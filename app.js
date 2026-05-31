'use strict';

// ─── AUTH ──────────────────────────────────────────────────────────────────
const AUTH_KEY = 'nvsight_auth';

function checkAuth() {
  return localStorage.getItem(AUTH_KEY) === '1';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (user === 'admin' && pass === 'sightendo') {
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
  { id: 'needs',       icon: '🛠️' },
];

const LABELS = {
  overview:   ['Product Overview',      'Обзор продукта'],
  regulatory: ['Regulatory Standards',  'Регуляторные стандарты'],
  risks:      ['Key Risks',             'Ключевые риски'],
  questions:  ['Questions for CTO',     'Вопросы к CTO'],
  plan:       ['Engagement Plan',       'План работы'],
  needs:      ['What I Need',           'Что мне нужно'],
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
}

function showSection(id) {
  currentSection = id;
  buildNav();
  const main = document.getElementById('main');
  const renders = {
    overview:   renderOverview,
    regulatory: renderRegulatory,
    risks:      renderRisks,
    questions:  renderQuestions,
    plan:       renderPlan,
    needs:      renderNeeds,
  };
  main.innerHTML = (renders[id] || (() => ''))();
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────────
function renderOverview() {
  return `
<h1>CoPilotMD NV-Sight</h1>
<p class="section-desc">${t(
  'AI system for neuro-endovascular procedures — what I understood before the meeting.',
  'AI-система для нейроэндоваскулярных процедур — что я понял до встречи.'
)}</p>

<h2>${t('What the Product Does', 'Что делает продукт')}</h2>
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <p>${t(
        'CoPilotMD NV-Sight is a real-time AI assistant for interventional neuro-radiology. It analyzes angiographic X-ray images during minimally invasive stroke procedures and provides the physician with real-time guidance: vessel anomaly detection, functional brain mapping, and automated clinical reporting.',
        'CoPilotMD NV-Sight — AI-ассистент реального времени для интервенционной нейрорадиологии. Анализирует ангиографические рентгеновские изображения во время малоинвазивных процедур лечения инсульта и предоставляет врачу помощь в реальном времени: детекция сосудистых аномалий, функциональное картирование мозга, автоматизированные клинические отчёты.'
      )}</p>
    </div>
    ${renderNotePanel('ov_product')}
  </div>
</div>

<h2>${t('System Architecture', 'Архитектура системы')}</h2>
<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <p style="font-family:monospace;font-size:13px;color:#374151;line-height:2.2">
        X-Ray Angio + PACS<br>
        &nbsp;&nbsp;&nbsp;&nbsp;↓<br>
        CoPilotMD Workstation<br>
        &nbsp;&nbsp;&nbsp;&nbsp;(Receiver → Organizer → AI Classifier)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;↓<br>
        ${t('INR Display — laptop in hospital network', 'INR Display — ноутбук в сети госпиталя')}
      </p>
      <p style="margin-top:12px;font-size:13px;color:#6b7a99">${t(
        '⚠ Currently runs on a laptop in the hospital domain. Likely a temporary architecture — QA must be designed to survive infrastructure changes.',
        '⚠ Сейчас работает на ноутбуке в домене госпиталя. Вероятно временная архитектура — QA нужно строить с расчётом на изменения инфраструктуры.'
      )}</p>
    </div>
    ${renderNotePanel('ov_arch')}
  </div>
</div>

<h2>${t('Product Modules', 'Модули продукта')}</h2>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title"><span class="status-pill done" style="margin-right:8px">${t('Live pilot','Живой пилот')}</span> Module 1a — DETECT</div>
      <p>${t('Real-time detection of vessel anomalies — occlusions, vasospasms, emboli. Live pilot at Sheba Medical Center, Israel.','Детекция сосудистых аномалий в реальном времени — окклюзии, вазоспазмы, эмболии. Живой пилот в Sheba Medical Center, Израиль.')}</p>
    </div>
    ${renderNotePanel('ov_mod1a')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title"><span class="status-pill feasibility" style="margin-right:8px">Feasibility</span> Module 1b — UNDERSTAND</div>
      <p>${t('Functional brain mapping — identifies eloquent brain zones at risk during the procedure. Currently at feasibility stage.','Функциональное картирование мозга — выявляет зоны элоквентного мозга под угрозой во время процедуры. Сейчас на стадии feasibility.')}</p>
    </div>
    ${renderNotePanel('ov_mod1b')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title"><span class="status-pill after" style="margin-right:8px">${t('Post-MVP','После MVP')}</span> Module 2 — INSIGHT</div>
      <p>${t('Real-time risk analysis and procedural recommendations. Planned after MVP.','Анализ рисков и рекомендации в реальном времени. После MVP.')}</p>
    </div>
    ${renderNotePanel('ov_mod2')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title"><span class="status-pill after" style="margin-right:8px">${t('Post-MVP','После MVP')}</span> Module 3 — REPORT</div>
      <p>${t('Automated post-procedure clinical reporting. Planned after MVP.','Автоматические клинические отчёты после процедуры. После MVP.')}</p>
    </div>
    ${renderNotePanel('ov_mod3')}
  </div>
</div>

<h2>${t('Clinical Data', 'Клинические данные')}</h2>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title">🇮🇱 Sheba Medical Center</div>
      <p>${t('3,000+ patients · 600 stroke cases · Live pilot running. Primary training data source.','3 000+ пациентов · 600 инсультных случаев · Пилот работает. Основной источник обучающих данных.')}</p>
    </div>
    ${renderNotePanel('ov_sheba')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title">🇺🇸 Mount Sinai, New York</div>
      <p>${t('~500 US patients. Must become the independent validation set for FDA submission.','~500 пациентов США. Должен стать независимым validation set для FDA submission.')}</p>
    </div>
    ${renderNotePanel('ov_sinai')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="card-title">🇺🇸 St. Vincent, Indiana</div>
      <p>${t('~400 US patients. Part of the FDA submission evidence package.','~400 пациентов США. Часть доказательного пакета для FDA.')}</p>
    </div>
    ${renderNotePanel('ov_vincent')}
  </div>
</div>

<div class="card">
  <div class="risk-card-inner">
    <div class="risk-main">
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
  'Standards applicable to CoPilotMD NV-Sight — by market and by function. To confirm: which markets are in scope and in what order?',
  'Стандарты применимые к CoPilotMD NV-Sight — по рынкам и по функциям. Уточнить: какие рынки в приоритете и в какой последовательности?'
)}</p>

<h2>${t('Common to Both Markets', 'Общие для обоих рынков')}</h2>

${sc('iso13485', 'ISO 13485 — Quality Management System', t(
  'The organisational foundation for all regulated medical device work. Defines how design, development, production, and post-market activities are managed — from writing requirements through to closing defects. Every other standard operates within this framework. QA provides the data; quality management owns the system.',
  'Организационная основа для всей регулируемой работы с медицинскими устройствами. Определяет как управляются проектирование, разработка, производство и пост-маркетинговые активности — от написания требований до закрытия дефектов. Все остальные стандарты работают внутри этой системы. QA предоставляет данные; quality management владеет системой.'
), ['21 CFR Part 820', 'EU MDR 2017/745'], ['IEC 62304', 'ISO 14971', 'IEC 62366'])}

${sc('iec62304', 'IEC 62304 — Medical Device Software Lifecycle', t(
  'The primary standard governing how medical software is developed and tested. Classifies software by safety risk, requires traceability from requirements through architecture to test results, and mandates structured defect management. This is where QA work lives most directly: test plans, test cases, and verification reports must all align with IEC 62304.',
  'Основной стандарт, регулирующий разработку и тестирование медицинского ПО. Классифицирует ПО по уровню риска безопасности, требует трассируемости от требований через архитектуру к результатам тестов, регламентирует структурированное управление дефектами. Именно здесь наиболее непосредственно работает QA: тест-планы, тест-кейсы и отчёты верификации должны соответствовать IEC 62304.'
), ['ISO 14971', '21 CFR Part 820', 'FDA 510(k)'])}

${sc('iso14971', 'ISO 14971 — Risk Management', t(
  'Requires identifying all hazards, analysing failure modes, defining mitigations, and documenting residual risk throughout the product lifecycle. For AI systems this includes incorrect predictions, dataset bias, edge case behaviour, and automation bias. The risk file directly drives QA priorities: higher risk means more rigorous test coverage.',
  'Требует идентификации всех опасностей, анализа режимов отказов, определения мер по снижению рисков и документирования остаточного риска на протяжении всего жизненного цикла продукта. Для AI-систем это включает неверные предсказания, смещение датасета, граничные случаи и автоматизационное смещение. Risk file напрямую определяет приоритеты QA: выше риск — строже тестовое покрытие.'
), ['IEC 62304', 'IEC 62366', 'EU AI Act', 'FDA Cybersecurity Guidance'])}

${sc('iec62366', 'IEC 62366 — Usability Engineering', t(
  'Addresses how users interact with the system under real clinical conditions. For NV-Sight: can a physician correctly interpret AI output under time pressure? Can they recognise when the system is uncertain? Does the display avoid creating false confidence? Requires documented formative and summative usability studies — QA designs and executes the test scenarios.',
  'Охватывает то, как пользователи взаимодействуют с системой в реальных клинических условиях. Для NV-Sight: может ли врач правильно интерпретировать AI-вывод под давлением времени? Может ли он распознать когда система неуверена? Избегает ли дисплей создания ложной уверенности? Требует задокументированных формативных и суммативных юзабилити-исследований — QA проектирует и выполняет тестовые сценарии.'
), ['ISO 14971', 'EU AI Act', 'FDA 510(k)'])}

<h2>${t('United States — FDA', 'США — FDA')}</h2>

${sc('cfr820', '21 CFR Part 820 — Quality System Regulation', t(
  'The FDA\'s QMS requirements, increasingly harmonised with ISO 13485. Covers design controls, CAPA process, supplier qualification, document control, and production records. Assumed to be in place for any 510(k) submission.',
  'QMS-требования FDA, всё более гармонизированные с ISO 13485. Охватывают design controls, процесс CAPA, квалификацию поставщиков, контроль документации и производственные записи. Предполагается соответствие для любой 510(k) подачи.'
), ['ISO 13485', 'IEC 62304'])}

${sc('fda510k', 'FDA 510(k) — Premarket Notification', t(
  'The primary regulatory pathway for CoPilotMD as a Class II medical device. Requires demonstrating substantial equivalence to predicate devices — AiDOC, Viz.ai, and RapidAI are the relevant comparators. QA provides the performance test evidence package that forms the technical core of the submission.',
  'Основной регуляторный путь для CoPilotMD как медицинского устройства класса II. Требует демонстрации существенной эквивалентности предикатным устройствам — AiDOC, Viz.ai и RapidAI являются релевантными компараторами. QA предоставляет пакет доказательств производительности, который формирует техническое ядро submission.'
), ['IEC 62304', 'ISO 14971', 'IEC 62366', 'FDA AI/ML SaMD', 'FDA Cybersecurity Guidance', 'PCCP'])}

${sc('fdaaiml', 'FDA AI/ML SaMD Guidance', t(
  'The FDA\'s framework for AI-enabled Software as a Medical Device. Sets expectations around model transparency, performance thresholds, clinical validation, and lifecycle management. Defines what the validation evidence package must contain and how it should be structured.',
  'Руководство FDA по AI-enabled Software as a Medical Device. Определяет ожидания относительно прозрачности модели, порогов производительности, клинической валидации и управления жизненным циклом. Задаёт структуру и содержание пакета доказательств валидации.'
), ['FDA 510(k)', 'EU AI Act', 'ISO 14971'])}

${sc('fdacyber', 'FDA Cybersecurity Guidance', t(
  'Mandatory for all new device submissions since 2023. Requires threat modelling, a Software Bill of Materials (SBOM), a vulnerability management plan, and post-market monitoring protocols. QA contributes security test cases and validates that controls perform as specified.',
  'Обязательно для всех новых подач устройств с 2023 года. Требует моделирование угроз, Software Bill of Materials (SBOM), план управления уязвимостями и протоколы пост-маркетингового мониторинга. QA вносит тест-кейсы безопасности и валидирует что контроли работают как заявлено.'
), ['FDA 510(k)', 'ISO 14971', 'EU MDR 2017/745'])}

${sc('pccp', 'PCCP — Predetermined Change Control Plan', t(
  'Required when the AI model will be updated or retrained after market clearance. Defines in advance which types of changes are permitted without a new 510(k) submission. If model updates are part of the product roadmap — and for an AI medical device they almost certainly are — the PCCP must be built into the QA framework from day one.',
  'Требуется когда AI-модель будет обновляться или переобучаться после получения market clearance. Заранее определяет какие типы изменений разрешены без новой подачи 510(k). Если обновления модели являются частью roadmap — а для AI медицинского устройства это почти наверняка так — PCCP необходимо встроить в QA-фреймворк с первого дня.'
), ['FDA 510(k)', 'EU AI Act'])}

${sc('hipaa', 'HIPAA', t(
  'Governs the use of US patient data. All clinical data from Mount Sinai and St. Vincent must be properly de-identified before it can enter the validation pipeline. Not a QA deliverable, but a hard prerequisite: testing cannot start on US data until HIPAA compliance is confirmed.',
  'Регулирует использование данных пациентов США. Все клинические данные из Mount Sinai и St. Vincent должны быть надлежащим образом деидентифицированы до входа в тестовый pipeline. Не является QA-deliverable, но является жёстким prerequisite: тестирование на US-данных не может начаться пока не подтверждено соответствие HIPAA.'
), ['GDPR', 'FDA 510(k)'])}

<h2>${t('Europe — CE Mark', 'Европа — CE Mark')}</h2>

${sc('mdr', 'EU MDR 2017/745 — Medical Device Regulation', t(
  'The primary European regulatory framework, replacing the older MDD directive. More demanding than FDA in several respects — particularly around clinical evidence requirements and post-market surveillance obligations. Meeting MDR requirements typically simplifies subsequent FDA compliance, not the reverse.',
  'Основная европейская регуляторная система, заменившая старую директиву MDD. Более требовательная чем FDA в ряде аспектов — особенно в части требований к клиническим доказательствам и обязательствам по пост-маркетинговому надзору. Соответствие требованиям MDR, как правило, упрощает последующее соответствие FDA, а не наоборот.'
), ['ISO 13485', 'IEC 62304', 'ISO 14971', 'IEC 62366', 'FDA 510(k)'], ['MDR Annex I (GSPR)'])}

${sc('gspr', 'MDR Annex I — General Safety and Performance Requirements (GSPR)', t(
  'The technical checklist every device must satisfy to receive CE Mark. Each requirement must be mapped to specific evidence — test reports, standards compliance, clinical data. QA produces a substantial portion of this evidence through verification and validation testing.',
  'Технический чеклист который каждое устройство должно выполнить для получения CE Mark. Каждое требование должно быть привязано к конкретным доказательствам — тестовые отчёты, соответствие стандартам, клинические данные. QA производит значительную часть этих доказательств через верификационное и валидационное тестирование.'
), ['EU MDR 2017/745', 'IEC 62304', 'ISO 14971'])}

${sc('gdpr', 'GDPR — General Data Protection Regulation', t(
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
  'Эти стандарты не требуют создания отдельной документации для регуляторов параллельно с обычной QA-работой. Они определяют как эта работа должна быть организована с самого начала. Тест-кейс написанный по IEC 62304 — это всё ещё тест-кейс. Дефект занесённый с CAPA-трассируемостью — это всё ещё отчёт о дефекте. Разница в том что каждый артефакт структурирован, связан и хранится так, что может быть проверен по требованию.'
))}

${sc('approach2', t('QA Contributes, But Does Not Own Everything', 'QA участвует, но не владеет всем'), t(
  'QA owns: test plans, test cases, verification reports, defect management, and usability test execution. QA contributes to: risk assessments, Design History File assembly, CAPA records. Regulatory consultant owns: submission strategy, final documentation, and direct FDA/MDR communication. These boundaries matter — attempting to cover all three without the appropriate expertise is a common reason medical device programmes stall.',
  'QA владеет: тест-планами, тест-кейсами, отчётами верификации, управлением дефектами и выполнением юзабилити-тестов. QA участвует в: оценках рисков, сборке Design History File, записях CAPA. Regulatory consultant владеет: стратегией подачи, финальной документацией и прямой коммуникацией с FDA/MDR. Эти границы важны — попытка покрыть все три без нужной экспертизы является распространённой причиной стагнации программ медицинских устройств.'
))}

${sc('approach3', t('Everything Feeds the Design History File', 'Всё входит в Design History File'), t(
  'The DHF is the primary evidence package for any regulatory submission. It accumulates everything produced during development: requirements, risk assessments, architectural decisions, test results, defect records, and corrective actions. The QA role is to ensure that nothing produced is lost — and that what is produced is specific enough to be meaningful to a reviewer who was not present when the work was done.',
  'DHF — основной доказательный пакет для любой регуляторной подачи. Он накапливает всё произведённое в процессе разработки: требования, оценки рисков, архитектурные решения, результаты тестов, записи о дефектах и корректирующие действия. Роль QA — обеспечить чтобы ничто произведённое не было потеряно, и чтобы произведённое было достаточно конкретным, чтобы быть значимым для проверяющего, который не присутствовал при этой работе.'
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
        'The claimed >80% accuracy may have been measured on data the model was trained on — not an independent set. This is a showstopper for FDA: validating on training data proves nothing. US data (Mount Sinai, St. Vincent) must become the independent validation set. Must clarify on day one.',
        'Заявленные >80% точности могут быть измерены на тех же данных, на которых обучали — не независимом датасете. Это стоп-фактор для FDA: валидация на обучающих данных ничего не доказывает. US данные (Mount Sinai, St. Vincent) должны стать независимым validation set. Уточнить в первый день.'
      ),
      expect: t(
        'Expected: possible overlap. Action: US dataset becomes independent validation set — first QA priority.',
        'Ожидаем: возможно пересекаются. Действие: US датасет становится независимым validation set — первый приоритет QA.'
      ),
    },
    {
      level: 'critical',
      title: t('System Live in Clinic Without QA', 'Система работает в клинике без QA'),
      body: t(
        'The Sheba pilot is running in an active OR with no formal QA process, no documented test coverage, no structured issue log. Any incident right now is a reputational and regulatory liability. First action: audit current state, document as baseline, capture all known issues from the pilot. This is not a criticism — it is the starting point.',
        'Пилот в Sheba работает в операционной без формального QA-процесса, без задокументированного покрытия тестами, без структурированного лога проблем. Любой инцидент сейчас — репутационный и регуляторный риск. Первое действие: аудит текущего состояния, фиксация как baseline, запись всех известных проблем из пилота. Это не критика — это отправная точка.'
      ),
      expect: t(
        'Expected: informal feedback notes. Action: formal baseline audit — this is day-1 work.',
        'Ожидаем: неформальные заметки. Действие: формальный baseline аудит — это работа первого дня.'
      ),
    },
    {
      level: 'high',
      title: t('Module 2 at Feasibility Stage', 'Module 2 на стадии Feasibility'),
      body: t(
        'MVP requires both modules. If Module 2 (UNDERSTAND — functional brain mapping) does not stabilize on schedule, the entire FDA timeline shifts. Need a realistic development forecast before committing to any engagement plan.',
        'MVP требует оба модуля. Если Module 2 (UNDERSTAND — функциональное картирование мозга) не стабилизируется в срок — весь FDA timeline сдвигается. Нужен реалистичный прогноз разработки до принятия любого плана работы.'
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
        'Ноутбук в операционной — вектор риска: перегрев во время длинных процедур, потеря сети, зависание посреди процедуры. Нужно знать: постоянная production архитектура или временное решение? Ответ значительно меняет QA-стратегию.'
      ),
      expect: t(
        'Expected: temporary. If permanent — performance and reliability testing become critical path.',
        'Ожидаем: временное. Если постоянное — performance и reliability testing становятся критическим путём.'
      ),
    },
    {
      level: 'high',
      title: t('Each New Hospital = New Integration', 'Каждый новый госпиталь = новая интеграция'),
      body: t(
        '"No hardware changes" is a thesis, not a guarantee. Different PACS systems, different angiograph vendors, different network configurations at every US site. Without a standardized site acceptance testing protocol, every new hospital connection is an uncontrolled risk.',
        '"Без изменений железа" — тезис, не гарантия. Разные PACS системы, разные ангиографы, разные сетевые конфигурации на каждом US-сайте. Без стандартизированного site acceptance testing protocol каждое новое подключение — неконтролируемый риск.'
      ),
      expect: t(
        'Expected: only Sheba configuration tested. Deliverable: standardized site acceptance checklist.',
        'Ожидаем: только конфигурация Sheba протестирована. Результат: стандартный site acceptance чеклист.'
      ),
    },
    {
      level: 'medium',
      title: t('Ground Truth Annotation Status Unknown', 'Статус Ground Truth разметки неизвестен'),
      body: t(
        'Clinical expert-annotated data is the foundation of any model validation. If annotation is incomplete — validation is blocked. Key questions: who annotated, what protocol was used, what is the inter-annotator agreement score, is it finished?',
        'Данные с разметкой клинических экспертов — основа любой валидации модели. Если разметка не завершена — валидация заблокирована. Ключевые вопросы: кто размечал, по какому протоколу, inter-annotator agreement, завершена ли разметка?'
      ),
      expect: t(
        'Expected: partially done. If not complete — this becomes the #1 bottleneck blocking everything else.',
        'Ожидаем: частично завершена. Если нет — становится узким местом #1, блокирующим всё остальное.'
      ),
    },
    {
      level: 'high',
      title: t('No Formal Requirements Documentation', 'Нет формальных требований'),
      body: t(
        'The system was built without documented product requirements. Jira tickets and informal notes cannot serve as a traceability baseline for FDA submission — a regulator needs to see a clear chain: requirement → test case → result. Without this chain, test coverage cannot be formally demonstrated, and the Design History File cannot be assembled.',
        'Система построена без задокументированных product requirements. Jira-тикеты и неформальные заметки не могут служить baseline трассируемости для FDA submission — регулятор должен видеть чёткую цепочку: требование → тест-кейс → результат. Без этой цепочки тестовое покрытие нельзя формально доказать, а Design History File нельзя собрать.'
      ),
      expect: t(
        'Expected: no formal requirements exist. Action: retrospective requirements documentation in first 30 days — QA extracts requirements from existing system behaviour, Jira, and dev conversations, then gets sign-off from CTO and clinical expert. No BA is needed; this is standard practice in early-stage medical device companies.',
        'Ожидаем: формальных требований нет. Действие: ретроспективная документация требований в первые 30 дней — QA извлекает требования из существующего поведения системы, Jira и разговоров с разработчиками, затем получает sign-off от CTO и клинического эксперта. BA для этого не нужен — это стандартная практика в ранних медицинских стартапах.'
      ),
    },
    {
      level: 'medium',
      title: t('No Regulatory Consultant Identified', 'Нет регуляторного консультанта'),
      body: t(
        'Without a regulatory consultant we are guessing what FDA actually requires. Building a QA system without knowing the exact target is expensive and risky. Engaging a regulatory consultant must be a parallel track to QA setup from day one.',
        'Без регуляторного консультанта мы гадаем что на самом деле требует FDA. Строить QA-систему не зная точной цели — дорого и рискованно. Привлечение регуляторного консультанта должно быть параллельным треком к QA с первого дня.'
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
  'Risks I can see before the first conversation — based on the case study only.',
  'Риски, которые я вижу до первого разговора — только на основе case study.'
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

// ─── QUESTIONS ─────────────────────────────────────────────────────────────
function renderQuestions() {
  const must = [
    {
      q: t(
        '"What format do you expect for the test assignment — slides, document, live discussion?"',
        '"В каком формате вы ожидаете тестовое задание — слайды, документ, живой разговор?"'
      ),
      a: t(
        'Expected: slides. Need this to spend preparation time correctly.',
        'Ожидаем: слайды. Нужно чтобы правильно потратить время на подготовку.'
      ),
    },
    {
      q: t(
        '"Who is the presentation for — CTO only, or is the CEO also present?"',
        '"На кого рассчитана презентация — только CTO или CEO тоже присутствует?"'
      ),
      a: t(
        'Expected: panel with CTO + CEO minimum. Need to balance technical and business language.',
        'Ожидаем: panel минимум CTO + CEO. Нужно найти баланс между техническим и бизнес языком.'
      ),
    },
    {
      q: t(
        '"Was the model validated on an independent dataset, or does it overlap with training data?"',
        '"Модель валидировалась на независимом датасете или пересекается с обучающими данными?"'
      ),
      a: t(
        'Expected: possible overlap. This is the first critical gap for FDA — US data must become the independent validation set.',
        'Ожидаем: возможно пересекаются. Это первый критический gap для FDA — US данные должны стать независимым validation set.'
      ),
    },
    {
      q: t(
        '"Was clinical data collected under IRB approval and de-identified per HIPAA/FDA standards?"',
        '"Клинические данные собирались под IRB approval и деидентифицированы по HIPAA/FDA стандартам?"'
      ),
      a: t(
        'Expected: yes. Without this, data cannot be used in a submission.',
        'Ожидаем: да. Без этого данные нельзя использовать в submission.'
      ),
    },
    {
      q: t(
        '"Is there already an FDA regulatory consultant engaged, or does that need to be organized?"',
        '"Есть ли уже контакт с FDA или регуляторным консультантом, или это нужно будет организовать?"'
      ),
      a: t(
        'Expected: not yet or just starting. Need to understand how independent we are in defining requirements.',
        'Ожидаем: нет или только начинают. Нужно понять насколько мы самостоятельны в определении требований.'
      ),
    },
    {
      q: t(
        '"Is there a log of issues from the Sheba pilot — what physicians reported, what didn\'t work?"',
        '"Есть ли лог проблем из Sheba пилота — что сообщали врачи, что не работало?"'
      ),
      a: t(
        'Expected: informal notes. This is a ready-made QA backlog — real problems from real production usage.',
        'Ожидаем: неформальные заметки. Это готовый QA backlog — реальные проблемы реального использования.'
      ),
    },
  ];

  const important = [
    {
      q: t(
        '"What makes up the remaining 10% to MVP-ready in Module 1?"',
        '"Что составляет оставшиеся 10% до MVP ready в Module 1?"'
      ),
      a: t(
        'Expected: edge cases or integration. Need to know where the active risks are right now.',
        'Ожидаем: edge cases или интеграция. Нужно понять где горячие риски прямо сейчас.'
      ),
    },
    {
      q: t(
        '"Is the laptop a temporary solution or the final production architecture?"',
        '"Ноутбук — временное решение или финальная production архитектура?"'
      ),
      a: t(
        'Expected: temporary. Affects what to test now versus what to defer.',
        'Ожидаем: временное. Влияет на то что тестировать сейчас а что отложить.'
      ),
    },
    {
      q: t(
        '"Module 2 is at feasibility — is there a timeline to a stable, testable version?"',
        '"Module 2 на feasibility — есть ли timeline до stable, тестируемой версии?"'
      ),
      a: t(
        'Expected: 1-2 months. Directly affects the 90-day plan.',
        'Ожидаем: 1-2 месяца. Напрямую влияет на 90-дневный план.'
      ),
    },
    {
      q: t(
        '"Is clinical data already annotated with ground truth labels, or is annotation still ongoing?"',
        '"Клинические данные уже размечены ground truth метками или разметка продолжается?"'
      ),
      a: t(
        'Expected: partially done. If not complete — this is the bottleneck that blocks all validation.',
        'Ожидаем: частично завершена. Если нет — это bottleneck который блокирует всю валидацию.'
      ),
    },
    {
      q: t(
        '"Do modules 1 and 2 run sequentially in the pipeline, or can they operate independently?"',
        '"Модули 1 и 2 работают последовательно в pipeline или могут работать независимо?"'
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
      a: t(
        'Expected: 12-18 months. Need to assess realism of a 180-day submission plan.',
        'Ожидаем: 12-18 месяцев. Нужно оценить реалистичность 180-дневного плана к submission.'
      ),
    },
  ];

  const nice = [
    {
      q: t(
        '"Is the 12mm from GT an internal accuracy requirement, or does it come from the regulator?"',
        '"12mm from GT — внутреннее требование к точности или от регулятора?"'
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
      a: t(
        'Expected: physician continues without the system. Affects regulatory risk classification.',
        'Ожидаем: врач продолжает без системы. Влияет на regulatory класс риска.'
      ),
    },
    {
      q: t(
        '"Are there examples of presentation formats you like or don\'t like?"',
        '"Есть примеры форматов презентаций которые вам нравятся или нет?"'
      ),
      a: t(
        'Expected: concrete, no fluff.',
        'Ожидаем: конкретика без воды.'
      ),
    },
  ];

  const qCard = (item, cls, clsLabel, key) => `
<div class="q-card">
  <div class="risk-card-inner">
    <div class="risk-main">
      <div class="q-label ${cls}">${clsLabel}</div>
      <div class="question">${item.q}</div>
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
  'Prioritized — what to ask and why. Each question serves a purpose.',
  'Приоритизированные — что спросить и зачем. Каждый вопрос имеет цель.'
)}</p>

<h2>🔴 ${t('Must Ask', 'Задать обязательно')}</h2>
${must.map((q,i) => qCard(q, 'must', t('MUST ASK','ОБЯЗАТЕЛЬНО'), `q_must_${i}`)).join('')}

<h2>🟡 ${t('Important — If Time Allows', 'Важные — если есть время')}</h2>
${important.map((q,i) => qCard(q, 'important', t('IMPORTANT','ВАЖНО'), `q_imp_${i}`)).join('')}

<h2>🟢 ${t('Nice to Know', 'Хорошо бы узнать')}</h2>
${nice.map((q,i) => qCard(q, 'nice', t('NICE TO KNOW','ХОРОШО БЫ'), `q_nice_${i}`)).join('')}`;
}

// ─── PLAN ──────────────────────────────────────────────────────────────────
function renderPlan() {
  return `
<h1>${t('Engagement Plan', 'План работы')}</h1>
<p class="section-desc">${t(
  'Three variants — selected based on what they actually need. Variant B eliminated: too slow to FDA.',
  'Три варианта — выбирается исходя из того что им реально нужно. Вариант B исключён: слишком долго до FDA.'
)}</p>

<div class="variant-tabs">
  <button class="vtab active" onclick="showVariant('A')">
    ${t('Variant A — Regulatory First', 'Вариант A — Regulatory First')}
  </button>
  <button class="vtab" onclick="showVariant('B')">
    ${t('Variant B — Eliminated', 'Вариант B — Исключён')}
  </button>
  <button class="vtab" onclick="showVariant('C')">
    ${t('Variant C — Parallel ✅', 'Вариант C — Параллельно ✅')}
  </button>
</div>

<!-- VARIANT A -->
<div id="variant-A" class="variant-content active">
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
            <li>${t('Baseline audit of Sheba pilot — document current state, all known issues, all user feedback', 'Baseline аудит Sheba пилота — документируем текущее состояние, все известные проблемы, весь feedback')}</li>
            <li>${t('Study FDA 510(k) pathway with regulatory consultant — understand exact deliverables required', 'Изучаем FDA 510(k) с регуляторным консультантом — понимаем точные требуемые deliverables')}</li>
            <li>${t('Map predicate devices (AiDOC, Viz.ai, RapidAI) — identify most relevant comparison points', 'Маппинг предикатных устройств (AiDOC, Viz.ai, RapidAI) — наиболее релевантные точки сравнения')}</li>
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
            <li>${t('Data pipeline testing first — garbage in, garbage out. All stages before AI input verified', 'Тестирование data pipeline первым — garbage in, garbage out. Все стадии до AI верифицированы')}</li>
            <li>${t('Module 1a end-to-end: AI accuracy layer → real-time performance → clinical display — each independently, then integrated', 'Module 1a end-to-end: AI accuracy → real-time performance → clinical display — каждый независимо, потом вместе')}</li>
            <li>${t('Independent validation dataset established from US sites — separate from training data', 'Независимый validation датасет из US сайтов — отдельный от обучающих данных')}</li>
            <li>${t('Site acceptance testing protocol v1 — standardized checklist, tested and validated on Sheba', 'Site acceptance testing protocol v1 — стандартный чеклист, протестирован и валидирован на Sheba')}</li>
            <li>${t('DHF documentation starts: requirements → test cases → results, full traceability', 'Начало DHF документации: требования → тест-кейсы → результаты, полная трассируемость')}</li>
          </ul>
          <p class="phase-note">${t('Module 2 test framework prepared in parallel — ready to execute as soon as dev stabilizes.','Framework для Module 2 готов параллельно — выполняется как только dev стабилизируется.')}</p>
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
            <li>${t('Full regression — both modules integrated end-to-end', 'Полная регрессия — оба модуля интегрированы end-to-end')}</li>
            <li>${t('Performance benchmarking on production-equivalent hardware', 'Performance benchmarking на production-эквивалентном оборудовании')}</li>
            <li>${t('Predicate device comparison testing documented for 510(k)', 'Сравнительное тестирование с предикатными устройствами задокументировано для 510(k)')}</li>
            <li>${t('510(k) submission package assembled together with regulatory consultant', '510(k) submission package собран вместе с регуляторным консультантом')}</li>
          </ul>
          <p class="phase-note">${t('Target: submission-ready at month 6–7. Main risk: Module 2 development timeline.','Цель: готовность к submission на месяце 6–7. Главный риск: timeline разработки Module 2.')}</p>
        </div>
        ${renderNotePanel('plan_a_180')}
      </div>
    </div>
  </div>
</div>

<!-- VARIANT B -->
<div id="variant-B" class="variant-content">
  <div class="highlight-box" style="background:#fee2e2;border-color:#fca5a5;color:#7f1d1d">
    <strong style="color:#7f1d1d">⛔ ${t('Eliminated — Too Slow', 'Исключён — Слишком долго')}</strong>
    ${t(
      'This variant (QA process maturity first, regulatory second) pushes FDA submission to month 9–10. For a company that needs US market entry, that is not viable. Shown here for completeness only — not a proposal.',
      'Этот вариант (сначала зрелость QA-процесса, потом regulatory) сдвигает FDA submission на месяц 9–10. Для компании которой нужен выход на US рынок — это неприемлемо. Показан для полноты — не предложение.'
    )}
  </div>
</div>

<!-- VARIANT C -->
<div id="variant-C" class="variant-content">
  <div class="highlight-box" style="background:#f0fdf4;border-color:#86efac;color:#14532d">
    <strong style="color:#14532d">✅ ${t('Recommended — With a Junior QA', 'Рекомендуется — с Junior QA')}</strong>
    ${t(
      'I own the regulatory track and strategic QA direction. A junior QA engineer handles test execution, documentation, and defect tracking under my direct guidance. Fastest path to FDA submission with proper quality coverage on both tracks simultaneously.',
      'Я отвечаю за regulatory трек и стратегическое направление QA. Junior QA инженер выполняет тесты, ведёт документацию и трекинг дефектов под моим прямым руководством. Самый быстрый путь к FDA submission с правильным QA покрытием на обоих треках одновременно.'
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
            <li>${t('510(k) submission package — assembled with regulatory consultant', '510(k) submission package — собирается с регуляторным консультантом')}</li>
          </ul>
          <p class="phase-note">${t('Target: submission-ready at month 6. Main risk: Module 2 development timeline.','Цель: готовность к submission на месяце 6. Главный риск: timeline разработки Module 2.')}</p>
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

// ─── NEEDS ─────────────────────────────────────────────────────────────────
function renderNeeds() {
  return `
<h1>${t('What I Need', 'Что мне нужно')}</h1>
<p class="section-desc">${t(
  'Resources and access I will ask for — organized by category.',
  'Ресурсы и доступы которые запрошу — сгруппированы по категориям.'
)}</p>

<h2>👥 ${t('People', 'Люди')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">🩺 ${t('Clinical Expert', 'Клинический эксперт')}</div>
  <p>${t('A physician or radiologist who is the single source of truth on clinical correctness. Who approves that a functional zone mapping is correct — not algorithmically, but clinically?','Врач или радиолог — единственный источник правды по клинической корректности. Кто апрувит что маппинг функциональной зоны корректен — не алгоритмически, а клинически?')}</p>
</div>${renderNotePanel('need_clinical')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">⚖️ ${t('Regulatory Consultant', 'Регуляторный консультант')}</div>
  <p>${t('Defines exactly what FDA requires for 510(k) submission. Already engaged or needs to be found? Without this, QA direction is a guess.','Определяет что именно требует FDA для 510(k) submission. Уже есть или нужно найти? Без этого направление QA — это догадки.')}</p>
</div>${renderNotePanel('need_reg')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">👨‍💻 ${t('Developer Access', 'Доступ к разработчикам')}</div>
  <p>${t('To understand pipeline architecture, data flow, technical debt, and upcoming changes. QA cannot be built in isolation.','Понимание архитектуры pipeline, data flow, технического долга и предстоящих изменений. QA нельзя строить изолированно.')}</p>
</div>${renderNotePanel('need_dev')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">👶 ${t('Junior QA (Variant C)', 'Junior QA (Вариант C)')}</div>
  <p>${t('For Variant C: handles test execution and documentation under my direction. Frees me for regulatory and strategic work. Fastest path to submission.','Для Варианта C: выполняет тесты и ведёт документацию под моим руководством. Освобождает меня для regulatory и стратегической работы. Самый быстрый путь к submission.')}</p>
</div>${renderNotePanel('need_junior')}</div></div>

<h2>📊 ${t('Data', 'Данные')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Retrospective Data Access', 'Доступ к ретроспективным данным')}</div>
  <p>${t('De-identified data from all three sites (Sheba, Mount Sinai, St. Vincent) for validation. IRB-approved and HIPAA-compliant.','Деидентифицированные данные из всех трёх сайтов (Sheba, Mount Sinai, St. Vincent) для валидации. С IRB approval и соответствием HIPAA.')}</p>
</div>${renderNotePanel('need_data')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Ground Truth Annotation Details', 'Детали Ground Truth разметки')}</div>
  <p>${t('Who annotated, what protocol, inter-annotator agreement score, completion status. If incomplete — validation is blocked.','Кто размечал, по какому протоколу, inter-annotator agreement, статус завершённости. Если не завершена — валидация заблокирована.')}</p>
</div>${renderNotePanel('need_gt')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Sheba Pilot Issue Log', 'Лог проблем Sheba пилота')}</div>
  <p>${t('All physician feedback and technical issues from the live pilot. This is our ready-made QA backlog — real problems from real usage.','Весь feedback врачей и технические проблемы из живого пилота. Это готовый QA backlog — реальные проблемы реального использования.')}</p>
</div>${renderNotePanel('need_log')}</div></div>

<h2>💻 ${t('Systems & Tools', 'Системы и инструменты')}</h2>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Test Environment', 'Тестовая среда')}</div>
  <p>${t('Access to the product in a test environment — not in production Sheba. Testing safely in a live OR is not possible.','Доступ к продукту в тестовой среде — не в продакшне Sheba. Безопасное тестирование в живой операционной невозможно.')}</p>
</div>${renderNotePanel('need_env')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Bug Tracking', 'Баг-трекинг')}</div>
  <p>${t('Jira or equivalent — with proper workflows, fields, priorities, and severity definitions. Starting point for QA visibility across the team.','Jira или аналог — с правильными workflows, полями, приоритетами и определениями severity. Отправная точка для видимости QA в команде.')}</p>
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
  <p>${t('Everything already written — PRD, architecture diagrams, any existing specs. Starting from scratch is preventable.','Всё что уже написано — PRD, архитектурные схемы, любые существующие specs. Начинать с нуля необязательно.')}</p>
</div>${renderNotePanel('need_prd')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">${t('Clinical Trial Protocols', 'Протоколы клинических исследований')}</div>
  <p>${t('Protocols from all three sites — Sheba, Mount Sinai, St. Vincent Indiana.','Протоколы из всех трёх сайтов — Sheba, Mount Sinai, St. Vincent Indiana.')}</p>
</div>${renderNotePanel('need_protocols')}</div></div>

<div class="card"><div class="risk-card-inner"><div class="risk-main">
  <div class="card-title">IRB Approvals</div>
  <p>${t('Confirms data was collected under proper ethics oversight. Required for any FDA submission.','Подтверждает что данные собирались под надлежащим этическим надзором. Обязательно для FDA submission.')}</p>
</div>${renderNotePanel('need_irb')}</div></div>`;
}

// ─── INIT ──────────────────────────────────────────────────────────────────
(function init() {
  document.getElementById('btn-en').classList.toggle('active', L === 'en');
  document.getElementById('btn-ru').classList.toggle('active', L === 'ru');

  if (checkAuth()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display  = 'flex';
    showSection('overview');
  } else {
    document.getElementById('login-user').focus();
  }
})();
