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
    what: 'Американский закон для производителей медустройств. Раздел 820.30 (Design Controls) - ключевой для QA: требует документировать все этапы от требований до верификации и валидации. В 2024 году приведён в соответствие с ISO 13485.',
    reqs: [
      { h: 'Design Controls (820.30)', d: 'Весь цикл разработки документируется - требования, архитектура, верификация, валидация. Без этого submission невозможен.' },
      { h: 'Document Control (820.40)', d: 'Версионирование, approval и контроль всей документации. Каждая версия документа должна быть прослеживаема.' },
      { h: 'CAPA (820.100)', d: 'Corrective and Preventive Action для каждого дефекта и несоответствия. Root cause + действия + подтверждение закрытия.' },
      { h: 'Complaint Files (820.198)', d: 'Фиксация и анализ жалоб и adverse events. Для клинического AI это включает feedback от врачей из пилота.' },
      { h: 'V&V Records', d: 'Результаты каждого теста хранятся как часть Design History File. Не "тест прошёл", а подписанный отчёт.' },
    ],
    docs: ['teststrategy', 'traceability', 'vnvreport', 'dhf', 'qualityreport'],
    pitfalls: [
      'Многие воспринимают 820 как список документов, которые нужно подготовить перед подачей. FDA смотрит иначе - они хотят видеть живую систему: как принимались решения, почему тестировалось именно это, кто и когда что подписал. Наличие документа без реального процесса за ним - красный флаг на аудите.',
      'Самая частая причина замечаний - нет прослеживаемости между требованием, тест-кейсом и результатом теста. Нельзя просто сказать "мы тестировали функцию X". Нужно показать: вот требование, вот тест-кейс под него, вот результат выполнения. Без этой цепочки submission уязвим.',
      'Разработчики регулярно делают небольшие правки алгоритма не думая о документировании. По 820 любое изменение в design - даже минорное - должно пройти через change control с оценкой влияния на верификацию и валидацию. Это дисциплина которую нужно выстраивать с самого начала, потому что восстановить историю изменений задним числом очень сложно.',
    ],
    refs: ['std-13485', 'std-62304'],
  },
  'std-62304': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Medical Device Software Lifecycle Processes',
    what: 'Международный стандарт жизненного цикла ПО медустройств. FDA признаёт как consensus standard. Определяет классификацию ПО по уровням риска и требования к документации на каждом уровне.',
    reqs: [
      { h: 'Классификация: Class C (почти точно NV-Sight)', d: 'Ошибка AI при детекции окклюзии во время процедуры = серьёзный вред пациенту. Class C - наивысший уровень, полная документация обязательна.' },
      { h: 'Software Development Plan', d: 'Как организована разработка и тестирование - документируется до начала работ.' },
      { h: 'Unit + Integration + System Tests', d: 'Планы и отчёты по каждому уровню тестирования. Все результаты хранятся, не только итоговый вывод.' },
      { h: 'Anomaly Records', d: 'Каждый обнаруженный дефект документируется - статус, root cause, resolution. Без этого submission не пройдёт.' },
      { h: 'Full Traceability', d: 'Требования → архитектура → тест-кейсы → результаты - связь на всех уровнях.' },
    ],
    docs: ['teststrategy', 'testplans', 'testcases', 'defectworkflow', 'traceability', 'vnvreport'],
    pitfalls: [
      'Когда команда видит какой объём документации требует Class C, возникает соблазн обосновать Class B. Проблема в том что FDA при review смотрит на реальный сценарий использования. Для NV-Sight: ошибка детекции во время активной stroke-процедуры - это potential serious harm. Если FDA не согласится с классификацией, придётся переделывать всю документацию.',
      'Unit-тесты часто воспринимаются как внутренняя практика разработки, не требующая формального документирования. По IEC 62304 для Class C это не так - нужны не просто тесты, а задокументированные планы и отчёты на каждом уровне: unit, integration, system. Это нужно планировать заранее, а не восстанавливать задним числом.',
      'Закрыть дефект в Jira с комментарием "fixed" - недостаточно. Для каждого значимого дефекта нужен root cause analysis: что именно сломалось, почему это произошло, что сделано чтобы не повторилось. Без этого defect record не проходит аудит.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-14971': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Risk Management for Medical Devices',
    what: 'Стандарт управления рисками. FDA признаёт. QA не ведёт risk file самостоятельно - это зона engineering team. Но QA обеспечивает доказательства: тест-результаты подтверждающие что mitigation работает.',
    reqs: [
      { h: 'Risk Framework', d: 'Hazard → Hazardous Situation → Harm. Для каждого: Severity × Probability = Risk Level → приемлем или требует mitigation.' },
      { h: 'Risk Controls', d: 'Mitigation меры для неприемлемых рисков. QA тестирует что они работают - это и есть QA contribution в risk file.' },
      { h: 'Residual Risk', d: 'После mitigation - документируется остаточный риск и принимается решение о приемлемости.' },
      { h: 'QA Contribution', d: 'Failure modes найденные в тестировании → в risk file. Тест-отчёты = evidence для risk controls.' },
    ],
    docs: ['testcases', 'vnvreport', 'riskcontrib', 'traceability'],
    pitfalls: [
      'QA команды часто думают что risk management - это задача инженеров или product owner, а QA только тестирует по готовым тест-кейсам. На самом деле risk file без QA evidence неполный: каждый risk control должен иметь тест-доказательство что он работает. Если QA не предоставляет эти данные - submission неполный.',
      'Когда в тестировании находится новый failure mode которого не было в risk analysis - это не просто баг, это потенциально новый hazard. Его нужно добавить в risk file, оценить severity и probability, определить mitigation. Если этого не делать, risk file постепенно устаревает и перестаёт отражать реальную картину.',
      'В hazard analysis описаны конкретные опасные сценарии: ложно-отрицательная детекция при определённом типе изображения, например. Именно эти сценарии и нужно тестировать в первую очередь. Если тест-кейсы не связаны с hazard analysis - часть реальных рисков остаётся непроверенной.',
      'Для AI/ML продуктов failure modes вероятностные, не детерминированные. Классическое "запустил тест - получил pass/fail" здесь недостаточно. Нужны статистические подходы: на каком объёме данных тестировали, какой доверительный интервал у метрик, как обеспечивали representative sample.',
    ],
    refs: ['std-62304', 'std-62366', 'std-820'],
  },
  'std-62366': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Usability Engineering for Medical Devices',
    what: 'Стандарт usability engineering. FDA признаёт. Цель: убедиться что пользователь не причинит вред через use error - не просто что интерфейс удобен.',
    reqs: [
      { h: 'Formative Testing', d: 'В процессе разработки - итерационная проверка UI. Выявление usability hazards на ранних стадиях.' },
      { h: 'Summative Testing', d: 'Финальная валидация с реальными пользователями (врачами). Обязательна для submission - симуляция не засчитывается.' },
      { h: 'Use Specification', d: 'Кто пользователь, в каких условиях работает, какие критические задачи выполняет.' },
      { h: 'Usability Hazards → Risk File', d: 'Каждый выявленный usability hazard идёт в ISO 14971 risk file с оценкой severity.' },
    ],
    docs: ['usability', 'riskcontrib', 'vnvreport'],
    pitfalls: [
      'IEC 62366 про безопасность, не про удобство. Вопрос не "удобно ли врачу работать с интерфейсом", а "может ли врач совершить use error который приведёт к вреду пациенту". Это другой тип тестирования с другими сценариями - сфокусированными на critical tasks и потенциально опасных ошибках.',
      'Formative testing - это итерационная работа в процессе разработки, summative - финальная валидация перед submission. Часто formative делают, а summative откладывают или пропускают. FDA не примет submission только с formative результатами - summative обязателен.',
      'Врачи должны участвовать в summative testing лично. Нельзя заменить их другими пользователями или симуляцией. Это организационный вызов - нужно привлечь реальных специалистов, согласовать время, провести сессии. Чем раньше это планировать, тем лучше.',
      'Для NV-Sight это особенно важно: врач интерпретирует AI output во время активной intraoperative процедуры, под временным давлением, с высокой когнитивной нагрузкой. Тест-сценарии usability должны моделировать именно эти условия, а не спокойное изучение интерфейса в офисе.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-13485': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Quality Management Systems for Medical Devices',
    what: 'QMS стандарт для медустройств. После обновления 21 CFR Part 820 в 2024 году практически идентичен по структуре. Сертификация по ISO 13485 упрощает выход на международные рынки в будущем.',
    reqs: [
      { h: 'Документированные процедуры', d: 'Все quality activities имеют задокументированные процедуры - не просто делаются, а описаны как делаются.' },
      { h: 'Internal Audits', d: 'Планируются и документируются - проверка что QMS реально применяется, а не существует на бумаге.' },
      { h: 'CAPA', d: 'Для любых несоответствий - с root cause analysis и evidence закрытия.' },
      { h: 'Management Review', d: 'QA метрики регулярно докладываются руководству. Quality Report - основной инструмент для этого.' },
    ],
    docs: ['teststrategy', 'metrics', 'qualityreport', 'defectworkflow'],
    pitfalls: [
      'Сертификация ISO 13485 это хорошо, но сама по себе не означает что QMS работает. При recertification аудите проверяют реальные примеры: покажите CAPA который открывали в последнем квартале, покажите результаты internal audit, покажите management review записи. Если система только на бумаге - это выявится.',
      'CAPA - это не просто "нашли проблему, починили". Нужен root cause analysis, план действий, сроки, ответственные, и главное - evidence что проблема действительно устранена и не повторится. Без всего этого CAPA формально не закрыт и аудитор его не засчитает.',
    ],
    refs: ['std-820', 'std-62304'],
  },
  'std-samd': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Software as a Medical Device - Clinical Evaluation',
    what: 'FDA guidance по клинической оценке SaMD. Не закон, но FDA следует этому при review - игнорировать нельзя. Определяет что именно нужно доказать клиническими данными.',
    reqs: [
      { h: 'Analytical Performance', d: 'Как работает модель технически - accuracy, sensitivity, specificity, recall, precision на тестовом датасете.' },
      { h: 'Clinical Performance', d: 'Как AI влияет на клинические решения врача. Аналитического одного недостаточно - нужно показать clinical benefit.' },
      { h: 'Independent Test Set', d: 'Валидационный датасет не должен участвовать в обучении. Mount Sinai + St. Vincent - именно independent validation sets.' },
      { h: 'Subgroup Analysis', d: 'Производительность на подгруппах: демография, типы патологии, тип оборудования.' },
    ],
    docs: ['vnvreport', 'testcases', 'testplans'],
    pitfalls: [
      'Команды часто показывают accuracy модели на том же датасете на котором её обучали или валидировали. FDA такой результат не засчитает - нужен independent test set, данные из которого модель не видела ни разу в процессе обучения. Для NV-Sight это данные из Mount Sinai и St. Vincent, которые должны быть строго изолированы от обучения с самого начала.',
      'Хорошая accuracy в среднем по датасету не означает что модель одинаково хорошо работает для всех пациентов. FDA будет смотреть на subgroup analysis: как модель работает для разных возрастных групп, типов патологии, оборудования. Если subgroup performance не проверялась - это пробел который обнаружится при review.',
      'Аналитическая производительность (технические метрики модели) - это только часть картины. FDA хочет видеть clinical performance: как наличие AI ассистента влияет на решения врача и исходы для пациента. Без этого компонента clinical evaluation считается неполной.',
    ],
    refs: ['std-aiml', 'std-14971'],
  },
  'std-aiml': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'AI/ML-Based Software as a Medical Device - Action Plan',
    what: 'FDA guidance специфично для AI/ML устройств. Определяет как FDA смотрит на AI: разработка, тестирование и жизненный цикл модели после выхода на рынок.',
    reqs: [
      { h: 'Good Machine Learning Practice (GMLP)', d: 'Стандарты разработки модели - качество данных, воспроизводимость, оценка производительности.' },
      { h: 'Bias & Generalizability', d: 'Модель работает на разных популяциях - демография, оборудование, клиники. Проверяется тестированием.' },
      { h: 'Real-World Performance Monitoring', d: 'После deployment - план мониторинга производительности и триггеры для re-evaluation.' },
      { h: 'Transparency', d: 'Что делает модель, как интерпретировать output, где границы применимости - документируется.' },
    ],
    docs: ['vnvreport', 'testplans', 'testcases', 'pccp'],
    pitfalls: [
      'Если тестировать только на основной популяции из Sheba - это не покрывает все требования FDA. Нужно показать что модель работает корректно на разных подгруппах: разная демография, разные типы сосудистых аномалий, разное оборудование. Bias в одной подгруппе может стать причиной отклонения submission.',
      'FDA AI/ML Action Plan явно требует план реального мониторинга производительности после deployment. Это значит: определить метрики для мониторинга, частоту проверки, пороговые значения, действия при деградации. Без этого плана submission неполон - нельзя просто выпустить продукт и не следить за ним.',
      'AI модель - это black box с точки зрения традиционного тестирования. FDA требует документировать known failure modes: при каких условиях модель работает хуже, какие типы входных данных дают ненадёжные результаты, какие есть ограничения применимости. Это честность перед регулятором и врачом.',
    ],
    refs: ['std-samd', 'std-pccp', 'std-62366'],
  },
  'std-pccp': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Predetermined Change Control Plan',
    what: 'Обязателен если AI модель будет обновляться после market clearance. Включается в original submission. Без PCCP - каждое обновление модели = новый 510(k) = год+ ожидания перед каждым улучшением.',
    reqs: [
      { h: 'Pre-approved Changes', d: 'Какие изменения разрешены без нового submission: retrain на большем датасете, threshold adjustments и т.п.' },
      { h: 'Performance Metrics & Triggers', d: 'При каком падении метрик требуется re-submission или дополнительный review.' },
      { h: 'Change Methodology', d: 'Как оцениваются изменения - тест-протокол, датасет, критерии приёмки.' },
      { h: 'Scope Definition', d: 'Чёткие границы что входит и не входит в PCCP - FDA будет проверять соответствие при каждом изменении.' },
    ],
    docs: ['pccp', 'vnvreport', 'testplans'],
    pitfalls: [
      'PCCP должен быть частью original submission - это не документ который можно добавить позже. Если планируете обновлять AI модель после выхода (а планируете - иначе зачем данные из новых клиник), PCCP нужно писать одновременно с основным submission пакетом, не после.',
      'Слишком широкий PCCP - например "мы можем менять модель если performance не ухудшается" - FDA при review ограничит: потребует конкретные метрики, конкретные пороги, конкретные протоколы оценки. Чем расплывчатее написан PCCP, тем больше правок потребует review.',
      'Слишком узкий PCCP оставит команду без возможности обновлять модель в ответ на новые данные без нового 510(k). Каждый новый 510(k) - это как минимум несколько месяцев ожидания. Баланс между широким и узким PCCP - это ключевой архитектурный вопрос.',
      'NV-Sight будет накапливать данные из Mount Sinai и St. Vincent. Почти наверняка модель захочется переобучить на более богатом датасете. PCCP нужно писать уже сейчас с прицелом на эти сценарии - иначе окажется что такое изменение требует нового submission.',
    ],
    refs: ['std-aiml', 'std-62304'],
  },
  'std-cyber': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Cybersecurity in Medical Devices (2023)',
    what: 'С 2023 года обязательно включать в premarket submission. Кибербезопасность рассматривается как patient safety issue, а не IT задача. Client-server архитектура NV-Sight = расширенная attack surface.',
    reqs: [
      { h: 'Threat Modeling', d: 'STRIDE или аналог - документировать угрозы и mitigations для каждой точки входа: PACS, сеть больницы, клиентский ноутбук.' },
      { h: 'SBOM', d: 'Software Bill of Materials - полный список всех компонентов включая open source зависимости.' },
      { h: 'Cybersecurity Testing', d: 'Penetration testing, vulnerability scanning - результаты входят в submission.' },
      { h: 'Post-Market Monitoring', d: 'План реагирования на уязвимости и patch management process после выхода.' },
    ],
    docs: ['teststrategy', 'testplans', 'vnvreport', 'dhf'],
    pitfalls: [
      'Кибербезопасность медустройств - это ответственность производителя устройства, а не IT-отдела. FDA требует включить результаты cybersecurity testing в premarket submission. Это значит что QA должен планировать и документировать security testing наравне с функциональным - это часть V&V, а не отдельная история.',
      'SBOM (Software Bill of Materials) - это полный список всего ПО в продукте, включая все open source зависимости и их версии. Команды часто не имеют актуального SBOM потому что зависимости меняются в процессе разработки. Без SBOM submission неполон, а при появлении уязвимости непонятно даже затронут ли ею продукт.',
      'Client-server архитектура NV-Sight означает несколько точек соединения: ноутбук - сервер, сервер - PACS, PACS - ангиограф. Каждое из этих соединений - потенциальный attack vector. Threat modeling должен охватить все точки, а не только клиентскую часть.',
      'FDA требует не просто хорошую security при выходе, но и задокументированный план на случай когда после выхода обнаружат уязвимость. Нужен процесс: как мониторим vulnerabilities в зависимостях, как быстро выпускаем патч, как уведомляем клинические сайты.',
    ],
    refs: ['std-62304', 'std-hipaa'],
  },
  'std-hipaa': {
    type: 'Операционный (Закон)', typeClass: 'operational',
    subtitle: 'Health Insurance Portability and Accountability Act',
    what: 'Закон США о защите данных пациентов (PHI - Protected Health Information). Напрямую влияет на работу QA с тестовыми данными из клиник. Нарушение - крупные штрафы.',
    reqs: [
      { h: 'De-identification (Safe Harbor)', d: 'Удалить 18 идентификаторов из данных пациента. Только после этого можно использовать для тестирования без Business Associate Agreement.' },
      { h: 'Business Associate Agreement (BAA)', d: 'Если QA-команда работает с реальными PHI данными из клиник - нужен BAA с каждой клиникой.' },
      { h: 'Data Handling', d: 'PHI нельзя хранить на личных устройствах или незащищённых системах. Влияет на организацию тест-окружения.' },
    ],
    docs: ['testplans', 'testcases', 'sat'],
    pitfalls: [
      'Убрать имя пациента из файла - это не деидентификация. DICOM файлы содержат десятки тегов с PHI: дата рождения, дата процедуры, ID исследования, ID врача, ID аппарата, институция и многое другое. HIPAA Safe Harbor требует удалить конкретный список из 18 идентификаторов - и это нужно делать инструментом, а не вручную, потому что некоторые теги неочевидны и легко пропустить.',
      'Когда команда берёт данные из Sheba для тестирования, кажется что это внутренний процесс и никаких проблем нет. Но если QA-инженер работает вне Израиля, или данные копируются на устройство без надлежащей защиты, или нет подписанного BAA между CoPilotMD и клиникой - это уже нарушение. Нужно либо работать только с деидентифицированными данными, либо иметь оформленный BAA и понимать какие системы хранения PHI разрешены.',
      'Тестовые данные это не только production данные которые скопировали. Это ещё синтетические данные, данные из открытых датасетов, mock-данные. Для каждой категории свои правила: синтетические можно хранить без ограничений, реальные PHI - только в защищённой среде с контролем доступа. Отсутствие формального процесса что именно как хранится и кто имеет доступ - это нарушение которое аудит HIPAA обнаруживает первым делом.',
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
      { h: 'Transfer Syntax', d: 'Форматы сжатия изображений - pipeline должен корректно обрабатывать все варианты которые генерируют Siemens аппараты.' },
      { h: 'DICOM over Network (DIMSE)', d: 'Передача через PACS - задержки при передаче через сеть больницы учитываются в performance тест-сценариях.' },
    ],
    docs: ['testplans', 'testcases', 'testmatrix', 'sat'],
    pitfalls: [
      'В разработке обычно тестируют на нескольких "хороших" DICOM файлах которые корректно открываются и красиво выглядят. В реальной клинике приходят файлы с битыми тегами, нестандартными значениями, редкими transfer syntax, артефактами сжатия от конкретного поколения аппарата. Если pipeline не обрабатывает такие случаи, он упадёт именно в момент реальной процедуры. Тест-матрица должна включать edge cases форматов, а не только happy path.',
      'NV-Sight работает intraoperative - то есть AI даёт результат пока процедура идёт. Задержка в несколько секунд в тестовой среде где PACS рядом и сеть быстрая - это не показатель. Реальная задержка складывается из: передача от ангиографа до PACS, с PACS на сервер NV-Sight, обработка моделью, обратно на клиентский ноутбук. Всё это через больничную сеть которая может быть загружена. Нужно тестировать performance именно в условиях близких к реальным, иначе на первом же клиническом сайте будет сюрприз.',
      'DICOM файл с удалённым именем пациента - это не деидентифицированный DICOM файл. Внутри DICOM структуры несколько сотен потенциальных тегов, из которых десятки содержат PHI: PatientBirthDate, InstitutionName, PerformingPhysicianName, StationName, DeviceSerialNumber и другие. Для тестирования нужен специальный инструмент деидентификации который обрабатывает все теги по списку, а не ручное удаление очевидных полей.',
      'Siemens выпускает разные серии ангиографов и каждая генерирует DICOM немного по-разному: разные значения в служебных тегах, разные варианты сжатия, иногда vendor-specific расширения протокола. Команда ориентируется на конкретный набор аппаратов в Sheba - это хорошо. Но тест-матрица должна покрывать все типы которые планируются к использованию, потому что pipeline который работает на одной серии может падать на другой.',
    ],
    refs: ['std-hipaa', 'std-cyber'],
  },
};

// ─── STANDARDS CROSS-REFERENCES ───────────────────────────────────────────
// rel types: 'Общее' | 'Дополнение' | 'Взаимозависимость'
const STANDARDS_REFS = {
  'std-820': [
    { id: 'std-13485', rel: 'Общее',
      note: 'После 2024 обновления 820 и 13485 структурно совпадают - выполняя одно, закрываешь большинство требований второго. Различие: 13485 международный, 820 только для США.' },
    { id: 'std-62304', rel: 'Дополнение',
      note: '820 задаёт общие Design Controls для любого медустройства, 62304 конкретизирует их применительно к ПО - что именно документировать на каждом этапе разработки.' },
  ],
  'std-62304': [
    { id: 'std-14971', rel: 'Взаимозависимость',
      note: 'Уровень риска из 14971 определяет Software Class в 62304 (A/B/C). Без risk assessment нельзя правильно классифицировать ПО - объём документации вытекает из этой связи.' },
    { id: 'std-820', rel: 'Дополнение',
      note: '820 требует Design Controls в общем виде, 62304 описывает конкретные шаги для ПО внутри этих controls.' },
  ],
  'std-14971': [
    { id: 'std-62304', rel: 'Взаимозависимость',
      note: 'Класс ПО (62304) вытекает из оценки риска (14971). Замкнутый цикл: риск → software class → объём документации и тестирования.' },
    { id: 'std-62366', rel: 'Дополнение',
      note: '62366 выявляет usability hazards, которые как input идут в risk file (14971). Два независимых источника рисков: технические и пользовательские - оба обязательны.' },
    { id: 'std-820', rel: 'Общее',
      note: 'Оба требуют документировать risk mitigation и доказательства что controls работают. 14971 детализирует risk framework, 820 требует итоговый результат.' },
  ],
  'std-62366': [
    { id: 'std-14971', rel: 'Дополнение',
      note: '62366 находит usability hazards, 14971 принимает их как input и оценивает риск. Однонаправленная связь: 62366 поставляет данные, 14971 управляет ими.' },
    { id: 'std-820', rel: 'Дополнение',
      note: '820.30(g) требует design validation - 62366 описывает как именно проводить usability validation для медустройств с UI.' },
  ],
  'std-13485': [
    { id: 'std-820', rel: 'Общее',
      note: 'Структурно практически идентичны после 2024. Единственное практическое отличие: 13485 международный, 820 только для США. При глобальном выходе нужны оба.' },
    { id: 'std-62304', rel: 'Дополнение',
      note: '13485 описывает QMS в целом, 62304 детализирует требования к software lifecycle внутри этой системы.' },
  ],
  'std-samd': [
    { id: 'std-aiml', rel: 'Дополнение',
      note: 'SaMD guidance - базовый framework clinical evaluation для любого SaMD. AI/ML Action Plan - надстройка с требованиями специфичными именно для AI модели. Читать оба вместе.' },
    { id: 'std-14971', rel: 'Дополнение',
      note: 'Clinical performance data из SaMD guidance используется как evidence в risk file. Недостаточная производительность модели = risk, должен быть задокументирован и mitigated.' },
  ],
  'std-aiml': [
    { id: 'std-samd', rel: 'Дополнение',
      note: 'SaMD guidance - основа, AI/ML Action Plan - расширение для AI-специфичных требований. Неотделимы при работе с AI medical device.' },
    { id: 'std-pccp', rel: 'Взаимозависимость',
      note: 'AI/ML Action Plan вводит концепцию PCCP и объясняет зачем он нужен. PCCP guidance описывает как его составить. Концепция + реализация.' },
    { id: 'std-62366', rel: 'Дополнение',
      note: 'AI/ML требует прозрачное взаимодействие врача с AI output. 62366 описывает как проверить это через usability testing - в т.ч. интерпретацию вывода под временным давлением.' },
  ],
  'std-pccp': [
    { id: 'std-aiml', rel: 'Взаимозависимость',
      note: 'AI/ML Action Plan вводит требование PCCP, PCCP guidance даёт детальный формат. Неотделимы: без контекста AI/ML непонятно зачем PCCP, без PCCP guidance непонятно как его писать.' },
    { id: 'std-62304', rel: 'Дополнение',
      note: 'Каждое изменение из PCCP должно следовать change management процессу 62304. PCCP определяет ЧТО и при каких условиях меняем, 62304 - КАК документируем это изменение.' },
  ],
  'std-cyber': [
    { id: 'std-62304', rel: 'Дополнение',
      note: '62304 требует документировать software components (основа для SBOM) и change management (для security patches). Cybersecurity - часть software lifecycle, а не отдельная дисциплина.' },
    { id: 'std-hipaa', rel: 'Дополнение',
      note: 'Оба про защиту данных пациента, но с разных сторон: HIPAA - privacy, Cybersecurity - security системы. Нарушение security (взлом, утечка) автоматически становится HIPAA violation.' },
  ],
  'std-hipaa': [
    { id: 'std-dicom', rel: 'Взаимозависимость',
      note: 'PHI теги встроены прямо в DICOM файлы. Деидентификация по HIPAA невозможна без точного знания какие именно DICOM теги содержат PHI и как их удалять.' },
    { id: 'std-cyber', rel: 'Дополнение',
      note: 'HIPAA защищает PHI со стороны privacy, Cybersecurity - со стороны security. Нарушение Cybersecurity (взлом системы) автоматически становится нарушением HIPAA.' },
  ],
  'std-dicom': [
    { id: 'std-hipaa', rel: 'Взаимозависимость',
      note: 'PHI теги встроены в DICOM структуру. Корректная деидентификация по HIPAA требует детального знания DICOM - без этого невозможно гарантировать что все идентификаторы удалены.' },
    { id: 'std-cyber', rel: 'Дополнение',
      note: 'DICOM over network (DIMSE protocol) - это attack surface. FDA Cybersecurity требует threat modeling для всех сетевых протоколов, включая DICOM-соединение между аппаратом и PACS.' },
  ],
};

const STD_SLIDES_META = [
  { id: 'std-overview', icon: '📜', title: 'Standards Overview' },
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
  // Reference
  { id: 'glossary',         icon: '📖', title: 'Abbreviations',                     group: 'Reference' },
];

let currentSlide = 'overview';

// ─── COLLAPSED GROUPS (persisted in sessionStorage) ────────────────────────
const COLLAPSED_KEY = 'nvsight_collapsed';

function loadCollapsed() {
  try { return new Set(JSON.parse(sessionStorage.getItem(COLLAPSED_KEY)) || []); }
  catch { return new Set(); }
}

function saveCollapsed(set) {
  sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...set]));
}

const collapsedGroups = loadCollapsed();

function toggleGroup(group) {
  if (collapsedGroups.has(group)) {
    collapsedGroups.delete(group);
  } else {
    collapsedGroups.add(group);
  }
  saveCollapsed(collapsedGroups);
  buildNav();
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────
function buildNav() {
  const groups = ['', 'Standards', 'Foundation', 'Operational', 'Regulatory', 'Reference'];
  let html = '';

  groups.forEach(group => {
    const groupSlides = SLIDES.filter(s => s.group === group);
    if (!groupSlides.length) return;

    if (group) {
      const collapsed = collapsedGroups.has(group);
      html += `
        <li>
          <div class="group-label group-label-btn" onclick="toggleGroup('${group}')">
            <span>${group}</span>
            <span class="group-arrow${collapsed ? ' group-arrow-collapsed' : ''}">▾</span>
          </div>
        </li>`;
      if (collapsed) return;
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
  if (id === 'overview')            content = renderOverview();
  else if (id === 'std-overview')   content = renderStandardOverview();
  else if (id.startsWith('std-'))   content = renderStandard(id);
  else if (id === 'teststrategy')   content = renderTestStrategy();
  else if (id === 'testmatrix')     content = renderTestMatrix();
  else if (id === 'glossary')       content = renderGlossary();
  else                              content = renderBlankSlide();

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

const overviewCollapsed = new Set();

function toggleOverviewGroup(group) {
  if (overviewCollapsed.has(group)) {
    overviewCollapsed.delete(group);
  } else {
    overviewCollapsed.add(group);
  }
  const body = document.querySelector('.slide-body');
  if (body) body.innerHTML = renderOverview();
}

function renderOverview() {
  const groups = ['Standards', 'Foundation', 'Operational', 'Regulatory'];

  let html = `
    <div class="ov-scope-note">
      <div class="ov-scope-label">📌 QA Scope boundary</div>
      <p class="ov-scope-text">As agreed with the CTO at the initial interview: QA scope on this project does not include clinical validation of AI output. Determining whether a generated hint correctly reflects the underlying pathology is the responsibility of the clinical team at Sheba Medical - that is a separate validation process with different ownership, methods, and sign-off authority.</p>
      <p class="ov-scope-text" style="margin-top:10px">QA owns the layer between the algorithm and the physician: that every hint produced is delivered completely and rendered correctly; that the system never fails silently; that end-to-end latency stays within the clinical window; that the pipeline holds under real operating conditions.</p>
      <p class="ov-scope-text ov-scope-key" style="margin-top:12px"><strong>The clinical team owns the question "is this hint medically accurate?" QA owns the question "did this hint reach the physician's screen - fully delivered, correctly rendered, and conforming to the system's design specifications?"</strong></p>
    </div>
    <div class="ov-disclaimer">
      <p class="ov-disclaimer-text">One thing to flag upfront: the documents in this framework are built from QA engineering experience - how testing should be structured for a product like NV-Sight. They haven't been formally mapped to FDA premarket submission requirements yet, and haven't been audited against the applicable standards.</p>
      <p class="ov-disclaimer-text" style="margin-top:10px">That alignment work - cross-referencing each document against <a href="https://www.fda.gov/media/153781/download" target="_blank" class="ov-link">FDA's guidance on premarket software submissions (2023)</a> and the relevant standards (<a href="https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820" target="_blank" class="ov-link">21 CFR Part 820</a>, IEC 62304, <a href="https://www.iso.org/standard/59752.html" target="_blank" class="ov-link">ISO 13485</a>, ISO 14971, and others) - is part of the actual project work ahead. The goal here is to show a clear QA structure and process thinking, not to hand over a submission-ready package on day one.</p>
      <p class="ov-disclaimer-text" style="margin-top:10px">The overall structure is designed with QMS compliance as the target state. A Quality Manual - the top-level document that ties the whole system together under ISO 13485 / 21 CFR Part 820 - <strong>will be developed as the framework matures.</strong></p>
    </div>
    <div class="ov-update-note">
      <div class="ov-update-label">📌 Regulatory update</div>
      <p class="ov-update-text">In February 2024, FDA revised 21 CFR Part 820 and renamed it the <strong>Quality Management System Regulation (QMSR)</strong>. The key change: it now incorporates ISO 13485:2016 by reference (§820.7). In practice, comply with ISO 13485 and you comply with 21 CFR Part 820 - they're the same requirement. The QMSR took effect <strong>February 2, 2026</strong>, so it's mandatory right now.</p>
    </div>`;

  groups.forEach(group => {
    const groupSlides = SLIDES.filter(s => s.group === group);
    const collapsed = overviewCollapsed.has(group);
    html += `
      <div class="doc-group-section">
        <div class="doc-group-title ${group.toLowerCase()} doc-group-toggle" onclick="toggleOverviewGroup('${group}')">
          <span>${group}</span>
          <span class="ov-arrow${collapsed ? ' ov-arrow-collapsed' : ''}">▾</span>
        </div>
        ${collapsed ? '' : `
        <div class="doc-chips">
          ${groupSlides.map(s =>
            `<div class="doc-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</div>`
          ).join('')}
        </div>`}
      </div>`;
  });

  return html;
}

function renderBlankSlide() {
  return `<p class="slide-placeholder">- content coming soon -</p>`;
}

// ─── TEST STRATEGY ─────────────────────────────────────────────────────────
function renderTestStrategy() {
  const mustHave = [
    {
      title: 'Product Overview and Risk Context',
      what: 'Our goal here: establish the product context and risk tier so every testing decision that follows has a clear rationale behind it.',
      label: 'entry',
      nvsight: [
        'Intended use: assists interventional neuroradiologists by generating visual hints (overlays, markers) on angiographic frames - the physician interprets those hints, NV-Sight does not make clinical decisions',
        'Software class: Class C per IEC 62304 - system failure during an active procedure (crash, silent failure, hints not rendered) directly impacts the physician\'s situational awareness',
        'Operating environment: Siemens Artis angiography systems, hospital PACS via DICOM, Windows client application',
        'User population: interventional neuroradiologists and neurovascular surgeons, Sheba Medical Center (pilot site)',
        'Key hazards from QA perspective: pipeline fails silently during procedure (Critical), hints not rendered or misplaced on wrong frames (Serious), latency exceeding clinical threshold (Serious)',
      ],
    },
    {
      title: 'Test Scope',
      what: 'Our goal here: define the boundaries of what QA owns and what it does not - agreed with the team upfront, not figured out mid-sprint.',
      nvsight: [
        'In scope: hint rendering pipeline (completeness, correct placement, all defined hint types), PACS integration and DICOM frame ingestion, UI overlays and measurement display, session state, end-to-end latency, test data de-identification',
        'Out of scope: clinical accuracy of AI-generated hints (validated by the clinical team at Sheba - not QA), Siemens hardware firmware, hospital network infrastructure, third-party PACS systems not in the integration plan',
      ],
    },
    {
      title: 'Test Levels',
      what: 'Our goal here: define which testing levels apply to NV-Sight, what each covers, and who runs it - so ownership is clear before the project starts, not negotiated mid-sprint.',
      nvsight: [
        'Unit - owned by engineering, not QA. Covers hint rendering components, overlay positioning logic, DICOM tag parsing. QA reviews coverage reports and flags gaps.',
        'Integration - QA and engineering jointly. Validates the seams between components: PACS connectivity, DICOM series ingestion, Siemens API handshake, algorithm output handoff to the rendering pipeline.',
        'System - QA owns end-to-end. Intraoperative workflow simulation on de-identified Sheba case data, covering all defined hint types across real-world DICOM scenarios.',
        'UAT - QA organises and facilitates, physicians from Sheba execute. Validates the hint delivery experience from clinical hands: is everything displayed correctly, on time, and as specified. QA cannot run UAT alone.',
      ],
    },
    {
      title: 'Risk-Based Test Prioritization',
      what: 'IEC 62304 and ISO 14971 both require a risk-based approach to testing: effort is distributed proportionally to the consequence of failure, not spread equally across all features. To implement this, we use a P0-P3 priority scale. This is the single classification system that runs through everything - it determines the priority of test cases we write, the severity of bugs we log in Jira, how often each area is tested, and what blocks a release. The higher the risk, the deeper the coverage and the stricter the release gate.',
      nvsight: [
        'P0 - release blocker, no exceptions. If a P0 issue is open, the release does not go out. For NV-Sight: hints do not reach the screen, pipeline fails silently, system crashes mid-procedure - physician loses the tool during an active intervention.',
        'P1 - must be fixed before release, but does not stop work while the fix is in progress. For NV-Sight: hints arrive but with latency above the clinical threshold, PACS connection drops during a session.',
        'P2 - real problem, not clinically critical. Documented and fixed in planned order. For NV-Sight: hints overlap in a rare rendering scenario, an unusual Siemens DICOM format renders slightly off.',
        'P3 - system works correctly, but something could be better. Logged and fixed when there is capacity. For NV-Sight: incomplete logs, minor UI layout issues, non-critical display elements.',
        'This same P0-P3 scale applies consistently to test cases, Jira bug reports, regression run frequency, and release sign-off criteria - one language across QA, engineering, and product.',
      ],
    },
    {
      title: 'Entry and Exit Criteria',
      what: 'Our goal here: define the conditions for starting a test cycle and signing off a release. In general, criteria are calibrated to release cadence and scope - a hotfix follows a faster path than a full release, and a team with weekly deploys structures this differently than a team shipping quarterly. For NV-Sight, scope adjustments are possible but the bar itself does not move: a missed occlusion is equally dangerous whether it was introduced in a major update or a one-line patch.',
      nvsight: [
        'Entry: build passes CI, no open P0 bugs from previous cycle, de-identified DICOM test dataset available, test environment stable and documented',
        'Exit (full release): 100% of P0 and P1 test cases passed, traceability matrix updated, full regression suite green, QA sign-off documented',
        'Exit (hotfix): targeted regression on the affected area + full P0 suite - scope is narrower, the bar is the same',
        'No release gate override under any circumstance, regardless of business pressure or timeline',
      ],
    },
    {
      title: 'Defect Management',
      what: 'Our goal here: define how bugs are classified, who escalates what, and what the resolution standard looks like for each severity level.',
      nvsight: [
        'Severity 1 (pipeline crash, silent failure, complete hint rendering loss during procedure) - immediate escalation, no release gate override',
        'Severity 2 (hint rendering incorrect or incomplete: wrong overlay, missing hint type, hint on wrong frame) - resolved before release',
        'Severity 3-4 - risk-accepted with product sign-off',
        'All defects in Jira with mandatory fields: steps to reproduce, affected build, DICOM sequence or frame reference',
        'Clinical accuracy of AI output is not a QA severity category - that is clinical validation, tracked separately by the Sheba team',
      ],
    },
    {
      title: 'Test Environment',
      what: 'Our goal here: define the infrastructure needed to run tests in conditions that reflect real deployment as closely as possible.',
      nvsight: [
        'Dedicated QA environment with Siemens angiography simulator or de-identified DICOM datasets from Sheba',
        'DICOM dataset must cover all defined hint types - without this, hint type coverage cannot be validated exhaustively',
        'Separate PACS test instance - no shared infrastructure with production',
        'No real patient data in any test environment (HIPAA)',
        'Environment configuration documented and version-controlled',
      ],
    },
  ];

  const niceToHave = [
    'Performance and Load Testing Strategy',
    'Regression Automation Approach',
    'Test Data Management Policy',
    'Third-Party and Vendor Testing Responsibilities',
    'Metrics and Reporting Cadence',
  ];

  const sections = mustHave.map(s => {
    const isEntry = s.label === 'entry';
    return `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block${isEntry ? ' ts-entry-block' : ''}">
        <div class="ts-nvsight-label">${isEntry ? 'Entry information' : 'Our preliminary example'}</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">The Test Strategy defines what we test, why, and how. It is the top-level QA thinking document that everything else flows from - test plans, test cases, and the traceability matrix are all downstream of decisions made here.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">These sections are important for a mature QA process but are not blockers for the initial framework. They will be defined and filled in during the project.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
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
    <p class="overview-intro" style="margin-bottom:20px">Regulatory standards and requirements relevant to QA processes and documentation for FDA submission in the US market.</p>
    <div class="std-overview-grid">${rows}</div>`;
}

function renderStandard(id) {
  const d = STANDARDS_DATA[id];
  if (!d) return `<p class="slide-placeholder">Данные не найдены</p>`;

  const docChip = (docId) => {
    const s = SLIDES.find(sl => sl.id === docId);
    return s ? `<span class="std-doc-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</span>` : '';
  };

  const REL_CLASS = {
    'Общее':            'rel-obshhee',
    'Дополнение':       'rel-dopolnenie',
    'Взаимозависимость':'rel-vzaimozavis',
  };

  const refs = STANDARDS_REFS[id] || [];
  const refRows = refs.map(ref => {
    const s = SLIDES.find(sl => sl.id === ref.id);
    if (!s) return '';
    return `
      <div class="std-ref-row">
        <div class="std-ref-top">
          <span class="std-ref-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</span>
          <span class="std-rel-badge ${REL_CLASS[ref.rel] || ''}">${ref.rel}</span>
        </div>
        <div class="std-ref-note">${ref.note}</div>
      </div>`;
  }).join('');

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

    <div class="std-section-title">Влияет на документы</div>
    <div class="std-chip-row" style="margin-bottom:20px">${d.docs.map(docChip).join('')}</div>

    <div class="std-section-title">Пересечения со стандартами</div>
    <div class="std-refs-list" style="margin-bottom:20px">${refRows}</div>

    <div class="std-pitfall-block">
      <div class="std-section-title">⚠️ Подводные камни</div>
      <ul class="std-pitfall-list">
        ${d.pitfalls.map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>`;
}

// ─── TEST MATRIX ───────────────────────────────────────────────────────────
function renderTestMatrix() {
  const c = (cov, pri = null) => ({ cov, pri });

  const sections = [
    {
      title: 'Hint Rendering Pipeline',
      rows: [
        ['All defined hint types rendered per specification',           c('—'),  c('◑'),       c('✅','P0'), c('✅'),      c('—')],
        ['Hint delivery without loss or duplication',                   c('—'),  c('✅','P0'), c('✅','P0'), c('—'),       c('—')],
        ['Overlay positioned on the correct frame',                     c('✅'), c('—'),       c('✅','P0'), c('◑'),       c('—')],
        ['Silent failure detection (no output → explicit alert)',       c('—'),  c('◑'),       c('✅','P0'), c('—'),       c('—')],
        ['Overlapping hints rendering',                                 c('✅'), c('—'),       c('◑','P2'), c('—'),       c('—')],
        ['Rapid frame sequence handling',                               c('—'),  c('—'),       c('◑','P2'), c('—'),       c('—')],
      ],
    },
    {
      title: 'DICOM / PACS Integration',
      rows: [
        ['DICOM tag parsing',                                           c('✅'), c('—'),       c('—'),       c('—'),       c('—')],
        ['PACS frame ingestion',                                        c('—'),  c('✅','P1'), c('✅','P1'), c('—'),       c('—')],
        ['PACS connectivity stability',                                 c('—'),  c('✅','P1'), c('✅','P1'), c('—'),       c('—')],
        ['Siemens-specific DICOM format variants',                      c('◑'),  c('—'),       c('✅','P2'), c('—'),       c('—')],
      ],
    },
    {
      title: 'Performance & Latency',
      rows: [
        ['End-to-end frame-to-hint latency (within clinical window)',   c('—'),  c('—'),       c('✅','P1'), c('—'),       c('✅')],
        ['Pipeline throughput under load',                              c('—'),  c('—'),       c('—'),       c('—'),       c('✅')],
        ['PACS transfer time baseline',                                 c('—'),  c('◑'),       c('—'),       c('—'),       c('✅')],
      ],
    },
    {
      title: 'Failure Handling & Resilience',
      rows: [
        ['Algorithm produces no output - system response',              c('—'),  c('—'),       c('✅','P0'), c('—'),       c('—')],
        ['PACS disconnect mid-session',                                 c('—'),  c('—'),       c('✅','P1'), c('—'),       c('—')],
        ['Malformed or corrupt DICOM frame',                            c('◑'),  c('—'),       c('✅','P2'), c('—'),       c('—')],
      ],
    },
    {
      title: 'Session Management',
      rows: [
        ['Session state integrity',                                     c('—'),  c('◑'),       c('✅','P2'), c('—'),       c('—')],
        ['Session recovery after disconnect',                           c('—'),  c('—'),       c('✅','P2'), c('—'),       c('—')],
      ],
    },
    {
      title: 'Security & Data Privacy',
      rows: [
        ['Test data de-identification (HIPAA)',                         c('—'),  c('—'),       c('✅'),      c('✅'),      c('—')],
        ['No PHI in test environment (process check)',                  c('—'),  c('—'),       c('✅'),      c('—'),       c('—')],
      ],
    },
    {
      title: 'UI & Display',
      rows: [
        ['UI overlays and measurement display',                         c('✅'), c('—'),       c('✅','P2'), c('◑'),       c('—')],
        ['Logging and audit trail',                                     c('—'),  c('—'),       c('✅','P3'), c('—'),       c('—')],
      ],
    },
    {
      title: 'Out of QA Scope',
      oos: true,
      rows: [
        ['Clinical accuracy of AI-generated hints',                     c('🏥'), c('🏥'),      c('🏥'),      c('🏥'),      c('—')],
        ['Algorithm model performance (sensitivity / specificity)',      c('🏥'), c('🏥'),      c('🏥'),      c('🏥'),      c('—')],
        ['Siemens hardware and firmware',                               c('—'),  c('—'),       c('—'),       c('—'),       c('—')],
      ],
    },
  ];

  const cols = ['Unit', 'Integration', 'System', 'UAT', 'Perf'];

  const priHtml = (pri) => pri
    ? `<span class="tm-pri tm-pri-${pri.toLowerCase()}">${pri}</span>`
    : '';

  const tableRows = sections.map(sec => {
    const hCls = sec.oos ? 'tm-section-header tm-oos-header' : 'tm-section-header';
    let html = `<tr><td class="${hCls}" colspan="6">${sec.title}</td></tr>`;
    sec.rows.forEach(([label, ...cells]) => {
      const cellsHtml = cells.map(cell => {
        const cls = cell.cov === '🏥' ? 'tm-cell tm-cell-oos'
                  : cell.cov === '✅' ? 'tm-cell tm-cell-full'
                  : cell.cov === '◑'  ? 'tm-cell tm-cell-partial'
                  :                     'tm-cell tm-cell-na';
        return `<td class="${cls}">${cell.cov}${priHtml(cell.pri)}</td>`;
      }).join('');
      html += `<tr><td class="tm-row-label">${label}</td>${cellsHtml}</tr>`;
    });
    return html;
  }).join('');

  const legend = [
    { sym: '✅', label: 'Full coverage' },
    { sym: '◑',  label: 'Partial coverage' },
    { sym: '—',  label: 'Not applicable' },
    { sym: '🏥', label: 'Clinical team (Sheba) - not QA' },
  ];
  const legendHtml = legend.map(l =>
    `<span class="tm-legend-item"><span class="tm-legend-sym">${l.sym}</span><span class="tm-legend-label">${l.label}</span></span>`
  ).join('');

  return `
    <p class="ts-intro">Maps test coverage across features and test levels. Shows what is tested, at which level, and at what priority - and makes explicit what falls outside QA scope.</p>
    <div class="tm-legend">${legendHtml}</div>
    <div class="tm-table-wrap">
      <table class="tm-table">
        <thead>
          <tr>
            <th class="tm-th-label">Feature / Scenario</th>
            ${cols.map(col => `<th class="tm-th-col">${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`;
}

// ─── GLOSSARY ──────────────────────────────────────────────────────────────
function renderGlossary() {
  const terms = [
    { abbr: 'BAA',    full: 'Business Associate Agreement',          note: 'Legal contract required when a vendor processes Protected Health Information (PHI) on behalf of a covered entity.' },
    { abbr: 'CAPA',   full: 'Corrective and Preventive Action',      note: 'Process for identifying, investigating, and resolving non-conformances, plus preventing recurrence.' },
    { abbr: 'CFR',    full: 'Code of Federal Regulations',           note: 'Official compilation of US federal rules. 21 CFR covers food and drugs, including medical devices.' },
    { abbr: 'CI',     full: 'Continuous Integration',                note: 'Development practice where code changes are automatically built and tested on every commit.' },
    { abbr: 'DHF',    full: 'Design History File',                   note: 'Required by 21 CFR Part 820 - the complete record of design and development of a device.' },
    { abbr: 'DICOM',  full: 'Digital Imaging and Communications in Medicine', note: 'Standard format for storing and transmitting medical imaging data, including angiographic frames.' },
    { abbr: 'DIMSE',  full: 'DICOM Message Service Element',         note: 'The network protocol used by DICOM to transfer images and data between devices and PACS.' },
    { abbr: 'FDA',    full: 'Food and Drug Administration',          note: 'US federal agency that regulates medical devices, including SaMD. Oversees premarket submissions and post-market surveillance.' },
    { abbr: 'FMEA',   full: 'Failure Mode and Effects Analysis',     note: 'Risk analysis technique that identifies potential failure modes, their causes, and their effects on system function.' },
    { abbr: 'GMLP',   full: 'Good Machine Learning Practice',        note: 'FDA-defined principles for responsible development and evaluation of AI/ML-based medical devices.' },
    { abbr: 'HIPAA',  full: 'Health Insurance Portability and Accountability Act', note: 'US law protecting patient health information. Applies directly to QA when working with clinical test data.' },
    { abbr: 'IEC',    full: 'International Electrotechnical Commission', note: 'International standards body. Publishes IEC 62304 (software lifecycle) and IEC 62366 (usability engineering).' },
    { abbr: 'ISO',    full: 'International Organization for Standardization', note: 'International standards body. Publishes ISO 13485 (QMS for medical devices) and ISO 14971 (risk management).' },
    { abbr: 'PACS',   full: 'Picture Archiving and Communication System', note: 'Hospital infrastructure for storing, retrieving, and transmitting medical images. NV-Sight connects to PACS via DICOM.' },
    { abbr: 'PCCP',   full: 'Predetermined Change Control Plan',     note: 'FDA submission document that pre-approves specific types of AI model changes, avoiding a new submission for each update.' },
    { abbr: 'PHI',    full: 'Protected Health Information',          note: 'Any patient-identifiable health data regulated under HIPAA. DICOM files contain PHI in metadata tags.' },
    { abbr: 'PMA',    full: 'Premarket Approval',                    note: 'FDA approval pathway for Class III (highest risk) devices. Requires clinical trial evidence.' },
    { abbr: '510(k)', full: 'Premarket Notification',                note: 'FDA clearance pathway for Class II devices. Requires demonstrating substantial equivalence to a predicate device.' },
    { abbr: 'QA',     full: 'Quality Assurance',                     note: 'Systematic process of ensuring product quality through planned activities - process-focused, not just test-focused.' },
    { abbr: 'QMS',    full: 'Quality Management System',             note: 'The complete set of policies, processes, and documentation governing how quality is managed across the organization.' },
    { abbr: 'QMSR',   full: 'Quality Management System Regulation',  note: 'FDA\'s 2024 update to 21 CFR Part 820, now incorporating ISO 13485:2016 by reference. Mandatory since February 2, 2026.' },
    { abbr: 'SaMD',   full: 'Software as a Medical Device',          note: 'Software intended to be used for medical purposes without being part of a physical device. NV-Sight is a SaMD.' },
    { abbr: 'SBOM',   full: 'Software Bill of Materials',            note: 'Complete inventory of all software components and dependencies in a product. Required in FDA cybersecurity submissions.' },
    { abbr: 'SAT',    full: 'Site Acceptance Testing',               note: 'On-site validation that the system works correctly in the actual clinical environment before go-live.' },
    { abbr: 'SOP',    full: 'Standard Operating Procedure',          note: 'Documented step-by-step instructions for a recurring process. Required by ISO 13485 for all key quality activities.' },
    { abbr: 'STRIDE', full: 'Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege', note: 'Threat modeling framework used in cybersecurity analysis to identify attack vectors systematically.' },
    { abbr: 'UAT',    full: 'User Acceptance Testing',               note: 'Validation with real end users (physicians) to confirm the system meets clinical needs before release.' },
    { abbr: 'V&V',    full: 'Verification and Validation',           note: 'Verification: did we build the product right? Validation: did we build the right product? Both are required by IEC 62304 and 21 CFR Part 820.' },
  ];

  const rows = terms.map(t => `
    <div class="gl-row">
      <div class="gl-abbr">${t.abbr}</div>
      <div class="gl-body">
        <div class="gl-full">${t.full}</div>
        <div class="gl-note">${t.note}</div>
      </div>
    </div>`).join('');

  return `
    <p class="ts-intro">Abbreviations used across this QA framework. Excludes common terms (API, AI, UI, OS, etc.).</p>
    <div class="gl-list">${rows}</div>`;
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
