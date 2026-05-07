const predictionTypeLabel = {
  activity: '活性预测',
  toxicity: '毒理预测',
  admet: 'ADMET 预测',
};

const DEFAULT_MODEL_URL = 'https://mock-model.local/predict';

const agents = [
  ['molecule', '分子分析师', '结构与相似性', '#2563eb', '扫描 2,400 项模拟试验与结构片段', '缺少分子结构信号,SMILES 解释力下降约 18%'],
  ['cardio', '心脏专家', '心律与瓣膜风险', '#dc2626', '模拟 6 个月内心电图与心血管事件变化', '心血管风险置信度下降,高风险警报可能延迟'],
  ['neuro', '神经专家', '神经毒性', '#9333ea', '评估神经兴奋性、眩晕与认知副作用信号', '神经相关副作用解释减少约 12%'],
  ['blood', '血液学专家', '凝血与血象', '#16a34a', '分析血小板、凝血与贫血模拟指标', '血液毒性覆盖不足,置信区间变宽'],
  ['toxicology', '毒理学专家', '肝肾毒性', '#f97316', '测试肝酶升高与肾损伤概率', 'ADMET 风险评分波动增加约 22%'],
  ['biostats', '生物统计学专家', '证据整合', '#0891b2', '整合智能体评分并计算模拟置信区间', '通过/失败边界更不稳定,解释性下降'],
  ['efficacy', '疗效专家', '疗效与收益', '#4f46e5', '建立生物标志物改善模型与收益曲线', '疗效收益估计不足,风险收益比偏保守'],
].map(([id, name, specialty, color, analysis, disabledImpact]) => ({ id, name, specialty, color, analysis, disabledImpact }));

const presets = [
  ['metformin', '二甲双胍 + 糖尿病', '二甲双胍', 'CN(C)C(=N)N=C(N)N', '2 型糖尿病', 'admet', 'AMPK', '通过'],
  ['fenfluramine', '芬氟拉明 + 肥胖症', '芬氟拉明', 'CCNC(C)CC1=CC=C(C=C1)C(F)(F)F', '肥胖症', 'toxicity', '5-HT2B', '失败: 心脏瓣膜风险'],
  ['thalidomide', '沙利度胺出生缺陷风险', '沙利度胺', '', '妊娠相关恶心', 'toxicity', 'CRBN', '失败: 出生缺陷风险'],
  ['rosiglitazone', '文迪雅/罗格列酮心脏风险', '文迪雅', '', '2 型糖尿病', 'toxicity', 'PPARγ', '失败: 心力衰竭风险'],
  ['keytruda', '可瑞达高置信通过', '可瑞达', '', '黑色素瘤', 'activity', 'PD-1', '通过: 高置信度'],
].map(([id, label, drugName, smiles, disease, predictionType, target, outcome]) => ({
  id,
  label,
  drugName,
  smiles,
  disease,
  predictionType,
  target,
  outcome,
}));

const fixedResults = {
  metformin: result({
    id: 'metformin',
    drugName: '二甲双胍',
    disease: '2 型糖尿病',
    smiles: 'CN(C)C(=N)N=C(N)N',
    predictionType: 'admet',
    target: 'AMPK',
    verdict: 'pass',
    confidence: 88,
    predictionScore: 84,
    organRiskScore: 2.4,
    efficacyScore: 8.1,
    sideEffects: [['胃肠不适', '消化系统', 18, 3], ['乳酸升高信号', '代谢', 2, 5]],
    trialTime: '28 个月 (95% CI: 24-34)',
    analysis: '模拟结果显示 ADMET 风险较低,疗效收益在糖代谢指标上较稳定。',
    structureHint: '小分子胍类结构占位图',
    heatmap: [['心脏', 2, 2, 3], ['肝脏', 3, 3, 4], ['肾脏', 3, 4, 5], ['神经', 2, 2, 2]],
    evidence: [['SIM-PMID-240017', '分子分析师', '胍类结构相似性模拟证据'], ['SIM-PMID-240044', '疗效专家', '糖化血红蛋白改善模型']],
  }),
  fenfluramine: result({
    id: 'fenfluramine',
    drugName: '芬氟拉明',
    disease: '肥胖症',
    smiles: 'CCNC(C)CC1=CC=C(C=C1)C(F)(F)F',
    predictionType: 'toxicity',
    target: '5-HT2B',
    verdict: 'fail',
    confidence: 86,
    predictionScore: 31,
    organRiskScore: 8.6,
    efficacyScore: 5.2,
    sideEffects: [['心脏瓣膜风险', '心脏', 15, 9], ['肺动脉高压信号', '肺部', 7, 8]],
    failureReason: '心脏瓣膜风险超过体重控制收益',
    trialTime: '36 个月 (风险中止模拟)',
    analysis: '心脏专家给出 5-HT2B 相关风险信号,验证员判定风险收益比不成立。',
    warning: '警告:此模拟预测 15% 心脏病发作风险 - 请在继续前查阅真实临床数据',
    structureHint: '苯乙胺类结构占位图',
    heatmap: [['心脏', 4, 9, 8], ['肺部', 3, 8, 6], ['神经', 6, 5, 5], ['肝脏', 3, 4, 4]],
    evidence: [['SIM-PMID-520118', '心脏专家', '瓣膜病变风险模拟引用'], ['SIM-PMID-520122', '毒理学专家', '肺动脉压升高信号']],
  }),
  thalidomide: result({
    id: 'thalidomide',
    drugName: '沙利度胺',
    disease: '妊娠相关恶心',
    predictionType: 'toxicity',
    target: 'CRBN',
    verdict: 'fail',
    confidence: 95,
    predictionScore: 12,
    organRiskScore: 9.7,
    efficacyScore: 3.4,
    sideEffects: [['出生缺陷风险', '胚胎发育', 38, 10], ['周围神经病变', '神经', 21, 7]],
    failureReason: '胚胎发育毒性信号极高,不可进入临床使用判断',
    trialTime: '立即终止 (模拟伦理闸门)',
    analysis: '该演示案例固定触发出生缺陷风险提示,仅用于说明高危药物筛查界面。',
    warning: '警告:检测到高严重度出生缺陷风险模拟信号 - 仅用于历史风险演示',
    structureHint: '酰亚胺结构占位图',
    heatmap: [['胚胎发育', 1, 10, 9], ['神经', 2, 8, 7], ['肝脏', 2, 5, 5], ['血液', 2, 4, 4]],
    evidence: [['SIM-PMID-600001', '毒理学专家', '致畸性历史风险模拟'], ['SIM-PMID-600004', '生物统计学专家', '伦理闸门评分']],
  }),
  rosiglitazone: result({
    id: 'rosiglitazone',
    drugName: '文迪雅 / 罗格列酮',
    disease: '2 型糖尿病',
    predictionType: 'toxicity',
    target: 'PPARγ',
    verdict: 'fail',
    confidence: 89,
    predictionScore: 42,
    organRiskScore: 8,
    efficacyScore: 7.3,
    sideEffects: [['心力衰竭风险增加 30%', '心脏', 30, 8], ['水肿', '循环系统', 14, 5]],
    failureReason: '心血管风险超过 HbA1c 降低 1.2% 的疗效收益',
    trialTime: '40 个月 (95% CI: 34-48)',
    analysis: '疗效专家给出 HbA1c 降低 1.2% 的通过信号,但心脏专家风险评分更高。',
    warning: '警告:此模拟预测心力衰竭风险增加 30% - 请在继续前查阅真实临床数据',
    structureHint: '噻唑烷二酮结构占位图',
    heatmap: [['心脏', 6, 8, 8], ['代谢', 8, 4, 5], ['肝脏', 5, 5, 6], ['血液', 3, 3, 4]],
    evidence: [['SIM-PMID-700030', '心脏专家', '心力衰竭风险模拟'], ['SIM-PMID-700052', '疗效专家', 'HbA1c 改善模型']],
  }),
  keytruda: result({
    id: 'keytruda',
    drugName: '可瑞达',
    disease: '黑色素瘤',
    predictionType: 'activity',
    target: 'PD-1',
    verdict: 'pass',
    confidence: 92,
    predictionScore: 91,
    organRiskScore: 3.1,
    efficacyScore: 9.2,
    sideEffects: [['免疫相关皮疹', '皮肤', 11, 4], ['甲状腺功能异常信号', '内分泌', 8, 5]],
    trialTime: '30 个月 (95% CI: 26-36)',
    analysis: '疗效专家与生物统计学专家均给出高通过置信度,器官风险处于可解释范围。',
    structureHint: '抗体药物结构占位图',
    heatmap: [['免疫', 9, 3, 4], ['皮肤', 6, 4, 3], ['内分泌', 5, 5, 4], ['肝脏', 5, 4, 4]],
    evidence: [['SIM-PMID-810091', '疗效专家', 'PD-1 通路收益模拟'], ['SIM-PMID-810128', '生物统计学专家', '响应率置信区间模拟']],
  }),
  vioxx: result({
    id: 'vioxx',
    drugName: '万络',
    disease: '关节炎',
    predictionType: 'toxicity',
    target: 'COX-2',
    verdict: 'fail',
    confidence: 90,
    predictionScore: 37,
    organRiskScore: 8.2,
    efficacyScore: 7.1,
    sideEffects: [['心肌梗死', '心脏', 12, 9], ['中风', '神经血管', 4, 8]],
    failureReason: '心血管风险超过收益',
    trialTime: '42 个月 (三期试验终止)',
    analysis: '抗炎疗效明确,但心血管事件模拟信号过高,验证员判定失败。',
    warning: '警告:此模拟预测 12% 心肌梗死风险 - 请在继续前查阅真实临床数据',
    structureHint: 'COX-2 抑制剂结构占位图',
    heatmap: [['心脏', 6, 9, 8], ['神经血管', 5, 8, 7], ['胃肠', 6, 4, 5], ['肾脏', 4, 6, 6]],
    evidence: [['SIM-PMID-900012', '心脏专家', '心肌梗死事件模拟'], ['SIM-PMID-900026', '生物统计学专家', '三期终止时间估计']],
  }),
  aspirin: result({
    id: 'aspirin',
    drugName: '阿司匹林',
    disease: '炎症/疼痛',
    predictionType: 'admet',
    target: 'COX-1/COX-2',
    verdict: 'pass',
    confidence: 82,
    predictionScore: 76,
    organRiskScore: 4.5,
    efficacyScore: 7.6,
    sideEffects: [['胃肠刺激', '胃肠', 16, 5], ['出血风险信号', '血液', 6, 6]],
    trialTime: '24 个月 (基准模拟)',
    analysis: '作为基准药物用于模拟预测样本,显示中等风险与稳定疗效。',
    structureHint: '水杨酸酯结构占位图',
    heatmap: [['胃肠', 6, 6, 5], ['血液', 5, 6, 5], ['心脏', 6, 3, 4], ['肾脏', 4, 5, 5]],
    evidence: [['SIM-PMID-100101', '血液学专家', '出血风险基准模拟'], ['SIM-PMID-100144', '疗效专家', '抗炎收益基准模拟']],
  }),
};

const aliases = {
  二甲双胍: 'metformin',
  metformin: 'metformin',
  芬氟拉明: 'fenfluramine',
  fenfluramine: 'fenfluramine',
  沙利度胺: 'thalidomide',
  thalidomide: 'thalidomide',
  文迪雅: 'rosiglitazone',
  罗格列酮: 'rosiglitazone',
  rosiglitazone: 'rosiglitazone',
  可瑞达: 'keytruda',
  keytruda: 'keytruda',
  pembrolizumab: 'keytruda',
  万络: 'vioxx',
  vioxx: 'vioxx',
  rofecoxib: 'vioxx',
  阿司匹林: 'aspirin',
  aspirin: 'aspirin',
};

const caseStudies = [
  ['罗格列酮', '失败', '心脏风险 8.0/10', '心脏专家提示心力衰竭风险增加 30%,疗效专家提示 HbA1c 降低 1.2%,最终风险 > 收益。'],
  ['万络', '失败', '预估 42 个月', '关节炎样本报告显示心脏风险 8.2/10,疗效 7.1/10,三期试验模拟终止。'],
  ['可瑞达', '通过', '置信度 92%', '免疫疗法模拟样本展示疗效收益明显高于器官风险,适合演示高通过置信度。'],
];

const state = {
  activeTab: 'predict',
  form: {
    drugName: '',
    smiles: '',
    disease: '',
    predictionType: 'admet',
    target: '',
    endpointUrl: DEFAULT_MODEL_URL,
    modelType: 'GPT',
    apiKey: '',
  },
  result: null,
  message: null,
  connectionStatus: 'idle',
  isRunning: false,
  activeAgentIndex: -1,
  runLog: [],
  agentOrder: agents.map((agent) => agent.id),
  enabledAgents: new Set(agents.map((agent) => agent.id)),
  draggingAgent: null,
  moleculeMode: 'target',
  targetDesign: {
    disease: '',
    symptoms: '',
    bodyPart: '',
    downstreamTarget: '',
    metabolites: '',
    desiredEffect: '',
  },
  candidateMolecules: [],
  molecule: {
    name: '',
    smiles: '',
    molecularWeight: 420,
    bioavailability: 58,
    targetOrgans: ['心脏', '肝脏'],
    target: '',
    disease: '',
    predictionType: 'admet',
  },
  moleculeResult: null,
  moleculeStatus: 'idle',
  moleculeRunLog: [],
  activeMoleculeAgentIndex: -1,
  isMoleculeRunning: false,
  selectedHeatmap: null,
  guideOpen: false,
};

function result(input) {
  return {
    ...input,
    timeline: input.timeline || ['输入归一化', '智能体并行评分', '风险收益整合', `${input.verdict === 'pass' ? '通过' : '失败'}徽章生成`],
    sideEffects: input.sideEffects.map(([name, organ, probability, severity]) => ({ name, organ, probability, severity })),
    heatmap: input.heatmap.map(([organ, activity, toxicity, admet]) => ({ organ, activity, toxicity, admet })),
    evidence: input.evidence.map(([id, agent, note]) => ({ id, agent, note })),
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function orderedAgents() {
  return state.agentOrder.map((id) => agents.find((agent) => agent.id === id)).filter((agent) => agent && state.enabledAgents.has(agent.id));
}

function render() {
  document.getElementById('app').innerHTML = `
    <header class="app-header">
      <div class="shell header-inner">
        <div class="brand">
          <div class="brand-mark">AI</div>
          <div>
            <h1>AI 药物研发预测沙盒</h1>
            <p>基于模拟 AI 智能体的虚拟筛选与 ADMET 预测</p>
          </div>
        </div>
        <nav class="tabs" aria-label="主要页面">
          ${tabButton('predict', '药物预测')}
          ${tabButton('molecule', '新分子设计')}
        </nav>
      </div>
    </header>
    <main class="shell main">
      ${safetyStrip()}
      ${state.message ? messageBox() : ''}
      ${state.activeTab === 'predict' ? predictWorkspace() : ''}
      ${state.activeTab === 'molecule' ? moleculeWorkspace() : ''}
    </main>
    ${footer()}
    ${state.guideOpen ? guideModal() : ''}
  `;
  bindEvents();
}

function tabButton(id, label) {
  return `<button class="tab ${state.activeTab === id ? 'active' : ''}" data-tab="${id}"><span class="tab-icon"></span>${label}</button>`;
}

function safetyStrip() {
  return `
    <section class="safety-strip">
      <div>
        <h2>AI 药物研发预测与新分子设计沙盒</h2>
        <p>本工具分为药物预测与新分子设计两条主线:已有药物进入智能体评估,疾病/靶点/代谢物可生成候选新分子并继续预测。所有预测、评分、证据 ID 和模型结果均为模拟或用户配置模型输出。</p>
      </div>
      <strong>科研演示 · 非医疗建议</strong>
    </section>
  `;
}

function messageBox() {
  return `<div class="message ${state.message.type}">${escapeHtml(state.message.text)}</div>`;
}

function panel(title, body, extraClass = '') {
  return `<section class="panel ${extraClass}"><div class="panel-title"><span class="panel-icon"></span>${title}</div>${body}</section>`;
}

function predictWorkspace() {
  return `
    <div class="predict-grid">
      <aside class="stack">
        ${presetPanel()}
        ${formPanel()}
        ${modelPanel()}
        <button class="primary full" data-action="run" ${state.isRunning ? 'disabled' : ''}>${state.isRunning ? 'AI 预测中' : '开始 AI 预测'}</button>
      </aside>
      <section class="stack">
        ${agentVisualizer()}
        ${caseStudyPanel()}
      </section>
      <aside class="stack">
        ${state.result ? resultPanel(state.result) : emptyResult()}
      </aside>
    </div>
  `;
}

function presetPanel() {
  return panel(
    '预设示例',
    `<div class="preset-list">
      ${presets
        .map(
          (preset) => `
        <button class="preset" data-preset="${preset.id}">
          <span>${escapeHtml(preset.label)}</span>
          <small>${escapeHtml(preset.outcome)}</small>
        </button>`,
        )
        .join('')}
    </div>`,
  );
}

function formPanel() {
  const form = state.form;
  return panel(
    '药物输入',
    `
      ${field('药物名称', `<input class="input" data-field="drugName" value="${escapeHtml(form.drugName)}" placeholder="例如: 二甲双胍">`)}
      ${field('药物 SMILES 结构式', `<textarea class="input" data-field="smiles" rows="3" placeholder="请输入 SMILES,可留空">${escapeHtml(form.smiles)}</textarea>`)}
      ${field('疾病/适应症', `<input class="input" data-field="disease" value="${escapeHtml(form.disease)}" placeholder="例如: 2 型糖尿病">`)}
      <div class="field">
        <span class="label">预测类型</span>
        <div class="radio-row">
          ${Object.entries(predictionTypeLabel)
            .map(
              ([value, label]) => `
            <label class="radio-card ${form.predictionType === value ? 'active' : ''}">
              <input type="radio" name="predictionType" value="${value}" ${form.predictionType === value ? 'checked' : ''}>
              ${label}
            </label>`,
            )
            .join('')}
        </div>
      </div>
      ${field('靶点名称 (选填)', `<input class="input" data-field="target" value="${escapeHtml(form.target)}" placeholder="例如: AMPK / PD-1">`)}
      <p class="hint">请输入药物名称或 SMILES 结构式,仅用于科研参考。Demo 默认不真实调用外部模型。</p>
    `,
  );
}

function modelPanel() {
  const form = state.form;
  const badge = {
    idle: '未测试',
    testing: '测试中',
    success: '成功',
    error: '失败',
  }[state.connectionStatus];

  return panel(
    '模型接口配置',
    `
      ${field('模型接口 URL', `<input class="input" data-field="endpointUrl" value="${escapeHtml(form.endpointUrl)}">`)}
      ${field(
        '模型类型',
        `<select class="input" data-field="modelType">
          ${['GPT', 'Claude', 'Custom'].map((item) => `<option ${form.modelType === item ? 'selected' : ''}>${item}</option>`).join('')}
        </select>`,
      )}
      ${field('API Key', `<input class="input" data-field="apiKey" type="password" value="${escapeHtml(form.apiKey)}">`)}
      <div class="connection-row">
        <button class="secondary" data-action="test-connection" ${state.connectionStatus === 'testing' ? 'disabled' : ''}>测试连接</button>
        <span class="status ${state.connectionStatus}">${badge}</span>
      </div>
    `,
  );
}

function field(label, control) {
  return `<label class="field"><span class="label">${label}</span>${control}</label>`;
}

function allOrderedAgents() {
  return state.agentOrder.map((id) => agents.find((agent) => agent.id === id)).filter(Boolean);
}

function agentVisualizer(options = {}) {
  const runList = orderedAgents();
  const list = allOrderedAgents();
  const isRunning = options.isRunning ?? state.isRunning;
  const activeAgentIndex = options.activeAgentIndex ?? state.activeAgentIndex;
  const activeAgent = runList[activeAgentIndex];
  const completedAgentIds = new Set(runList.slice(0, Math.max(activeAgentIndex, 0)).map((agent) => agent.id));
  const runLog = options.runLog ?? state.runLog;
  return panel(
    '智能体分析',
    `
      <div class="agent-stage">
        ${isRunning ? '<div class="scan-line"></div>' : ''}
        <div class="agent-grid">
          ${list
            .map((agent, index) => {
              const enabled = state.enabledAgents.has(agent.id);
              const active = isRunning && activeAgent?.id === agent.id;
              const complete = completedAgentIds.has(agent.id);
              return `
                <div class="agent-node ${active ? 'active' : ''} ${enabled ? '' : 'disabled'}" style="--agent:${agent.color}; --agent-soft:${softColor(agent.color)}; border-color:${active || complete ? agent.color : '#cbd5e1'}">
                  <div class="agent-node-head">
                    <span class="agent-dot"></span>
                    <button class="agent-switch ${enabled ? 'on' : ''}" data-toggle-agent="${agent.id}" aria-label="切换${agent.name}">
                      <i></i>
                    </button>
                  </div>
                  <strong>${agent.name}</strong>
                  <small>${agent.specialty}</small>
                </div>`;
            })
            .join('')}
        </div>
        <div class="process-log">
          <strong>模拟过程</strong>
          ${
            runLog.length
              ? runLog.map((line) => `<p><span></span>${escapeHtml(line)}</p>`).join('')
              : '<p><span></span>点击开始 AI 预测后,7 个智能体会依次点亮并展示实时分析。</p>'
          }
        </div>
      </div>
    `,
  );
}

function softColor(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

function emptyResult() {
  return panel(
    '结果展示',
    `<div class="empty-result">
      <div class="empty-icon ${state.isRunning ? 'float' : ''}"></div>
      <h3>${state.isRunning ? '正在生成模拟报告' : '等待预测结果'}</h3>
      <p>结果会包含判定、置信度、预测分数、器官风险、疗效、副作用热力图、模拟证据与导出按钮。</p>
    </div>`,
  );
}

function resultPanel(item) {
  const pass = item.verdict === 'pass';
  return panel(
    '结果展示',
    `
      <div class="result-hero ${pass ? 'pass' : 'fail'}">
        <div>
          <p>${escapeHtml(item.drugName)} · ${escapeHtml(item.disease)}</p>
          <strong>${pass ? '通过' : '失败'}</strong>
        </div>
        <div class="confidence"><span>预测置信度</span><b>${item.confidence}%</b></div>
      </div>
      ${item.warning ? `<div class="warning">${escapeHtml(item.warning)}</div>` : ''}
      <div class="metric-row">
        ${metric('预测分数', item.predictionScore, 'dark')}
        ${metric('器官风险', `${item.organRiskScore}/10`, item.organRiskScore > 7 ? 'danger' : 'warn')}
        ${metric('疗效评分', `${item.efficacyScore}/10`, 'good')}
      </div>
      <section class="subpanel">
        <h3>主要副作用</h3>
        ${item.sideEffects.map((effect) => `<p class="side-effect"><span>${escapeHtml(effect.name)} <small>${escapeHtml(effect.organ)}</small></span><b>${effect.probability}%</b></p>`).join('')}
      </section>
      ${item.failureReason ? `<div class="failure"><b>失败原因:</b> ${escapeHtml(item.failureReason)}</div>` : ''}
      <div class="two-col">
        <section class="subpanel">
          <h3>预估试验时间</h3>
          <p>${escapeHtml(item.trialTime)}</p>
          <h3>简单分析说明</h3>
          <p>${escapeHtml(item.analysis)}</p>
        </section>
        <section class="subpanel">
          <h3>结构示意图</h3>
          <div class="molecule"><span class="node a"></span><span class="node b"></span><span class="node c"></span><span class="bond ab"></span><span class="bond bc"></span></div>
          <p class="small">${escapeHtml(item.structureHint)}</p>
        </section>
      </div>
      ${heatmap(item.heatmap)}
      <section class="subpanel">
        <h3>模拟证据系统</h3>
        ${item.evidence.map((evidence) => `<p class="evidence"><b>${evidence.id}</b> · ${escapeHtml(evidence.agent)} · ${escapeHtml(evidence.note)}</p>`).join('')}
      </section>
      <div class="export-row">
        <button class="secondary" data-action="export-pdf">导出 PDF</button>
        <button class="secondary" data-action="export-csv">导出 CSV</button>
      </div>
      <p class="hint">仅供研究使用 - 非医疗建议</p>
    `,
  );
}

function metric(label, value, tone) {
  return `<div class="metric ${tone}"><span>${label}</span><b>${value}</b></div>`;
}

function heatmap(rows) {
  const metrics = [
    ['activity', '活性'],
    ['toxicity', '毒性'],
    ['admet', 'ADMET'],
  ];
  return `
    <section class="subpanel">
      <div class="heat-title">
        <h3>交互式副作用热力图</h3>
        <span>${state.selectedHeatmap ? escapeHtml(`${state.selectedHeatmap.organ} · ${state.selectedHeatmap.label}: ${state.selectedHeatmap.value}/10`) : '点击格子查看评分'}</span>
      </div>
      <div class="heat-grid header"><span>器官</span><span>活性</span><span>毒性</span><span>ADMET</span></div>
      ${rows
        .map(
          (row) => `
        <div class="heat-grid">
          <strong>${escapeHtml(row.organ)}</strong>
          ${metrics
            .map(
              ([key, label]) => `
            <button class="heat-cell" data-heat-organ="${escapeHtml(row.organ)}" data-heat-label="${label}" data-heat-value="${row[key]}" style="background:${heatColor(row[key])}">
              ${row[key]}
            </button>`,
            )
            .join('')}
        </div>`,
        )
        .join('')}
    </section>`;
}

function heatColor(value) {
  if (value >= 8) return '#fecdd3';
  if (value >= 6) return '#fed7aa';
  if (value >= 4) return '#fde68a';
  return '#bbf7d0';
}

function caseStudyPanel() {
  return panel(
    '案例展示',
    `<div class="case-grid">
      ${caseStudies
        .map(
          ([title, verdict, metricText, detail]) => `
        <article class="case-card">
          <div><h3>${title}</h3><span class="${verdict === '通过' ? 'pass-pill' : 'fail-pill'}">${verdict}</span></div>
          <p>${detail}</p>
          <b>${metricText}</b>
        </article>`,
        )
        .join('')}
    </div>`,
  );
}

function advancedAgentSettingsPanel() {
  const disabled = orderedAgents().filter((agent) => !state.enabledAgents.has(agent.id));
  return panel(
    '智能体分析',
    `
      <div class="agent-control-list compact">
        ${orderedAgents()
          .map(
            (agent, index) => `
          <div class="agent-row" draggable="true" data-agent="${agent.id}">
            <span>#${index + 1}</span>
            <div><h3><i style="background:${agent.color}"></i>${agent.name}</h3><p>${agent.specialty}</p></div>
            <button class="toggle ${state.enabledAgents.has(agent.id) ? 'on' : ''}" data-toggle-agent="${agent.id}" aria-label="切换${agent.name}"></button>
          </div>`,
          )
          .join('')}
      </div>
      <div class="impact-list">
        ${
          disabled.length
            ? disabled.map((agent) => `<div class="impact"><b>${agent.name}:</b> ${agent.disabledImpact}</div>`).join('')
            : '<div class="impact good">全部智能体启用,当前结果解释覆盖最完整。</div>'
        }
      </div>
      <p class="hint">拖动智能体可调整分析优先级；关闭专家会实时影响结果解释覆盖。</p>
    `,
  );
}

function moleculeWorkspace() {
  return `
    <div class="molecule-grid">
      <aside class="stack">
        ${moleculeModePanel()}
        ${state.moleculeMode === 'target' ? targetDesignPanel() : moleculeCreatorPanel()}
        ${modelPanel()}
      </aside>
      <section class="stack">
        ${state.moleculeMode === 'target' ? candidatePanel() : ''}
        ${moleculePreviewPanel()}
        ${agentVisualizer({
          isRunning: state.isMoleculeRunning,
          activeAgentIndex: state.activeMoleculeAgentIndex,
          runLog: state.moleculeRunLog,
        })}
      </section>
      <aside class="stack molecule-result-stack">
        ${state.moleculeResult ? resultPanel(state.moleculeResult) : emptyMoleculeResult()}
        ${moleculeDownloadPanel()}
      </aside>
    </div>
  `;
}

function moleculeModePanel() {
  return panel(
    '设计方式',
    `<div class="mode-switch">
      <button class="${state.moleculeMode === 'target' ? 'active' : ''}" data-mode="target">目标驱动生成</button>
      <button class="${state.moleculeMode === 'manual' ? 'active' : ''}" data-mode="manual">手动创建分子</button>
    </div>
    <p class="hint">目标驱动用于从疾病、症状、部位、靶点和代谢物生成候选分子；手动创建用于直接输入你已有的新分子。</p>`,
  );
}

function targetDesignPanel() {
  const target = state.targetDesign;
  return panel(
    '目标驱动生成',
    `
      ${field('疾病/适应症', `<input class="input" data-target-design="disease" value="${escapeHtml(target.disease)}" placeholder="例如: 非小细胞肺癌">`)}
      ${field('症状/表型', `<textarea class="input" data-target-design="symptoms" rows="3" placeholder="例如: 炎症因子升高、耐药突变、肿瘤增殖">${escapeHtml(target.symptoms)}</textarea>`)}
      ${field('发病部位', `<input class="input" data-target-design="bodyPart" value="${escapeHtml(target.bodyPart)}" placeholder="例如: 肺部 / 肝脏 / 神经系统">`)}
      ${field('下游靶点', `<input class="input" data-target-design="downstreamTarget" value="${escapeHtml(target.downstreamTarget)}" placeholder="例如: EGFR / KRAS / JAK-STAT">`)}
      ${field('相关代谢物', `<textarea class="input" data-target-design="metabolites" rows="2" placeholder="例如: 乳酸、谷氨酰胺、前列腺素">${escapeHtml(target.metabolites)}</textarea>`)}
      ${field('期望作用', `<input class="input" data-target-design="desiredEffect" value="${escapeHtml(target.desiredEffect)}" placeholder="例如: 抑制增殖并降低炎症信号">`)}
      <button class="primary full" data-action="generate-candidates">生成候选新分子</button>
      <p class="hint">生成结果是用于产品演示的候选结构草案，仍需进入右侧预测流程验证。</p>
    `,
  );
}

function candidatePanel() {
  return panel(
    '候选分子',
    state.candidateMolecules.length
      ? `<div class="candidate-list">
          ${state.candidateMolecules
            .map(
              (candidate, index) => `
            <article class="candidate-card">
              <div>
                <h3>${escapeHtml(candidate.name)}</h3>
                <span>${candidate.fitScore}% 匹配</span>
              </div>
              <p>${escapeHtml(candidate.rationale)}</p>
              <code>${escapeHtml(candidate.smiles)}</code>
              <button class="secondary full" data-candidate="${index}">载入并预测</button>
            </article>`,
            )
            .join('')}
        </div>`
      : `<div class="empty-result compact-empty">
          <div class="empty-icon"></div>
          <h3>等待候选分子</h3>
          <p>填写疾病症状、发病部位、下游靶点和代谢物后，生成候选新分子。</p>
        </div>`,
  );
}

function moleculeCreatorPanel() {
  const molecule = state.molecule;
  const organs = ['心脏', '肝脏', '肾脏', '神经', '血液', '免疫', '胚胎发育'];
  return panel(
    '手动创建分子',
    `
      ${field('分子名称', `<input class="input" data-molecule="name" value="${escapeHtml(molecule.name)}" placeholder="例如: HX-2048">`)}
      ${field('SMILES 结构式', `<textarea class="input" data-molecule="smiles" rows="3" placeholder="输入或粘贴新分子的 SMILES">${escapeHtml(molecule.smiles)}</textarea>`)}
      ${field('适应症/疾病', `<input class="input" data-molecule="disease" value="${escapeHtml(molecule.disease)}" placeholder="例如: 肿瘤 / 炎症 / 糖尿病">`)}
      ${field('靶点名称', `<input class="input" data-molecule="target" value="${escapeHtml(molecule.target)}" placeholder="例如: EGFR / PD-1 / AMPK">`)}
      <div class="field">
        <span class="label">预测类型</span>
        <div class="radio-row">
          ${Object.entries(predictionTypeLabel)
            .map(
              ([value, label]) => `
            <label class="radio-card ${molecule.predictionType === value ? 'active' : ''}">
              <input type="radio" name="moleculePredictionType" value="${value}" ${molecule.predictionType === value ? 'checked' : ''}>
              ${label}
            </label>`,
            )
            .join('')}
        </div>
      </div>
      ${moleculeSlider('molecularWeight', '分子量', 100, 1000, molecule.molecularWeight, 'Da')}
      ${moleculeSlider('bioavailability', '生物利用度', 5, 100, molecule.bioavailability, '%')}
      <div class="field"><span class="label">目标器官</span>
        <div class="organ-grid">
          ${organs
            .map(
              (organ) => `
            <label><input type="checkbox" data-molecule-organ="${organ}" ${molecule.targetOrgans.includes(organ) ? 'checked' : ''}>${organ}</label>`,
            )
            .join('')}
        </div>
      </div>
      <button class="primary full" data-action="predict-molecule" ${state.isMoleculeRunning ? 'disabled' : ''}>
        ${state.isMoleculeRunning ? '模型预测中' : '调用模型预测作用'}
      </button>
      <p class="hint">默认 mock 接口会在本地生成结果；如果填入真实 REST URL,会通过本地代理转发,避免浏览器 CORS。</p>
    `,
  );
}

function moleculeSlider(key, label, min, max, value, unit) {
  return `
    <label class="field">
      <span class="range-label"><span>${label}</span><b>${value} ${unit}</b></span>
      <input class="range" type="range" min="${min}" max="${max}" value="${value}" data-molecule-range="${key}">
    </label>`;
}

function moleculePreviewPanel() {
  const molecule = state.molecule;
  return panel(
    '分子设计预览',
    `
      <div class="molecule-design">
        <div class="molecule"><span class="node a"></span><span class="node b"></span><span class="node c"></span><span class="bond ab"></span><span class="bond bc"></span></div>
        <div class="molecule-facts">
          <h3>${escapeHtml(molecule.name || '未命名新分子')}</h3>
          <p>${escapeHtml(molecule.smiles || '等待输入 SMILES 结构式')}</p>
          <dl>
            <div><dt>分子量</dt><dd>${molecule.molecularWeight} Da</dd></div>
            <div><dt>生物利用度</dt><dd>${molecule.bioavailability}%</dd></div>
            <div><dt>靶点</dt><dd>${escapeHtml(molecule.target || '未指定')}</dd></div>
            <div><dt>目标器官</dt><dd>${escapeHtml(molecule.targetOrgans.join('、') || '未选择')}</dd></div>
          </dl>
        </div>
      </div>
    `,
  );
}

function emptyMoleculeResult() {
  return panel(
    '新分子作用预测',
    `<div class="empty-result">
      <div class="empty-icon ${state.isMoleculeRunning ? 'float' : ''}"></div>
      <h3>${state.isMoleculeRunning ? '正在请求模型预测' : '等待新分子预测'}</h3>
      <p>创建分子后点击“调用模型预测作用”,这里会展示潜在作用、ADMET、器官风险、疗效、副作用和导出按钮。</p>
    </div>`,
  );
}

function moleculeDownloadPanel() {
  return `
    <section class="panel molecule-download-panel">
      <div class="panel-title"><span class="panel-icon"></span>下载中心</div>
      <div class="download-actions">
        <button class="secondary full" data-action="download-molecule-csv" ${hasMoleculeDraft() ? '' : 'disabled'}>下载分子 CSV</button>
        <button class="primary full" data-action="download-molecule-report" ${state.moleculeResult ? '' : 'disabled'}>下载报告 PDF</button>
      </div>
      <p class="hint">分子 CSV 导出当前结构信息；报告 PDF 需要先完成模型预测。</p>
    </section>
  `;
}

function hasMoleculeDraft() {
  return Boolean(state.molecule.name.trim() || state.molecule.smiles.trim());
}

function footer() {
  return `
    <footer class="footer">
      <div class="shell footer-inner">
        <p>本工具仅为 AI 辅助科研预测,不构成医疗诊断、治疗建议,不可直接用于临床。</p>
        <div><span>©2026 AI 药物研发预测工具 保留所有权利</span><button data-action="guide">使用说明</button></div>
      </div>
    </footer>`;
}

function guideModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <div class="modal-head"><div><h2>使用说明</h2><p>这是一个科研演示沙盒,所有输出均由 mock 数据生成。</p></div><button data-action="close-guide">关闭</button></div>
        <ol>
          <li>药物预测:选择预设示例或输入已有药物、SMILES、适应症与靶点。</li>
          <li>新分子设计:可通过疾病症状、发病部位、下游靶点和代谢物生成候选分子,也可手动输入新分子。</li>
          <li>模型接口区域支持默认 mock 和 REST JSON 代理,API Key 只保存在当前页面内存中。</li>
          <li>点击预测后,7 个智能体会按序分析并生成模拟报告,报告可导出 PDF 或 CSV。</li>
          <li>所有结果仅供研究演示,不得作为医疗建议或临床决策依据。</li>
        </ol>
      </section>
    </div>`;
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll('[data-field]').forEach((field) => {
    field.addEventListener('input', () => {
      state.form[field.dataset.field] = field.value;
    });
    field.addEventListener('change', () => {
      state.form[field.dataset.field] = field.value;
    });
  });

  document.querySelectorAll('input[name="predictionType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.form.predictionType = radio.value;
      render();
    });
  });

  document.querySelectorAll('[data-molecule]').forEach((field) => {
    field.addEventListener('input', () => {
      state.molecule[field.dataset.molecule] = field.value;
    });
    field.addEventListener('change', () => {
      state.molecule[field.dataset.molecule] = field.value;
    });
  });

  document.querySelectorAll('[data-target-design]').forEach((field) => {
    field.addEventListener('input', () => {
      state.targetDesign[field.dataset.targetDesign] = field.value;
    });
    field.addEventListener('change', () => {
      state.targetDesign[field.dataset.targetDesign] = field.value;
    });
  });

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.moleculeMode = button.dataset.mode;
      render();
    });
  });

  document.querySelectorAll('[data-candidate]').forEach((button) => {
    button.addEventListener('click', () => {
      loadCandidate(Number(button.dataset.candidate));
      predictMolecule();
    });
  });

  document.querySelectorAll('input[name="moleculePredictionType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.molecule.predictionType = radio.value;
      render();
    });
  });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presets.find((item) => item.id === button.dataset.preset);
      state.form = {
        ...state.form,
        drugName: preset.drugName,
        smiles: preset.smiles,
        disease: preset.disease,
        predictionType: preset.predictionType,
        target: preset.target,
      };
      runPrediction();
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleAction(button.dataset.action));
  });

  document.querySelectorAll('[data-heat-organ]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedHeatmap = {
        organ: button.dataset.heatOrgan,
        label: button.dataset.heatLabel,
        value: button.dataset.heatValue,
      };
      render();
    });
  });

  document.querySelectorAll('[data-toggle-agent]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.toggleAgent;
      if (state.enabledAgents.has(id)) state.enabledAgents.delete(id);
      else state.enabledAgents.add(id);
      render();
    });
  });

  document.querySelectorAll('.agent-row').forEach((row) => {
    row.addEventListener('dragstart', () => {
      state.draggingAgent = row.dataset.agent;
    });
    row.addEventListener('dragover', (event) => event.preventDefault());
    row.addEventListener('drop', () => {
      const source = state.draggingAgent;
      const target = row.dataset.agent;
      if (source && target && source !== target) {
        const next = state.agentOrder.filter((id) => id !== source);
        next.splice(next.indexOf(target), 0, source);
        state.agentOrder = next;
      }
      state.draggingAgent = null;
      render();
    });
  });

  document.querySelectorAll('[data-molecule-range]').forEach((range) => {
    range.addEventListener('input', () => {
      state.molecule[range.dataset.moleculeRange] = Number(range.value);
      render();
    });
  });

  document.querySelectorAll('[data-molecule-organ]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const organ = checkbox.dataset.moleculeOrgan;
      state.molecule.targetOrgans = checkbox.checked
        ? [...new Set([...state.molecule.targetOrgans, organ])]
        : state.molecule.targetOrgans.filter((item) => item !== organ);
      render();
    });
  });
}

function handleAction(action) {
  if (action === 'run') runPrediction();
  if (action === 'predict-molecule') predictMolecule();
  if (action === 'generate-candidates') generateCandidates();
  if (action === 'test-connection') testConnection();
  if (action === 'export-csv' && currentExportResult()) exportCsv(currentExportResult());
  if (action === 'export-pdf' && currentExportResult()) exportPdf(currentExportResult());
  if (action === 'download-molecule-csv') exportMoleculeCsv();
  if (action === 'download-molecule-report' && state.moleculeResult) exportPdf(state.moleculeResult);
  if (action === 'guide') {
    state.guideOpen = true;
    render();
  }
  if (action === 'close-guide') {
    state.guideOpen = false;
    render();
  }
}

function currentExportResult() {
  return state.activeTab === 'molecule' ? state.moleculeResult : state.result;
}

function exportMoleculeCsv() {
  if (!hasMoleculeDraft()) {
    state.message = { type: 'error', text: '请先填写或载入新分子后再下载 CSV' };
    render();
    return;
  }

  const molecule = state.molecule;
  const rows = [
    ['字段', '值'],
    ['分子名称', molecule.name || '未命名新分子'],
    ['SMILES', molecule.smiles || ''],
    ['分子量', `${molecule.molecularWeight} Da`],
    ['生物利用度', `${molecule.bioavailability}%`],
    ['目标器官', molecule.targetOrgans.join('、')],
    ['靶点', molecule.target || ''],
    ['适应症/疾病', molecule.disease || ''],
    ['预测类型', predictionTypeLabel[molecule.predictionType] || molecule.predictionType],
  ];
  downloadTextFile(`${safeFileName(molecule.name || 'new-molecule')}.csv`, rows.map((row) => row.map(csvCell).join(',')).join('\n'), 'text/csv;charset=utf-8');
  state.message = { type: 'success', text: '分子 CSV 已生成' };
  render();
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function safeFileName(value) {
  return String(value || 'download').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'download';
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([`\uFEFF${content}`], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function validateTargetDesign() {
  const target = state.targetDesign;
  if (!target.disease.trim() && !target.symptoms.trim()) return '请输入疾病或症状后再生成候选分子';
  if (!target.downstreamTarget.trim() && !target.metabolites.trim()) return '请输入下游靶点或相关代谢物';
  return '';
}

function generateCandidates() {
  const error = validateTargetDesign();
  if (error) {
    state.message = { type: 'error', text: error };
    render();
    return;
  }

  const target = state.targetDesign;
  const seed = Array.from(`${target.disease}${target.symptoms}${target.bodyPart}${target.downstreamTarget}${target.metabolites}${target.desiredEffect}`).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const diseaseSlug = (target.disease || 'target').replace(/\s+/g, '').slice(0, 4).toUpperCase();
  const targetName = target.downstreamTarget || '多靶点';
  const metaboliteName = target.metabolites.split(/[、,，\s]+/).filter(Boolean)[0] || '代谢物';

  state.candidateMolecules = [
    {
      name: `HX-${diseaseSlug}-${(seed % 900) + 100}`,
      smiles: `CCN${seed % 2 ? 'C' : 'O'}C(=O)C${(seed % 7) + 1}CCN`,
      target: targetName,
      disease: target.disease || '未指定适应症',
      molecularWeight: 280 + (seed % 360),
      bioavailability: 42 + (seed % 38),
      targetOrgans: inferTargetOrgans(target.bodyPart, target.symptoms),
      predictionType: 'activity',
      fitScore: 78 + (seed % 14),
      rationale: `围绕 ${targetName} 与 ${metaboliteName} 生成的小分子草案,倾向于${target.desiredEffect || '调节疾病相关通路'}。`,
    },
    {
      name: `MX-${diseaseSlug}-${(seed % 700) + 210}`,
      smiles: `COC1=CC=C(NC(=O)N${seed % 3 ? 'C' : 'O'})C=C1`,
      target: targetName,
      disease: target.disease || '未指定适应症',
      molecularWeight: 360 + (seed % 420),
      bioavailability: 35 + (seed % 45),
      targetOrgans: inferTargetOrgans(target.bodyPart, target.metabolites),
      predictionType: 'admet',
      fitScore: 72 + (seed % 18),
      rationale: `偏 ADMET 稳定性的候选结构,用于观察 ${target.bodyPart || '目标部位'} 暴露和代谢风险。`,
    },
    {
      name: `TX-${diseaseSlug}-${(seed % 500) + 330}`,
      smiles: `CC(C)NC(=O)C1=CN=C${seed % 2 ? 'N' : 'O'}C=C1`,
      target: targetName,
      disease: target.disease || '未指定适应症',
      molecularWeight: 220 + (seed % 500),
      bioavailability: 28 + (seed % 55),
      targetOrgans: inferTargetOrgans(target.bodyPart, target.symptoms + target.metabolites),
      predictionType: 'toxicity',
      fitScore: 68 + (seed % 20),
      rationale: `高风险筛查候选,用于提前暴露 ${target.symptoms || '症状'} 相关毒理信号。`,
    },
  ];

  state.message = { type: 'success', text: '已生成 3 个候选新分子，可载入任一候选并进入预测。' };
  render();
}

function inferTargetOrgans(bodyPart, text) {
  const source = `${bodyPart} ${text}`;
  if (/心|cardio|heart/i.test(source)) return ['心脏', '血液'];
  if (/肝|liver/i.test(source)) return ['肝脏', '代谢'];
  if (/肾|kidney|renal/i.test(source)) return ['肾脏', '代谢'];
  if (/脑|神经|neuro|brain/i.test(source)) return ['神经', '血液'];
  if (/免疫|immune|炎症|inflamm/i.test(source)) return ['免疫', '肝脏'];
  if (/肺|lung/i.test(source)) return ['心脏', '免疫'];
  return ['肝脏', '肾脏'];
}

function loadCandidate(index) {
  const candidate = state.candidateMolecules[index];
  if (!candidate) return;
  state.molecule = {
    name: candidate.name,
    smiles: candidate.smiles,
    molecularWeight: candidate.molecularWeight,
    bioavailability: candidate.bioavailability,
    targetOrgans: candidate.targetOrgans,
    target: candidate.target,
    disease: candidate.disease,
    predictionType: candidate.predictionType,
  };
  state.moleculeMode = 'manual';
  state.moleculeResult = null;
  state.selectedHeatmap = null;
}

function validateForm() {
  if (!state.form.drugName.trim() && !state.form.smiles.trim()) return '请输入药物信息后再尝试';
  if (!state.form.disease.trim()) return '请输入药物信息后再尝试';
  if (!isValidUrl(state.form.endpointUrl)) return '模型接口 URL 格式不正确';
  if (needsApiKey() && !state.form.apiKey.trim()) return 'API Key 不能为空';
  return '';
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function needsApiKey() {
  return state.form.endpointUrl !== DEFAULT_MODEL_URL;
}

async function testConnection() {
  if (!isValidUrl(state.form.endpointUrl)) {
    state.connectionStatus = 'error';
    state.message = { type: 'error', text: '模型接口 URL 格式不正确' };
    render();
    return;
  }
  if (needsApiKey() && !state.form.apiKey.trim()) {
    state.connectionStatus = 'error';
    state.message = { type: 'error', text: 'API Key 不能为空' };
    render();
    return;
  }
  state.connectionStatus = 'testing';
  state.message = { type: 'info', text: '正在执行模拟连接测试,不会发送真实 API Key。' };
  render();
  await sleep(650);
  const failed = state.form.endpointUrl.toLowerCase().includes('fail');
  state.connectionStatus = failed ? 'error' : 'success';
  state.message = { type: failed ? 'error' : 'success', text: failed ? '连接失败:模拟接口返回不可用' : '连接成功:已完成模拟握手' };
  render();
}

async function runPrediction() {
  const error = validateForm();
  if (error) {
    state.message = { type: 'error', text: error };
    render();
    return;
  }
  state.isRunning = true;
  state.result = null;
  state.selectedHeatmap = null;
  state.activeAgentIndex = -1;
  state.runLog = ['研究员圆圈激活:准备扫描 2,400 项模拟试验'];
  state.message = { type: 'info', text: '模拟智能体正在启动,所有结果均为 mock 演示。' };
  render();

  const list = orderedAgents();
  for (let index = 0; index < list.length; index += 1) {
    state.activeAgentIndex = index;
    state.runLog = [...state.runLog.slice(-4), `${list[index].name}:${list[index].analysis}`];
    render();
    await sleep(500);
  }

  state.activeAgentIndex = list.length;
  state.runLog = [...state.runLog.slice(-4), '验证员圆圈整合所有评分,生成风险收益判定'];
  render();
  await sleep(450);

  state.result = buildPrediction();
  state.runLog = [...state.runLog.slice(-4), `最终汇聚为${state.result.verdict === 'pass' ? '通过' : '失败'}徽章`];
  state.isRunning = false;
  state.message = { type: 'success', text: '预测完成:结果为模拟输出,仅供研究演示。' };
  render();
}

function validateMolecule() {
  const molecule = state.molecule;
  if (!molecule.name.trim() && !molecule.smiles.trim()) return '请输入药物信息后再尝试';
  if (!molecule.disease.trim()) return '请输入药物信息后再尝试';
  if (!isValidUrl(state.form.endpointUrl)) return '模型接口 URL 格式不正确';
  if (needsApiKey() && !state.form.apiKey.trim()) return 'API Key 不能为空';
  return '';
}

async function predictMolecule() {
  const error = validateMolecule();
  if (error) {
    state.message = { type: 'error', text: error };
    render();
    return;
  }

  state.isMoleculeRunning = true;
  state.moleculeStatus = 'running';
  state.moleculeResult = null;
  state.selectedHeatmap = null;
  state.activeMoleculeAgentIndex = -1;
  state.moleculeRunLog = ['新分子创造器已提交结构,准备请求模型预测作用'];
  state.message = { type: 'info', text: '新分子预测已启动,结果会明确标注模拟或模型来源。' };
  render();

  const list = orderedAgents();
  for (let index = 0; index < list.length; index += 1) {
    state.activeMoleculeAgentIndex = index;
    state.moleculeRunLog = [...state.moleculeRunLog.slice(-4), `${list[index].name}:${list[index].analysis}`];
    render();
    await sleep(420);
  }

  state.activeMoleculeAgentIndex = list.length;
  state.moleculeRunLog = [...state.moleculeRunLog.slice(-4), '本地代理准备发送 REST JSON,并等待模型返回结构化结果'];
  render();

  try {
    const prediction = await requestMoleculePrediction();
    state.moleculeResult = prediction;
    state.moleculeStatus = 'success';
    state.moleculeRunLog = [...state.moleculeRunLog.slice(-4), `模型预测完成:${prediction.verdict === 'pass' ? '通过' : '失败'}徽章已生成`];
    state.message = { type: 'success', text: '新分子预测完成。请注意:结果仅供研究演示,非医疗建议。' };
  } catch (error) {
    state.moleculeStatus = 'error';
    state.moleculeRunLog = [...state.moleculeRunLog.slice(-4), '模型请求失败,未生成伪装成真实模型的结果'];
    state.message = { type: 'error', text: error.message || '模型请求失败' };
  } finally {
    state.isMoleculeRunning = false;
    render();
  }
}

async function requestMoleculePrediction() {
  const fallback = buildMoleculeMockPrediction('本地 mock 预测');

  if (state.form.endpointUrl === DEFAULT_MODEL_URL) {
    return fallback;
  }

  const response = await fetch(proxyUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpointUrl: state.form.endpointUrl,
      apiKey: state.form.apiKey,
      task: 'molecule_effect_prediction',
      modelType: state.form.modelType,
      molecule: clone(state.molecule),
      outputSchema: 'PredictionResult',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `模型代理请求失败 (${response.status})`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return normalizePredictionResult(data.prediction || data.result || data, fallback, data.partial || false);
}

function proxyUrl() {
  return window.location.protocol === 'file:' ? 'http://localhost:5173/api/predict-molecule' : '/api/predict-molecule';
}

function buildMoleculeMockPrediction(sourceNote = '本地模拟预测') {
  const molecule = state.molecule;
  const seed = Array.from(`${molecule.name}${molecule.smiles}${molecule.disease}${molecule.target}${molecule.molecularWeight}${molecule.bioavailability}`).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const highRiskOrgan = molecule.targetOrgans.includes('心脏') || molecule.targetOrgans.includes('胚胎发育');
  const sizePenalty = molecule.molecularWeight > 720 ? 1.2 : molecule.molecularWeight < 180 ? 0.7 : 0;
  const bioPenalty = molecule.bioavailability < 25 ? 1.1 : molecule.bioavailability > 75 ? -0.4 : 0;
  const toxicityPenalty = molecule.predictionType === 'toxicity' ? 0.9 : 0;
  const organRiskScore = clampOneDecimal(3.2 + (seed % 35) / 10 + sizePenalty + bioPenalty + toxicityPenalty + (highRiskOrgan ? 1.1 : 0), 1, 9.8);
  const efficacyScore = clampOneDecimal(4.8 + (seed % 38) / 10 + (molecule.target ? 0.8 : 0) + (molecule.predictionType === 'activity' ? 0.9 : 0), 1, 9.6);
  const verdict = organRiskScore > efficacyScore + 1.2 || organRiskScore >= 7.8 ? 'fail' : 'pass';
  const primaryOrgan = molecule.targetOrgans[0] || '肝脏';
  const secondaryOrgan = molecule.targetOrgans[1] || '肾脏';

  return result({
    id: `new-molecule-${seed}`,
    drugName: molecule.name || '未命名新分子',
    disease: molecule.disease,
    smiles: molecule.smiles,
    predictionType: molecule.predictionType,
    target: molecule.target,
    verdict,
    confidence: Math.max(62, Math.min(91, 68 + (seed % 24))),
    predictionScore: Math.max(16, Math.min(94, Math.round(efficacyScore * 10 - organRiskScore * 3 + (seed % 14)))),
    organRiskScore,
    efficacyScore,
    sideEffects: [
      [`${primaryOrgan}应激信号`, primaryOrgan, 6 + (seed % 18), Math.min(9, Math.round(organRiskScore))],
      [`${secondaryOrgan}代谢负荷`, secondaryOrgan, 4 + (seed % 12), Math.max(3, Math.round(organRiskScore - 2))],
      ['胃肠耐受性波动', '消化系统', 8 + (seed % 10), 3],
    ],
    failureReason: verdict === 'fail' ? '新分子模拟显示器官风险高于预测疗效收益' : '',
    trialTime: `${24 + (seed % 22)} 个月 (模拟 CI: ${20 + (seed % 8)}-${40 + (seed % 14)})`,
    analysis: `${sourceNote}:新分子 ${molecule.name || '未命名'} 的 ${predictionTypeLabel[molecule.predictionType]} 显示${verdict === 'pass' ? '收益风险比暂时可接受' : '需要优先复核安全性'}。所有字段仅供研究演示,非医疗建议。`,
    warning:
      organRiskScore >= 7.5
        ? `警告:此新分子模拟预测 ${primaryOrgan} 高风险 - 请在继续前查阅真实临床数据`
        : '',
    structureHint: molecule.smiles ? '由用户创造 SMILES 生成的结构占位图' : '新分子结构占位图',
    heatmap: [
      [primaryOrgan, Math.max(2, Math.round(efficacyScore - 2)), Math.round(organRiskScore), Math.max(3, Math.round(organRiskScore - 1))],
      [secondaryOrgan, 4 + (seed % 4), Math.max(2, Math.round(organRiskScore - 2)), 4 + (seed % 4)],
      ['肝脏', 4 + (seed % 4), 3 + (seed % 5), 4 + (seed % 5)],
      ['免疫', Math.max(3, Math.round(efficacyScore)), 3 + (seed % 4), 4],
    ],
    evidence: [
      [`SIM-MOL-${seed}01`, '分子分析师', '用户创造分子结构相似性模拟'],
      [`SIM-MOL-${seed}02`, '疗效专家', '靶点作用收益模拟'],
      [`SIM-MOL-${seed}03`, '生物统计学专家', '模型输出归一化与置信区间估计'],
    ],
  });
}

function normalizePredictionResult(raw, fallback, partialFromProxy) {
  const normalized = clone(fallback);
  const partial = Boolean(partialFromProxy);
  const value = raw && typeof raw === 'object' ? raw : {};
  const scalarFields = ['id', 'drugName', 'disease', 'smiles', 'predictionType', 'target', 'verdict', 'confidence', 'predictionScore', 'organRiskScore', 'efficacyScore', 'failureReason', 'trialTime', 'analysis', 'warning', 'structureHint'];

  scalarFields.forEach((field) => {
    if (value[field] !== undefined && value[field] !== null && value[field] !== '') normalized[field] = value[field];
  });

  if (value.drugName === undefined && value.name) normalized.drugName = value.name;
  if (value.sideEffects) normalized.sideEffects = normalizeSideEffects(value.sideEffects, normalized.sideEffects);
  if (value.heatmap) normalized.heatmap = normalizeHeatmap(value.heatmap, normalized.heatmap);
  if (value.evidence) normalized.evidence = normalizeEvidence(value.evidence, normalized.evidence);
  normalized.verdict = normalized.verdict === 'fail' ? 'fail' : 'pass';
  normalized.confidence = Number(normalized.confidence) || fallback.confidence;
  normalized.predictionScore = Number(normalized.predictionScore) || fallback.predictionScore;
  normalized.organRiskScore = Number(normalized.organRiskScore) || fallback.organRiskScore;
  normalized.efficacyScore = Number(normalized.efficacyScore) || fallback.efficacyScore;

  if (partial || missingPredictionFields(value)) {
    normalized.analysis = `${normalized.analysis} 部分字段由本地模拟补齐。`;
    normalized.evidence = [
      ...normalized.evidence,
      { id: `SIM-FILL-${Date.now().toString().slice(-5)}`, agent: '生物统计学专家', note: '模型返回字段不完整,已本地补齐' },
    ];
  }

  return normalized;
}

function normalizeSideEffects(items, fallback) {
  if (!Array.isArray(items) || !items.length) return fallback;
  return items.map((item, index) => ({
    name: item.name || item[0] || `模型副作用 ${index + 1}`,
    organ: item.organ || item[1] || '未指定器官',
    probability: Number(item.probability ?? item[2] ?? 5),
    severity: Number(item.severity ?? item[3] ?? 4),
  }));
}

function normalizeHeatmap(items, fallback) {
  if (!Array.isArray(items) || !items.length) return fallback;
  return items.map((item) => ({
    organ: item.organ || item[0] || '器官',
    activity: Number(item.activity ?? item[1] ?? 4),
    toxicity: Number(item.toxicity ?? item[2] ?? 4),
    admet: Number(item.admet ?? item[3] ?? 4),
  }));
}

function normalizeEvidence(items, fallback) {
  if (!Array.isArray(items) || !items.length) return fallback;
  return items.map((item, index) => ({
    id: item.id || item[0] || `MODEL-EVIDENCE-${index + 1}`,
    agent: item.agent || item[1] || '模型接口',
    note: item.note || item[2] || '模型返回证据',
  }));
}

function missingPredictionFields(value) {
  return ['verdict', 'confidence', 'predictionScore', 'organRiskScore', 'efficacyScore', 'sideEffects', 'heatmap', 'evidence'].some((field) => value[field] === undefined);
}

function clampOneDecimal(value, min, max) {
  return Number(Math.max(min, Math.min(max, value)).toFixed(1));
}

function buildPrediction() {
  const key = aliases[state.form.drugName.trim()] || aliases[state.form.drugName.trim().toLowerCase()];
  if (key && fixedResults[key]) {
    return {
      ...clone(fixedResults[key]),
      disease: state.form.disease || fixedResults[key].disease,
      smiles: state.form.smiles || fixedResults[key].smiles,
      predictionType: state.form.predictionType,
      target: state.form.target || fixedResults[key].target,
    };
  }

  const seed = Array.from(`${state.form.drugName}${state.form.smiles}${state.form.disease}${state.form.predictionType}`).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const organRiskScore = Number((2.5 + (seed % 62) / 10).toFixed(1));
  const efficacyScore = Number((4.2 + (seed % 48) / 10).toFixed(1));
  const verdict = organRiskScore > efficacyScore + 1.1 || organRiskScore >= 7.4 ? 'fail' : 'pass';
  return result({
    id: `custom-${seed}`,
    drugName: state.form.drugName || '未命名药物',
    disease: state.form.disease || '未指定适应症',
    smiles: state.form.smiles,
    predictionType: state.form.predictionType,
    target: state.form.target,
    verdict,
    confidence: Math.max(62, Math.min(88, 70 + (seed % 19))),
    predictionScore: Math.max(18, Math.min(92, Math.round(efficacyScore * 10 - (organRiskScore > efficacyScore ? 32 : 8) + (seed % 12)))),
    organRiskScore,
    efficacyScore,
    sideEffects: [['肝酶升高信号', '肝脏', 6 + (seed % 12), 4 + (seed % 3)], ['心律波动信号', '心脏', 3 + (seed % 10), 4 + (seed % 4)], ['胃肠不适', '消化系统', 8 + (seed % 14), 3]],
    failureReason: verdict === 'fail' ? '模拟器判定器官风险高于疗效收益' : '',
    trialTime: `${26 + (seed % 20)} 个月 (模拟 CI: ${22 + (seed % 8)}-${42 + (seed % 12)})`,
    analysis: verdict === 'pass' ? '未知药物使用本地 mock 规则生成结果,当前模拟显示疗效收益略高于器官风险。' : '未知药物使用本地 mock 规则生成结果,当前模拟提示需要优先复核器官安全性。',
    warning: organRiskScore >= 7.5 ? '警告:此模拟预测高器官风险 - 请在继续前查阅真实临床数据' : '',
    structureHint: state.form.smiles ? '由 SMILES 生成的结构占位图' : '分子结构占位图',
    heatmap: [['心脏', 4 + (seed % 4), Math.round(organRiskScore), 5], ['肝脏', 5, 4 + (seed % 5), 5 + (seed % 4)], ['肾脏', 4, 3 + (seed % 5), 4 + (seed % 4)], ['神经', 3 + (seed % 5), 3 + (seed % 4), 4]],
    evidence: [[`SIM-PMID-${seed}01`, '分子分析师', '结构相似性模拟证据'], [`SIM-PMID-${seed}02`, '毒理学专家', '器官毒性 mock 信号'], [`SIM-PMID-${seed}03`, '生物统计学专家', '风险收益整合模拟']],
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function exportCsv(item) {
  const rows = [
    ['字段', '值'],
    ['药物名称', item.drugName],
    ['疾病', item.disease],
    ['判定结果', item.verdict === 'pass' ? '通过' : '失败'],
    ['预测置信度', `${item.confidence}%`],
    ['预测分数', item.predictionScore],
    ['器官风险评分', item.organRiskScore],
    ['疗效评分', item.efficacyScore],
    ['主要副作用', item.sideEffects.map((effect) => `${effect.name}(${effect.probability}%)`).join('; ')],
    ['失败原因', item.failureReason || '不适用'],
    ['预估试验时间', item.trialTime],
    ['分析说明', item.analysis],
    ['免责声明', '仅供研究使用 - 非医疗建议'],
  ];
  const csv = `\ufeff${rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')}`;
  download(`${item.drugName}-prediction-report.csv`, csv, 'text/csv;charset=utf-8');
}

function exportPdf(item) {
  const lines = [
    'AI Drug Research Sandbox - Mock Prediction Report',
    `Drug: ${item.drugName}`,
    `Disease: ${item.disease}`,
    `Verdict: ${item.verdict === 'pass' ? 'PASS' : 'FAIL'}`,
    `Confidence: ${item.confidence}%`,
    `Prediction score: ${item.predictionScore}/100`,
    `Organ risk score: ${item.organRiskScore}/10`,
    `Efficacy score: ${item.efficacyScore}/10`,
    `Side effects: ${item.sideEffects.map((effect) => `${effect.name} ${effect.probability}%`).join('; ')}`,
    `Failure reason: ${item.failureReason || 'N/A'}`,
    `Estimated trial time: ${item.trialTime}`,
    `Analysis: ${item.analysis}`,
    'Disclaimer: Research demo only. Not medical advice.',
  ].map((line) => line.replace(/[^\x20-\x7e]/g, '?'));
  const pdf = makeSimplePdf(lines);
  download(`${item.drugName}-prediction-report.pdf`, pdf, 'application/pdf');
}

function makeSimplePdf(lines) {
  const safe = (text) => text.replace(/[\\()]/g, '\\$&');
  const stream = `BT /F1 11 Tf 48 790 Td 16 TL ${lines.map((line) => `(${safe(line)}) Tj T*`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

render();
