'use strict';

// ─── AUTH ──────────────────────────────────────────────────────────────────
const AUTH_KEY = 'nvsight_pres_auth';

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
    const startSlide = location.hash.slice(1);
    const valid = SLIDES.find(s => s.id === startSlide);
    showSlide(valid ? startSlide : 'overview');
  } else {
    const err = document.getElementById('login-error');
    err.textContent = 'Invalid login or password';
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
}

// ─── STANDARDS DATA ────────────────────────────────────────────────────────
const STANDARDS_DATA = {
  'std-820': {
    type: 'Закон FDA', typeClass: 'law',
    subtitle: 'Quality System Regulation',
    what: 'Американский закон для производителей медустройств. Раздел 820.30 (Design Controls) — ключевой для QA: требует документировать все этапы от требований до верификации и валидации. В 2024 году приведён в соответствие с ISO 13485.',
    reqs: [
      { h: 'Design Controls (820.30)', d: 'Весь цикл разработки документируется — требования, архитектура, верификация, валидация. Без этого submission невозможен.' },
      { h: 'Document Control (820.40)', d: 'Версионирование, approval и контроль всей документации. Каждая версия документа должна быть прослеживаема.' },
      { h: 'CAPA (820.100)', d: 'Corrective and Preventive Action для каждого дефекта и несоответствия. Root cause + действия + подтверждение закрытия.' },
      { h: 'Complaint Files (820.198)', d: 'Фиксация и анализ жалоб и adverse events. Для клинического AI это включает feedback от врачей из пилота.' },
      { h: 'V&V Records', d: 'Результаты каждого теста хранятся как часть Design History File. Не "тест прошёл", а подписанный отчёт.' },
    ],
    docs: ['teststrategy', 'traceability', 'vnvreport', 'dhf', 'qualityreport'],
    pitfalls: [
      'Воспринимать как чеклист, а не как живую систему — FDA проверяет реальное применение, не только наличие документов.',
      'Нет traceability требование → тест → результат — первое что запросят на аудите.',
      'Изменения в дизайне без документирования — критическое нарушение, может заблокировать submission.',
    ],
    refs: ['std-13485', 'std-62304'],
  },
  'std-62304': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Medical Device Software Lifecycle Processes',
    what: 'Международный стандарт жизненного цикла ПО медустройств. FDA признаёт как consensus standard. Определяет классификацию ПО по уровням риска и требования к документации на каждом уровне.',
    reqs: [
      { h: 'Классификация: Class C (почти точно NV-Sight)', d: 'Ошибка AI при детекции окклюзии во время процедуры = серьёзный вред пациенту. Class C — наивысший уровень, полная документация обязательна.' },
      { h: 'Software Development Plan', d: 'Как организована разработка и тестирование — документируется до начала работ.' },
      { h: 'Unit + Integration + System Tests', d: 'Планы и отчёты по каждому уровню тестирования. Все результаты хранятся, не только итоговый вывод.' },
      { h: 'Anomaly Records', d: 'Каждый обнаруженный дефект документируется — статус, root cause, resolution. Без этого submission не пройдёт.' },
      { h: 'Full Traceability', d: 'Требования → архитектура → тест-кейсы → результаты — связь на всех уровнях.' },
    ],
    docs: ['teststrategy', 'testplans', 'testcases', 'defectworkflow', 'traceability', 'vnvreport'],
    pitfalls: [
      'Занижение класса (B вместо C) чтобы уменьшить объём документации — FDA оспорит при submission.',
      'Не документировать unit-тесты как "внутренние" — для Class C всё идёт в submission пакет.',
      'Закрытые дефекты без root cause analysis — формально недостаточно для аудита.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-14971': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Risk Management for Medical Devices',
    what: 'Стандарт управления рисками. FDA признаёт. QA не ведёт risk file самостоятельно — это зона engineering team. Но QA обеспечивает доказательства: тест-результаты подтверждающие что mitigation работает.',
    reqs: [
      { h: 'Risk Framework', d: 'Hazard → Hazardous Situation → Harm. Для каждого: Severity × Probability = Risk Level → приемлем или требует mitigation.' },
      { h: 'Risk Controls', d: 'Mitigation меры для неприемлемых рисков. QA тестирует что они работают — это и есть QA contribution в risk file.' },
      { h: 'Residual Risk', d: 'После mitigation — документируется остаточный риск и принимается решение о приемлемости.' },
      { h: 'QA Contribution', d: 'Failure modes найденные в тестировании → в risk file. Тест-отчёты = evidence для risk controls.' },
    ],
    docs: ['testcases', 'vnvreport', 'riskcontrib', 'traceability'],
    pitfalls: [
      'QA считает risk management "не своим" — без QA evidence risk file неполный и submission не примут.',
      'Не обновлять risk file когда QA находит новые failure modes в тестировании.',
      'Не тестировать boundary cases из hazard analysis — они там именно потому что это зоны риска.',
      'AI/ML специфика: failure modes вероятностные, не детерминированные — нужны статистические подходы к тест-покрытию.',
    ],
    refs: ['std-62304', 'std-62366', 'std-820'],
  },
  'std-62366': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Usability Engineering for Medical Devices',
    what: 'Стандарт usability engineering. FDA признаёт. Цель: убедиться что пользователь не причинит вред через use error — не просто что интерфейс удобен.',
    reqs: [
      { h: 'Formative Testing', d: 'В процессе разработки — итерационная проверка UI. Выявление usability hazards на ранних стадиях.' },
      { h: 'Summative Testing', d: 'Финальная валидация с реальными пользователями (врачами). Обязательна для submission — симуляция не засчитывается.' },
      { h: 'Use Specification', d: 'Кто пользователь, в каких условиях работает, какие критические задачи выполняет.' },
      { h: 'Usability Hazards → Risk File', d: 'Каждый выявленный usability hazard идёт в ISO 14971 risk file с оценкой severity.' },
    ],
    docs: ['usability', 'riskcontrib', 'vnvreport'],
    pitfalls: [
      'Путать с UX-тестированием — цель не "красиво", а "врач не совершит опасную ошибку".',
      'Не привлекать реальных врачей к summative testing — обязательны, без них FDA не примет.',
      'Только formative без summative — submission не пройдёт review.',
      'NV-Sight: AI output интерпретируется под временным давлением во время инсульт-процедуры — usability особенно критична.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-13485': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Quality Management Systems for Medical Devices',
    what: 'QMS стандарт для медустройств. После обновления 21 CFR Part 820 в 2024 году практически идентичен по структуре. Сертификация по ISO 13485 упрощает выход на международные рынки в будущем.',
    reqs: [
      { h: 'Документированные процедуры', d: 'Все quality activities имеют задокументированные процедуры — не просто делаются, а описаны как делаются.' },
      { h: 'Internal Audits', d: 'Планируются и документируются — проверка что QMS реально применяется, а не существует на бумаге.' },
      { h: 'CAPA', d: 'Для любых несоответствий — с root cause analysis и evidence закрытия.' },
      { h: 'Management Review', d: 'QA метрики регулярно докладываются руководству. Quality Report — основной инструмент для этого.' },
    ],
    docs: ['teststrategy', 'metrics', 'qualityreport', 'defectworkflow'],
    pitfalls: [
      'Получить сертификат ISO 13485 и не применять систему реально — аудиторы проверяют живые примеры, не только документы.',
      'Нет реального CAPA process — FDA и аудиторы запрашивают конкретные примеры из практики.',
    ],
    refs: ['std-820', 'std-62304'],
  },
  'std-samd': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Software as a Medical Device — Clinical Evaluation',
    what: 'FDA guidance по клинической оценке SaMD. Не закон, но FDA следует этому при review — игнорировать нельзя. Определяет что именно нужно доказать клиническими данными.',
    reqs: [
      { h: 'Analytical Performance', d: 'Как работает модель технически — accuracy, sensitivity, specificity, recall, precision на тестовом датасете.' },
      { h: 'Clinical Performance', d: 'Как AI влияет на клинические решения врача. Аналитического одного недостаточно — нужно показать clinical benefit.' },
      { h: 'Independent Test Set', d: 'Валидационный датасет не должен участвовать в обучении. Mount Sinai + St. Vincent — именно independent validation sets.' },
      { h: 'Subgroup Analysis', d: 'Производительность на подгруппах: демография, типы патологии, тип оборудования.' },
    ],
    docs: ['vnvreport', 'testcases', 'testplans'],
    pitfalls: [
      'Показывать только accuracy на train/validation set — FDA спросит про independent test set.',
      'Не иметь independent validation set — submission заблокируют на этом шаге.',
      'Игнорировать subgroup performance — модель может работать хорошо в среднем, плохо на конкретных подгруппах.',
    ],
    refs: ['std-aiml', 'std-14971'],
  },
  'std-aiml': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'AI/ML-Based Software as a Medical Device — Action Plan',
    what: 'FDA guidance специфично для AI/ML устройств. Определяет как FDA смотрит на AI: разработка, тестирование и жизненный цикл модели после выхода на рынок.',
    reqs: [
      { h: 'Good Machine Learning Practice (GMLP)', d: 'Стандарты разработки модели — качество данных, воспроизводимость, оценка производительности.' },
      { h: 'Bias & Generalizability', d: 'Модель работает на разных популяциях — демография, оборудование, клиники. Проверяется тестированием.' },
      { h: 'Real-World Performance Monitoring', d: 'После deployment — план мониторинга производительности и триггеры для re-evaluation.' },
      { h: 'Transparency', d: 'Что делает модель, как интерпретировать output, где границы применимости — документируется.' },
    ],
    docs: ['vnvreport', 'testplans', 'testcases', 'pccp'],
    pitfalls: [
      'Тестировать только на основной популяции — FDA спросит про subgroup performance отдельно.',
      'Нет плана мониторинга после deployment — "set and forget" не принимается для AI устройств.',
      'Не документировать failure modes модели — непрозрачность AI это risk, должен быть в risk file.',
    ],
    refs: ['std-samd', 'std-pccp', 'std-62366'],
  },
  'std-pccp': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Predetermined Change Control Plan',
    what: 'Обязателен если AI модель будет обновляться после market clearance. Включается в original submission. Без PCCP — каждое обновление модели = новый 510(k) = год+ ожидания перед каждым улучшением.',
    reqs: [
      { h: 'Pre-approved Changes', d: 'Какие изменения разрешены без нового submission: retrain на большем датасете, threshold adjustments и т.п.' },
      { h: 'Performance Metrics & Triggers', d: 'При каком падении метрик требуется re-submission или дополнительный review.' },
      { h: 'Change Methodology', d: 'Как оцениваются изменения — тест-протокол, датасет, критерии приёмки.' },
      { h: 'Scope Definition', d: 'Чёткие границы что входит и не входит в PCCP — FDA будет проверять соответствие при каждом изменении.' },
    ],
    docs: ['pccp', 'vnvreport', 'testplans'],
    pitfalls: [
      'Не включить PCCP в original submission — "добавим потом" не работает, нужно в первой подаче.',
      'Слишком широкий PCCP — FDA ограничит при review.',
      'Слишком узкий PCCP — нельзя обновить модель без нового submission.',
      'NV-Sight будет обновляться по мере накопления данных из USA sites — PCCP критичен с самого начала.',
    ],
    refs: ['std-aiml', 'std-62304'],
  },
  'std-cyber': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Cybersecurity in Medical Devices (2023)',
    what: 'С 2023 года обязательно включать в premarket submission. Кибербезопасность рассматривается как patient safety issue, а не IT задача. Client-server архитектура NV-Sight = расширенная attack surface.',
    reqs: [
      { h: 'Threat Modeling', d: 'STRIDE или аналог — документировать угрозы и mitigations для каждой точки входа: PACS, сеть больницы, клиентский ноутбук.' },
      { h: 'SBOM', d: 'Software Bill of Materials — полный список всех компонентов включая open source зависимости.' },
      { h: 'Cybersecurity Testing', d: 'Penetration testing, vulnerability scanning — результаты входят в submission.' },
      { h: 'Post-Market Monitoring', d: 'План реагирования на уязвимости и patch management process после выхода.' },
    ],
    docs: ['teststrategy', 'testplans', 'vnvreport', 'dhf'],
    pitfalls: [
      '"Это задача IT, не QA" — FDA требует это в device submission, значит QA документирует и тестирует.',
      'Нет SBOM — обязателен, включая все транзитивные зависимости open source.',
      'PACS-соединение не тестируется как attack surface — hospital network = потенциальный вектор атаки.',
      'Нет patch management plan — FDA спросит что происходит когда после выхода найдут уязвимость.',
    ],
    refs: ['std-62304', 'std-hipaa'],
  },
  'std-hipaa': {
    type: 'Операционный (Закон)', typeClass: 'operational',
    subtitle: 'Health Insurance Portability and Accountability Act',
    what: 'Закон США о защите данных пациентов (PHI — Protected Health Information). Напрямую влияет на работу QA с тестовыми данными из клиник. Нарушение — крупные штрафы.',
    reqs: [
      { h: 'De-identification (Safe Harbor)', d: 'Удалить 18 идентификаторов из данных пациента. Только после этого можно использовать для тестирования без Business Associate Agreement.' },
      { h: 'Business Associate Agreement (BAA)', d: 'Если QA-команда работает с реальными PHI данными из клиник — нужен BAA с каждой клиникой.' },
      { h: 'Data Handling', d: 'PHI нельзя хранить на личных устройствах или незащищённых системах. Влияет на организацию тест-окружения.' },
    ],
    docs: ['testplans', 'testcases', 'sat'],
    pitfalls: [
      '"Изображение без имени" ≠ деидентифицировано. DICOM файлы содержат 50+ тегов с PHI — дата рождения, ID исследования, номер аппарата и т.д.',
      'Нет формального процесса деидентификации тестовых данных — аудит найдёт нарушение.',
      'Использовать данные из Sheba напрямую для тестирования без BAA и de-identification.',
    ],
    refs: ['std-dicom', 'std-cyber'],
  },
  'std-dicom': {
    type: 'Операционный (Стандарт)', typeClass: 'operational',
    subtitle: 'Digital Imaging and Communications in Medicine',
    what: 'Стандарт хранения и передачи медицинских изображений. Не regulatory требование, но весь imaging pipeline NV-Sight работает с DICOM. QA должен понимать формат чтобы правильно строить тест-сценарии.',
    reqs: [
      { h: 'Структура', d: 'Patient → Study → Series → Instance (image). Понимание иерархии критично для корректных тест-сценариев.' },
      { h: 'PHI в тегах', d: 'DICOM содержит сотни тегов, многие с данными пациента. De-identification обязательна перед тестированием.' },
      { h: 'Transfer Syntax', d: 'Форматы сжатия изображений — pipeline должен корректно обрабатывать все варианты которые генерируют Siemens аппараты.' },
      { h: 'DICOM over Network (DIMSE)', d: 'Передача через PACS — задержки при передаче через сеть больницы учитываются в performance тест-сценариях.' },
    ],
    docs: ['testplans', 'testcases', 'testmatrix', 'sat'],
    pitfalls: [
      'Тестировать только на "идеальных" DICOM файлах — в реальности приходят битые теги, нестандартные значения, артефакты сжатия.',
      'Не тестировать real-time performance с реальными PACS-задержками — критично для intraoperative AI.',
      'Не деидентифицировать тестовые DICOM файлы — нарушение HIPAA, каждый файл содержит PHI.',
      'Разные Siemens аппараты генерируют DICOM немного по-разному — тестировать на данных с каждого типа аппарата.',
    ],
    refs: ['std-hipaa', 'std-cyber'],
  },
};

const STD_SLIDES_META = [
  { id: 'std-overview', icon: '📜', title: 'Стандарты и требования' },
  { id: 'std-820',      icon: '🇺🇸', title: '21 CFR Part 820' },
  { id: 'std-62304',    icon: '💻', title: 'IEC 62304' },
  { id: 'std-14971',    icon: '⚠️', title: 'ISO 14971' },
  { id: 'std-62366',    icon: '👤', title: 'IEC 62366-1' },
  { id: 'std-13485',    icon: '🏭', title: 'ISO 13485' },
  { id: 'std-samd',     icon: '📱', title: 'FDA SaMD Guidance' },
  { id: 'std-aiml',     icon: '🧠', title: 'FDA AI/ML Action Plan' },
  { id: 'std-pccp',     icon: '🔁', title: 'FDA PCCP' },
  { id: 'std-cyber',    icon: '🔒', title: 'FDA Cybersecurity 2023' },
  { id: 'std-hipaa',    icon: '🔐', title: 'HIPAA' },
  { id: 'std-dicom',    icon: '🖼️', title: 'DICOM' },
];

// ─── SLIDES ────────────────────────────────────────────────────────────────
const SLIDES = [
  { id: 'overview',         icon: '📋', title: 'Overview',                         group: '' },
  // Standards
  ...STD_SLIDES_META.map(s => ({ ...s, group: 'Standards' })),
  // Foundation
  { id: 'teststrategy',     icon: '🗺️', title: 'Test Strategy',                    group: 'Foundation' },
  { id: 'testmatrix',       icon: '🔢', title: 'Test Matrix',                       group: 'Foundation' },
  { id: 'bugreporting',     icon: '🐛', title: 'Bug Reporting Standards',           group: 'Foundation' },
  { id: 'metrics',          icon: '📊', title: 'QA Metrics & Quality Gates',        group: 'Foundation' },
  // Operational
  { id: 'testplans',        icon: '📝', title: 'Test Plans',                        group: 'Operational' },
  { id: 'testcases',        icon: '✅', title: 'Test Cases',                        group: 'Operational' },
  { id: 'automation',       icon: '🤖', title: 'Automation Framework',              group: 'Operational' },
  { id: 'defectworkflow',   icon: '🔄', title: 'Defect Tracking Workflow',          group: 'Operational' },
  { id: 'releasereadiness', icon: '🚦', title: 'Release Readiness Criteria',       group: 'Operational' },
  { id: 'qualityreport',    icon: '📈', title: 'Quality Report',                    group: 'Operational' },
  // Regulatory
  { id: 'traceability',     icon: '🔗', title: 'Traceability Matrix',               group: 'Regulatory' },
  { id: 'vnvreport',        icon: '📑', title: 'Verification & Validation Report',  group: 'Regulatory' },
  { id: 'riskcontrib',      icon: '⚠️', title: 'Risk Assessment (ISO 14971)',       group: 'Regulatory' },
  { id: 'dhf',              icon: '🗂️', title: 'Design History File (DHF)',         group: 'Regulatory' },
  { id: 'sat',              icon: '🏥', title: 'Site Acceptance Testing',           group: 'Regulatory' },
  { id: 'usability',        icon: '👁️', title: 'Usability Testing (IEC 62366)',    group: 'Regulatory' },
  { id: 'pccp',             icon: '🔁', title: 'PCCP',                              group: 'Regulatory' },
];

let currentSlide = 'overview';

// ─── NAVIGATION ────────────────────────────────────────────────────────────
function buildNav() {
  const groups = ['', 'Standards', 'Foundation', 'Operational', 'Regulatory'];
  let html = '';

  groups.forEach(group => {
    const groupSlides = SLIDES.filter(s => s.group === group);
    if (!groupSlides.length) return;

    if (group) {
      html += `<li><div class="group-label">${group}</div></li>`;
    }

    groupSlides.forEach(s => {
      const num = SLIDES.indexOf(s) + 1;
      html += `
        <li>
          <a href="#" class="${s.id === currentSlide ? 'active' : ''}"
             onclick="showSlide('${s.id}');return false;">
            <span class="nav-num">${num}</span>
            <span>${s.title}</span>
          </a>
        </li>`;
    });
  });

  document.getElementById('nav-list').innerHTML = html;
}

function showSlide(id) {
  currentSlide = id;
  buildNav();
  history.replaceState(null, '', '#' + id);

  const idx   = SLIDES.findIndex(s => s.id === id);
  const slide = SLIDES[idx];
  const total = SLIDES.length;
  const pct   = Math.round(((idx + 1) / total) * 100);

  const prev = idx > 0       ? SLIDES[idx - 1] : null;
  const next = idx < total-1 ? SLIDES[idx + 1] : null;

  const badge = slide.group
    ? `<span class="slide-group-badge badge-${slide.group.toLowerCase()}">${slide.group}</span>`
    : '';

  let content;
  if (id === 'overview')          content = renderOverview();
  else if (id === 'std-overview') content = renderStandardOverview();
  else if (id.startsWith('std-')) content = renderStandard(id);
  else                            content = renderBlankSlide();

  document.getElementById('main').innerHTML = `
    <div class="slide-progress">
      <div class="slide-progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="slide-topbar">
      <div class="slide-counter">Slide ${idx + 1} of ${total}</div>
      <div class="slide-nav-btns">
        ${prev ? `<button class="slide-btn" onclick="showSlide('${prev.id}')">← Prev</button>` : ''}
        ${next ? `<button class="slide-btn" onclick="showSlide('${next.id}')">Next →</button>` : ''}
      </div>
    </div>
    <div class="slide-card">
      <div class="slide-icon">${slide.icon}</div>
      <h1 class="slide-title">${slide.title}</h1>
      ${badge}
      <div class="slide-divider"></div>
      <div class="slide-body">${content}</div>
    </div>`;
}

function renderOverview() {
  const groups = ['Standards', 'Foundation', 'Operational', 'Regulatory'];
  let html = `<p class="overview-intro">QA-фреймворк для CoPilotMD NV-Sight — от стандартов FDA до готового пакета документов для submission. Нажмите на любой раздел чтобы перейти.</p>`;

  groups.forEach(group => {
    const groupSlides = SLIDES.filter(s => s.group === group);
    html += `
      <div class="doc-group-section">
        <div class="doc-group-title ${group.toLowerCase()}">${group}</div>
        <div class="doc-chips">
          ${groupSlides.map(s =>
            `<div class="doc-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</div>`
          ).join('')}
        </div>
      </div>`;
  });

  return html;
}

function renderBlankSlide() {
  return `<p class="slide-placeholder">— content coming soon —</p>`;
}

// ─── STANDARDS RENDER ──────────────────────────────────────────────────────
const TYPE_LABELS = {
  law:        'Закон FDA',
  standard:   'Consensus Standard',
  guidance:   'FDA Guidance',
  operational:'Операционный',
};

function renderStandardOverview() {
  const rows = STD_SLIDES_META.slice(1).map(s => {
    const d = STANDARDS_DATA[s.id];
    if (!d) return '';
    return `
      <div class="std-overview-card" onclick="showSlide('${s.id}')">
        <div class="std-overview-icon">${s.icon}</div>
        <div class="std-overview-body">
          <div class="std-overview-title">${s.title}</div>
          <div class="std-overview-sub">${d.subtitle}</div>
          <span class="std-type-badge tc-${d.typeClass}">${d.type}</span>
        </div>
      </div>`;
  }).join('');

  return `
    <p class="overview-intro" style="margin-bottom:20px">Стандарты и требования, которые нужно учитывать при создании QA-процессов и документации для FDA submission в США.</p>
    <div class="std-overview-grid">${rows}</div>`;
}

function renderStandard(id) {
  const d = STANDARDS_DATA[id];
  if (!d) return `<p class="slide-placeholder">Данные не найдены</p>`;

  const docChip = (docId) => {
    const s = SLIDES.find(sl => sl.id === docId);
    return s ? `<span class="std-doc-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</span>` : '';
  };

  const refChip = (refId) => {
    const s = SLIDES.find(sl => sl.id === refId);
    return s ? `<span class="std-ref-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</span>` : '';
  };

  return `
    <span class="std-type-badge tc-${d.typeClass}">${d.type}</span>
    <p class="std-what">${d.what}</p>

    <div class="std-section-title">Ключевые требования к QA</div>
    <div class="std-reqs">
      ${d.reqs.map(r => `
        <div class="std-req-item">
          <div class="std-req-h">${r.h}</div>
          <div class="std-req-d">${r.d}</div>
        </div>`).join('')}
    </div>

    <div class="std-two-col">
      <div>
        <div class="std-section-title">Влияет на документы</div>
        <div class="std-chip-row">${d.docs.map(docChip).join('')}</div>
      </div>
      <div>
        <div class="std-section-title">Пересечения со стандартами</div>
        <div class="std-chip-row">${d.refs.map(refChip).join('')}</div>
      </div>
    </div>

    <div class="std-pitfall-block">
      <div class="std-section-title">⚠️ Подводные камни</div>
      <ul class="std-pitfall-list">
        ${d.pitfalls.map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>`;
}

// ─── KEYBOARD NAVIGATION ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!checkAuth()) return;
  // Don't intercept keys when typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const idx = SLIDES.findIndex(s => s.id === currentSlide);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    if (idx < SLIDES.length - 1) showSlide(SLIDES[idx + 1].id);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (idx > 0) showSlide(SLIDES[idx - 1].id);
  }
});

// ─── INIT ──────────────────────────────────────────────────────────────────
(function init() {
  if (checkAuth()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-layout').style.display  = 'flex';
    const startSlide = location.hash.slice(1);
    const valid = SLIDES.find(s => s.id === startSlide);
    showSlide(valid ? startSlide : 'overview');
  } else {
    document.getElementById('login-user').focus();
  }
})();
