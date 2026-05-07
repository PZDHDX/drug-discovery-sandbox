const DEFAULT_MODEL_URL = 'https://mock-model.local/predict';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await readJson(request);
    const endpointUrl = String(body.endpointUrl || '');
    const apiKey = String(body.apiKey || '');

    if (!isHttpUrl(endpointUrl)) {
      return json({ error: '模型接口 URL 格式不正确' }, 400);
    }

    if (endpointUrl !== DEFAULT_MODEL_URL && !apiKey.trim()) {
      return json({ error: 'API Key 不能为空' }, 400);
    }

    const payload = {
      task: 'molecule_effect_prediction',
      modelType: body.modelType || 'Custom',
      molecule: body.molecule || {},
      outputSchema: 'PredictionResult',
    };

    if (endpointUrl === DEFAULT_MODEL_URL) {
      return json({ prediction: buildProxyMockPrediction(payload.molecule), source: 'mock' });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (apiKey.trim()) headers.Authorization = `Bearer ${apiKey}`;

    const upstream = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();

    if (!upstream.ok) {
      return json({ error: text || `模型接口请求失败 (${upstream.status})` }, upstream.status);
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { analysis: text, partial: true };
    }

    return json({
      prediction: parsed.prediction || parsed.result || parsed,
      partial: Boolean(parsed.partial),
      source: 'upstream',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '模型代理请求失败';
    return json({ error: message }, 500);
  }
};

export const config = {
  path: '/api/predict-molecule',
};

async function readJson(request: Request) {
  const text = await request.text();
  if (text.length > 1024 * 1024) throw new Error('请求体过大');
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('请求 JSON 格式不正确');
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildProxyMockPrediction(molecule: Record<string, any>) {
  const name = molecule.name || '未命名新分子';
  const disease = molecule.disease || '未指定适应症';
  return {
    drugName: name,
    disease,
    verdict: 'pass',
    confidence: 76,
    predictionScore: 72,
    organRiskScore: 4.6,
    efficacyScore: 7.4,
    sideEffects: [
      { name: '肝酶波动信号', organ: '肝脏', probability: 9, severity: 4 },
      { name: '胃肠耐受性波动', organ: '消化系统', probability: 11, severity: 3 },
    ],
    trialTime: '30 个月 (Netlify mock)',
    analysis: 'Netlify Function mock 返回的新分子作用预测，仅用于部署演示和开发验证。',
    heatmap: [
      { organ: '肝脏', activity: 6, toxicity: 4, admet: 5 },
      { organ: '肾脏', activity: 5, toxicity: 4, admet: 5 },
      { organ: '心脏', activity: 5, toxicity: 3, admet: 4 },
      { organ: '免疫', activity: 7, toxicity: 3, admet: 4 },
    ],
    evidence: [{ id: 'NETLIFY-FN-001', agent: '模型代理', note: '默认 mock 接口生成' }],
  };
}
