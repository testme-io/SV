'use strict';

// ─── AUTH ──────────────────────────────────────────────────────────────────
const AUTH_KEY = 'nvsight_auth_v2';

function checkAuth() {
  return localStorage.getItem(AUTH_KEY) === '1';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (user === 'admin' && pass === 'sightendo!') {
    localStorage.setItem(AUTH_KEY, '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display  = 'flex';
    showSection('overview');
  } else {
    const err = document.getElementById('login-error');
    err.textContent = 'Invalid login or password';
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
}

// ─── LANGUAGE ──────────────────────────────────────────────────────────────
let L = localStorage.getItem('lang') || 'en';
const t = (en, ru) => L === 'en' ? en : ru;

function switchLang(lang) {
  L = lang;
  localStorage.setItem('lang', lang);
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
  showSection(currentSection);
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────
let currentSection = 'overview';

const NAV = [
  { id: 'overview',    icon: '🎯' },
  { id: 'regulatory',  icon: '⚖️' },
  { id: 'risks',       icon: '⚠️' },
  { id: 'questions',   icon: '❓' },
  { id: 'plan',        icon: '📋' },
  { id: 'docs',        icon: '📄' },
  { id: 'needs',       icon: '🛠️' },
];

const LABELS = {
  overview:   ['Product Overview',           'Обзор продукта'],
  regulatory: ['Regulatory Standards',       'Регуляторные стандарты'],
  risks:      ['Key Risks',                  'Ключевые риски'],
  questions:  ['Questions for CTO',          'Вопросы к CTO'],
  plan:       ['Preliminary Work Plan',      'Предварительный план работы'],
  docs:       ['QA Documents',               'Документы QA'],
  needs:      ['What I Need',                'Что мне нужно'],
};

function label(id) { return LABELS[id][L === 'en' ? 0 : 1]; }

function buildNav() {
  document.getElementById('nav-subtitle').textContent =
    t('QA Expert · CTO Meeting', 'QA Эксперт · Встреча с CTO');

  document.getElementById('nav-list').innerHTML = NAV.map(s => `
    <li>
      <a href="#" data-section="${s.id}"
         class="${s.id === currentSection ? 'active' : ''}"
         onclick="showSection('${s.id}');return false;">
        <span>${s.icon}</span>
        <span>${label(s.id)}</span>
      </a>
    </li>
  `).join('');

  const footer = document.getElementById('nav-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="nav-footer">
        <button class="nav-export-btn" onclick="exportNotes()">⬇ ${t('Export Notes', 'Экспорт заметок')}</button>
        <button class="nav-import-btn" onclick="importNotes()">⬆ ${t('Import Notes', 'Импорт заметок')}</button>
      </div>`;
  }
}

function showSection(id) {
  currentSection = id;
  buildNav();
  history.replaceState(null, '', '#' + id);
  const main = document.getElementById('main');
  const renders = {
    overview:   renderOverview,
    regulatory: renderRegulatory,
    risks:      renderRisks,
    questions:  renderQuestions,
    plan:       renderPlan,
    docs:       renderDocs,
    needs:      renderNeeds,
  };
  main.innerHTML = (renders[id] || (() => ''))();
}

// ─── OVERVIEW CHIPS ────────────────────────────────────────────────────────
const OV_STATUSES = ['', 'yes', 'no'];
const OV_STATUS_LABELS = {
  '':    ['❓ Not confirmed', '❓ Не утверждено'],
  'yes': ['✅ Yes',           '✅ Да'],
  'no':  ['❌ No',            '❌ Нет'],
};
const OV_STATUS_COLORS = {
  '':    'background:#f1f5f9;color:#64748b;border-color:#cbd5e1',
  'yes': 'background:#f0fdf4;color:#166534;border-color:#86efac',
  'no':  'background:#fef2f2;color:#991b1b;border-color:#fca5a5',
};
function getOvStatus(key) { return localStorage.getItem('ovstatus_' + key) || ''; }
function cycleOvStatus(key) {
  const cur  = getOvStatus(key);
  const idx  = OV_STATUSES.indexOf(cur);
  const next = OV_STATUSES[(idx + 1) % OV_STATUSES.length];
  next ? localStorage.setItem('ovstatus_' + key, next) : localStorage.removeItem('ovstatus_' + key);
  const btn = document.getElementById('ovchip-' + key);
  if (btn) {
    const lbl = OV_STATUS_LABELS[next] || OV_STATUS_LABELS[''];
    btn.textContent = lbl[L === 'en' ? 0 : 1];
    btn.setAttribute('style', 'cursor:pointer;border:1px solid;border-radius:20px;padding:3px 12px;font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:8px;' + (OV_STATUS_COLORS[next] || OV_STATUS_COLORS['']));
  }
}
function renderOvChip(key) {
  const st  = getOvStatus(key);
  const lbl = OV_STATUS_LABELS[st] || OV_STATUS_LABELS[''];
  const col = OV_STATUS_COLORS[st] || OV_STATUS_COLORS[''];
  return `<button id="ovchip-${key}" onclick="cycleOvStatus('${key}')"
    style="cursor:pointer;border:1px solid;border-radius:20px;padding:3px 12px;font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:8px;${col}">${lbl[L === 'en' ? 0 : 1]}</button>`;
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────────
function renderOverview() {
  return `
<h1>CoPilotMD NV-Sight</h1>
<p class="section-desc">${t(
  'AI system for neuro-endovascular procedures - what I understood before the meeting.',
  'AI-система для нейроэндоваскулярных процедур - что я понял до встречи.'
)}</p>

<h2>${t('What the Product Does', 'Что делает продукт')}</h2>
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_product')}
      <p>${t(
        'CoPilotMD NV-Sight is a real-time AI assistant for interventional neuro-radiology. It analyzes angiographic X-ray images during minimally invasive stroke procedures and provides the physician with real-time guidance: vessel anomaly detection, functional brain mapping, and automated clinical reporting.',
        'CoPilotMD NV-Sight - AI-ассистент реального времени для интервенционной нейрорадиологии. Анализирует ангиографические рентгеновские изображения во время малоинвазивных процедур лечения инсульта и предоставляет врачу помощь в реальном времени: детекция сосудистых аномалий, функциональное картирование мозга, автоматизированные клинические отчёты.'
      )}</p>
    </div>
    ${renderNotePanel('ov_product')}
  </div>
</div>

<h2>${t('System Architecture', 'Архитектура системы')}</h2>
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_arch')}
      <table style="font-size:13px;color:#374151;border-collapse:collapse;width:100%">
        <tr>
          <td style="font-family:monospace;padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;color:#1a1a2e;font-weight:600">X-Ray Angio + PACS</td>
          <td style="padding:6px 0;color:#6b7a99;vertical-align:top">${t('the angiography machine in the OR + the hospital system where images are stored','ангиограф в операционной + госпитальная система хранения снимков')}</td>
        </tr>
        <tr><td style="font-family:monospace;padding:2px 16px 2px 0;color:#9ca3af">↓</td><td></td></tr>
        <tr>
          <td style="font-family:monospace;padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;color:#1a1a2e;font-weight:600">CoPilotMD Workstation</td>
          <td style="padding:6px 0;color:#6b7a99;vertical-align:top">${t('the main processing box - receives images, runs the AI, sends results out','главный обрабатывающий блок - принимает снимки, запускает AI, отдаёт результат')}</td>
        </tr>
        <tr>
          <td style="font-family:monospace;padding:4px 16px 4px 12px;white-space:nowrap;vertical-align:top;color:#6b7a99">Receiver</td>
          <td style="padding:4px 0;color:#6b7a99;vertical-align:top">${t('catches the image stream coming from the angio machine','принимает поток снимков с ангиографа')}</td>
        </tr>
        <tr>
          <td style="font-family:monospace;padding:4px 16px 4px 12px;white-space:nowrap;vertical-align:top;color:#6b7a99">Organizer</td>
          <td style="padding:4px 0;color:#6b7a99;vertical-align:top">${t('sorts and prepares frames so the AI gets clean input','сортирует и готовит кадры чтобы AI получал чистый ввод')}</td>
        </tr>
        <tr>
          <td style="font-family:monospace;padding:4px 16px 4px 12px;white-space:nowrap;vertical-align:top;color:#6b7a99">AI Classifier</td>
          <td style="padding:4px 0;color:#6b7a99;vertical-align:top">${t('the model itself - analyses frames and outputs detections in real time','сама модель - анализирует кадры и выдаёт детекции в реальном времени')}</td>
        </tr>
        <tr><td style="font-family:monospace;padding:2px 16px 2px 0;color:#9ca3af">↓</td><td></td></tr>
        <tr>
          <td style="font-family:monospace;padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;color:#1a1a2e;font-weight:600">INR Display</td>
          <td style="padding:6px 0;color:#6b7a99;vertical-align:top">${t('a laptop on the hospital network showing AI output to the physician in real time','ноутбук в сети госпиталя, показывает AI-вывод врачу в реальном времени')}</td>
        </tr>
      </table>
      <p style="margin-top:12px;font-size:13px;color:#6b7a99">${t(
        '⚠ Currently runs on a laptop in the hospital domain. Likely a temporary architecture - QA must be designed to survive infrastructure changes.',
        '⚠ Сейчас работает на ноутбуке в домене госпиталя. Вероятно временная архитектура - QA нужно строить с расчётом на изменения инфраструктуры.'
      )}</p>
    </div>
    ${renderNotePanel('ov_arch')}
  </div>
</div>

<h2>${t('Product Modules', 'Модули продукта')}</h2>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_mod1a')}
      <div class="card-title"><span class="status-pill done" style="margin-right:8px">${t('Live pilot','Живой пилот')}</span> Module 1a - DETECT</div>
      <p>${t('Real-time detection of vessel anomalies - occlusions, vasospasms, emboli. Live pilot at Sheba Medical Center, Israel.','Детекция сосудистых аномалий в реальном времени - окклюзии, вазоспазмы, эмболии. Живой пилот в Sheba Medical Center, Израиль.')}</p>
    </div>
    ${renderNotePanel('ov_mod1a')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_mod1b')}
      <div class="card-title"><span class="status-pill feasibility" style="margin-right:8px">Feasibility</span> Module 1b - UNDERSTAND</div>
      <p>${t('Functional brain mapping - identifies eloquent brain zones at risk during the procedure. Currently at feasibility stage.','Функциональное картирование мозга - выявляет зоны элоквентного мозга под угрозой во время процедуры. Сейчас на стадии feasibility.')}</p>
    </div>
    ${renderNotePanel('ov_mod1b')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_mod2')}
      <div class="card-title"><span class="status-pill after" style="margin-right:8px">${t('Post-MVP','После MVP')}</span> Module 2 - INSIGHT</div>
      <p>${t('Real-time risk analysis and procedural recommendations. Planned after MVP.','Анализ рисков и рекомендации в реальном времени. После MVP.')}</p>
    </div>
    ${renderNotePanel('ov_mod2')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_mod3')}
      <div class="card-title"><span class="status-pill after" style="margin-right:8px">${t('Post-MVP','После MVP')}</span> Module 3 - REPORT</div>
      <p>${t('Automated post-procedure clinical reporting. Planned after MVP.','Автоматические клинические отчёты после процедуры. После MVP.')}</p>
    </div>
    ${renderNotePanel('ov_mod3')}
  </div>
</div>

<h2>${t('Clinical Data', 'Клинические данные')}</h2>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_sheba')}
      <div class="card-title">🇮🇱 Sheba Medical Center</div>
      <p>${t('3,000+ patients · 600 stroke cases · Live pilot running. Primary training data source.','3 000+ пациентов · 600 инсультных случаев · Пилот работает. Основной источник обучающих данных.')}</p>
    </div>
    ${renderNotePanel('ov_sheba')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_sinai')}
      <div class="card-title">🇺🇸 Mount Sinai, New York</div>
      <p>${t('~500 US patients. Must become the independent validation set for FDA submission.','~500 пациентов США. Должен стать независимым validation set для FDA submission.')}</p>
    </div>
    ${renderNotePanel('ov_sinai')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_vincent')}
      <div class="card-title">🇺🇸 St. Vincent, Indiana</div>
      <p>${t('~400 US patients. Part of the FDA submission evidence package.','~400 пациентов США. Часть доказательного пакета для FDA.')}</p>
    </div>
    ${renderNotePanel('ov_vincent')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_perf')}
      <div class="card-title">📊 ${t('Performance Claims', 'Заявленные показатели')}</div>
      <p>${t('>80% accuracy (95% CI) · 12mm spatial accuracy from Ground Truth · ❓ Validated on which dataset?','>80% точность (95% CI) · 12мм пространственная точность от Ground Truth · ❓ Проверено на каких данных?')}</p>
    </div>
    ${renderNotePanel('ov_perf')}
  </div>
</div>

<h2>${t('Regulatory Context', 'Регуляторный контекст')}</h2>
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      ${renderOvChip('ov_reg')}
      <p>${t(
        'Target market: United States → FDA clearance required. Path: 510(k) submission using predicate devices AiDOC, Viz.ai, RapidAI. Key standards: 21 CFR Part 820, IEC 62304 (software lifecycle), ISO 14971 (risk management), IEC 62366 (usability), FDA SaMD guidance. Requires a Quality Management System (QMS) and a Design History File (DHF) with full traceability.',
        'Целевой рынок: США → требуется FDA clearance. Путь: подача 510(k) используя предикатные устройства AiDOC, Viz.ai, RapidAI. Ключевые стандарты: 21 CFR Part 820, IEC 62304 (жизненный цикл ПО), ISO 14971 (управление рисками), IEC 62366 (юзабилити), руководство FDA по SaMD. Требуется QMS и Design History File (DHF) с полной трассируемостью.'
      )}</p>
    </div>
    ${renderNotePanel('ov_reg')}
  </div>
</div>`;
}

// ─── NOTES (generic, keyed by string id) ───────────────────────────────────
function getNoteValue(key) {
  return localStorage.getItem('note_' + key) || '';
}

function renderNoteInline(key) {
  const saved   = getNoteValue(key);
  const label   = t('Notes', 'Заметки');
  const ph      = t('Add a note…', 'Добавить заметку…');
  const saveBtn = t('Save', 'Сохранить');
  const editBtn = t('Edit', 'Изменить');
  if (saved) {
    return `<div class="note-inline" id="np-${key}" data-type="inline">
  <div class="answer-label">${label}</div>
  <div class="answer-text">${saved.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
  <button class="answer-btn edit" onclick="editNote('${key}')">${editBtn}</button>
</div>`;
  }
  return `<div class="note-inline" id="np-${key}" data-type="inline">
  <div class="answer-label">${label}</div>
  <textarea id="ni-${key}" placeholder="${ph}" rows="2"></textarea>
  <button class="answer-btn save" onclick="saveNote('${key}')">${saveBtn}</button>
</div>`;
}

function renderNotePanel(key) {
  const saved   = getNoteValue(key);
  const label   = t('Notes', 'Заметки');
  const ph      = t('Add a note…', 'Добавить заметку…');
  const saveBtn = t('Save', 'Сохранить');
  const editBtn = t('Edit', 'Изменить');

  if (saved) {
    return `<div class="risk-answer" id="np-${key}">
  <div class="answer-label">${label}</div>
  <div class="answer-text">${saved.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
  <button class="answer-btn edit" onclick="editNote('${key}')">${editBtn}</button>
</div>`;
  }
  return `<div class="risk-answer" id="np-${key}">
  <div class="answer-label">${label}</div>
  <textarea id="ni-${key}" placeholder="${ph}"></textarea>
  <button class="answer-btn save" onclick="saveNote('${key}')">${saveBtn}</button>
</div>`;
}

function saveNote(key) {
  const input = document.getElementById('ni-' + key);
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    localStorage.setItem('note_' + key, val);
  } else {
    localStorage.removeItem('note_' + key);
  }
  refreshNotePanel(key);
}

function editNote(key) {
  const panel = document.getElementById('np-' + key);
  if (!panel) return;
  const saved   = getNoteValue(key);
  const isInline = panel.dataset.type === 'inline';
  const rows    = isInline ? ' rows="2"' : '';
  panel.innerHTML = `
  <div class="answer-label">${t('Notes', 'Заметки')}</div>
  <textarea id="ni-${key}"${rows}>${saved}</textarea>
  <button class="answer-btn save" onclick="saveNote('${key}')">${t('Save', 'Сохранить')}</button>`;
}

function refreshNotePanel(key) {
  const panel = document.getElementById('np-' + key);
  if (!panel) return;
  const saved    = getNoteValue(key);
  const isInline = panel.dataset.type === 'inline';
  const ph       = t('Add a note…','Добавить заметку…');
  const rows     = isInline ? ' rows="2"' : '';
  if (saved) {
    panel.innerHTML = `
  <div class="answer-label">${t('Notes', 'Заметки')}</div>
  <div class="answer-text">${saved.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
  <button class="answer-btn edit" onclick="editNote('${key}')">${t('Edit', 'Изменить')}</button>`;
  } else {
    panel.innerHTML = `
  <div class="answer-label">${t('Notes', 'Заметки')}</div>
  <textarea id="ni-${key}"${rows} placeholder="${ph}"></textarea>
  <button class="answer-btn save" onclick="saveNote('${key}')">${t('Save', 'Сохранить')}</button>`;
  }
}

// ─── REGULATORY ────────────────────────────────────────────────────────────
function renderRegulatory() {
  const xref = (label, tags) => tags.length ? `
    <div class="std-links">
      <span class="std-links-label">${label}:</span>
      ${tags.map(t => `<span class="std-tag">${t}</span>`).join('')}
    </div>` : '';

  const sc = (key, title, body, overlaps = [], includes = []) => `
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title">${title}</div>
      <p>${body}</p>
      ${xref(t('Overlaps with', 'Пересекается с'), overlaps)}
      ${xref(t('Includes / required by', 'Включает / требуется'), includes)}
    </div>
    ${renderNotePanel('reg_' + key)}
  </div>
</div>`;

  return `
<h1>${t('Regulatory Standards', 'Регуляторные стандарты')}</h1>
<p class="section-desc">${t(
  'Applicable to CoPilotMD NV-Sight - by market. Final scope depends on which markets they are actually targeting.',
  'Стандарты применимые к CoPilotMD NV-Sight. Финальный scope зависит от того, какие рынки они реально планируют.'
)}</p>

<h2>${t('Common to Both Markets', 'Общие для обоих рынков')}</h2>

${sc('iso13485', 'ISO 13485 - Quality Management System', t(
  'The organisational foundation for all regulated medical device work. Defines how design, development, production, and post-market activities are managed - from writing requirements through to closing defects. Every other standard operates within this framework. QA provides the data; quality management owns the system.',
  'Организационная основа для всей регулируемой работы с медицинскими устройствами. Определяет как управляются проектирование, разработка, производство и пост-маркетинговые активности - от написания требований до закрытия дефектов. Все остальные стандарты работают внутри этой системы. QA предоставляет данные; quality management владеет системой.'
), ['21 CFR Part 820', 'EU MDR 2017/745'], ['IEC 62304', 'ISO 14971', 'IEC 62366'])}

${sc('iec62304', 'IEC 62304 - Medical Device Software Lifecycle', t(
  'The primary standard governing how medical software is developed and tested. Classifies software by safety risk, requires traceability from requirements through architecture to test results, and mandates structured defect management. This is where QA work lives most directly: test plans, test cases, and verification reports must all align with IEC 62304.',
  'Основной стандарт, регулирующий разработку и тестирование медицинского ПО. Классифицирует ПО по уровню риска безопасности, требует трассируемости от требований через архитектуру к результатам тестов, регламентирует структурированное управление дефектами. Именно здесь наиболее непосредственно работает QA: тест-планы, тест-кейсы и отчёты верификации должны соответствовать IEC 62304.'
), ['ISO 14971', '21 CFR Part 820', 'FDA 510(k)'])}

${sc('iso14971', 'ISO 14971 - Risk Management', t(
  'Requires identifying all hazards, analysing failure modes, defining mitigations, and documenting residual risk throughout the product lifecycle. For AI systems this includes incorrect predictions, dataset bias, edge case behaviour, and automation bias. The risk file directly drives QA priorities: higher risk means more rigorous test coverage.',
  'Требует идентификации всех опасностей, анализа режимов отказов, определения мер по снижению рисков и документирования остаточного риска на протяжении всего жизненного цикла продукта. Для AI-систем это включает неверные предсказания, смещение датасета, граничные случаи и автоматизационное смещение. Risk file напрямую определяет приоритеты QA: выше риск - строже тестовое покрытие.'
), ['IEC 62304', 'IEC 62366', 'EU AI Act', 'FDA Cybersecurity Guidance'])}

${sc('iec62366', 'IEC 62366 - Usability Engineering', t(
  'Addresses how users interact with the system under real clinical conditions. For NV-Sight: can a physician correctly interpret AI output under time pressure? Can they recognise when the system is uncertain? Does the display avoid creating false confidence? Requires documented formative and summative usability studies - QA designs and executes the test scenarios.',
  'Охватывает то, как пользователи взаимодействуют с системой в реальных клинических условиях. Для NV-Sight: может ли врач правильно интерпретировать AI-вывод под давлением времени? Может ли он распознать когда система неуверена? Избегает ли дисплей создания ложной уверенности? Требует задокументированных формативных и суммативных юзабилити-исследований - QA проектирует и выполняет тестовые сценарии.'
), ['ISO 14971', 'EU AI Act', 'FDA 510(k)'])}

<h2>${t('United States - FDA', 'США - FDA')}</h2>

${sc('cfr820', '21 CFR Part 820 - Quality System Regulation', t(
  'The FDA\'s QMS requirements, increasingly harmonised with ISO 13485. Covers design controls, CAPA process, supplier qualification, document control, and production records. Assumed to be in place for any 510(k) submission.',
  'QMS-требования FDA, всё более гармонизированные с ISO 13485. Охватывают design controls, процесс CAPA, квалификацию поставщиков, контроль документации и производственные записи. Предполагается соответствие для любой 510(k) подачи.'
), ['ISO 13485', 'IEC 62304'])}

${sc('fda510k', 'FDA 510(k) - Premarket Notification', t(
  'The primary regulatory pathway for CoPilotMD as a Class II medical device. Requires demonstrating substantial equivalence to predicate devices - AiDOC, Viz.ai, and RapidAI are the relevant comparators. QA provides the performance test evidence package that forms the technical core of the submission.',
  'Основной регуляторный путь для CoPilotMD как медицинского устройства класса II. Требует демонстрации существенной эквивалентности предикатным устройствам - AiDOC, Viz.ai и RapidAI являются релевантными компараторами. QA предоставляет пакет доказательств производительности, который формирует техническое ядро submission.'
), ['IEC 62304', 'ISO 14971', 'IEC 62366', 'FDA AI/ML SaMD', 'FDA Cybersecurity Guidance', 'PCCP'])}

${sc('fdaaiml', 'FDA AI/ML SaMD Guidance', t(
  'The FDA\'s framework for AI-enabled Software as a Medical Device. Sets expectations around model transparency, performance thresholds, clinical validation, and lifecycle management. Defines what the validation evidence package must contain and how it should be structured.',
  'Руководство FDA по AI-enabled Software as a Medical Device. Определяет ожидания относительно прозрачности модели, порогов производительности, клинической валидации и управления жизненным циклом. Задаёт структуру и содержание пакета доказательств валидации.'
), ['FDA 510(k)', 'EU AI Act', 'ISO 14971'])}

${sc('fdacyber', 'FDA Cybersecurity Guidance', t(
  'Mandatory for all new device submissions since 2023. Requires threat modelling, a Software Bill of Materials (SBOM), a vulnerability management plan, and post-market monitoring protocols. QA contributes security test cases and validates that controls perform as specified.',
  'Обязательно для всех новых подач устройств с 2023 года. Требует моделирование угроз, Software Bill of Materials (SBOM), план управления уязвимостями и протоколы пост-маркетингового мониторинга. QA вносит тест-кейсы безопасности и валидирует что контроли работают как заявлено.'
), ['FDA 510(k)', 'ISO 14971', 'EU MDR 2017/745'])}

${sc('pccp', 'PCCP - Predetermined Change Control Plan', t(
  'Required when the AI model will be updated or retrained after market clearance. Defines in advance which types of changes are permitted without a new 510(k) submission. If model updates are part of the product roadmap - and for an AI medical device they almost certainly are - the PCCP must be built into the QA framework from day one.',
  'Требуется когда AI-модель будет обновляться или переобучаться после получения market clearance. Заранее определяет какие типы изменений разрешены без новой подачи 510(k). Если обновления модели являются частью roadmap - а для AI медицинского устройства это почти наверняка так - PCCP необходимо встроить в QA-фреймворк с первого дня.'
), ['FDA 510(k)', 'EU AI Act'])}

${sc('hipaa', 'HIPAA', t(
  'Governs the use of US patient data. All clinical data from Mount Sinai and St. Vincent must be properly de-identified before it can enter the validation pipeline. Not a QA deliverable, but a hard prerequisite: testing cannot start on US data until HIPAA compliance is confirmed.',
  'Регулирует использование данных пациентов США. Все клинические данные из Mount Sinai и St. Vincent должны быть надлежащим образом деидентифицированы до входа в тестовый pipeline. Не является QA-deliverable, но является жёстким prerequisite: тестирование на US-данных не может начаться пока не подтверждено соответствие HIPAA.'
), ['GDPR', 'FDA 510(k)'])}

<h2>${t('Europe - CE Mark', 'Европа - CE Mark')}</h2>

${sc('mdr', 'EU MDR 2017/745 - Medical Device Regulation', t(
  'The primary European regulatory framework, replacing the older MDD directive. More demanding than FDA in several respects - particularly around clinical evidence requirements and post-market surveillance obligations. Meeting MDR requirements typically simplifies subsequent FDA compliance, not the reverse.',
  'Основная европейская регуляторная система, заменившая старую директиву MDD. Более требовательная чем FDA в ряде аспектов - особенно в части требований к клиническим доказательствам и обязательствам по пост-маркетинговому надзору. Соответствие требованиям MDR, как правило, упрощает последующее соответствие FDA, а не наоборот.'
), ['ISO 13485', 'IEC 62304', 'ISO 14971', 'IEC 62366', 'FDA 510(k)'], ['MDR Annex I (GSPR)'])}

${sc('gspr', 'MDR Annex I - General Safety and Performance Requirements (GSPR)', t(
  'The technical checklist every device must satisfy to receive CE Mark. Each requirement must be mapped to specific evidence - test reports, standards compliance, clinical data. QA produces a substantial portion of this evidence through verification and validation testing.',
  'Технический чеклист который каждое устройство должно выполнить для получения CE Mark. Каждое требование должно быть привязано к конкретным доказательствам - тестовые отчёты, соответствие стандартам, клинические данные. QA производит значительную часть этих доказательств через верификационное и валидационное тестирование.'
), ['EU MDR 2017/745', 'IEC 62304', 'ISO 14971'])}

${sc('gdpr', 'GDPR - General Data Protection Regulation', t(
  'The European equivalent of HIPAA, with stricter consent and data minimisation requirements. Applies to any clinical data from EU patients used in training or validation. Must be confirmed before any EU patient data enters the testing pipeline.',
  'Европейский эквивалент HIPAA, с более строгими требованиями к согласию и минимизации данных. Применяется к любым клиническим данным пациентов ЕС используемым в обучении или валидации. Должно быть подтверждено до того как любые данные пациентов ЕС войдут в тестовый pipeline.'
), ['HIPAA', 'EU MDR 2017/745'])}

${sc('euaiact', 'EU AI Act', t(
  'New regulation entering into force 2024–2026, classifying medical AI as high-risk by definition. Adds requirements beyond MDR: transparency of AI decision logic, human oversight mechanisms, robustness testing, bias assessment, and conformity assessment. Overlaps significantly with MDR but cannot be satisfied by MDR compliance alone.',
  'Новый регламент, вступающий в силу в 2024–2026 годах, классифицирующий медицинский AI как высокорисковый по определению. Добавляет требования сверх MDR: прозрачность логики AI-решений, механизмы человеческого надзора, тестирование на устойчивость, оценка смещения и оценка соответствия. Существенно пересекается с MDR, но не покрывается только соответствием MDR.'
), ['EU MDR 2017/745', 'FDA AI/ML SaMD', 'ISO 14971', 'IEC 62366'])}

<h2>${t('QA Approach', 'Принцип работы QA')}</h2>

${sc('approach1', t('Standards Define Structure, Not Additional Work', 'Стандарты определяют структуру, а не дополнительную работу'), t(
  'These standards do not require creating separate documentation for regulators alongside regular QA work. They define how that work should be organised from the start. A test case written to IEC 62304 is still a test case. A defect logged with CAPA traceability is still a defect report. The difference is that every artefact is structured, linked, and stored in a way that can be audited on demand.',
  'Эти стандарты не требуют создания отдельной документации для регуляторов параллельно с обычной QA-работой. Они определяют как эта работа должна быть организована с самого начала. Тест-кейс написанный по IEC 62304 - это всё ещё тест-кейс. Дефект занесённый с CAPA-трассируемостью - это всё ещё отчёт о дефекте. Разница в том что каждый артефакт структурирован, связан и хранится так, что может быть проверен по требованию.'
))}

${sc('approach2', t('QA Contributes, But Does Not Own Everything', 'QA участвует, но не владеет всем'), t(
  'QA owns: test plans, test cases, verification reports, defect management, and usability test execution. QA contributes to: risk assessments, Design History File assembly, CAPA records. Regulatory consultant owns: submission strategy, final documentation, and direct FDA/MDR communication. Without a consultant, I am guessing what the regulator actually wants — that is too expensive a guess.',
  'QA владеет: тест-планами, тест-кейсами, отчётами верификации, управлением дефектами и выполнением юзабилити-тестов. QA участвует в: оценках рисков, сборке Design History File, записях CAPA. Regulatory consultant владеет: стратегией подачи, финальной документацией и прямой коммуникацией с FDA/MDR. Без консультанта я буду гадать что регулятор на самом деле требует — это слишком дорогая догадка.'
))}

${sc('approach3', t('Everything Feeds the Design History File', 'Всё входит в Design History File'), t(
  'The DHF is the document package submitted to FDA. It accumulates everything produced during development: requirements, risk assessments, architectural decisions, test results, defect records, and corrective actions. My job is to make sure nothing gets lost and everything is written clearly enough that a regulator can follow it without me in the room.',
  'DHF - пакет документов который подаётся в FDA. Накапливает всё произведённое в процессе разработки: требования, оценки рисков, архитектурные решения, результаты тестов, записи о дефектах и корректирующие действия. Моя задача - следить чтобы ничего не терялось и всё было написано достаточно понятно, чтобы регулятор мог разобраться без меня.'
))}
`;
}

// ─── RISK ANSWERS ──────────────────────────────────────────────────────────
function getAnswer(i) {
  return localStorage.getItem('risk_answer_' + i) || '';
}

function renderAnswerPanel(i) {
  const saved   = getAnswer(i);
  const label   = t('CTO Answer', 'Ответ CTO');
  const ph      = t('Type the answer here…', 'Введите ответ здесь…');
  const saveBtn = t('Save', 'Сохранить');
  const editBtn = t('Edit', 'Изменить');

  if (saved) {
    return `<div class="risk-answer" id="ra-panel-${i}">
  <div class="answer-label">${label}</div>
  <div class="answer-text">${saved.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
  <button class="answer-btn edit" onclick="editRiskAnswer(${i})">${editBtn}</button>
</div>`;
  }
  return `<div class="risk-answer" id="ra-panel-${i}">
  <div class="answer-label">${label}</div>
  <textarea id="ra-input-${i}" placeholder="${ph}"></textarea>
  <button class="answer-btn save" onclick="saveRiskAnswer(${i})">${saveBtn}</button>
</div>`;
}

function saveRiskAnswer(i) {
  const input = document.getElementById('ra-input-' + i);
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    localStorage.setItem('risk_answer_' + i, val);
  } else {
    localStorage.removeItem('risk_answer_' + i);
  }
  refreshAnswerPanel(i);
}

function editRiskAnswer(i) {
  const panel = document.getElementById('ra-panel-' + i);
  if (!panel) return;
  const saved = getAnswer(i);
  panel.innerHTML = `
  <div class="answer-label">${t('CTO Answer', 'Ответ CTO')}</div>
  <textarea id="ra-input-${i}">${saved}</textarea>
  <button class="answer-btn save" onclick="saveRiskAnswer(${i})">${t('Save', 'Сохранить')}</button>`;
}

function refreshAnswerPanel(i) {
  const panel = document.getElementById('ra-panel-' + i);
  if (!panel) return;
  const saved = getAnswer(i);
  panel.innerHTML = `
  <div class="answer-label">${t('CTO Answer', 'Ответ CTO')}</div>
  <div class="answer-text">${saved.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
  <button class="answer-btn edit" onclick="editRiskAnswer(${i})">${t('Edit', 'Изменить')}</button>`;
}

// ─── RISKS ─────────────────────────────────────────────────────────────────
function renderRisks() {
  const risks = [
    {
      level: 'critical',
      title: t('Training = Validation Dataset', 'Training = Validation датасет'),
      body: t(
        'The claimed >80% accuracy may have been measured on data the model was trained on - not an independent set. This is a showstopper for FDA: validating on training data proves nothing. US data (Mount Sinai, St. Vincent) must become the independent validation set. Must clarify on day one.',
        'Заявленные >80% точности могут быть измерены на тех же данных, на которых обучали - не независимом датасете. Это стоп-фактор для FDA: валидация на обучающих данных ничего не доказывает. US данные (Mount Sinai, St. Vincent) должны стать независимым validation set. Уточнить в первый день.'
      ),
      expect: t(
        'Expected: possible overlap. Action: US dataset becomes independent validation set - first QA priority.',
        'Ожидаем: возможно пересекаются. Действие: US датасет становится независимым validation set - первый приоритет QA.'
      ),
    },
    {
      level: 'critical',
      title: t('System Live in Clinic Without QA', 'Система работает в клинике без QA'),
      body: t(
        'The Sheba pilot is running in an active OR with no formal QA process, no documented test coverage, no structured issue log. Any incident right now is a reputational and regulatory liability. First action: audit current state, document as baseline, capture all known issues from the pilot. This is not a criticism - it is the starting point.',
        'Пилот в Sheba работает в операционной без формального QA-процесса, без задокументированного покрытия тестами, без структурированного лога проблем. Любой инцидент сейчас - репутационный и регуляторный риск. Первое действие: аудит текущего состояния, фиксация как baseline, запись всех известных проблем из пилота. Это не критика - это отправная точка.'
      ),
      expect: t(
        'Expected: informal feedback notes. Action: formal baseline audit - this is day-1 work.',
        'Ожидаем: неформальные заметки. Действие: формальный baseline аудит - это работа первого дня.'
      ),
    },
    {
      level: 'high',
      title: t('Module 2 at Feasibility Stage', 'Module 2 на стадии Feasibility'),
      body: t(
        'MVP requires both modules. If Module 2 (UNDERSTAND - functional brain mapping) does not stabilize on schedule, the entire FDA timeline shifts. Need a realistic development forecast before committing to any engagement plan.',
        'MVP требует оба модуля. Если Module 2 (UNDERSTAND - функциональное картирование мозга) не стабилизируется в срок - весь FDA timeline сдвигается. Нужен реалистичный прогноз разработки до принятия любого плана работы.'
      ),
      expect: t(
        'Expected: 1-2 months to stable version. Directly affects the 90-day plan structure.',
        'Ожидаем: 1-2 месяца до стабильной версии. Напрямую влияет на структуру 90-дневного плана.'
      ),
    },
    {
      level: 'high',
      title: t('Laptop as Production Hardware', 'Ноутбук как Production-оборудование'),
      body: t(
        'A laptop in the OR is a risk vector: overheating during long procedures, network drops, system crash mid-procedure. Need to know: is this the permanent production architecture, or a temporary workaround? The answer changes the QA strategy significantly.',
        'Ноутбук в операционной - вектор риска: перегрев во время длинных процедур, потеря сети, зависание посреди процедуры. Нужно знать: постоянная production архитектура или временное решение? Ответ значительно меняет QA-стратегию.'
      ),
      expect: t(
        'Expected: temporary. If permanent - performance and reliability testing become critical path.',
        'Ожидаем: временное. Если постоянное - performance и reliability testing становятся критическим путём.'
      ),
    },
    {
      level: 'high',
      title: t('Each New Hospital = New Integration', 'Каждый новый госпиталь = новая интеграция'),
      body: t(
        '"No hardware changes" is a thesis, not a guarantee. Different PACS systems, different angiograph vendors, different network configurations at every US site. Without a standardized site acceptance testing protocol, every new hospital connection is an uncontrolled risk.',
        '"Без изменений железа" - тезис, не гарантия. Разные PACS системы, разные ангиографы, разные сетевые конфигурации на каждом US-сайте. Без стандартизированного site acceptance testing protocol каждое новое подключение - неконтролируемый риск.'
      ),
      expect: t(
        'Expected: only Sheba configuration tested. Deliverable: standardized site acceptance checklist.',
        'Ожидаем: только конфигурация Sheba протестирована. Результат: стандартный site acceptance чеклист.'
      ),
    },
    {
      level: 'high',
      title: t('No Formal Requirements Documentation', 'Нет формальных требований'),
      body: t(
        'The system was built without documented product requirements. Jira tickets and informal notes cannot serve as a traceability baseline for FDA submission - a regulator needs to see a clear chain: requirement → test case → result. Without this chain, test coverage cannot be formally demonstrated, and the Design History File cannot be assembled.',
        'Система построена без задокументированных product requirements. Jira-тикеты и неформальные заметки не могут служить baseline трассируемости для FDA submission - регулятор должен видеть чёткую цепочку: требование → тест-кейс → результат. Без этой цепочки тестовое покрытие нельзя формально доказать, а Design History File нельзя собрать.'
      ),
      expect: t(
        'Expected: no formal requirements exist. Action: retrospective requirements documentation in first 30 days - QA extracts requirements from existing system behaviour, Jira, and dev conversations, then gets sign-off from CTO and clinical expert. No BA is needed; this is standard practice in early-stage medical device companies.',
        'Ожидаем: формальных требований нет. Действие: ретроспективная документация требований в первые 30 дней - QA извлекает требования из существующего поведения системы, Jira и разговоров с разработчиками, затем получает sign-off от CTO и клинического эксперта. BA для этого не нужен - это стандартная практика в ранних медицинских стартапах.'
      ),
    },
    {
      level: 'medium',
      title: t('Ground Truth Annotation Status Unknown', 'Статус Ground Truth разметки неизвестен'),
      body: t(
        'Clinical expert-annotated data is the foundation of any model validation. If annotation is incomplete - validation is blocked. Key questions: who annotated, what protocol was used, what is the inter-annotator agreement score, is it finished?',
        'Данные с разметкой клинических экспертов - основа любой валидации модели. Если разметка не завершена - валидация заблокирована. Ключевые вопросы: кто размечал, по какому протоколу, inter-annotator agreement, завершена ли разметка?'
      ),
      expect: t(
        'Expected: partially done. If not complete - this becomes the #1 bottleneck blocking everything else.',
        'Ожидаем: частично завершена. Если нет - становится узким местом #1, блокирующим всё остальное.'
      ),
    },
    {
      level: 'medium',
      title: t('No Regulatory Consultant Identified', 'Нет регуляторного консультанта'),
      body: t(
        'Without a regulatory consultant we are guessing what FDA actually requires. Building a QA system without knowing the exact target is expensive and risky. Engaging a regulatory consultant must be a parallel track to QA setup from day one.',
        'Без регуляторного консультанта мы гадаем что на самом деле требует FDA. Строить QA-систему не зная точной цели - дорого и рискованно. Привлечение регуляторного консультанта должно быть параллельным треком к QA с первого дня.'
      ),
      expect: t(
        'Expected: not yet engaged. Action: identify and engage in parallel with QA setup.',
        'Ожидаем: ещё не привлечён. Действие: найти и привлечь параллельно с выстраиванием QA.'
      ),
    },
  ];

  return `
<h1>${t('Key Risks', 'Ключевые риски')}</h1>
<p class="section-desc">${t(
  'Risks I can see before the first conversation - based on the case study only.',
  'Риски, которые я вижу до первого разговора - только на основе case study.'
)}</p>

${risks.map((r, i) => `
<div class="card risk-card ${r.level}">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title">
        <span class="badge ${r.level}">${r.level.toUpperCase()}</span>
        ${r.title}
      </div>
      <p>${r.body}</p>
      <div class="expect-box">
        <strong>${t('Expected answer / action', 'Ожидаемый ответ / действие')}</strong>
        ${r.expect}
      </div>
    </div>
    ${renderAnswerPanel(i)}
  </div>
</div>
`).join('')}`;
}

// ─── CUSTOM QUESTIONS ──────────────────────────────────────────────────────
function getCustomQs() {
  try { return JSON.parse(localStorage.getItem('custom_qs') || '[]'); }
  catch(e) { return []; }
}

function renderCustomQCard(idx, editing) {
  const qs   = getCustomQs();
  const item = qs[idx] || { q: '', a: '' };
  const isNew = !item.q && !item.a;
  if (editing === undefined) editing = isNew;

  const labelText = t('ADDED', 'ДОБАВЛЕН');
  const saveBtn   = t('Save',   'Сохранить');
  const editBtn   = t('Edit',   'Изменить');
  const delBtn    = t('Delete', 'Удалить');

  if (editing) {
    return `
<div id="cq-card-${idx}" class="q-card" style="border-color:#e9d5ff">
  <div class="q-label" style="background:#fdf4ff;color:#6b21a8">${labelText}</div>
  <textarea id="cq-q-${idx}" rows="2" placeholder="${t('Question…','Вопрос…')}"
    style="width:100%;box-sizing:border-box;margin-top:8px;padding:8px;border:1px solid #e9d5ff;border-radius:6px;font-size:13px;resize:vertical;font-family:inherit">${item.q}</textarea>
  <textarea id="cq-a-${idx}" rows="2" placeholder="${t('Answer…','Ответ…')}"
    style="width:100%;box-sizing:border-box;margin-top:6px;padding:8px;border:1px solid #bae6fd;border-radius:6px;font-size:13px;resize:vertical;font-family:inherit">${item.a}</textarea>
  <div style="margin-top:8px;display:flex;gap:8px">
    <button class="answer-btn save" onclick="saveCustomQ(${idx})">${saveBtn}</button>
    ${!isNew ? `<button class="answer-btn edit" style="background:#fef2f2;color:#991b1b;border-color:#fca5a5" onclick="deleteCustomQ(${idx})">${delBtn}</button>` : ''}
  </div>
</div>`;
  }

  return `
<div id="cq-card-${idx}" class="q-card" style="border-color:#e9d5ff">
  <div class="q-label" style="background:#fdf4ff;color:#6b21a8">${labelText}</div>
  <div class="question" style="margin-top:6px">${item.q || '-'}</div>
  ${item.a ? `<div class="expect-box"><strong>${t('Answer','Ответ')}</strong>${item.a}</div>` : ''}
  <div style="margin-top:10px;display:flex;gap:8px">
    <button class="answer-btn edit" onclick="editCustomQ(${idx})">${editBtn}</button>
    <button class="answer-btn edit" style="background:#fef2f2;color:#991b1b;border-color:#fca5a5" onclick="deleteCustomQ(${idx})">${delBtn}</button>
  </div>
</div>`;
}

function refreshCustomQ(idx, editing) {
  const card = document.getElementById('cq-card-' + idx);
  if (!card) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCustomQCard(idx, editing);
  card.replaceWith(tmp.firstElementChild);
}

function saveCustomQ(idx) {
  const qEl = document.getElementById('cq-q-' + idx);
  const aEl = document.getElementById('cq-a-' + idx);
  if (!qEl) return;
  const qs = getCustomQs();
  qs[idx] = { q: qEl.value.trim(), a: aEl ? aEl.value.trim() : '' };
  localStorage.setItem('custom_qs', JSON.stringify(qs));
  refreshCustomQ(idx, false);
}

function editCustomQ(idx) { refreshCustomQ(idx, true); }

function deleteCustomQ(idx) {
  const qs = getCustomQs();
  qs.splice(idx, 1);
  qs.length ? localStorage.setItem('custom_qs', JSON.stringify(qs))
            : localStorage.removeItem('custom_qs');
  const c = document.getElementById('custom-qs-container');
  if (c) c.innerHTML = qs.map((_, i) => renderCustomQCard(i, false)).join('');
}

function addCustomQ() {
  const qs  = getCustomQs();
  const idx = qs.length;
  qs.push({ q: '', a: '' });
  localStorage.setItem('custom_qs', JSON.stringify(qs));
  const c = document.getElementById('custom-qs-container');
  if (c) {
    const tmp = document.createElement('div');
    tmp.innerHTML = renderCustomQCard(idx, true);
    c.appendChild(tmp.firstElementChild);
    document.getElementById('cq-card-' + idx)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ─── QUESTIONS ─────────────────────────────────────────────────────────────
function renderQuestions() {
  const must = [
    {
      q: t(
        '"What format do you expect for the test assignment - slides, document, live discussion? Are there examples of formats you like or do not like?"',
        '"В каком формате вы ожидаете тестовое задание - слайды, документ, живой разговор? Есть примеры форматов которые вам нравятся или нет?"'
      ),
      g: t(
        'Know how to prepare.',
        'Понять как готовиться.'
      ),
      a: t(
        'Expected: slides. Need this to spend preparation time correctly.',
        'Ожидаем: слайды. Нужно чтобы правильно потратить время на подготовку.'
      ),
    },
    {
      q: t(
        '"Who is the presentation for - CTO only, or is the CEO also present?"',
        '"На кого рассчитана презентация - только CTO или CEO тоже присутствует?"'
      ),
      g: t(
        'Determine the specific approach to the presentation.',
        'Определить специфику подачи презентации.'
      ),
      a: t(
        'Expected: panel with CTO + CEO minimum. Need to balance technical and business language.',
        'Ожидаем: panel минимум CTO + CEO. Нужно найти баланс между техническим и бизнес языком.'
      ),
    },
    {
      q: t(
        '"Which markets are the priority - US only, Europe only, or both simultaneously? And in what order?"',
        '"Какие рынки в приоритете - только США, только Европа, или оба одновременно? И в какой последовательности?"'
      ),
      g: t(
        'Determines the entire regulatory scope and documentation standard. US only - FDA 510(k) path, HIPAA, no CE work. Europe only - EU MDR, GDPR, no FDA work. Both - the full list from the Regulatory Standards section applies, with significantly more documentation effort. The answer also tells us which dataset sources (US sites vs EU sites) to prioritize first.',
        'Определяет весь регуляторный scope и стандарт документации. Только США - путь FDA 510(k), HIPAA, CE не нужен. Только Европа - EU MDR, GDPR, FDA не нужен. Оба рынка - применяется полный список из раздела Регуляторные стандарты, с существенно большим объёмом документации. Ответ также определяет какие источники данных (US сайты или EU сайты) приоритизировать первыми.'
      ),
      a: t(
        'Expected: US first, then Europe. Changes nothing about the QA approach but immediately narrows the regulatory checklist to focus on.',
        'Ожидаем: сначала США, потом Европа. Не меняет QA подход но сразу сужает регуляторный чеклист до нужного фокуса.'
      ),
    },
    {
      q: t(
        '"Was the model validated on an independent dataset, or does it overlap with training data?"',
        '"Модель валидировалась на независимом датасете или пересекается с обучающими данными?"'
      ),
      g: t(
        'Identify the first critical FDA gap. FDA requires a clean separation between training and validation data. If they overlap, US data collection becomes the first unblocking task.',
        'Выявить первый критический FDA gap. FDA требует чёткого разделения обучающих и валидационных данных. Если пересекаются - сбор US данных становится первой разблокирующей задачей.'
      ),
      a: t(
        'Expected: possible overlap. This is the first critical gap for FDA - US data must become the independent validation set.',
        'Ожидаем: возможно пересекаются. Это первый критический gap для FDA - US данные должны стать независимым validation set.'
      ),
    },
    {
      q: t(
        '"Was clinical data collected under IRB approval and de-identified per HIPAA/FDA standards?"',
        '"Клинические данные собирались под IRB approval и деидентифицированы по HIPAA/FDA стандартам?"'
      ),
      g: t(
        'Determine if data can legally enter the QA pipeline at all. Missing IRB or HIPAA compliance blocks everything - no testing can start on that data until it is resolved.',
        'Определить можно ли вообще юридически использовать данные в QA pipeline. Отсутствие IRB или HIPAA compliance блокирует всё - тестирование на этих данных невозможно пока не решено.'
      ),
      a: t(
        'Expected: yes. Without this, data cannot be used in a submission (submission - the regulatory approval filing sent to FDA).',
        'Ожидаем: да. Без этого данные нельзя использовать в submission (submission - пакет документов на одобрение, который подаём в FDA).'
      ),
    },
    {
      q: t(
        '"Is there already an FDA regulatory consultant engaged, or does that need to be organized?"',
        '"Есть ли уже контакт с FDA или регуляторным консультантом, или это нужно будет организовать?"'
      ),
      g: t(
        'Understand who owns the submission requirements. Without a regulatory consultant, QA direction is guesswork - we would be building evidence for a standard we have not confirmed applies.',
        'Понять кто владеет требованиями к submission. Без регуляторного консультанта QA-направление строится на догадках - мы создаём доказательства для стандарта который не подтверждён.'
      ),
      a: t(
        'Expected: not yet or just starting. Need to understand how independent we are in defining requirements.',
        'Ожидаем: нет или только начинают. Нужно понять насколько мы самостоятельны в определении требований.'
      ),
    },
    {
      q: t(
        '"Is there a log of issues from the Sheba pilot - what physicians reported, what did not work?"',
        '"Есть ли лог проблем из Sheba пилота - что сообщали врачи, что не работало?"'
      ),
      g: t(
        'Find an existing QA backlog to avoid starting from zero. Real issues from real production usage are worth more than any test plan written in isolation.',
        'Найти готовый QA backlog чтобы не начинать с нуля. Реальные проблемы реального использования стоят больше любого тест-плана написанного в изоляции.'
      ),
      a: t(
        'Expected: informal notes. This is a ready-made QA backlog - real problems from real production usage.',
        'Ожидаем: неформальные заметки. Это готовый QA backlog - реальные проблемы реального использования.'
      ),
    },
    {
      q: t(
        '"Why is the engagement structured as 3 months? Is this a trial period, a project milestone, or a budget decision?"',
        '"Почему контракт на 3 месяца? Это испытательный срок, проектный milestone или бюджетное решение?"'
      ),
      g: t(
        'Calibrate the engagement model and priority order. A trial period means proving value in the first 30 days. A fixed milestone means knowing exactly what "done" looks like at month 3. The answer changes what gets prioritized from day one.',
        'Откалибровать модель работы и порядок приоритетов. Trial period - доказываю ценность в первые 30 дней. Фиксированный milestone - понимаю как выглядит "done" к месяцу 3. Ответ меняет приоритеты с первого дня.'
      ),
      a: t(
        'Expected: trial period or milestone-based. Either way, the first 30 days must show visible, measurable output.',
        'Ожидаем: испытательный срок или milestone-based. В любом случае первые 30 дней должны показать видимый измеримый результат.'
      ),
    },
    {
      q: t(
        '"What is the plan for QA after the contract ends - extend, hire a permanent QA, build a team, transfer the project, or sell?"',
        '"Что планируется с QA после окончания контракта - продление, найм постоянного QA, своя команда, передача проекта или продажа?"'
      ),
      g: t(
        'Determines what to leave behind and how to structure all output. Handing over to a new hire means thorough documentation of every process built. Extension means focus on delivery. Selling or transferring - the DHF and process documentation become the primary asset being handed over.',
        'Определяет что оставить после себя и как структурировать всю работу. Передача новому сотруднику - подробная документация каждого выстроенного процесса. Продление - фокус на результате. Продажа или передача - DHF и документация процессов становятся основным передаваемым активом.'
      ),
      a: t(
        'Expected: extension or permanent hire. If selling or transferring - the documentation standard immediately goes up.',
        'Ожидаем: продление или постоянный найм. Если продажа или передача - требования к документации сразу вырастают.'
      ),
    },
  ];

  const important = [
    {
      q: t(
        '"What makes up the remaining 10% to MVP-ready in Module 1?"',
        '"Что составляет оставшиеся 10% до MVP ready в Module 1?"'
      ),
      g: t(
        'Locate where the active risk sits right now before any planning. Edge cases and integration issues are very different things to test for.',
        'Найти где горячий риск прямо сейчас до любого планирования. Edge cases и интеграционные проблемы - принципиально разные объекты тестирования.'
      ),
      a: t(
        'Expected: edge cases or integration. Need to know where the active risks are right now.',
        'Ожидаем: edge cases или интеграция. Нужно понять где горячие риски прямо сейчас.'
      ),
    },
    {
      q: t(
        '"Is the laptop a temporary solution or the final production architecture?"',
        '"Ноутбук - временное решение или финальная production архитектура?"'
      ),
      g: t(
        'Distinguish what needs testing now from what to defer. If it is temporary, performance benchmarking on current hardware is wasted effort.',
        'Разделить что тестировать сейчас от того что отложить. Если временное - performance benchmarking на текущем железе это потраченные впустую усилия.'
      ),
      a: t(
        'Expected: temporary. Affects what to test now versus what to defer.',
        'Ожидаем: временное. Влияет на то что тестировать сейчас а что отложить.'
      ),
    },
    {
      q: t(
        '"Module 2 is at feasibility - is there a timeline to a stable, testable version?"',
        '"Module 2 на feasibility - есть ли timeline до stable, тестируемой версии?"'
      ),
      g: t(
        'Build a realistic 90-day plan. An unstable Module 2 with no timeline changes the entire engagement structure - resources shift fully to Module 1 and regulatory work.',
        'Составить реалистичный 90-дневный план. Нестабильный Module 2 без timeline меняет всю структуру работы - ресурсы полностью смещаются на Module 1 и regulatory.'
      ),
      a: t(
        'Expected: 1-2 months. Directly affects the 90-day plan.',
        'Ожидаем: 1-2 месяца. Напрямую влияет на 90-дневный план.'
      ),
    },
    {
      q: t(
        '"Is clinical data already annotated with ground truth labels (ground truth - verified correct answers used to measure AI accuracy), or is annotation still ongoing?"',
        '"Клинические данные уже размечены ground truth метками (ground truth - эталонная разметка, правильные ответы по которым проверяется точность AI), или разметка продолжается?"'
      ),
      g: t(
        'Identify whether validation is blocked before committing to any timeline. Incomplete annotation is the single most common reason AI medical device validation stalls.',
        'Определить заблокирована ли валидация до принятия любых сроков. Незавершённая разметка - самая частая причина стагнации валидации AI медицинских устройств.'
      ),
      a: t(
        'Expected: partially done. If not complete - this is the bottleneck that blocks all validation.',
        'Ожидаем: частично завершена. Если нет - это bottleneck который блокирует всю валидацию.'
      ),
    },
    {
      q: t(
        '"Do modules 1 and 2 run sequentially in the pipeline, or can they operate independently?"',
        '"Модули 1 и 2 работают последовательно в pipeline или могут работать независимо?"'
      ),
      g: t(
        'Determine whether integration testing is a separate and mandatory work item, or whether modules can be fully tested in isolation.',
        'Определить является ли интеграционное тестирование отдельным обязательным пунктом или модули можно полностью тестировать изолированно.'
      ),
      a: t(
        'Expected: sequentially. Integration between them must be tested as a separate layer.',
        'Ожидаем: последовательно. Интеграцию между ними нужно тестировать как отдельный слой.'
      ),
    },
    {
      q: t(
        '"What is the target timeline for US commercialization?"',
        '"Какой целевой timeline для US commercialization?"'
      ),
      g: t(
        'Our preliminary work plan targets FDA submission-ready at month 6-7. After submission, FDA review takes another 6-12 months before clearance and market entry. Total: minimum 12-18 months to first US sale. This question checks their business timeline against that math. Target 12 months - our plan fits just barely. Target 18 months - there is breathing room. Target under 12 months - something does not add up and needs to be discussed now.',
        'Наш план нацелен на готовность к FDA submission к месяцу 6-7. После подачи FDA рассматривает документы ещё 6-12 месяцев до выдачи clearance и выхода на рынок. Итого: минимум 12-18 месяцев до первых продаж в США. Вопрос проверяет их бизнес-цель против этой математики. Цель 12 месяцев - наш план вписывается впритык. Цель 18 месяцев - есть запас. Цель меньше 12 месяцев - что-то не сходится и это нужно обсудить сразу.'
      ),
      a: t(
        'Expected: 12-18 months. Confirms that a 6-7 month QA and submission preparation window is realistic.',
        'Ожидаем: 12-18 месяцев. Подтверждает что окно 6-7 месяцев на QA и подготовку submission реалистично.'
      ),
    },
  ];

  const nice = [
    {
      q: t(
        '"Is the 12mm from GT an internal accuracy requirement, or does it come from the regulator?"',
        '"12mm from GT - внутреннее требование к точности или от регулятора?"'
      ),
      g: t(
        'Understand whether the current accuracy standard is enough for FDA, or whether it will need to be renegotiated with the regulatory consultant.',
        'Понять достаточен ли текущий стандарт точности для FDA или его нужно будет пересматривать с регуляторным консультантом.'
      ),
      a: t(
        'Expected: internal. Need to understand if this is sufficient for FDA.',
        'Ожидаем: внутреннее. Нужно понять достаточно ли это для FDA.'
      ),
    },
    {
      q: t(
        '"Which PACS systems and angiograph vendors have you already integrated with?"',
        '"С какими PACS системами и ангиографами вы уже интегрировались?"'
      ),
      g: t(
        'Define the compatibility test matrix for US site deployments. Each new PACS or angiograph vendor adds a separate integration test scope.',
        'Определить матрицу совместимости для развёртывания на US сайтах. Каждый новый вендор PACS или ангиографа добавляет отдельный объём интеграционного тестирования.'
      ),
      a: t(
        'Expected: Sheba configuration only. Need to understand the compatibility matrix for US sites.',
        'Ожидаем: только конфигурация Sheba. Нужно понять матрицу совместимости для US сайтов.'
      ),
    },
    {
      q: t(
        '"What happens if the system crashes or disconnects during an active procedure?"',
        '"Что происходит если система падает или теряет связь во время активной процедуры?"'
      ),
      g: t(
        'Understand the fail-safe behavior and its direct impact on regulatory risk classification. A system that the physician cannot safely ignore has a higher risk class and stricter evidence requirements.',
        'Понять поведение fail-safe и его прямое влияние на регуляторный класс риска. Система которую врач не может безопасно проигнорировать имеет более высокий класс риска и более строгие требования к доказательствам.'
      ),
      a: t(
        'Expected: physician continues without the system. Affects regulatory risk classification.',
        'Ожидаем: врач продолжает без системы. Влияет на regulatory класс риска.'
      ),
    },
  ];

  const qCard = (item, cls, clsLabel, key) => `
<div class="q-card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="q-label ${cls}">${clsLabel}</div>
      <div class="question">${item.q}</div>
      <div class="goal-box">
        <strong>${t('Goal', 'Цель')}</strong>
        ${item.g}
      </div>
      <div class="expect-box">
        <strong>${t('Expected', 'Ожидаем')}</strong>
        ${item.a}
      </div>
    </div>
    ${renderNotePanel(key)}
  </div>
</div>`;

  return `
<h1>${t('Questions for CTO', 'Вопросы к CTO')}</h1>
<p class="section-desc">${t(
  'What to ask and why.',
  'Что спросить и зачем.'
)}</p>

<h2>🔴 ${t('Must Ask', 'Задать обязательно')}</h2>
${must.map((q,i) => qCard(q, 'must', t('MUST ASK','ОБЯЗАТЕЛЬНО'), `q_must_${i}`)).join('')}

<h2>🟡 ${t('Important - If Time Allows', 'Важные - если есть время')}</h2>
${important.map((q,i) => qCard(q, 'important', t('IMPORTANT','ВАЖНО'), `q_imp_${i}`)).join('')}

<h2>🟢 ${t('Nice to Know', 'Хорошо бы узнать')}</h2>
${nice.map((q,i) => qCard(q, 'nice', t('NICE TO KNOW','ХОРОШО БЫ'), `q_nice_${i}`)).join('')}

<h2>➕ ${t('Additional Questions', 'Дополнительные вопросы')}</h2>
<div id="custom-qs-container">
  ${getCustomQs().map((_, i) => renderCustomQCard(i, false)).join('')}
</div>
<button onclick="addCustomQ()"
  style="margin-top:14px;padding:10px 24px;background:#fdf4ff;color:#6b21a8;border:1px solid #e9d5ff;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px">
  ➕ ${t('Add question', 'Добавить вопрос')}
</button>`;
}

// ─── PLAN ──────────────────────────────────────────────────────────────────
function renderPlan() {
  return `
<h1>${t('Preliminary Work Plan', 'Предварительный план работы')}</h1>

<div class="variant-tabs">
  <button class="vtab active" onclick="showVariant('A')">
    ${t('Variant A - Regulatory First', 'Вариант A - Regulatory First')}
  </button>
  <button class="vtab" onclick="showVariant('B')">
    ${t('Variant B - Eliminated', 'Вариант B - Исключён')}
  </button>
  <button class="vtab" onclick="showVariant('C')">
    ${t('Variant C - Parallel ✅', 'Вариант C - Параллельно ✅')}
  </button>
</div>

<!-- VARIANT A -->
<div id="variant-A" class="variant-content active">
  <p style="font-size:15px;font-weight:600;color:#1a1a2e;margin:0 0 14px">${t(
    'One person does everything. I run QA setup and regulatory preparation at the same time, solo. Slower on execution, leaner on headcount.',
    'Один человек делает всё. Я веду выстраивание QA и регуляторную подготовку одновременно, соло. Медленнее по исполнению, дешевле по составу команды.'
  )}</p>
  <div class="highlight-box">
    <strong>${t('When to propose this', 'Когда предлагать')}</strong>
    ${t(
      'If they say "FDA submission above all else" and have no budget for a junior QA. I lead regulatory preparation alongside QA process setup.',
      'Если говорят "FDA submission прежде всего" и нет бюджета на junior QA. Я веду regulatory preparation вместе с выстраиванием QA-процесса.'
    )}
  </div>

  <div class="phase">
    <div class="phase-header d30">${t('Days 1–30 · Foundation', 'Дни 1–30 · Фундамент')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Baseline audit of Sheba pilot - document current state, all known issues, all user feedback', 'Baseline аудит Sheba пилота - документируем текущее состояние, все известные проблемы, весь feedback')}</li>
            <li>${t('Study FDA 510(k) pathway with regulatory consultant - understand exact deliverables required', 'Изучаем FDA 510(k) с регуляторным консультантом - понимаем точные требуемые deliverables')}</li>
            <li>${t('Map predicate devices (AiDOC, Viz.ai, RapidAI) - identify most relevant comparison points', 'Маппинг предикатных устройств (AiDOC, Viz.ai, RapidAI) - наиболее релевантные точки сравнения')}</li>
            <li>${t('Set up defect tracking, documentation space, QA tooling', 'Настраиваем дефект-трекинг, место для документации, QA-инструменты')}</li>
            <li>${t('Test Strategy v1: scope, risk matrix, severity thresholds (false negative = Critical by default), definition of done', 'Test Strategy v1: scope, risk матрица, severity пороги (false negative = Critical по умолчанию), definition of done')}</li>
          </ul>
        </div>
        ${renderNotePanel('plan_a_30')}
      </div>
    </div>
  </div>

  <div class="phase">
    <div class="phase-header d90">${t('Days 31–90 · Validation Core', 'Дни 31–90 · Ядро валидации')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Data pipeline testing first - garbage in, garbage out. All stages before AI input verified', 'Тестирование data pipeline первым - garbage in, garbage out. Все стадии до AI верифицированы')}</li>
            <li>${t('Module 1a end-to-end: AI accuracy layer → real-time performance → clinical display - each independently, then integrated', 'Module 1a end-to-end: AI accuracy → real-time performance → clinical display - каждый независимо, потом вместе')}</li>
            <li>${t('Independent validation dataset established from US sites - separate from training data', 'Независимый validation датасет из US сайтов - отдельный от обучающих данных')}</li>
            <li>${t('Site acceptance testing protocol v1 - standardized checklist, tested and validated on Sheba', 'Site acceptance testing protocol v1 - стандартный чеклист, протестирован и валидирован на Sheba')}</li>
            <li>${t('DHF documentation starts: requirements → test cases → results, full traceability', 'Начало DHF документации: требования → тест-кейсы → результаты, полная трассируемость')}</li>
          </ul>
          <p class="phase-note">${t('Module 2 test framework prepared in parallel - ready to execute as soon as dev stabilizes.','Framework для Module 2 готов параллельно - выполняется как только dev стабилизируется.')}</p>
        </div>
        ${renderNotePanel('plan_a_90')}
      </div>
    </div>
  </div>

  <div class="phase">
    <div class="phase-header d180">${t('Days 91–180 · Submission Ready', 'Дни 91–180 · Готовность к Submission')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Module 2 full test cycle (conditional on stability by day 90)', 'Полный тест-цикл Module 2 (при условии стабильности к дню 90)')}</li>
            <li>${t('Full regression - both modules integrated end-to-end', 'Полная регрессия - оба модуля интегрированы end-to-end')}</li>
            <li>${t('Performance benchmarking on production-equivalent hardware', 'Performance benchmarking на production-эквивалентном оборудовании')}</li>
            <li>${t('Predicate device comparison testing documented for 510(k)', 'Сравнительное тестирование с предикатными устройствами задокументировано для 510(k)')}</li>
            <li>${t('510(k) submission package assembled together with regulatory consultant', '510(k) submission package собран вместе с регуляторным консультантом')}</li>
          </ul>
          <p class="phase-note">${t('Output: full evidence package assembled and handed to the regulatory consultant for submission filing. Main risk: Module 2 development timeline.','Результат: полный пакет доказательств собран и передан регуляторному консультанту для подачи. Главный риск: timeline разработки Module 2.')}</p>
        </div>
        ${renderNotePanel('plan_a_180')}
      </div>
    </div>
  </div>
</div>

<!-- VARIANT B -->
<div id="variant-B" class="variant-content">
  <p style="font-size:15px;font-weight:600;color:#1a1a2e;margin:0 0 14px">${t(
    'QA first, regulatory second. Build proper processes, culture, and full test coverage — then turn to FDA. Logical sequence, but the timeline doesn\'t fit.',
    'Сначала QA, потом regulatory. Выстроить процессы, культуру и полное тестовое покрытие — затем переходить к FDA. Логичная последовательность, но сроки не вписываются.'
  )}</p>
  <div class="highlight-box" style="background:#fee2e2;border-color:#fca5a5;color:#7f1d1d">
    <strong style="color:#7f1d1d">⛔ ${t('Eliminated - Too Slow to FDA', 'Исключён - Слишком медленный путь к FDA')}</strong>
    <p style="margin:12px 0 8px">${t(
      'What Variant B was: build internal QA maturity first - processes, culture, full test coverage across all modules - before turning attention to regulatory. Proper QA governance, then regulatory preparation.',
      'Что представлял собой Вариант B: сначала выстроить внутреннюю зрелость QA - процессы, культуру, полное тестовое покрытие всех модулей - и только потом переходить к regulatory. Сначала правильная QA-система, потом регуляторная подготовка.'
    )}</p>
    <p style="margin:0">${t(
      'Why eliminated: this sequence pushes the FDA 510(k) submission to month 9–10 at minimum. (too long)',
      'Почему исключён: такая последовательность сдвигает FDA 510(k) submission минимум на месяц 9–10. (слишком большой срок)'
    )}</p>
  </div>
</div>

<!-- VARIANT C -->
<div id="variant-C" class="variant-content">
  <p style="font-size:15px;font-weight:600;color:#1a1a2e;margin:0 0 14px">${t(
    'Two people, two tracks running in parallel. I own strategy and regulatory. Junior owns test execution and documentation. Both tracks move at full speed simultaneously — more ground covered in the same time.',
    'Два человека, два трека параллельно. Я отвечаю за стратегию и regulatory. Junior ведёт выполнение тестов и документацию. Оба трека движутся на полной скорости одновременно — больше сделано за то же время.'
  )}</p>
  <div class="highlight-box" style="background:#f0fdf4;border-color:#86efac;color:#14532d">
    <strong style="color:#14532d">✅ ${t('Optimal - With a Junior QA (ideal scenario)', 'Оптимальный - с Junior QA (идеальный сценарий)')}</strong>
    ${t(
      'I own the regulatory track and strategic QA direction. A junior QA engineer handles test execution, documentation, and defect tracking under my direct guidance. Fastest path to FDA submission with proper quality coverage on both tracks simultaneously. Note: if a junior is not available initially, this variant reverts to Variant A until headcount is approved.',
      'Я отвечаю за regulatory трек и стратегическое направление QA. Junior QA инженер выполняет тесты, ведёт документацию и трекинг дефектов под моим прямым руководством. Самый быстрый путь к FDA submission с правильным покрытием на обоих треках. Примечание: если junior недоступен сразу - вариант C фактически совпадает с вариантом A до момента найма.'
    )}
  </div>

  <div class="phase">
    <div class="phase-header d30">${t('Days 1–30 · Dual Track Launch', 'Дни 1–30 · Запуск обоих треков')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Me: Baseline audit + regulatory study + Test Strategy v1', 'Я: Baseline аудит + изучение regulatory + Test Strategy v1')}</li>
            <li>${t('Junior: Tooling setup, first test cases on core flow, defect log started', 'Junior: Настройка инструментов, первые тест-кейсы на core flow, начало лога дефектов')}</li>
            <li>${t('Together: Severity matrix, priority order, weekly sync cadence', 'Вместе: Severity матрица, порядок приоритетов, ритм еженедельных синхронизаций')}</li>
          </ul>
        </div>
        ${renderNotePanel('plan_c_30')}
      </div>
    </div>
  </div>

  <div class="phase">
    <div class="phase-header d90">${t('Days 31–90 · Full Coverage', 'Дни 31–90 · Полное покрытие')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Me: DHF documentation, predicate device analysis, validation dataset validation, regulatory consultant coordination', 'Я: DHF документация, анализ предикатных устройств, валидация validation датасета, координация с регуляторным консультантом')}</li>
            <li>${t('Junior: Module 1a full test execution, site acceptance testing, defect tracking and reporting', 'Junior: Полное тестирование Module 1a, site acceptance testing, трекинг и репортинг дефектов')}</li>
            <li>${t('Together: Weekly QA review, metrics, risk reassessment', 'Вместе: Еженедельный QA review, метрики, переоценка рисков')}</li>
          </ul>
          <p class="phase-note">${t('Target by day 90: Module 1a fully tested and documented. Independent US validation set established.','Цель к дню 90: Module 1a полностью протестирован и задокументирован. Независимый US validation set установлен.')}</p>
        </div>
        ${renderNotePanel('plan_c_90')}
      </div>
    </div>
  </div>

  <div class="phase">
    <div class="phase-header d180">${t('Days 91–180 · Submission', 'Дни 91–180 · Submission')}</div>
    <div class="phase-body">
      <div class="risk-card-inner">
        <div class="risk-main">
          <ul>
            <li>${t('Module 2 full cycle + integration testing with Module 1', 'Полный цикл Module 2 + интеграционное тестирование с Module 1')}</li>
            <li>${t('Final regression, performance benchmarking, predicate device comparison', 'Финальная регрессия, performance benchmarking, сравнение с предикатными устройствами')}</li>
            <li>${t('510(k) submission package - assembled with regulatory consultant', '510(k) submission package - собирается с регуляторным консультантом')}</li>
          </ul>
          <p class="phase-note">${t('Output: full evidence package assembled and handed to the regulatory consultant for submission filing. Main risk: Module 2 development timeline.','Результат: полный пакет доказательств собран и передан регуляторному консультанту для подачи. Главный риск: timeline разработки Module 2.')}</p>
        </div>
        ${renderNotePanel('plan_c_180')}
      </div>
    </div>
  </div>
</div>`;
}

function showVariant(v) {
  document.querySelectorAll('.vtab').forEach((btn, i) => {
    btn.classList.toggle('active', ['A', 'B', 'C'][i] === v);
  });
  document.querySelectorAll('.variant-content').forEach(el => {
    el.classList.toggle('active', el.id === 'variant-' + v);
  });
}

// ─── QA DOCUMENTS ──────────────────────────────────────────────────────────
const DOC_STATUSES = ['', 'required', 'skip'];
const DOC_STATUS_LABELS = {
  '':         ['❓ To confirm', '❓ Уточнить'],
  'required': ['✅ Required',   '✅ Нужен'],
  'skip':     ['⛔ Not needed', '⛔ Не нужен'],
};
const DOC_STATUS_COLORS = {
  '':         'background:#f1f5f9;color:#64748b;border-color:#cbd5e1',
  'required': 'background:#eff6ff;color:#1d4ed8;border-color:#93c5fd',
  'skip':     'background:#fef2f2;color:#991b1b;border-color:#fca5a5',
};

function getDocStatus(key) { return localStorage.getItem('docstatus_' + key) || ''; }
function cycleDocStatus(key) {
  const cur = getDocStatus(key);
  const idx = DOC_STATUSES.indexOf(cur);
  const next = DOC_STATUSES[(idx + 1) % DOC_STATUSES.length];
  next ? localStorage.setItem('docstatus_' + key, next) : localStorage.removeItem('docstatus_' + key);
  // Re-render the status button in place
  const btn = document.getElementById('docstatus-' + key);
  if (btn) {
    const lbl = DOC_STATUS_LABELS[next] || DOC_STATUS_LABELS[''];
    btn.textContent = lbl[L === 'en' ? 0 : 1];
    btn.setAttribute('style', 'cursor:pointer;border:1px solid;border-radius:20px;padding:4px 14px;font-size:0.82rem;font-weight:600;' + (DOC_STATUS_COLORS[next] || DOC_STATUS_COLORS['']));
  }
}

function renderDocCard(key, icon, title, enBody, ruBody) {
  const st  = getDocStatus(key);
  const lbl = DOC_STATUS_LABELS[st] || DOC_STATUS_LABELS[''];
  const col = DOC_STATUS_COLORS[st] || DOC_STATUS_COLORS[''];
  return `
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        ${icon} ${title}
        <button id="docstatus-${key}" onclick="cycleDocStatus('${key}')"
          style="cursor:pointer;border:1px solid;border-radius:20px;padding:4px 14px;font-size:0.82rem;font-weight:600;${col}">
          ${lbl[L === 'en' ? 0 : 1]}
        </button>
      </div>
      <p>${t(enBody, ruBody)}</p>
    </div>
    ${renderNotePanel('doc_' + key)}
  </div>
</div>`;
}

function renderDocs() {
  return `
<h1>${t('QA Documents', 'Документы QA')}</h1>
<p class="section-desc">${t(
  'Click the badge on each card to set status. Notes field on the right.',
  'Нажмите значок на карточке чтобы поставить статус. Поле заметок справа.'
)}</p>

<h2>📐 ${t('Foundation - Build First', 'Фундамент - создаётся первым')}</h2>

${renderDocCard('teststrategy', '🗺️',
  t('Test Strategy', 'Test Strategy'),
  'The master QA framework document. Defines scope, testing approach, risk classification, severity matrix, tools selection, automation stance, and definition of done. Required for 510(k) and IEC 62304 compliance. Produced in Month 1 - everything else depends on it.',
  'Главный QA-документ верхнего уровня. Определяет scope, подход к тестированию, классификацию рисков, severity матрицу, выбор инструментов, позицию по автоматизации и definition of done. Необходим для 510(k) и IEC 62304. Создаётся в месяц 1 - всё остальное зависит от него.'
)}

${renderDocCard('testmatrix', '🔢',
  t('Test Matrix', 'Test Matrix'),
  'Features × Platforms × Risk levels. Shows what gets tested, how (manual/automated), at what coverage level, and in what priority order. Makes coverage gaps visible and drives resource allocation.',
  'Функции × Платформы × Уровни риска. Показывает что тестируется, как (вручную/автоматизировано), с каким уровнем покрытия и в каком порядке приоритетов. Делает пробелы в покрытии видимыми и управляет распределением ресурсов.'
)}

${renderDocCard('bugreporting', '🐛',
  t('Bug Reporting Standards', 'Стандарты репортинга дефектов'),
  'Severity definitions (Critical / High / Medium / Low), priority levels, mandatory Jira fields, SLA per severity, escalation rules, and bug report template. Without this, defects are filed inconsistently and triage is guesswork.',
  'Определения severity (Critical / High / Medium / Low), уровни приоритета, обязательные поля Jira, SLA по severity, правила эскалации и шаблон баг-репорта. Без этого дефекты фиксируются непоследовательно и триаж становится угадыванием.'
)}

${renderDocCard('metrics', '📊',
  t('QA Metrics & Quality Gates', 'QA-метрики и Quality Gates'),
  'Which metrics are tracked (test coverage, defect density, pass rate, open critical count, mean time to fix), reporting cadence, and quality gate thresholds that must pass before any release. Establishes QA visibility across the team.',
  'Какие метрики отслеживаются (test coverage, defect density, pass rate, количество открытых критических, mean time to fix), периодичность репортинга и пороги quality gate которые должны быть пройдены перед любым релизом. Обеспечивает видимость QA для всей команды.'
)}

<h2>📋 ${t('Operational - Maintained Throughout', 'Операционные - ведутся постоянно')}</h2>

${renderDocCard('testplans', '📝',
  t('Test Plans', 'Тест-планы'),
  'Per-module and per-release test plans. Separate plans for Module 1a, Module 1b, Module 2, integration testing, and regression. Each plan defines scope, entry/exit criteria, test environment, data requirements, and schedule.',
  'Тест-планы по модулям и по релизам. Отдельные планы для Module 1a, Module 1b, Module 2, интеграционного тестирования и регрессии. Каждый план определяет scope, entry/exit критерии, тестовую среду, требования к данным и расписание.'
)}

${renderDocCard('testcases', '✅',
  t('Test Cases', 'Тест-кейсы'),
  'Actual test scenarios - organized by module, risk level, and test type (functional, performance, usability, security, regression). Written with enough detail that any tester can execute them consistently. Linked to requirements for traceability.',
  'Сами тестовые сценарии - организованы по модулям, уровням риска и типам тестирования (функциональные, производительность, юзабилити, безопасность, регрессия). Написаны достаточно подробно чтобы любой тестировщик мог выполнить их последовательно. Привязаны к требованиям для трассируемости.'
)}

${renderDocCard('automation', '🤖',
  t('Test Automation Framework', 'Фреймворк автоматизации тестирования'),
  'Automation is optional at this stage but the approach must be defined early to avoid wasted effort. Key decisions: what level to automate (smoke only, regression suite, API layer, UI), what tools (Pytest, Playwright, Selenium, or none yet), and critically - what NOT to automate (AI accuracy testing, usability studies, one-off clinical validations). Important: clarify the expected automation scope with the team before committing any resources. The answer ranges from "no automation right now" to "full CI regression suite" and each requires a very different time investment.',
  'Автоматизация на данном этапе не обязательна, но подход нужно определить заранее чтобы не потратить ресурсы впустую. Ключевые решения: что автоматизировать (только smoke, regression suite, API-слой, UI), какие инструменты (Pytest, Playwright, Selenium, или пока ничего), и главное - что НЕ автоматизировать (тестирование точности AI, юзабилити-исследования, одноразовые клинические валидации). Важно: согласовать ожидаемый объём автоматизации с командой до начала работ. Ответ варьируется от "автоматизация пока не нужна" до "полный CI regression suite" - и каждый вариант требует принципиально разного вложения времени.'
)}

${renderDocCard('defectworkflow', '🔄',
  t('Defect Tracking Workflow', 'Workflow трекинга дефектов'),
  'How defects are filed, triaged, assigned, resolved, verified, and closed. Jira configuration guide: statuses, transitions, fields, dashboards, and filters. Defines who owns what at each stage.',
  'Как дефекты фиксируются, проходят триаж, назначаются, исправляются, верифицируются и закрываются. Руководство по настройке Jira: статусы, переходы, поля, дашборды и фильтры. Определяет владельцев на каждом этапе.'
)}

${renderDocCard('releasereadiness', '🚦',
  t('Release Readiness Criteria', 'Критерии готовности к релизу'),
  'Go/no-go checklist per release. Metrics snapshot, open critical and high defect count, regression status, sign-off requirements. Makes release decisions transparent and defensible - especially important for a regulated product.',
  'Go/no-go чеклист для каждого релиза. Снапшот метрик, количество открытых критических и высоких дефектов, статус регрессии, требования к подписям. Делает решения о релизе прозрачными и обоснованными - особенно важно для регулируемого продукта.'
)}

${renderDocCard('qualityreport', '📈',
  t('Quality Report', 'Quality Report'),
  'Periodic QA status report - sprint or monthly. Summarizes test execution progress, defect trends, coverage status, risks, and blockers. The primary QA communication artefact for product and engineering leadership.',
  'Периодический QA статус-отчёт - спринтовый или ежемесячный. Суммирует прогресс выполнения тестов, тренды дефектов, статус покрытия, риски и блокеры. Основной артефакт QA-коммуникации для руководства продукта и разработки.'
)}

<h2>⚖️ ${t('Regulatory - Required for 510(k) / CE Mark', 'Регуляторные - обязательны для 510(k) / CE Mark')}</h2>

${renderDocCard('traceability', '🔗',
  t('Traceability Matrix', 'Матрица трассируемости'),
  'Requirements → Test Cases → Test Results. Required by IEC 62304 and FDA. Proves that every stated requirement is covered by at least one test case, and every test case maps to a result. The auditor\'s first request.',
  'Требования → Тест-кейсы → Результаты тестов. Требуется IEC 62304 и FDA. Доказывает что каждое заявленное требование покрыто хотя бы одним тест-кейсом, и каждый тест-кейс привязан к результату. Первый запрос аудитора.'
)}

${renderDocCard('vnvreport', '📑',
  t('Verification & Validation Report', 'Отчёт верификации и валидации'),
  'Summary of all V&V testing - the technical core of the 510(k) submission package. Covers system performance on the independent validation dataset, comparison with predicate devices, statistical analysis, and overall safety/performance conclusions.',
  'Сводный отчёт всего V&V-тестирования - техническое ядро пакета 510(k) submission. Охватывает производительность системы на независимом validation датасете, сравнение с предикатными устройствами, статистический анализ и общие выводы по безопасности/производительности.'
)}

${renderDocCard('riskcontrib', '⚠️',
  t('Risk Assessment Contributions (ISO 14971)', 'Вклад в оценку рисков (ISO 14971)'),
  'QA contribution to the product risk file: failure modes identified during testing, evidence that mitigations work as intended, residual risk data. Not the full risk file (that is owned by the engineering team) - but QA provides the test evidence that populates it.',
  'Вклад QA в risk file продукта: режимы отказов выявленные при тестировании, доказательства что меры снижения работают как задумано, данные остаточного риска. Не весь risk file (им владеет команда разработки) - но QA предоставляет тестовые доказательства которые его наполняют.'
)}

${renderDocCard('dhf', '🗂️',
  t('Design History File (DHF) - QA Section', 'Design History File (DHF) - раздел QA'),
  'The master regulatory evidence dossier. QA owns the test-related sections: Test Strategy, test plans, test cases, test results, defect records, and V&V report. Ensures nothing produced is lost and everything is traceable to a specific requirement or risk.',
  'Главный регуляторный доказательный досье. QA владеет разделами связанными с тестированием: Test Strategy, тест-планы, тест-кейсы, результаты тестов, записи о дефектах и V&V отчёт. Обеспечивает что ничто произведённое не теряется и всё трассируется к конкретному требованию или риску.'
)}

${renderDocCard('sat', '🏥',
  t('Site Acceptance Testing Protocol', 'Протокол приёмочного тестирования на сайте'),
  'Standardised deployment checklist for each clinical site (Sheba, Mount Sinai, St. Vincent). Ensures consistent installation, configuration, and sign-off at every site. Validated once on Sheba, then replicated. Critical for multi-site submissions.',
  'Стандартизированный чеклист развёртывания для каждого клинического сайта (Sheba, Mount Sinai, St. Vincent). Обеспечивает последовательную установку, конфигурацию и подпись на каждом сайте. Валидируется на Sheba, затем тиражируется. Критичен для multi-site submissions.'
)}

${renderDocCard('usability', '👁️',
  t('Usability Testing Report (IEC 62366)', 'Отчёт юзабилити-тестирования (IEC 62366)'),
  'Formative and summative usability study documentation. Can the physician correctly interpret AI output under time pressure? Does the UI avoid creating false confidence? QA designs and executes the test scenarios; the report documents findings and residual usability risks.',
  'Документация формативных и суммативных юзабилити-исследований. Может ли врач правильно интерпретировать AI-вывод под давлением времени? Избегает ли UI создания ложной уверенности? QA проектирует и выполняет тестовые сценарии; отчёт документирует результаты и остаточные юзабилити-риски.'
)}

${renderDocCard('pccp', '🔁',
  t('PCCP - Predetermined Change Control Plan', 'PCCP - Predetermined Change Control Plan'),
  'Required if the AI model will be updated or retrained after market clearance. Defines in advance which types of changes are permitted without a new 510(k) submission. If model updates are on the roadmap - for an AI medical device they almost certainly are - the PCCP must be scoped and included in the original submission.',
  'Требуется если AI-модель будет обновляться или переобучаться после получения market clearance. Заранее определяет какие типы изменений разрешены без новой подачи 510(k). Если обновления модели есть в roadmap - для AI медицинского устройства это почти наверняка так - PCCP необходимо включить в исходный submission.'
)}
`;
}

// ─── NEEDS ─────────────────────────────────────────────────────────────────
function renderNeeds() {
  return `
<h1>${t('What I Need', 'Что мне нужно')}</h1>
<p class="section-desc">${t(
  'Resources and access I will ask for on day one.',
  'Ресурсы и доступы которые запрошу с первого дня.'
)}</p>

<h2>👥 ${t('People', 'Люди')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">🩺 ${t('Clinical Expert', 'Клинический эксперт')}</div>
  <p>${t('A physician or radiologist who is the single source of truth on clinical correctness. Who approves that a functional zone mapping is correct - not algorithmically, but clinically?','Врач или радиолог - единственный источник правды по клинической корректности. Кто апрувит что маппинг функциональной зоны корректен - не алгоритмически, а клинически?')}</p>
</div>${renderNotePanel('need_clinical')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">⚖️ ${t('Regulatory Consultant', 'Регуляторный консультант')}</div>
  <p>${t('Defines exactly what FDA requires for 510(k) submission. Already engaged or needs to be found? Without this, QA direction is a guess.','Определяет что именно требует FDA для 510(k) submission. Уже есть или нужно найти? Без этого направление QA - это догадки.')}</p>
</div>${renderNotePanel('need_reg')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">👨‍💻 ${t('Developer Access', 'Доступ к разработчикам')}</div>
  <p>${t('To understand pipeline architecture, data flow, technical debt, and upcoming changes. QA cannot be built in isolation.','Понимание архитектуры pipeline, data flow, технического долга и предстоящих изменений. QA нельзя строить изолированно.')}</p>
</div>${renderNotePanel('need_dev')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">👶 ${t('Junior QA - Later', 'Junior QA - Позже')}</div>
  <p>${t('Not expected initially - understood. When the time comes: handles test execution and documentation under my direction, freeing me for regulatory and strategic work. This is what unlocks Variant C and the fastest path to submission. Worth raising after the first 30–60 days once the scope is visible.','Изначально не ожидается - понято. Когда придёт время: выполняет тесты и ведёт документацию под моим руководством, освобождая меня для regulatory и стратегической работы. Именно это открывает Вариант C и самый быстрый путь к submission. Стоит поднять после первых 30–60 дней когда объём работ станет очевиден.')}</p>
</div>${renderNotePanel('need_junior')}</div></div>

<h2>📊 ${t('Data', 'Данные')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Retrospective Data Access', 'Доступ к ретроспективным данным')}</div>
  <p>${t('De-identified data from all three sites (Sheba, Mount Sinai, St. Vincent) for validation. IRB-approved and HIPAA-compliant.','Деидентифицированные данные из всех трёх сайтов (Sheba, Mount Sinai, St. Vincent) для валидации. С IRB approval и соответствием HIPAA.')}</p>
</div>${renderNotePanel('need_data')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Ground Truth Annotation Details', 'Детали Ground Truth разметки')}</div>
  <p>${t('Who annotated, what protocol, inter-annotator agreement score, completion status. If incomplete - validation is blocked.','Кто размечал, по какому протоколу, inter-annotator agreement, статус завершённости. Если не завершена - валидация заблокирована.')}</p>
</div>${renderNotePanel('need_gt')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Sheba Pilot Issue Log', 'Лог проблем Sheba пилота')}</div>
  <p>${t('All physician feedback and technical issues from the live pilot. This is our ready-made QA backlog - real problems from real usage.','Весь feedback врачей и технические проблемы из живого пилота. Это готовый QA backlog - реальные проблемы реального использования.')}</p>
</div>${renderNotePanel('need_log')}</div></div>

<h2>💻 ${t('Systems & Tools', 'Системы и инструменты')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Test Environment', 'Тестовая среда')}</div>
  <p>${t('Access to the product in a test environment - not in production Sheba. Testing safely in a live OR is not possible.','Доступ к продукту в тестовой среде - не в продакшне Sheba. Безопасное тестирование в живой операционной невозможно.')}</p>
</div>${renderNotePanel('need_env')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Bug Tracking', 'Баг-трекинг')}</div>
  <p>${t('Jira or equivalent - with proper workflows, fields, priorities, and severity definitions. Starting point for QA visibility across the team.','Jira или аналог - с правильными workflows, полями, приоритетами и определениями severity. Отправная точка для видимости QA в команде.')}</p>
</div>${renderNotePanel('need_bugs')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Documentation Space', 'Место для документации')}</div>
  <p>${t('Confluence or equivalent for Test Strategy, test plans, DHF documentation, and traceability matrices.','Confluence или аналог для Test Strategy, тест-планов, DHF документации и матриц трассируемости.')}</p>
</div>${renderNotePanel('need_docs')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Benchmark Product Access', 'Доступ к продуктам-бенчмаркам')}</div>
  <p>${t('AiDOC, Viz.ai cited as UX benchmarks. Need at least demo or documentation to understand the target UX standard we are being compared against.','AiDOC, Viz.ai названы как UX бенчмарки. Нужен хотя бы демо или документация чтобы понять целевой UX стандарт с которым нас сравнивают.')}</p>
</div>${renderNotePanel('need_bench')}</div></div>

<h2>📄 ${t('Documents', 'Документы')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Product Requirements & Architecture', 'Product Requirements и архитектура')}</div>
  <p>${t('Everything already written - PRD, architecture diagrams, any existing specs. Starting from scratch is preventable.','Всё что уже написано - PRD, архитектурные схемы, любые существующие specs. Начинать с нуля необязательно.')}</p>
</div>${renderNotePanel('need_prd')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Clinical Trial Protocols', 'Протоколы клинических исследований')}</div>
  <p>${t('Protocols from all three sites - Sheba, Mount Sinai, St. Vincent Indiana.','Протоколы из всех трёх сайтов - Sheba, Mount Sinai, St. Vincent Indiana.')}</p>
</div>${renderNotePanel('need_protocols')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">IRB Approvals</div>
  <p>${t('Confirms data was collected under proper ethics oversight. Required for any FDA submission.','Подтверждает что данные собирались под надлежащим этическим надзором. Обязательно для FDA submission.')}</p>
</div>${renderNotePanel('need_irb')}</div></div>`;
}

// ─── EXPORT / IMPORT ───────────────────────────────────────────────────────
function exportNotes() {
  const prefixes = ['note_', 'risk_answer_', 'docstatus_', 'ovstatus_'];
  const singleKeys = ['custom_qs'];
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (singleKeys.includes(k) || prefixes.some(p => k.startsWith(p))) {
      data[k] = localStorage.getItem(k);
    }
  }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'nvsight-notes-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importNotes() {
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file   = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error();
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
        showSection(currentSection);
      } catch(err) {
        alert(t('Import failed: invalid or corrupted file.', 'Ошибка импорта: неверный или повреждённый файл.'));
      }
    };
    reader.readAsText(file);
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// ─── INIT ──────────────────────────────────────────────────────────────────
(function init() {
  document.getElementById('btn-en').classList.toggle('active', L === 'en');
  document.getElementById('btn-ru').classList.toggle('active', L === 'ru');

  if (checkAuth()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display  = 'flex';
    const startSection = location.hash.slice(1);
    showSection(startSection && startSection in { overview:1, regulatory:1, risks:1, questions:1, plan:1, docs:1, needs:1 } ? startSection : 'overview');
  } else {
    document.getElementById('login-user').focus();
  }
})();
