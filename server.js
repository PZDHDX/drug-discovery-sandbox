const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 5173);
const root = __dirname;
const defaultModelUrl = 'https://mock-model.local/predict';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = http.createServer((request, response) => {
  const rawUrl = decodeURIComponent((request.url || '/').split('?')[0]);

  if (request.method === 'POST' && rawUrl === '/api/predict-molecule') {
    handleMoleculeProxy(request, response);
    return;
  }

  const requestedPath = rawUrl === '/' ? '/index.html' : rawUrl;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(content);
  });
});

async function handleMoleculeProxy(request, response) {
  try {
    const body = await readJson(request);
    const endpointUrl = String(body.endpointUrl || '');
    const apiKey = String(body.apiKey || '');

    if (!isHttpUrl(endpointUrl)) {
      sendJson(response, 400, { error: '模型接口 URL 格式不正确' });
      return;
    }

    if (endpointUrl !== defaultModelUrl && !apiKey.trim()) {
      sendJson(response, 400, { error: 'API Key 不能为空' });
      return;
    }

    const payload = {
      task: 'molecule_effect_prediction',
      modelType: body.modelType || 'Custom',
      molecule: body.molecule || {},
      outputSchema: 'PredictionResult',
    };

    if (endpointUrl === defaultModelUrl) {
      sendJson(response, 200, { prediction: buildProxyMockPrediction(payload.molecule), source: 'mock' });
      return;
    }

    const upstream = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();

    if (!upstream.ok) {
      sendJson(response, upstream.status, { error: text || `模型接口请求失败 (${upstream.status})` });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { analysis: text, partial: true };
    }

    sendJson(response, 200, {
      prediction: parsed.prediction || parsed.result || parsed,
      partial: Boolean(parsed.partial),
      source: 'upstream',
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || '模型代理请求失败' });
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error('请求体过大'));
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('请求 JSON 格式不正确'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildProxyMockPrediction(molecule) {
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
    trialTime: '30 个月 (代理 mock)',
    analysis: '本地代理 mock 返回的新分子作用预测,仅用于开发验证。',
    heatmap: [
      { organ: '肝脏', activity: 6, toxicity: 4, admet: 5 },
      { organ: '肾脏', activity: 5, toxicity: 4, admet: 5 },
      { organ: '心脏', activity: 5, toxicity: 3, admet: 4 },
      { organ: '免疫', activity: 7, toxicity: 3, admet: 4 },
    ],
    evidence: [{ id: 'SIM-PROXY-001', agent: '模型代理', note: '默认 mock 接口生成' }],
  };
}

server.listen(port, () => {
  console.log(`AI drug sandbox running at http://localhost:${port}`);
});
