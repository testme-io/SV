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
    type: 'FDA Regulation', typeClass: 'law',
    subtitle: 'Quality System Regulation',
    what: 'US federal regulation for medical device manufacturers. Section 820.30 (Design Controls) is the key section for QA: it requires documenting every stage from requirements through verification and validation. Updated in 2024 to align with ISO 13485.',
    reqs: [
      { h: 'Design Controls (820.30)', d: 'The full development cycle is documented - requirements, architecture, verification, validation. Without this, premarket submission is not possible.' },
      { h: 'Document Control (820.40)', d: 'Versioning, approval, and control of all documentation. Every document version must be traceable.' },
      { h: 'CAPA (820.100)', d: 'Corrective and Preventive Action for every defect and non-conformance. Root cause analysis, corrective actions, and confirmation of closure.' },
      { h: 'Complaint Files (820.198)', d: 'Recording and analysis of complaints and adverse events. For a clinical AI product, this includes feedback from physicians at the pilot site.' },
      { h: 'V&V Records', d: 'Results of every test are stored as part of the Design History File. Not just "test passed" - a signed, documented report.' },
    ],
    docs: ['teststrategy', 'traceability', 'vnvreport', 'dhf', 'qualityreport'],
    pitfalls: [
      'Many teams treat 21 CFR Part 820 as a checklist of documents to prepare before submission. FDA sees it differently - they want to see a living system: how decisions were made, why specific things were tested, who signed off and when. A document without a real process behind it is a red flag at audit.',
      'The most common audit finding: no traceability between requirement, test case, and test result. Saying "we tested feature X" is not enough. The chain must be visible - here is the requirement, here is the test case written against it, here is the executed result. Without this chain, the submission is vulnerable.',
      'Developers regularly make small algorithm changes without thinking about documentation. Under 21 CFR Part 820, any design change - even a minor one - must go through change control with an impact assessment on verification and validation. This discipline needs to be built from day one, because reconstructing a change history retroactively is extremely difficult.',
    ],
    refs: ['std-13485', 'std-62304'],
  },
  'std-62304': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Medical Device Software Lifecycle Processes',
    what: 'International standard for the software lifecycle of medical devices. Recognized by FDA as a consensus standard. Defines software classification by risk level and documentation requirements at each level.',
    reqs: [
      { h: 'Classification: Class C (most likely NV-Sight)', d: 'A system failure during an active procedure (pipeline crash, hints not rendered) = serious patient harm. Class C is the highest level - full documentation is mandatory.' },
      { h: 'Software Development Plan', d: 'How development and testing are organized - documented before work begins.' },
      { h: 'Unit + Integration + System Tests', d: 'Plans and reports at every testing level. All results are stored, not just the final verdict.' },
      { h: 'Anomaly Records', d: 'Every defect found is documented - status, root cause, resolution. Without this, submission will not pass review.' },
      { h: 'Full Traceability', d: 'Requirements - architecture - test cases - results: connected at every level.' },
    ],
    docs: ['teststrategy', 'testplans', 'testcases', 'defectworkflow', 'traceability', 'vnvreport'],
    pitfalls: [
      'When a team sees how much documentation Class C requires, the temptation arises to justify Class B. The problem is that FDA looks at the actual use scenario during review. For NV-Sight: system failure during an active stroke procedure = potential serious harm. If FDA disagrees with the classification, all documentation must be redone.',
      'Unit tests are often treated as an internal development practice that does not require formal documentation. Under IEC 62304 for Class C this is not the case - documented plans and reports are required at every level: unit, integration, system. This must be planned upfront, not reconstructed after the fact.',
      'Closing a defect in Jira with a comment of "fixed" is not enough. For every significant defect, a root cause analysis is required: what exactly broke, why it happened, what was done to prevent recurrence. Without this, the defect record does not pass audit.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-14971': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Risk Management for Medical Devices',
    what: 'Risk management standard. FDA recognized. QA does not own the risk file independently - that is engineering team territory. But QA provides the evidence: test results confirming that mitigations work.',
    reqs: [
      { h: 'Risk Framework', d: 'Hazard - Hazardous Situation - Harm. For each: Severity x Probability = Risk Level - acceptable or requires mitigation.' },
      { h: 'Risk Controls', d: 'Mitigation measures for unacceptable risks. QA tests that they work - this is the QA contribution to the risk file.' },
      { h: 'Residual Risk', d: 'After mitigation - residual risk is documented and an acceptability decision is made.' },
      { h: 'QA Contribution', d: 'Failure modes found in testing feed into the risk file. Test reports are the evidence for risk controls.' },
    ],
    docs: ['testcases', 'vnvreport', 'riskcontrib', 'traceability'],
    pitfalls: [
      'QA teams often assume risk management is the job of engineers or product owners, and QA just executes test cases. In fact, a risk file without QA evidence is incomplete: every risk control must have a test result proving it works. If QA does not provide this data, the submission is incomplete.',
      'When testing uncovers a new failure mode not in the risk analysis, this is not just a bug - it is potentially a new hazard. It must be added to the risk file, assessed for severity and probability, and a mitigation defined. Skipping this means the risk file gradually diverges from reality.',
      'The hazard analysis describes specific dangerous scenarios - for NV-Sight: pipeline fails silently during an active procedure, hint not rendered on the correct frame. These are exactly the scenarios that must be tested first. If test cases are not tied to the hazard analysis, some real risks remain uncovered.',
      'For AI/ML products, failure modes are probabilistic, not deterministic. Classic pass/fail testing is not sufficient. Statistical approaches are needed: how many samples were tested, what confidence intervals the metrics have, how a representative sample was ensured.',
    ],
    refs: ['std-62304', 'std-62366', 'std-820'],
  },
  'std-62366': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Usability Engineering for Medical Devices',
    what: 'Usability engineering standard. FDA recognized. The goal: ensure users do not cause harm through use error - not just that the interface is convenient.',
    reqs: [
      { h: 'Formative Testing', d: 'Iterative UI checks during development. Identifies usability hazards early.' },
      { h: 'Summative Testing', d: 'Final validation with real users (physicians). Required for submission - simulation does not count.' },
      { h: 'Use Specification', d: 'Who the user is, in what conditions they work, what critical tasks they perform.' },
      { h: 'Usability Hazards - Risk File', d: 'Every identified usability hazard goes into the ISO 14971 risk file with a severity assessment.' },
    ],
    docs: ['usability', 'riskcontrib', 'vnvreport'],
    pitfalls: [
      'IEC 62366 is about safety, not convenience. The question is not "is the interface comfortable for the physician" but "can the physician make a use error that leads to patient harm." This is a different type of testing with different scenarios - focused on critical tasks and potentially dangerous mistakes.',
      'Formative testing is iterative work during development, summative is final validation before submission. Formative is often done, summative is often deferred or skipped. FDA will not accept a submission with only formative results - summative is mandatory.',
      'Physicians must participate in summative testing in person. They cannot be replaced by other users or simulation. This is an organizational challenge - real specialists must be recruited, schedules coordinated, sessions conducted. The earlier this is planned, the better.',
      'For NV-Sight this is especially important: the physician interprets AI output during an active intraoperative procedure, under time pressure, with high cognitive load. Usability test scenarios must model exactly these conditions - not a calm review of the interface in an office.',
    ],
    refs: ['std-14971', 'std-820'],
  },
  'std-13485': {
    type: 'Consensus Standard', typeClass: 'standard',
    subtitle: 'Quality Management Systems for Medical Devices',
    what: 'QMS standard for medical devices. After the 2024 update to 21 CFR Part 820, structurally nearly identical. ISO 13485 certification simplifies entry into international markets in the future.',
    reqs: [
      { h: 'Documented Procedures', d: 'All quality activities have documented procedures - not just performed, but described in writing how they are performed.' },
      { h: 'Internal Audits', d: 'Planned and documented - verifying that the QMS is actually applied, not just exists on paper.' },
      { h: 'CAPA', d: 'For any non-conformance - with root cause analysis and evidence of closure.' },
      { h: 'Management Review', d: 'QA metrics are regularly reported to leadership. The Quality Report is the primary tool for this.' },
    ],
    docs: ['teststrategy', 'metrics', 'qualityreport', 'defectworkflow'],
    pitfalls: [
      'ISO 13485 certification is valuable, but by itself does not mean the QMS works. At recertification audits, real examples are checked: show a CAPA opened in the last quarter, show internal audit results, show management review records. If the system exists only on paper, it will be found.',
      'CAPA is not just "found a problem, fixed it." A root cause analysis is required, an action plan, deadlines, responsible parties, and most importantly - evidence that the problem was actually resolved and will not recur. Without all of this, the CAPA is formally not closed and an auditor will not accept it.',
    ],
    refs: ['std-820', 'std-62304'],
  },
  'std-samd': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Software as a Medical Device - Clinical Evaluation',
    what: 'FDA guidance on clinical evaluation of SaMD. Not a law, but FDA follows this during review - ignoring it is not an option. Defines what must be proven with clinical data.',
    reqs: [
      { h: 'Analytical Performance', d: 'How the model performs technically - accuracy, sensitivity, specificity, recall, precision on the test dataset.' },
      { h: 'Clinical Performance', d: 'How the AI affects clinical decisions by the physician. Analytical performance alone is not enough - clinical benefit must be demonstrated.' },
      { h: 'Independent Test Set', d: 'The validation dataset must not have been used in training. Mount Sinai and St. Vincent are exactly independent validation sets.' },
      { h: 'Subgroup Analysis', d: 'Performance across subgroups: demographics, pathology types, equipment type.' },
    ],
    docs: ['vnvreport', 'testcases', 'testplans'],
    pitfalls: [
      'Teams often present model accuracy on the same dataset used for training or validation. FDA will not accept this result - an independent test set is required, data the model has never seen during training. For NV-Sight, this is data from Mount Sinai and St. Vincent, which must be strictly isolated from training from the very beginning.',
      'Good average accuracy across the dataset does not mean the model performs equally well for all patients. FDA will look at subgroup analysis: how the model performs for different age groups, pathology types, equipment. If subgroup performance was not checked, this is a gap that will be found during review.',
      'Analytical performance (technical model metrics) is only part of the picture. FDA wants to see clinical performance: how the presence of an AI assistant affects physician decisions and patient outcomes. Without this component, the clinical evaluation is considered incomplete.',
    ],
    refs: ['std-aiml', 'std-14971'],
  },
  'std-aiml': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'AI/ML-Based Software as a Medical Device - Action Plan',
    what: 'FDA guidance specifically for AI/ML devices. Defines how FDA views AI: development, testing, and the model lifecycle after market entry.',
    reqs: [
      { h: 'Good Machine Learning Practice (GMLP)', d: 'Model development standards - data quality, reproducibility, performance evaluation.' },
      { h: 'Bias & Generalizability', d: 'The model works across different populations - demographics, equipment, clinics. Verified through testing.' },
      { h: 'Real-World Performance Monitoring', d: 'After deployment - a monitoring plan for performance and triggers for re-evaluation.' },
      { h: 'Transparency', d: 'What the model does, how to interpret its output, where the limits of applicability are - documented.' },
    ],
    docs: ['vnvreport', 'testplans', 'testcases', 'pccp'],
    pitfalls: [
      'Testing only on the primary population from Sheba does not cover all FDA requirements. It must be shown that the model works correctly across different subgroups: demographics, types of vascular abnormalities, equipment. Bias in one subgroup can be grounds for rejecting the submission.',
      'The FDA AI/ML Action Plan explicitly requires a real-world performance monitoring plan after deployment. This means defining metrics to monitor, check frequency, threshold values, and actions if performance degrades. Without this plan, the submission is incomplete - you cannot simply release a product and not monitor it.',
      'An AI model is a black box from the perspective of traditional testing. FDA requires documenting known failure modes: under what conditions the model performs worse, what types of input produce unreliable results, what the limits of applicability are. This is honesty toward the regulator and the physician.',
    ],
    refs: ['std-samd', 'std-pccp', 'std-62366'],
  },
  'std-pccp': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Predetermined Change Control Plan',
    what: 'Required if the AI model will be updated after market clearance. Included in the original submission. Without PCCP, every model update = a new 510(k) = a year or more of waiting before each improvement.',
    reqs: [
      { h: 'Pre-approved Changes', d: 'Which changes are permitted without a new submission: retraining on a larger dataset, threshold adjustments, etc.' },
      { h: 'Performance Metrics & Triggers', d: 'At what performance drop a re-submission or additional review is required.' },
      { h: 'Change Methodology', d: 'How changes are evaluated - test protocol, dataset, acceptance criteria.' },
      { h: 'Scope Definition', d: 'Clear boundaries of what is and is not in the PCCP - FDA will verify compliance at each change.' },
    ],
    docs: ['pccp', 'vnvreport', 'testplans'],
    pitfalls: [
      'The PCCP must be part of the original submission - it is not a document that can be added later. If you plan to update the AI model after launch (and you do - otherwise why collect data from new clinics), the PCCP must be written in parallel with the main submission package, not afterward.',
      'A PCCP that is too broad - for example "we can change the model if performance does not degrade" - FDA will constrain during review: specific metrics, specific thresholds, specific evaluation protocols will be required. The more vague the PCCP, the more revisions the review will require.',
      'A PCCP that is too narrow leaves the team unable to update the model in response to new data without a new 510(k). Each new 510(k) means at least several months of waiting. The balance between broad and narrow PCCP is a key architectural question.',
      'NV-Sight will accumulate data from Mount Sinai and St. Vincent. Almost certainly the model will need to be retrained on a richer dataset. The PCCP needs to be written now with these scenarios in mind - otherwise it may turn out that such a change requires a new submission.',
    ],
    refs: ['std-aiml', 'std-62304'],
  },
  'std-cyber': {
    type: 'FDA Guidance', typeClass: 'guidance',
    subtitle: 'Cybersecurity in Medical Devices (2023)',
    what: 'Mandatory in premarket submissions since 2023. Cybersecurity is treated as a patient safety issue, not an IT task. NV-Sight\'s client-server architecture = expanded attack surface.',
    reqs: [
      { h: 'Threat Modeling', d: 'STRIDE or equivalent - document threats and mitigations for each entry point: PACS, hospital network, client laptop.' },
      { h: 'SBOM', d: 'Software Bill of Materials - a complete list of all components including open source dependencies.' },
      { h: 'Cybersecurity Testing', d: 'Penetration testing, vulnerability scanning - results are included in the submission.' },
      { h: 'Post-Market Monitoring', d: 'A plan for responding to vulnerabilities and a patch management process after launch.' },
    ],
    docs: ['teststrategy', 'testplans', 'vnvreport', 'dhf'],
    pitfalls: [
      'Medical device cybersecurity is the responsibility of the device manufacturer, not the IT department. FDA requires including cybersecurity testing results in the premarket submission. This means QA must plan and document security testing on par with functional testing - it is part of V&V, not a separate topic.',
      'SBOM is a complete list of all software in the product, including all open source dependencies and their versions. Teams often do not have an up-to-date SBOM because dependencies change during development. Without an SBOM the submission is incomplete, and when a vulnerability appears it is unclear whether the product is even affected.',
      'NV-Sight\'s client-server architecture means several connection points: laptop - server, server - PACS, PACS - angiograph. Each of these connections is a potential attack vector. Threat modeling must cover all points, not just the client side.',
      'FDA requires not just good security at launch, but a documented plan for when a vulnerability is discovered after launch. A process is needed: how vulnerabilities in dependencies are monitored, how quickly a patch is released, how clinical sites are notified.',
    ],
    refs: ['std-62304', 'std-hipaa'],
  },
  'std-hipaa': {
    type: 'Operational (Law)', typeClass: 'operational',
    subtitle: 'Health Insurance Portability and Accountability Act',
    what: 'US law protecting patient data (PHI - Protected Health Information). Directly affects QA work with test data from clinical sites. Violation = substantial fines.',
    reqs: [
      { h: 'De-identification (Safe Harbor)', d: 'Remove 18 patient identifiers. Only then can the data be used for testing without a Business Associate Agreement.' },
      { h: 'Business Associate Agreement (BAA)', d: 'If the QA team works with real PHI data from clinics, a BAA is required with each clinic.' },
      { h: 'Data Handling', d: 'PHI cannot be stored on personal devices or unsecured systems. This affects how the test environment is organized.' },
    ],
    docs: ['testplans', 'testcases', 'sat'],
    pitfalls: [
      'Removing a patient\'s name from a file is not de-identification. DICOM files contain dozens of tags with PHI: date of birth, procedure date, study ID, physician ID, equipment ID, institution name, and more. HIPAA Safe Harbor requires removing a specific list of 18 identifiers - this must be done with a tool, not manually, because some tags are non-obvious and easy to miss.',
      'When a team takes data from Sheba for testing, it seems like an internal process with no issues. But if the QA engineer works outside Israel, or data is copied to a device without adequate protection, or there is no signed BAA between CoPilotMD and the clinic - this is already a violation. Either work only with de-identified data, or have a formal BAA in place and understand which PHI storage systems are permitted.',
      'Test data is not only production data that was copied. It also includes synthetic data, data from open datasets, mock data. Each category has its own rules: synthetic can be stored without restrictions, real PHI - only in a secured environment with access control. The absence of a formal process defining what is stored how and who has access is a violation that a HIPAA audit will find immediately.',
    ],
    refs: ['std-dicom', 'std-cyber'],
  },
  'std-dicom': {
    type: 'Operational (Standard)', typeClass: 'operational',
    subtitle: 'Digital Imaging and Communications in Medicine',
    what: 'Standard for storing and transmitting medical images. Not a regulatory requirement, but the entire NV-Sight imaging pipeline works with DICOM. QA must understand the format to build correct test scenarios.',
    reqs: [
      { h: 'Structure', d: 'Patient - Study - Series - Instance (image). Understanding the hierarchy is critical for correct test scenarios.' },
      { h: 'PHI in Tags', d: 'DICOM contains hundreds of tags, many with patient data. De-identification is mandatory before testing.' },
      { h: 'Transfer Syntax', d: 'Image compression formats - the pipeline must correctly handle all variants generated by Siemens equipment.' },
      { h: 'DICOM over Network (DIMSE)', d: 'Transmission via PACS - network transfer delays are accounted for in performance test scenarios.' },
    ],
    docs: ['testplans', 'testcases', 'testmatrix', 'sat'],
    pitfalls: [
      'In development, testing is typically done on a few "good" DICOM files that open correctly and look clean. In a real clinic, files arrive with broken tags, non-standard values, rare transfer syntax, compression artifacts from a specific generation of equipment. If the pipeline does not handle these cases, it will fail exactly at the moment of a real procedure. The test matrix must include format edge cases, not just the happy path.',
      'NV-Sight operates intraoperatively - meaning results are delivered while the procedure is in progress. A delay of a few seconds in a test environment where PACS is nearby and the network is fast is not representative. Real delay is the sum of: transfer from the angiograph to PACS, from PACS to the NV-Sight server, processing, back to the client laptop - all through the hospital network which may be under load. Performance must be tested in conditions close to real ones.',
      'A DICOM file with the patient name removed is not a de-identified DICOM file. Inside the DICOM structure there are several hundred potential tags, of which dozens contain PHI: PatientBirthDate, InstitutionName, PerformingPhysicianName, StationName, DeviceSerialNumber, and others. A specialized de-identification tool is required that processes all tags by the list - not manual removal of obvious fields.',
      'Siemens produces different angiograph series and each generates DICOM slightly differently: different values in service tags, different compression variants, sometimes vendor-specific protocol extensions. The test matrix must cover all equipment types planned for use, because a pipeline that works on one series may fail on another.',
    ],
    refs: ['std-hipaa', 'std-cyber'],
  },
};

// ─── STANDARDS CROSS-REFERENCES ───────────────────────────────────────────
// rel types: 'General' | 'Complement' | 'Interdependency'
const STANDARDS_REFS = {
  'std-820': [
    { id: 'std-13485', rel: 'General',
      note: 'After the 2024 update, 820 and 13485 are structurally aligned - complying with one covers most requirements of the other. The difference: 13485 is international, 820 is US-only.' },
    { id: 'std-62304', rel: 'Complement',
      note: '820 sets general Design Controls for any medical device, 62304 specifies how to apply them to software - what to document at each stage of development.' },
  ],
  'std-62304': [
    { id: 'std-14971', rel: 'Interdependency',
      note: 'The risk level from 14971 determines the Software Class in 62304 (A/B/C). Without risk assessment, software cannot be correctly classified - the documentation scope follows from this relationship.' },
    { id: 'std-820', rel: 'Complement',
      note: '820 requires Design Controls in general terms, 62304 describes the specific steps for software within those controls.' },
  ],
  'std-14971': [
    { id: 'std-62304', rel: 'Interdependency',
      note: 'Software class (62304) follows from risk assessment (14971). A closed loop: risk - software class - documentation and testing scope.' },
    { id: 'std-62366', rel: 'Complement',
      note: '62366 identifies usability hazards, which feed into the risk file (14971) as input. Two independent sources of risk: technical and user-related - both are required.' },
    { id: 'std-820', rel: 'General',
      note: 'Both require documenting risk mitigation and evidence that controls work. 14971 provides the risk framework, 820 requires the final result.' },
  ],
  'std-62366': [
    { id: 'std-14971', rel: 'Complement',
      note: '62366 finds usability hazards, 14971 accepts them as input and assesses the risk. A one-directional relationship: 62366 supplies the data, 14971 manages it.' },
    { id: 'std-820', rel: 'Complement',
      note: '820.30(g) requires design validation - 62366 describes how to conduct usability validation specifically for medical devices with a UI.' },
  ],
  'std-13485': [
    { id: 'std-820', rel: 'General',
      note: 'Structurally nearly identical after 2024. The only practical difference: 13485 is international, 820 is US-only. For global market entry, both are needed.' },
    { id: 'std-62304', rel: 'Complement',
      note: '13485 describes the QMS as a whole, 62304 details the software lifecycle requirements within that system.' },
  ],
  'std-samd': [
    { id: 'std-aiml', rel: 'Complement',
      note: 'SaMD guidance is the base clinical evaluation framework for any SaMD. The AI/ML Action Plan is an extension with requirements specific to AI models. Both must be read together.' },
    { id: 'std-14971', rel: 'Complement',
      note: 'Clinical performance data from SaMD guidance is used as evidence in the risk file. Insufficient model performance = risk, which must be documented and mitigated.' },
  ],
  'std-aiml': [
    { id: 'std-samd', rel: 'Complement',
      note: 'SaMD guidance is the foundation, AI/ML Action Plan is the extension for AI-specific requirements. Inseparable when working with an AI medical device.' },
    { id: 'std-pccp', rel: 'Interdependency',
      note: 'AI/ML Action Plan introduces the concept of PCCP and explains why it is needed. PCCP guidance describes how to write it. Concept + implementation.' },
    { id: 'std-62366', rel: 'Complement',
      note: 'AI/ML requires transparent interaction between the physician and AI output. 62366 describes how to verify this through usability testing - including interpretation of output under time pressure.' },
  ],
  'std-pccp': [
    { id: 'std-aiml', rel: 'Interdependency',
      note: 'AI/ML Action Plan introduces the PCCP requirement, PCCP guidance provides the detailed format. Inseparable: without the AI/ML context, the purpose of PCCP is unclear; without PCCP guidance, it is unclear how to write it.' },
    { id: 'std-62304', rel: 'Complement',
      note: 'Every change from the PCCP must follow the change management process of 62304. PCCP defines WHAT and under what conditions we change, 62304 defines HOW to document that change.' },
  ],
  'std-cyber': [
    { id: 'std-62304', rel: 'Complement',
      note: '62304 requires documenting software components (the basis for SBOM) and change management (for security patches). Cybersecurity is part of the software lifecycle, not a separate discipline.' },
    { id: 'std-hipaa', rel: 'Complement',
      note: 'Both address patient data protection, but from different angles: HIPAA - privacy, Cybersecurity - system security. A security breach automatically becomes a HIPAA violation.' },
  ],
  'std-hipaa': [
    { id: 'std-dicom', rel: 'Interdependency',
      note: 'PHI tags are embedded directly in DICOM files. HIPAA de-identification is impossible without precise knowledge of which DICOM tags contain PHI and how to remove them.' },
    { id: 'std-cyber', rel: 'Complement',
      note: 'HIPAA protects PHI from the privacy side, Cybersecurity from the security side. A Cybersecurity breach (system hack) automatically becomes a HIPAA violation.' },
  ],
  'std-dicom': [
    { id: 'std-hipaa', rel: 'Interdependency',
      note: 'PHI tags are embedded in the DICOM structure. Correct HIPAA de-identification requires detailed knowledge of DICOM - without this it is impossible to guarantee that all identifiers have been removed.' },
    { id: 'std-cyber', rel: 'Complement',
      note: 'DICOM over network (DIMSE protocol) is an attack surface. FDA Cybersecurity requires threat modeling for all network protocols, including the DICOM connection between equipment and PACS.' },
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
  { id: 'pccp',             icon: '🔁', title: 'PCCP — Predetermined Change Control Plan', group: 'Regulatory' },
  // Plan & Estimation
  { id: 'plan30_90_180',   icon: '📅', title: '30 / 90 / 180 Day Plan',             group: 'Plan & Estimation' },
  { id: 'docregistry',     icon: '📋', title: 'Document Registry',                  group: 'Plan & Estimation', wide: true },
  { id: 'fdasubplan',     icon: '🗓️', title: 'FDA Submission Plan & Estimation',   group: 'Plan & Estimation', wide: true, star: true },
  // Reference
  { id: 'glossary',         icon: '📖', title: 'Abbreviations',                     group: 'Reference' },
  { id: 'refdocs',          icon: '🔗', title: 'Referenced Documents',               group: 'Reference' },
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
  const groups = ['', 'Standards', 'Foundation', 'Operational', 'Regulatory', 'Plan & Estimation', 'Reference'];
  let html = '';

  groups.forEach(group => {
    const groupSlides = SLIDES.filter(s => s.group === group);
    if (!groupSlides.length) return;

    if (group) {
      const collapsed = collapsedGroups.has(group);
      const groupBadge = group === 'Standards'
        ? ' <span class="nav-ref-badge">internal ref</span>'
        : '';
      const groupSub = {
        'Foundation':   'how we work',
        'Operational':  'what we do every day',
        'Regulatory':   'what we show the regulator',
      }[group] || '';
      html += `
        <li>
          <div class="group-label group-label-btn" onclick="toggleGroup('${group}')">
            <div class="group-label-inner">
              <span>${group}${groupBadge}</span>
              ${groupSub ? `<span class="group-label-sub">${groupSub}</span>` : ''}
            </div>
            <span class="group-arrow${collapsed ? ' group-arrow-collapsed' : ''}">▾</span>
          </div>
        </li>`;
      if (collapsed) return;
    }

    groupSlides.forEach(s => {
      const num = SLIDES.indexOf(s) + 1;
      const starBadge = s.star ? ' <span class="nav-star-badge">★ key</span>' : '';
      html += `
        <li>
          <a href="#" class="${s.id === currentSlide ? 'active' : ''}${s.star ? ' nav-star-item' : ''}"
             onclick="showSlide('${s.id}');return false;">
            <span class="nav-num">${num}</span>
            <span>${s.title}${starBadge}</span>
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
  else if (id === 'bugreporting')   content = renderBugReporting();
  else if (id === 'metrics')        content = renderMetrics();
  else if (id === 'testplans')      content = renderTestPlans();
  else if (id === 'testcases')      content = renderTestCases();
  else if (id === 'automation')     content = renderAutomation();
  else if (id === 'defectworkflow')   content = renderDefectWorkflow();
  else if (id === 'releasereadiness') content = renderReleaseReadiness();
  else if (id === 'qualityreport')    content = renderQualityReport();
  else if (id === 'traceability')     content = renderTraceability();
  else if (id === 'vnvreport')        content = renderVnVReport();
  else if (id === 'riskcontrib')      content = renderRiskContrib();
  else if (id === 'dhf')              content = renderDhf();
  else if (id === 'sat')              content = renderSat();
  else if (id === 'usability')        content = renderUsability();
  else if (id === 'pccp')             content = renderPccp();
  else if (id === 'plan30_90_180')    content = renderPlan30_90_180();
  else if (id === 'docregistry')      content = renderDocRegistry();
  else if (id === 'fdasubplan')       content = renderFdaSubPlan();
  else if (id === 'glossary')         content = renderGlossary();
  else if (id === 'refdocs')          content = renderRefDocs();
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
    <div class="slide-card${slide.wide ? ' slide-card-wide' : ''}">
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

function renderBugReporting() {
  const fields = [
    {
      label: 'Summary',
      hint: '[WBS] What - Where - When: one sentence that makes the problem clear without opening the ticket',
      ex: '[Rendering] Aneurysm hint missing on frame 14 (Where) after PACS reconnect mid-session (When)',
      note: 'What = what is broken or absent. Where = which component, frame, or screen. When = under what condition or trigger. A summary that answers all three makes triage faster and the Jira backlog readable at a glance. WBS tag keeps the board filterable by work area.',
    },
    {
      label: 'Description',
      hint: 'The full body of the bug report. Contains: Steps to Reproduce, Expected Result, Actual Result, Evidence, and Possible Root Cause - in that order',
      ex: '',
      note: 'All sub-sections below (Steps to Reproduce through Root Cause) are mandatory parts of the Description field in Jira. They are listed separately here for clarity on what each must contain.',
      sub: true,
    },
    {
      label: '↳ Steps to Reproduce',
      hint: 'Numbered, minimal path to trigger the defect - no assumptions, no prior context required',
      ex: '1. Load DICOM series [UID]. 2. Wait for hint overlay to render. 3. Simulate PACS disconnect. 4. Reconnect PACS. 5. Observe hint state on frame 14.',
      note: 'If steps cannot be condensed to under 10 lines, the reproduction case is not isolated enough.',
    },
    {
      label: '↳ Expected Result',
      hint: 'What the system should do - reference the spec or requirement ID where possible',
      ex: 'All previously rendered hints persist through PACS reconnect. No re-render required. Ref: [REQ-042].',
      note: 'Linking to a requirement turns the bug into a traceability artifact - useful for the DHF.',
    },
    {
      label: '↳ Actual Result',
      hint: 'What the system actually does - precise and observable, no interpretation',
      ex: 'Hint overlay clears completely on reconnect. Frame 14 shows no hint even though hint was visible before disconnect.',
      note: 'Avoid "it does not work" or "hint is wrong" - describe exactly what is visible on screen.',
    },
    {
      label: '↳ Evidence',
      hint: 'Screenshot, screen recording, or DICOM viewer export - attached inline or linked',
      ex: 'screen-rec-20240918-frame14-reconnect.mp4 (attached)',
      note: 'For P0 and P1 a screen recording of the full reproduction sequence is expected, not just a final-state screenshot.',
    },
    {
      label: '↳ Root Cause',
      hint: 'A hypothesis about the likely cause - clearly marked as a hypothesis, not a diagnosis',
      ex: 'Possible cause: session state not preserved across PACS disconnect/reconnect cycle.',
      note: 'Gives the developer a starting point without locking in the diagnosis. If you have no hypothesis, write "Unknown" - do not leave the section blank.',
    },
    {
      label: 'Priority & Severity',
      hint: 'Set both together. Jira standard severity (Blocker / Critical / Major / Minor / Trivial) mapped to the P0-P3 scale from Risk-Based Test Prioritization in the Test Strategy',
      ex: 'Blocker (P0) / Critical (P1) / Major (P2) / Minor (P3) / Trivial (P3 - cosmetic)',
      note: 'The mapping is fixed: Blocker = P0, Critical = P1, Major = P2, Minor = P3, Trivial = P3 cosmetic. Both fields are set at filing time. If unsure between P0 and P1, choose P0 and discuss at triage - never the other way around.',
    },
    {
      label: 'Labels',
      hint: 'Context tags: Smoke / Regression / UAT / build number or other tags per project conventions',
      ex: 'Regression, build-2.4.1',
      note: 'Make the backlog filterable by test type and release. The exact label set is defined at project onboarding based on how the team organises the board.',
    },
    {
      label: 'Assignee',
      hint: 'The engineer responsible for investigating and fixing - set at triage, not left unassigned',
      ex: '[Component owner] assigned at triage. QA lead added as watcher.',
      note: 'An unassigned bug is a bug no one owns. Set immediately for P0, at triage for P1-P3. QA lead is a watcher on all P0 and P1 tickets.',
    },
    {
      label: 'Build Version',
      hint: 'Exact build identifier where the defect was first observed',
      ex: '2.4.1-rc3 (build 20240918)',
      note: 'Without this, the developer cannot determine if the bug is already fixed in a later build.',
    },
    {
      label: 'Environment',
      hint: 'Dev / Staging / Prod - depending on project setup. State it explicitly, never assume.',
      ex: 'Staging - Siemens angiography simulator v4.1, PACS test instance v3.1',
      note: 'The tier structure (dev / staging / prod) is defined at project onboarding. Include component versions if the bug is at the integration layer. Never use production for bug reproduction (HIPAA).',
    },
    {
      label: 'DICOM Reference',
      hint: 'Series UID, frame number, hint type - mandatory for any rendering or pipeline bug',
      ex: 'Study UID: 1.2.840.xxx | Series UID: 1.2.840.yyy | Frame: 14 | Hint type: Aneurysm marker',
      note: 'Without a DICOM reference, rendering bugs cannot be reproduced by engineering. Non-negotiable for hint delivery defects.',
    },
    {
      label: 'Related Bugs / Tasks',
      hint: 'Links to parent tasks, blocking issues, duplicate tickets, or related bugs - typed by relationship',
      ex: 'Blocks: NV-412 (release ticket) | Relates to: NV-388 (PACS reconnect session issue) | Parent: NV-300 (Rendering epic)',
      note: 'Use Jira\'s built-in link types: Blocks / Is blocked by / Relates to / Duplicates / Is child of. Correct linking keeps the dependency graph visible and prevents duplicate investigation of the same root cause.',
    },
    {
      label: 'Related Test Case',
      hint: 'Test case ID from the test plan that covers this scenario',
      ex: 'TC-RND-014',
      note: 'Required for traceability matrix and V&V report. A bug with no linked test case is a coverage gap that must be explained.',
    },
    {
      label: 'Comments',
      hint: 'Verification status updates posted as Jira comments throughout the lifecycle - not in the description',
      ex: `<strong>Verified</strong> [date] - build 2.4.2, Staging, Siemens simulator v4.1. Hint persists after reconnect on frame 14. Recording attached. TC-RND-014 passed. → Closing.<br>
           <strong>Reopened</strong> [date] - build 2.4.3, Staging. Failure reproduced on frame 22 in a different series. New recording attached. Returning to Triage.<br>
           <strong>Not Relevant</strong> [date] - Staging env config mismatch (PACS v2 vs. required PACS v3). Not reproducible on correct environment. Closing as env issue.`,
      note: 'Every verification attempt is a comment, not a silent status change. Include: outcome (Verified / Reopened / Not Relevant), build, environment tier, devices or simulator version, and evidence. Comment history for P0 and P1 goes into the DHF.',
    },
  ];

  const fieldRows = fields.map(f => {
    const isSub  = f.label.startsWith('↳');
    const isDesc = f.sub === true;
    const rowCls = isSub ? 'br-field-row br-field-sub' : isDesc ? 'br-field-row br-field-desc-parent' : 'br-field-row';
    const exHtml = f.ex ? `<div class="br-field-ex"><span class="br-ex-tag">e.g.</span> ${f.ex}</div>` : '';
    return `
    <div class="${rowCls}">
      <div class="br-field-label">${f.label}</div>
      <div class="br-field-body">
        <div class="br-field-hint">${f.hint}</div>
        ${exHtml}
        <div class="br-field-note">${f.note}</div>
      </div>
    </div>`;
  }).join('');

  const escalation = [
    {
      pri: 'P0', cls: 'p0',
      title: 'Immediate - synchronous',
      steps: [
        'File the Jira ticket, mark P0, block the release in Jira',
        'Ping QA lead + Engineering lead + Product directly (Slack DM, not channel)',
        'Do not wait for stand-up or sprint planning - P0 does not go async',
        'Engineering confirms reproduction within the hour or escalates further',
        'No release goes out while a P0 is open - no exceptions, no business overrides',
      ],
    },
    {
      pri: 'P1', cls: 'p1',
      title: 'Same-day - notify leads',
      steps: [
        'File in Jira, notify QA lead and Engineering lead in the team channel',
        'Fix must be scheduled within the current sprint',
        'QA verifies the fix before the sprint closes',
        'Release does not go out with an open P1',
      ],
    },
    {
      pri: 'P2 / P3', cls: 'p2',
      title: 'Standard triage - next planning',
      steps: [
        'File in Jira, assign to the relevant component owner',
        'Reviewed and prioritised at the next sprint planning session',
        'P2: requires a documented risk-acceptance if not fixed before release',
        'P3: fixed when capacity allows, no release gate impact',
      ],
    },
  ];

  const escBlocks = escalation.map(e => `
    <div class="br-esc-block br-esc-${e.cls}">
      <div class="br-esc-header">
        <span class="br-esc-pri tm-pri-${e.cls === 'p2' ? 'p2' : e.cls}">${e.pri}</span>
        <span class="br-esc-title">${e.title}</span>
      </div>
      <ul class="br-esc-list">
        ${e.steps.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>`).join('');

  const oosItems = [
    'Clinical accuracy of AI-generated hints. If a hint is delivered correctly per specification but a physician disagrees with its medical interpretation - that is a clinical finding, not a QA defect. Route to the clinical team at Sheba, not to engineering.',
    'Siemens hardware behavior. If the Artis system behaves unexpectedly at the hardware or firmware level - that is a vendor issue, not an NV-Sight bug.',
    'Hospital network or PACS infrastructure not in the integration plan. External system failures outside the agreed integration scope are not filed as NV-Sight defects.',
    '"The AI should have detected this." Algorithm sensitivity and specificity are owned by the clinical team. QA validates that what the algorithm produces is delivered correctly - not whether the algorithm should have produced something different.',
  ];

  return `
    <p class="ts-intro">Every bug filed against NV-Sight is a potential audit artifact - part of the CAPA chain, the DHF, and the V&V record. A report missing critical fields is returned for completion before it enters the triage queue. The standard below applies to all environments and all priority levels.</p>

    <div class="br-section-title">Mandatory Jira Fields</div>
    <div class="br-fields-list">${fieldRows}</div>

    <div class="br-section-title" style="margin-top:28px">Escalation Path by Priority</div>
    <p class="ts-intro" style="margin-top:0;margin-bottom:14px">P0 and P1 are not async. Filing the Jira ticket is step one, not the only step.</p>
    <div class="br-esc-grid">${escBlocks}</div>

    <div class="br-section-title" style="margin-top:28px">What is Not a QA Bug</div>
    <div class="br-oos-block">
      <div class="br-oos-label">📌 Out of QA defect scope</div>
      <ul class="br-oos-list">
        ${oosItems.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`;
}

function renderMetrics() {
  const metrics = [
    {
      id: 'TC',
      title: 'Test Case Execution',
      icon: '✅',
      desc: 'Tracks full coverage of the planned test scope: 100% of P0 and P1 test cases executed and passed, zero blocked without documented rationale. If coverage is not complete, the release gate is not met.',
      rows: [
        { label: 'Execution rate', formula: 'Executed TC / Total planned TC × 100', gate: '100% P0+P1 before release', nv: 'All hint type rendering cases + PACS integration cases must be fully executed. Partial execution is not acceptable for P0 coverage.' },
        { label: 'Pass rate', formula: 'Passed TC / Executed TC × 100', gate: '100% P0, ≥95% P1', nv: 'Any P0 failure blocks the release outright. P1 failures require a fix and re-run before sign-off.' },
        { label: 'Blocked rate', formula: 'Blocked TC / Total TC × 100', gate: '0% at release gate', nv: 'Blocked cases typically mean environment or data issues - must be resolved or formally risk-accepted with documented rationale.' },
      ],
    },
    {
      id: 'DEF',
      title: 'Defect Metrics',
      icon: '🐛',
      desc: 'Tracks the health and velocity of the bug funnel. High open P0/P1 count late in a sprint is an early warning signal.',
      rows: [
        { label: 'Open P0 count', formula: 'Count of open P0 Jira tickets', gate: '0 at release', nv: 'If this number is not zero, the release is blocked. No exceptions.' },
        { label: 'Open P1 count', formula: 'Count of open P1 Jira tickets', gate: '0 at release', nv: 'Same gate as P0. A P1 with no fix before release requires formal escalation and documented decision.' },
        { label: 'Defect density', formula: 'Total defects / test cases executed', gate: 'Tracked, no hard threshold yet', nv: 'Used to compare cycles over time. A spike in density after a DICOM ingestion or PACS integration change is a signal to extend coverage in that area.' },
        { label: 'Reopen rate', formula: 'Reopened bugs / Total closed bugs × 100', gate: '<5% target', nv: 'A high reopen rate points to either poor fix quality or insufficient re-test coverage. Both need a root cause conversation.' },
        { label: 'Mean time to close (P0/P1)', formula: 'Sum of (close date - open date) / count', gate: 'P0: same day | P1: within sprint', nv: 'Tracked per sprint to monitor engineering response time on critical defects.' },
      ],
    },
    {
      id: 'COV',
      title: 'Coverage Metrics',
      icon: '🗺️',
      desc: 'Tracks how much of the product is actually covered by tests - by requirement, by feature, and by risk level. The traceability matrix is the source of truth.',
      rows: [
        { label: 'Requirements coverage', formula: 'Requirements with linked TC / Total requirements × 100', gate: '100% P0 requirements', nv: 'Every P0 requirement in the SRS must have at least one passing test case. Gaps here are a direct DHF finding.' },
        { label: 'Hint type coverage', formula: 'Hint types with passing TC / Total defined hint types × 100', gate: '100% before release', nv: 'NV-Sight-specific: if any defined hint type has no test case covering it, the release cannot be signed off.' },
        { label: 'Risk coverage (ISO 14971)', formula: 'Identified risks with mitigating TC / Total identified risks × 100', gate: '100% P0 risks covered', nv: 'Risk items from the ISO 14971 risk file must be traceable to test cases. Unmitigated P0 risks block sign-off.' },
      ],
    },
    {
      id: 'ENV',
      title: 'Environment & Pipeline Health',
      icon: '⚙️',
      desc: 'An unstable test environment produces unreliable results. These metrics flag when environmental noise is distorting test outcomes.',
      rows: [
        { label: 'Environment availability', formula: 'Hours env available / Hours planned × 100', gate: '≥95% during test cycle', nv: 'If the Siemens simulator or PACS test instance is down, test execution stalls. Tracked to quantify impact on schedule.' },
        { label: 'CI pass rate', formula: 'Green CI runs / Total CI runs × 100', gate: '≥90% on main branch', nv: 'A CI pass rate below 90% on main means builds handed to QA are unreliable. Flaky CI needs to be fixed at the source.' },
        { label: 'False positive rate', formula: 'False failure reports / Total failures × 100', gate: '<5%', nv: 'Environment noise or flaky tests producing false P0 failures erode trust in the test suite. Investigated and fixed the same way as real defects.' },
      ],
    },
  ];

  const gates = [
    {
      label: 'Sprint exit',
      cls: 'mg-sprint',
      conditions: [
        'No open P0 or P1 defects',
        'Execution rate ≥ 80% for planned sprint scope',
        'All new test cases reviewed and linked to requirements',
        'Test results logged - no "verbal pass" without a record',
      ],
    },
    {
      label: 'Release candidate',
      cls: 'mg-rc',
      conditions: [
        '100% P0 and P1 test cases executed and passed',
        '100% defined hint types covered by passing test cases',
        'Zero open P0 or P1 defects',
        'All P2 defects either fixed or risk-accepted with written rationale',
        'Traceability matrix updated and reviewed',
        'Environment stable - no outstanding false positives',
      ],
    },
    {
      label: 'Release sign-off (QA)',
      cls: 'mg-signoff',
      conditions: [
        'Full regression suite green',
        'V&V report drafted and reviewed',
        'DHF updated with test results and open risk items',
        'QA lead sign-off documented in Jira and the release record',
        'No open P0 or P1 - no exceptions regardless of business pressure or timeline',
      ],
    },
  ];

  const metricBlocks = metrics.map(m => {
    const rows = m.rows.map(r => `
      <div class="mq-metric-row">
        <div class="mq-metric-label">${r.label}</div>
        <div class="mq-metric-formula">${r.formula}</div>
        <div class="mq-metric-gate">${r.gate}</div>
        <div class="mq-metric-nv">${r.nv}</div>
      </div>`).join('');
    return `
      <div class="mq-group">
        <div class="mq-group-header">
          <span class="mq-group-icon">${m.icon}</span>
          <span class="mq-group-title">${m.title}</span>
        </div>
        <p class="mq-group-desc">${m.desc}</p>
        <div class="mq-metric-table">
          <div class="mq-metric-thead">
            <div>Metric</div><div>Formula</div><div>Gate</div><div>For NV-Sight</div>
          </div>
          ${rows}
        </div>
      </div>`;
  }).join('');

  const gateBlocks = gates.map(g => `
    <div class="mq-gate-block mq-gate-${g.cls.split('-')[1]}">
      <div class="mq-gate-label">${g.label}</div>
      <ul class="mq-gate-list">
        ${g.conditions.map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary set - the specific metrics, thresholds, and reporting cadence will be reviewed and expanded during project onboarding based on the actual tooling, team structure, and release cadence.</strong></p>
    <p class="ts-intro">The metrics below must track three things: full coverage of the planned test scope, defect resolution velocity, and environment stability - each of these must be demonstrable with a number at any release decision point.</p>

    <div class="br-section-title">Metrics by Category</div>
    <div class="mq-groups">${metricBlocks}</div>

    <div class="br-section-title" style="margin-top:28px">Quality Gates</div>
    <p class="ts-intro" style="margin-top:0;margin-bottom:14px">Gates are binary - pass or fail. A gate condition that is "almost met" is a failed gate. Exceptions require documented sign-off from QA lead and Product, not a verbal agreement.</p>
    <div class="mq-gates-row">${gateBlocks}</div>`;
}

function renderTestPlans() {
  const mustHave = [
    {
      title: 'Scope and Objectives',
      what: 'Our goal here: define what this specific test plan covers - which build, which sprint or release, which test levels are included.',
      nvsight: [
        'Each plan is scoped to a specific build version and sprint - not "NV-Sight in general"',
        'Test level is stated explicitly: System testing of the hint delivery pipeline / UAT facilitation at Sheba / Integration testing of PACS handshake - one plan per level',
        'The objective is stated in one sentence: "Validate that all defined hint types are correctly delivered to the physician\'s screen in the Sheba pilot configuration for build v2.4.1"',
        'Out of scope items are listed by name - clinical accuracy validation, Siemens hardware, hospital network - not left implicit',
      ],
    },
    {
      title: 'Test Items',
      what: 'Our goal here: identify exactly what is being tested - build version, component versions, dataset version. Without this, a test report cannot be tied to a specific software state, which breaks the traceability chain required by IEC 62304 and 21 CFR Part 820.',
      nvsight: [
        'NV-Sight build version and commit hash',
        'DICOM dataset version: which de-identified Sheba case set was used, how many cases, which hint types are covered',
        'Siemens angiography simulator version or confirmed firmware version if using the physical Artis',
        'PACS test instance version and configuration snapshot',
        'Operating environment: OS version, client machine spec if relevant to rendering performance',
      ],
    },
    {
      title: 'Features Under Test',
      what: 'Our goal here: list what will be tested in this cycle, mapped to requirements. This is not a repeat of the test scope from the strategy - it is the specific feature list for this build, tied to the SRS requirement IDs that apply.',
      nvsight: [
        'Hint rendering pipeline: all defined hint types (aneurysm marker, occlusion highlight, measurement overlay) - referenced against project requirement IDs (exact format confirmed at onboarding)',
        'PACS session management: connect, disconnect, reconnect, hint persistence through reconnect',
        'DICOM ingestion: single-frame and multi-frame series, edge case DICOM tag sets present in the Sheba dataset',
        'End-to-end latency: time from DICOM frame arrival to hint rendered on screen, measured under clinical-representative data load',
        'Session state: hint state persistence across user interactions and short interruptions',
      ],
    },
    {
      title: 'Features Not Under Test',
      what: 'Our goal here: explicitly state what is not covered by this plan, and why. A blank "not tested" section is not acceptable - it means the author did not think about it, not that everything is covered.',
      nvsight: [
        'Clinical accuracy of AI-generated hints - validated by the clinical team at Sheba, not in QA scope',
        'Algorithm model performance (sensitivity, specificity, AUC) - clinical team and algorithm owner',
        'Siemens Artis hardware and firmware - vendor responsibility',
        'Hospital network infrastructure and third-party PACS systems outside the agreed integration plan',
        'Automated regression coverage - if automation is not yet in place for this cycle, that is stated here, not silently omitted',
      ],
    },
    {
      title: 'Test Types',
      what: 'Our goal here: define which types of testing apply to this project and which are in scope for this specific cycle. Not all types run every sprint - scope is stated explicitly per plan.',
      nvsight: [
        '<strong>Functional</strong> - core type for every cycle. Validates that the hint rendering pipeline, PACS integration, DICOM ingestion, and session management behave per specification.',
        '<strong>UI</strong> - validates overlays, measurement display, and visual correctness of hint positioning on screen. Runs every sprint; full scope before release.',
        '<strong>Performance / Latency</strong> - end-to-end frame-to-hint latency within the clinical window, pipeline throughput. Runs on a defined cadence, not every sprint.',
        '<strong>Security</strong> - test data de-identification (HIPAA), no PHI in any test environment, access control. Confirmed each cycle; full security review at major releases.',
        '<strong>Integration</strong> - PACS connectivity, DICOM ingestion handshake, Siemens API interaction. Joint QA and engineering; runs on every build that touches the integration layer.',
        '<strong>Regression</strong> - re-execution of P0 and P1 test cases after any change. Scope defined per cycle in the test plan: full regression for release, targeted for hotfix.',
        '<strong>Negative / Boundary</strong> - malformed DICOM, PACS disconnect mid-session, algorithm producing no output. System must fail explicitly, never silently.',
        '<strong>Exploratory</strong> - structured sessions on areas changed since the last build. Documented with session notes; findings filed as defects or test cases.',
        '<strong>UAT</strong> - physicians from Sheba execute. QA organises and facilitates. Validates hint delivery from clinical hands. Covered by a separate UAT plan.',
        '<strong>Out of scope for QA:</strong> penetration testing (security vendor), usability research (IEC 62366 - clinical and UX team), load / stress testing beyond defined latency thresholds (not in current project scope).',
      ],
    },
    {
      title: 'Test Approach',
      what: 'Our goal here: describe how testing will be done - what techniques and what execution model.',
      nvsight: [
        'Manual system testing on de-identified DICOM datasets from Sheba - each case selected to cover a specific hint type or edge condition',
        'DICOM sequence replay: same study loaded repeatedly under different conditions (reconnect, delay, data interruption) to validate consistency',
        'Boundary and negative testing for DICOM ingest: malformed tags, unsupported modalities, empty series - system must fail explicitly, not silently',
        'Latency measurement: automated timing logged per frame from DICOM receipt to hint render, reviewed against the clinical threshold defined in the SRS',
        'Exploratory testing allocated for each sprint: structured sessions targeting areas that changed since the last build, documented with session notes',
      ],
    },
    {
      title: 'Entry and Exit Criteria',
      what: 'Our goal here: define the specific gate conditions for this test cycle. These are more concrete than the strategy-level criteria - they are tied to this build and this dataset.',
      nvsight: [
        'Entry: build v[X.X] deployed to QA environment and smoke-tested, de-identified DICOM dataset version [Y] available and confirmed complete, no open P0 defects carried over from previous cycle, QA environment configuration documented',
        'Exit (standard cycle): all planned test cases executed, 100% P0 and P1 pass rate, zero open P0/P1 defects, traceability matrix updated, test execution report signed by QA lead',
        'Exit (hotfix): targeted regression on the changed component + full P0 suite executed and green, risk-acceptance documented for any untested area',
        'A cycle that meets all exit conditions except traceability update is not signed off - the paper trail is part of the deliverable, not optional cleanup',
      ],
    },
    {
      title: 'Suspension and Resumption Criteria',
      what: 'Our goal here: define when testing must be formally stopped mid-cycle and what conditions allow it to resume. This is separate from entry/exit - those govern the start and end of a cycle. Suspension criteria govern unexpected events during execution.',
      nvsight: [
        '<strong>Suspend if:</strong> a P0 defect is found that blocks the hint delivery pipeline or causes system crash mid-session - further test execution on the affected build produces no meaningful results',
        '<strong>Suspend if:</strong> the PACS test instance or Siemens simulator becomes unstable (more than 2 unplanned failures per day) - results logged under those conditions cannot be trusted',
        '<strong>Suspend if:</strong> real patient data is discovered in the test environment - testing stops immediately, HIPAA incident process is initiated',
        '<strong>Suspend if:</strong> the build under test is replaced mid-cycle without QA sign-off - results from the prior build are invalidated',
        '<strong>Resume when:</strong> a hotfix for the P0 is delivered, smoke suite passes on the new build, and the environment is confirmed stable - resumption is documented as a comment in the test cycle record',
        '<strong>Resume when:</strong> environment stability is confirmed by QA and engineering jointly - at least 4 hours of stable operation before test execution restarts',
        'Suspension and resumption events are logged in Jira against the test cycle ticket, with timestamp, reason, and the name of the person making the call',
      ],
    },
    {
      title: 'Test Risks and Contingencies',
      what: 'Our goal here: identify risks to the testing process itself - not product risks, but the things that could prevent QA from executing the plan as written. Each risk has a named mitigation so delays have a documented response, not an improvised one.',
      nvsight: [
        '<strong>Risk: Sheba DICOM dataset not available on time.</strong> Mitigation: use de-identified archive data from prior sprints to cover hint types present in the archive; flag any hint types not covered as a gap in the cycle report. UAT schedule negotiated with Sheba with a minimum 2-week lead time and a confirmed SLA.',
        '<strong>Risk: Siemens angiography simulator unavailable or unstable.</strong> Mitigation: maintain a documented fallback DICOM replay configuration that does not require the physical simulator; integration-layer tests that require the simulator are suspended and rescheduled, not skipped.',
        '<strong>Risk: PACS test instance instability.</strong> Mitigation: environment health is checked at the start of every test day; if instability threshold is hit (2 unplanned failures), testing is suspended per the suspension criteria above and engineering is engaged same-day.',
        '<strong>Risk: Key QA resource unavailable mid-cycle.</strong> Mitigation: test execution log and defect notes are maintained in sufficient detail that another team member can pick up from any point without a handover meeting.',
        '<strong>Risk: Build frequency too high for manual test cycle.</strong> Mitigation: agree with engineering on a build freeze window for the test cycle; QA does not accept a new build mid-cycle without a formal scope impact assessment.',
      ],
    },
    {
      title: 'Test Deliverables',
      what: 'Our goal here: list the artifacts this test cycle must produce. Under 21 CFR Part 820 and IEC 62304, undocumented testing did not happen.',
      nvsight: [
        'Test case execution report: all cases with pass/fail/blocked status, tester, date, build reference',
        'Defect list: all bugs filed during the cycle, with current status at cycle close',
        'Traceability matrix update: requirements linked to test cases, test cases linked to results',
        'Environment configuration log: what was running, at what version, for the duration of the cycle',
        'QA sign-off memo: one-page summary of cycle results, open risks, and the release recommendation - signed by QA lead and stored in the DHF',
      ],
    },
    {
      title: 'Schedule and Resources',
      what: 'Our goal here: state who runs the tests, how long the cycle takes, and what dependencies exist - so delays have a named cause, not a vague "QA is still testing".',
      nvsight: [
        'QA engineer: owns planning, execution, defect filing, and report. For UAT cycles, owns scheduling and facilitation with the Sheba team',
        'Sheba clinical liaison: required for UAT execution and for DICOM dataset selection (they know which cases are clinically representative)',
        'Engineering: available for P0 environment issues and DICOM debug sessions during the cycle - not on standby, but with a defined response time',
        'Cycle duration estimated per sprint size: a full system cycle on a stable build is 3-5 days. A hotfix regression is 1 day. UAT depends on Sheba availability and is planned at least 2 weeks in advance',
      ],
    },
  ];

  const niceToHave = [
    'Automation Coverage Target for This Cycle - which test cases are candidates for automation, expected coverage delta',
    'Test Data Creation and Anonymization Log - how new DICOM cases were selected, de-identified, and validated for use',
    'Defect Triage Schedule - recurring meeting cadence for reviewing open bugs during the cycle',
    'Performance Baseline Comparison - latency results compared to the previous cycle to detect regressions',
    'Third-Party Dependency Tracking - outstanding issues with Siemens simulator, PACS test instance, or Sheba coordination',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">A Test Plan is the document that operationalises the Test Strategy for a specific build and sprint. Where the strategy defines how we test in general, the plan defines what exactly will be tested, by whom, in what environment, and what constitutes done. Under IEC 62304 and 21 CFR Part 820, a test plan is a required DHF artifact - not internal documentation, but a regulatory record.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">Valuable for a mature process but not blockers for the initial framework. Added as the project progresses and patterns emerge.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderTestCases() {
  const mustHave = [
    {
      title: 'Test Case Structure - Mandatory Fields',
      what: 'Our goal here: define what every test case must contain so that any tester can execute it without asking questions, any developer can reproduce from it, and any auditor can trace it. A test case missing mandatory fields is not a test case - it is a note. Under IEC 62304 and 21 CFR Part 820, undocumented or untraceable test cases do not count as V&V evidence.',
      nvsight: [
        '<strong>TC-ID</strong> - unique identifier following the convention [area]-[sequence]: TC-RND-001 (rendering), TC-PAC-001 (PACS), TC-LAT-001 (latency), TC-SEC-001 (security), TC-SES-001 (session). Used for traceability matrix and Jira linking.',
        '<strong>Title</strong> - one sentence, observable behavior: "All defined hint types render on the correct frame after a cold PACS connect." Not "test hint rendering."',
        '<strong>Priority</strong> - P0 / P1 / P2 / P3. Set at authoring time, not after execution. Priority drives regression frequency and release gate conditions.',
        '<strong>Linked requirement</strong> - requirement ID from the project specification documents this test case covers. If no requirement exists, the test case must not be filed - it signals a gap in the specification.',
        '<strong>Preconditions</strong> - the exact system state before step 1: environment, build version, DICOM dataset loaded, session state, any configuration flags.',
        '<strong>Test steps</strong> - numbered, atomic, unambiguous. Each step is one action. No compound steps like "load the study and start the session."',
        '<strong>Expected result</strong> - defined per step or at the end, tied to the spec. "Hint type: Aneurysm marker appears at coordinates [x,y] on frame 14, within 2 seconds of DICOM delivery" - not "hint appears correctly."',
        '<strong>Pass / Fail / Blocked</strong> - the outcome field. Blocked requires a note explaining the blocker. No "in progress" at cycle close.',
        '<strong>Tester and date</strong> - who ran it and when. Required for the execution report.',
        '<strong>Evidence</strong> - screenshot or recording attached for P0 and P1 cases. Optional for P2/P3 unless the result is ambiguous.',
      ],
      label: 'entry',
    },
    {
      title: 'Naming and ID Convention',
      what: 'Our goal here: establish a consistent identifier system so test cases can be referenced unambiguously across the traceability matrix, Jira, and the V&V report. An ad-hoc naming scheme becomes unmanageable the moment a second person joins the project.',
      nvsight: [
        'Format: TC-[AREA]-[NNN] - two to four letter area code, three-digit sequence number with leading zeros',
        'Area codes: RND (rendering), PAC (PACS integration), LAT (latency/performance), SES (session management), SEC (security/data privacy), UI (display and overlays), NEG (negative and boundary)',
        'Sequences are never reused: a retired test case gets a "DEPRECATED" status tag, not a new case in its slot',
        'Jira test case tickets use the TC-ID in the ticket title and as a label for filter queries',
        'Example IDs: TC-RND-001 through TC-RND-0XX for the full rendering suite, TC-PAC-001 for basic PACS connect, TC-NEG-001 for malformed DICOM tag handling',
      ],
    },
    {
      title: 'Preconditions',
      what: 'Our goal here: make sure the test starts from a known state every time. A precondition that is ambiguous or assumed by the author but not written down is a source of inconsistent results - especially critical when the same test case is run by different people or across different build versions.',
      nvsight: [
        'Environment: QA env with Siemens angiography simulator running at version [X], PACS test instance at version [Y], NV-Sight build [Z] installed and smoke-tested',
        'Dataset: DICOM series [Series UID] loaded to PACS test instance, confirmed to contain hint types: [list]. Dataset version noted in the test case header.',
        'Session state: system is at the login screen / case is open / no active session - stated explicitly, not assumed',
        'No carry-over state: if the previous test case could leave residual state (open session, cached data, error flag), a reset step is listed in preconditions',
        'For latency test cases: network conditions noted (local LAN, simulated 10ms delay), no background processes on the client machine that would distort timing',
      ],
    },
    {
      title: 'Test Steps and Expected Results',
      what: 'Our goal here: write steps that are reproducible by anyone on the team, without prior context. The expected result must reference the specification - not the tester\'s memory of how the system worked last sprint. For a medical device, "looks correct" is not an expected result.',
      nvsight: [
        'Each step is one action: "Click [Load Study]" - not "Load the study and wait for hints to appear"',
        'Steps that involve timing include a measurement instruction: "Start the timer when the first DICOM frame is delivered. Stop when the hint overlay is visible on the frame."',
        'Expected results reference the requirement ID: "Hint overlay for Aneurysm marker appears within 2 seconds of DICOM delivery, at the position defined in [REQ-015]." Not "hint appears quickly."',
        'For negative test cases, the expected result is the error: "System displays an alert: \'PACS connection lost. Please reconnect.\' No hints are lost from the current frame." Silence is not an acceptable result for failure conditions.',
        'Multi-step cases where the pass/fail point is at the end still have observable checkpoints in earlier steps - a tester should never be 10 steps in before knowing if something went wrong',
      ],
    },
    {
      title: 'Priority Classification and Regression Frequency',
      what: 'Our goal here: make explicit how priority drives not just the release gate but the frequency of execution. P0 test cases run on every build. P1 runs every sprint. P2 and P3 run on a defined schedule. This is how risk-based testing is operationalised - not as a policy statement, but as a concrete execution cadence.',
      nvsight: [
        'P0 test cases: hint pipeline completeness, silent failure detection, PACS connect/disconnect, system crash recovery - run on every build handed to QA. Any P0 failure blocks the build.',
        'P1 test cases: latency measurement suite, all defined hint types under normal conditions, DICOM ingestion for the standard Sheba dataset - run every sprint cycle.',
        'P2 test cases: edge case DICOM formats, rare rendering scenarios, non-standard Siemens config - run at the start of each major release cycle and when the affected component changes.',
        'P3 test cases: UI layout checks, log completeness, non-critical display elements - run before a full release, skipped for hotfixes.',
        'Regression scope for hotfix: full P0 suite + targeted execution of cases covering the changed component. Scope is documented in the test plan for that hotfix.',
      ],
    },
    {
      title: 'Test Data Requirements',
      what: 'Our goal here: define what DICOM data each test case needs and ensure that data is available, versioned, and compliant. NV-Sight test cases are unusable without a properly prepared DICOM dataset - this is not a dependency that can be deferred.',
      nvsight: [
        'Each test case that requires DICOM data references the dataset by version and series UID - not "use any case from Sheba"',
        'Dataset must cover all defined hint types: if a hint type is not present in the dataset, the test case for that hint type cannot be executed - this is a P0 blocker for test planning',
        'All DICOM data used in testing is de-identified per the de-identification protocol (HIPAA). No real patient data in QA or UAT environments.',
        'Dataset version is logged alongside the test execution result. A result tied to dataset v1 is not automatically valid when dataset v2 is introduced.',
        'Negative test cases that use malformed or edge-case DICOM (missing tags, unsupported modality, empty series) maintain a separate "negative data" set, also versioned and documented.',
      ],
    },
    {
      title: 'Traceability',
      what: 'Our goal here: make it possible to answer three auditor questions at any point in the project: which requirement does this test case cover, which test case covers this requirement, and what was the result of the last execution. Without bidirectional traceability, the V&V report cannot be signed and the DHF is incomplete.',
      nvsight: [
        'Every test case has exactly one "Linked Requirement" field populated. A test case without a requirement link is not filed until the gap is resolved - either the requirement is added to the SRS or the test case is rejected.',
        'Every SRS requirement that has a QA coverage obligation appears in the traceability matrix with at least one linked test case. Requirements with no linked test case are flagged as coverage gaps.',
        'Jira test case tickets are linked to the requirement ticket in Jira. The traceability matrix is generated from this linkage, not maintained as a separate spreadsheet.',
        'When a defect is found, it is linked in Jira to the test case that discovered it. When the defect is fixed and verified, the test case result is updated.',
        'The traceability matrix is updated at the end of each sprint cycle, not at the end of the project. An outdated matrix is a DHF finding.',
      ],
    },
  ];

  const niceToHave = [
    'Automation Candidate Tagging - a label on each test case marking it as a candidate for automation, with an estimated automation effort score',
    'Exploratory Session Charters - structured exploratory testing sessions that complement scripted test cases, with session notes filed as test artifacts',
    'Parametrized Test Case Variants - a single TC-ID with a data table of DICOM variants, covering multiple hint types or series formats without duplicating the full step sequence',
    'Test Case Review and Approval Workflow - a formal review gate before a test case is marked "active," with a second QA reviewer or engineering sign-off for P0 cases',
    'Defect-Triggered Test Case Creation Log - a record of test cases added as a direct result of a bug found in testing, showing coverage improvement over time',
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
        <div class="ts-nvsight-label">${isEntry ? 'Required fields' : 'Our preliminary example'}</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">A test case is the atomic unit of QA work - the smallest thing that can be executed, recorded, and traced. For NV-Sight, test cases are not internal checklists: they are regulatory artifacts that go into the V&V report and the DHF. A test case that cannot be traced to a requirement, or whose expected result cannot be verified without asking the author, is not fit for purpose in this context.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">These practices strengthen the test case suite over time but are not required to start executing and reporting.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderAutomation() {
  return `
    <div class="ov-scope-note" style="margin-bottom:24px">
      <div class="ov-scope-label">📌 Current scope - agreed with CTO</div>
      <p class="ov-scope-text">Automation is not being considered in full scope at this stage of the project. The decision was made jointly with the CTO at the initial interview.</p>
      <p class="ov-scope-text" style="margin-top:10px">The maximum currently on the table: <strong>API tests covering smoke scenarios, or contract testing to run before the smoke suite</strong> - effectively a pre-P0 gate. This catches integration-layer failures before manual testing begins, without committing to a full automation framework.</p>
      <p class="ov-scope-text" style="margin-top:10px">Full automation coverage - framework, test cases, CI integration, and regulatory traceability - will be addressed in a dedicated documentation phase once the project is in a stable state.</p>
      <p class="ov-scope-text ov-scope-key" style="margin-top:12px"><strong>Preliminary stack: Python + Playwright. To be confirmed and adjusted after full project onboarding.</strong></p>
    </div>`;
}

function renderAutomation_UNUSED() { // kept for reference, not called
  const mustHave = [
    {
      title: 'Automation Scope and Boundaries',
      what: 'Our goal here: define what will and will not be automated - before writing a single line of automation code. Automation without a scope decision is a maintenance liability waiting to happen. For a Class C SaMD, the decision is also regulatory: automated test results must be as traceable and auditable as manual ones, which means the framework and its output have to be treated as controlled artifacts.',
      nvsight: [
        '<strong>In automation scope:</strong> P0 smoke suite (pipeline liveness, PACS connect, hint output on known DICOM input), regression suite for stable hint rendering scenarios, latency measurement runs (time from DICOM delivery to hint visible on screen), DICOM ingestion validation for the standard Sheba dataset variants',
        '<strong>Out of automation scope:</strong> UAT - physicians execute UAT manually, automation cannot substitute clinical judgment in that context. Exploratory testing - by definition not scriptable. Visual hint accuracy judgment - a screenshot diff can confirm pixel-level consistency, but whether the hint is correctly placed relative to the anatomy requires a trained eye.',
        'Automation starts with the P0 smoke suite and the core rendering regression. Anything beyond that is a nice-to-have until the manual suite is stable and the DICOM test dataset is finalised.',
        'An automated test that is flaky is worse than no automated test - it erodes trust in the entire suite. Stability is a hard requirement before a test case is added to CI.',
      ],
    },
    {
      title: 'Framework Architecture',
      what: 'Our goal here: define the technical structure of the automation framework - layers, responsibilities, and integration points. The architecture is determined after onboarding and reviewing the existing tech stack. The principles below apply regardless of the specific tools chosen.',
      label: 'entry',
      nvsight: [
        '<strong>Layer 1 - Test runner:</strong> executes test cases, collects results, generates a machine-readable report (JUnit XML or equivalent). Hooks into CI via a standard interface.',
        '<strong>Layer 2 - Domain abstractions:</strong> wrappers for DICOM dataset loading, PACS connection lifecycle, hint capture from the rendering layer. Test cases are written against these abstractions, not against raw APIs - so infrastructure changes do not require rewriting every test.',
        '<strong>Layer 3 - Test data management:</strong> resolves DICOM dataset by version and series UID, injects it into the test environment, tears it down after execution. No hardcoded paths or ad-hoc dataset copies.',
        '<strong>Reporting integration:</strong> results are published to the same system used for manual test tracking. Automated pass/fail must be linkable to the test case ID and the build version - for the traceability matrix and V&V report.',
        'Tool selection (test runner, assertion library, DICOM handling library) is finalised after onboarding. No tool decisions are made here without reviewing the existing engineering stack.',
      ],
    },
    {
      title: 'Test Case Selection for Automation',
      what: 'Our goal here: define clear criteria for which manual test cases become automated. Automating everything is as wrong as automating nothing. The criteria are driven by risk, stability, and return on investment - the same logic as any other QA decision on this project.',
      nvsight: [
        '<strong>Automate if:</strong> the test case is P0 or P1, the steps are fully deterministic (no human judgment in pass/fail), the scenario is executed more than once per sprint, the expected result can be expressed as a machine-verifiable assertion',
        '<strong>Do not automate if:</strong> the expected result requires visual clinical judgment, the test case covers a scenario that changes every sprint (unstable spec), the setup cost of the scenario in an automated context exceeds the manual execution cost over a 6-sprint horizon',
        'Each TC-ID in the test case library gets an "Automation status" field: Automated / Candidate / Manual-only / Deferred. This is maintained alongside the test case itself.',
        'The first automation milestone covers the P0 smoke suite: PACS connect success, at least one hint type rendered on a known frame within latency threshold, silent failure detection (no output triggers an alert, not silence). These three run on every CI build.',
      ],
    },
    {
      title: 'DICOM Test Data in Automation',
      what: 'Our goal here: define how automated tests select, load, and clean up DICOM data. This is the hardest automation challenge for NV-Sight - the test data is not synthetic, it is de-identified clinical data, which means it has versioning, compliance, and reproducibility requirements that generic web automation does not.',
      nvsight: [
        'Automated tests reference DICOM series by ID and dataset version, not by file path. The test data layer resolves the reference to the actual file in the versioned dataset store.',
        'No real patient data in any automated run. The de-identified dataset used by automation is version-controlled alongside the test suite.',
        'Each automated test case declares its DICOM dependencies in a configuration block at the top of the test: dataset version, series UID, expected hint types. This makes the test self-documenting and the dependency auditable.',
        'Test teardown removes any DICOM data loaded during the run from the test PACS instance. No residual state between automated runs - a test that leaves state can corrupt the next run\'s results.',
        'If the required DICOM series is not present in the test environment, the test reports "blocked" with a reason - not "failed." A missing dataset is an environment issue, not a product bug.',
      ],
    },
    {
      title: 'CI/CD Integration',
      what: 'Our goal here: define where automated tests sit in the build pipeline and what happens when they fail. The P0 smoke suite blocking a build is a policy decision that needs to be agreed with engineering before the pipeline is configured - not discovered when the first P0 test fails and blocks a release.',
      nvsight: [
        'P0 smoke suite runs on every build promoted to QA. A failing P0 automated test blocks the build from entering the manual test cycle - the same gate as a manually found P0 defect.',
        'Full regression suite runs on a nightly build trigger, not on every commit. Running the full DICOM replay suite on every commit is too slow to be useful and adds noise to commit-level feedback.',
        'Automated test results are published to the test management system (Jira Xray or equivalent) automatically after each run. The report is linked to the build version. A run with no published report is treated as a failed run.',
        'Flaky test handling: a test that fails intermittently is quarantined (moved to a non-blocking suite) within one sprint of the flakiness being observed. Quarantined tests get a Jira ticket and a fix deadline. A quarantined P0 test is treated as a P1 defect in the framework itself.',
        'The pipeline configuration is version-controlled alongside the test suite. Changes to CI configuration follow the same review process as changes to test cases.',
      ],
    },
    {
      title: 'Results, Reporting, and Traceability',
      what: 'Our goal here: make automated test results as traceable as manual ones. Under 21 CFR Part 820, it does not matter whether the test was run by a human or a script - the result must be linked to a requirement, a build, and a signed record. Automated results that live only in a CI log and are never imported into the test management system are not V&V evidence.',
      nvsight: [
        'Every automated run produces a report in a machine-readable format (JUnit XML). The report is imported into the test management system and linked to the build version and the sprint.',
        'Each automated test case result is linked to the same TC-ID as the corresponding manual test case. There is no separate "automation-only" test case namespace.',
        'When an automated test fails, a Jira defect is opened automatically (or via a defined manual step within one hour). The defect is linked to the TC-ID and the failing build. It goes through the same P0-P3 triage as a manually found defect.',
        'The traceability matrix entry for an automated test case shows "Automated" in the execution method column. This is a positive traceability signal - it means the test case runs more frequently and consistently than its manual equivalent.',
        'Automated test results are included in the QA sign-off memo and the V&V report, with the run timestamp and build reference.',
      ],
    },
    {
      title: 'Maintenance and Stability Standards',
      what: 'Our goal here: prevent the automation suite from becoming a maintenance burden that slows down QA instead of supporting it. Automation debt accumulates faster on medical device projects than on standard software - the regulatory requirement to keep test results trustworthy means a broken or flaky test suite cannot simply be ignored.',
      nvsight: [
        'Every automated test case has an owner: the QA engineer who wrote it. Ownership transfers explicitly when the team changes, not by default.',
        'A test case that breaks due to a product change is updated within the same sprint the change is deployed. A broken test that stays broken for more than one sprint is a process failure, not a backlog item.',
        'Automated tests are reviewed for relevance at the start of each major release cycle. Tests covering deprecated features are retired. Tests covering new P0 requirements are added before the release cycle starts.',
        'A "green CI" that is achieved by disabling or quarantining too many tests is not a green CI. The number of quarantined tests is tracked as a metric and reviewed at sprint planning. More than 10% of P0 automated tests quarantined at any time triggers a framework review.',
        'Automation code is treated as product code: version-controlled, code-reviewed, and not modified directly on the main branch without a PR.',
      ],
    },
  ];

  const niceToHave = [
    'Visual Regression Testing - pixel-level screenshot comparison for hint overlay rendering, flagging rendering changes between builds without human review of every frame',
    'Performance Automation Suite - automated latency measurement across a full DICOM session, with historical trending and threshold alerting in CI',
    'Contract Testing for PACS Integration - schema-level validation of the DICOM/DIMSE interface, independent of full end-to-end runs, running on every commit',
    'Automated Traceability Matrix Generation - a script that queries Jira and generates the current traceability matrix on demand, replacing the manually maintained spreadsheet',
    'Test Execution Dashboard - a live view of automation run status, quarantine count, flakiness rate, and coverage delta across sprints',
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
        <div class="ts-nvsight-label">${isEntry ? 'Architecture principles' : 'Our preliminary example'}</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">Automation is not a goal - it is a tool for making the regression cycle faster and more reliable. For NV-Sight, automation has a specific constraint: the test data is de-identified clinical DICOM, the system under test is a Class C SaMD, and automated results must be as traceable as manual ones. The framework below reflects that context. Tool selection is finalised after onboarding - the architecture and scope principles apply regardless of which tools are chosen.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">Valuable for a mature automation suite. Added after the core regression coverage is stable and the CI pipeline is running reliably.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderDefectWorkflow() {

  // ── Board columns ──────────────────────────────────────────────────────────
  const columns = [
    { label: 'Backlog',               color: '#94a3b8', bg: '#f8fafc' },
    { label: 'New',                   color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Clarification Request', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'To Do Bug',             color: '#ef4444', bg: '#fef2f2' },
    { label: 'To Do Task',            color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'In Progress',           color: '#f97316', bg: '#fff7ed' },
    { label: 'Ready to Test',         color: '#10b981', bg: '#ecfdf5' },
    { label: 'Ready to Deploy',       color: '#0ea5e9', bg: '#f0f9ff' },
    { label: 'Closed',                color: '#475569', bg: '#f1f5f9' },
  ];

  const colsHtml = columns.map(c =>
    `<div class="dw-col-pill" style="border-color:${c.color};background:${c.bg};color:${c.color}">${c.label}</div>`
  ).join('');

  // ── SVG Flowchart ─────────────────────────────────────────────────────────
  // Layout (viewBox 900 x 330):
  //   Top  (cy≈61):  [Clarification Request]
  //   Main (cy≈178): [New] → [To Do Bug / To Do Task] → [In Progress] → [Ready to Test] → [Ready to Deploy] → [Closed]
  //   Bot  (cy≈296): [Backlog]
  //
  // Node x-ranges (left edge, width):
  //   New:            x=10  w=92
  //   To Do Bug:      x=135 w=100  y=145 h=36
  //   To Do Task:     x=135 w=100  y=193 h=36
  //   In Progress:    x=278 w=122  y=158 h=40
  //   Ready to Test:  x=445 w=128  y=158 h=40
  //   Ready to Deploy:x=620 w=138  y=158 h=40
  //   Closed:         x=805 w=88   y=158 h=40
  //   CR:             x=180 w=190  y=42  h=38
  //   Backlog:        x=10  w=92   y=278 h=36

  const svg = `<svg viewBox="0 0 910 330" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:910px;display:block;margin:0 auto">
  <defs>
    <marker id="dw-a"  markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#94a3b8"/></marker>
    <marker id="dw-ag" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#10b981"/></marker>
    <marker id="dw-ar" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#f43f5e"/></marker>
    <marker id="dw-aa" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#f59e0b"/></marker>
  </defs>

  <!-- ── NODES ── -->

  <!-- Clarification Request (top) -->
  <rect x="180" y="42" width="190" height="38" rx="6" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
  <text x="275" y="58" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e" font-family="system-ui,sans-serif">Clarification</text>
  <text x="275" y="72" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e" font-family="system-ui,sans-serif">Request</text>

  <!-- New -->
  <rect x="10" y="158" width="92" height="40" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="56" y="183" text-anchor="middle" font-size="12" font-weight="700" fill="#1d4ed8" font-family="system-ui,sans-serif">New</text>

  <!-- To Do Bug -->
  <rect x="135" y="145" width="100" height="36" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="185" y="160" text-anchor="middle" font-size="9.5" font-weight="700" fill="#991b1b" font-family="system-ui,sans-serif">To Do</text>
  <text x="185" y="174" text-anchor="middle" font-size="9.5" font-weight="700" fill="#991b1b" font-family="system-ui,sans-serif">Bug</text>

  <!-- To Do Task -->
  <rect x="135" y="193" width="100" height="36" rx="6" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="2"/>
  <text x="185" y="208" text-anchor="middle" font-size="9.5" font-weight="700" fill="#5b21b6" font-family="system-ui,sans-serif">To Do</text>
  <text x="185" y="222" text-anchor="middle" font-size="9.5" font-weight="700" fill="#5b21b6" font-family="system-ui,sans-serif">Task</text>

  <!-- In Progress -->
  <rect x="278" y="158" width="122" height="40" rx="6" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="339" y="183" text-anchor="middle" font-size="11" font-weight="700" fill="#c2410c" font-family="system-ui,sans-serif">In Progress</text>

  <!-- Ready to Test -->
  <rect x="445" y="158" width="128" height="40" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
  <text x="509" y="175" text-anchor="middle" font-size="10.5" font-weight="700" fill="#065f46" font-family="system-ui,sans-serif">Ready to</text>
  <text x="509" y="190" text-anchor="middle" font-size="10.5" font-weight="700" fill="#065f46" font-family="system-ui,sans-serif">Test</text>

  <!-- Ready to Deploy -->
  <rect x="621" y="158" width="138" height="40" rx="6" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="2"/>
  <text x="690" y="175" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1" font-family="system-ui,sans-serif">Ready to</text>
  <text x="690" y="190" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1" font-family="system-ui,sans-serif">Deploy</text>

  <!-- Closed -->
  <rect x="808" y="158" width="88" height="40" rx="6" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
  <text x="852" y="183" text-anchor="middle" font-size="11" font-weight="700" fill="#334155" font-family="system-ui,sans-serif">Closed</text>

  <!-- Backlog (bottom, dashed border = holding area) -->
  <rect x="10" y="278" width="92" height="36" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,3"/>
  <text x="56" y="301" text-anchor="middle" font-size="11" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">Backlog</text>

  <!-- ── ARROWS ── -->

  <!-- New → To Do Bug (upper branch from New right edge) -->
  <path d="M102,172 C118,172 118,163 135,163" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- New → To Do Task (lower branch from New right edge) -->
  <path d="M102,186 C118,186 118,211 135,211" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- Label: assign responsible (above the two branches) -->
  <text x="118" y="140" text-anchor="middle" font-size="8" fill="#94a3b8" font-style="italic" font-family="system-ui,sans-serif">assign responsible</text>

  <!-- New → Backlog (future sprint, dashed) -->
  <path d="M56,198 L56,278" stroke="#94a3b8" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#dw-a)"/>
  <text x="68" y="240" text-anchor="start" font-size="8" fill="#94a3b8" font-style="italic" font-family="system-ui,sans-serif">future sprint</text>

  <!-- New → Clarification Request (behavior undefined, amber) -->
  <path d="M56,158 C56,98 214,98 214,80" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#dw-aa)"/>
  <text x="82" y="108" text-anchor="start" font-size="8" fill="#b45309" font-style="italic" font-family="system-ui,sans-serif">behavior undefined</text>

  <!-- Clarification Request → To Do group (resolves as Bug or Task) -->
  <path d="M275,80 C275,118 185,118 185,145" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#dw-aa)"/>
  <text x="246" y="113" text-anchor="middle" font-size="8" fill="#b45309" font-style="italic" font-family="system-ui,sans-serif">→ Bug or Task</text>

  <!-- Ready to Test → Clarification Request (question during testing) -->
  <path d="M509,158 C509,98 372,98 372,80" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#dw-aa)"/>
  <text x="456" y="104" text-anchor="middle" font-size="8" fill="#b45309" font-style="italic" font-family="system-ui,sans-serif">question during testing</text>

  <!-- To Do Bug → In Progress -->
  <path d="M235,163 C257,163 257,172 278,172" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- To Do Task → In Progress -->
  <path d="M235,211 C257,211 257,186 278,186" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- Label: dev lead distributes (between To Do and In Progress) -->
  <text x="257" y="205" text-anchor="middle" font-size="8" fill="#94a3b8" font-style="italic" font-family="system-ui,sans-serif">dev lead</text>
  <text x="257" y="215" text-anchor="middle" font-size="8" fill="#94a3b8" font-style="italic" font-family="system-ui,sans-serif">distributes</text>

  <!-- In Progress → Ready to Test -->
  <path d="M400,178 L445,178" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- Ready to Test → Ready to Deploy (pass, green) -->
  <path d="M573,178 L621,178" stroke="#10b981" stroke-width="2" fill="none" marker-end="url(#dw-ag)"/>
  <text x="597" y="172" text-anchor="middle" font-size="9" fill="#059669" font-weight="700" font-family="system-ui,sans-serif">pass ✓</text>

  <!-- Ready to Deploy → Closed -->
  <path d="M759,178 L808,178" stroke="#94a3b8" stroke-width="1.5" fill="none" marker-end="url(#dw-a)"/>

  <!-- Reopen loop: Ready to Test → In Progress (below row, dashed red) -->
  <path d="M509,198 C509,252 339,252 339,198" stroke="#f43f5e" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#dw-ar)"/>
  <text x="424" y="262" text-anchor="middle" font-size="9" fill="#e11d48" font-weight="600" font-family="system-ui,sans-serif">reopen ↺</text>
</svg>`;

  return `
    <p class="ts-intro">Jira board structure for NV-Sight. <strong>Rejected</strong> and <strong>Won\'t Fix</strong> are labels on Closed tickets - no separate columns. The board stays lean and auditable.</p>

    <div class="dw-col-label">Board Columns</div>
    <div class="dw-cols-strip">${colsHtml}</div>

    <div class="dw-env-note">
      <strong>STG / PROD testing:</strong> when staging or production testing is in scope, the columns <em>Ready to Test</em>, <em>In Progress</em>, and <em>Ready to Deploy</em> are duplicated per environment (e.g. <em>Ready to Test STG</em>, <em>Ready to Deploy PROD</em>). The flow stays the same.
    </div>

    <div class="dw-chart-label">Flow Diagram</div>
    ${svg}

    <div class="dw-flow-notes">
      <div class="dw-flow-note-item">
        <span class="dw-fn-dot" style="background:#94a3b8"></span>
        <span><strong>assign responsible</strong> - at New: QA or PM assigns the ticket owner (developer or team lead) before it moves to To Do or Backlog</span>
      </div>
      <div class="dw-flow-note-item">
        <span class="dw-fn-dot" style="background:#f97316"></span>
        <span><strong>dev lead distributes</strong> - at To Do: the engineering lead assigns the ticket to the developer for the current sprint</span>
      </div>
      <div class="dw-flow-note-item">
        <span class="dw-fn-dot" style="background:#f59e0b"></span>
        <span><strong>Clarification Request</strong> - used when expected behavior is not defined (from New) or a question arises during testing (from Ready to Test). Once resolved, the ticket becomes a Bug or Task and re-enters the main flow</span>
      </div>
      <div class="dw-flow-note-item">
        <span class="dw-fn-dot" style="background:#475569"></span>
        <span><strong>Rejected</strong> - applied as a Jira label on Closed: ticket was not reproducible or filed in error. Reason documented in the ticket. No separate column</span>
      </div>
      <div class="dw-flow-note-item">
        <span class="dw-fn-dot" style="background:#8b5cf6"></span>
        <span><strong>Won\'t Fix</strong> - applied as a Jira label on Closed: P2/P3 risk-accepted with named approver and written rationale. P0/P1 cannot be Won\'t Fixed - release is blocked until resolved</span>
      </div>
    </div>`;
}

function renderReleaseReadiness() {

  // ── Gate checklist blocks ─────────────────────────────────────────────────
  const gates = [
    {
      title: 'QA Gate',
      icon: '✅',
      cls: 'rr-gate-qa',
      items: [
        '100% of P0 and P1 test cases executed and passed on the release build',
        'Zero open P0 defects',
        'Zero open P1 defects',
        'All P2 defects either closed or risk-accepted with written rationale and named approver',
        'Full regression suite completed and green (P0 + P1 scope)',
        'All defined hint types covered by at least one passing test case',
        'Traceability matrix updated: every P0 requirement linked to a passing test case result',
        'No test cases in Blocked status without a documented and accepted reason',
        'Automated P0 smoke suite green on the release build',
      ],
    },
    {
      title: 'Documentation Gate',
      icon: '📄',
      cls: 'rr-gate-doc',
      items: [
        'Test execution report complete: all cases with status, tester, date, build reference',
        'V&V report drafted, reviewed, and signed by QA lead',
        'Traceability matrix exported and included in the DHF package',
        'All P0 and P1 defect ticket histories exported and filed in the DHF',
        'QA sign-off memo written and signed: cycle summary, open risks, release recommendation',
        'Environment configuration log for the test cycle archived',
        'CAPA entries for all P0 defects closed in this cycle reviewed and signed',
        'Won\'t Fix risk-acceptance records for any P2 defects filed in the DHF',
      ],
    },
    {
      title: 'Engineering Gate',
      icon: '⚙️',
      cls: 'rr-gate-eng',
      items: [
        'Code freeze confirmed: no uncommitted changes on the release branch',
        'Release build reproducible from source: the exact build can be regenerated from the tagged commit',
        'SBOM (Software Bill of Materials) updated to reflect the release version',
        'Change log complete: every user-facing change and every bug fix listed with ticket reference',
        'No known security vulnerabilities in the release build above the accepted risk threshold',
        'CI pipeline green on the release branch: all automated checks pass',
        'Deployment runbook reviewed and up to date for the Sheba pilot environment',
      ],
    },
    {
      title: 'Regulatory Gate',
      icon: '⚖️',
      cls: 'rr-gate-reg',
      items: [
        'IEC 62304 lifecycle documentation current for the release version: requirements, architecture, detailed design, test records',
        'ISO 14971 risk file updated: new risks identified during the cycle assessed and mitigated, residual risk acceptable',
        'All open CAPA items from prior releases reviewed - none blocking this release',
        'HIPAA compliance confirmed: no real patient data used in any test artifact included in the release package',
        'Design History File (DHF) updated with all artifacts from this release cycle',
        'If this release introduces a change to the intended use or adds a new hint type: regulatory impact assessment completed',
      ],
    },
    {
      title: 'Stakeholder Sign-offs',
      icon: '✍️',
      cls: 'rr-gate-signoff',
      items: [
        'QA lead: signs the V&V report and the QA sign-off memo. Confirms all QA gate conditions are met.',
        'Engineering lead: confirms code freeze, build integrity, SBOM, and engineering gate conditions.',
        'Product / Regulatory: confirms the release scope matches what was approved, risk file reviewed, no open regulatory actions.',
        'Sign-offs are documented in Jira (release ticket) and in the DHF. Verbal sign-offs are not valid.',
        'All three sign-offs must be in place before the release build is deployed to the Sheba pilot environment. No partial releases.',
      ],
    },
  ];

  const mustHave = [
    {
      title: 'What Release Readiness Means for a Class C SaMD',
      what: 'Our goal here: establish the standard against which every release is measured. For standard software, "ready to release" often means "tests pass and no known critical bugs." For a Class C medical device software, ready to release means all five gate conditions below are met simultaneously - QA, documentation, engineering, regulatory, and stakeholder sign-offs. A release where four of five gates are green is not a release.',
      nvsight: [
        'NV-Sight is used intraoperatively. A software regression that causes hint loss or a silent failure during an active procedure has a direct patient safety consequence. The release bar reflects that.',
        'Release readiness is not a checklist QA completes in isolation. It is a joint confirmation across QA, engineering, and product - each owning their gate, each signing off on their conditions.',
        'Timeline pressure is not a gate condition. A release date that is missed because a P1 defect was found three days before deployment is a normal outcome of a functioning QA process - not a failure of the process.',
        'The release readiness review is a scheduled meeting, not an email chain. It happens after the QA gate is confirmed green, before the deployment. Decisions made at the meeting are logged in the release Jira ticket.',
      ],
    },
    {
      title: 'The Five Gates',
      what: 'Our goal here: present the full set of conditions that must be met before a release is approved. Each gate is binary - met or not met. The conditions within each gate are listed in the Gate Checklist below.',
      label: 'gates',
    },
    {
      title: 'Hotfix Release Path',
      what: 'Our goal here: define the expedited release process for hotfixes, and make explicit what is narrower versus what is the same. A hotfix is not an excuse to skip the regulatory record - it is a scoped release where the QA and documentation scope is narrowed proportionally, but the bar within that scope does not move.',
      nvsight: [
        'Scope definition first: a hotfix release must define its scope in writing before testing starts. "Fix for TC-RND-014 regression introduced in v2.4.1" - not "urgent fix."',
        'QA scope: targeted regression on the changed component + full P0 smoke suite. P1 suite is run if the fix touches a P1 risk area. P2 and P3 suites are not run for a hotfix.',
        'Documentation scope: a hotfix-specific test execution report (not a full cycle report), a brief QA sign-off note referencing the hotfix scope, traceability matrix updated for the affected test cases only.',
        'Defect gate: same as a full release - zero open P0 and P1 defects. No exceptions for "it\'s just a hotfix."',
        'Sign-offs: same three stakeholders, but the sign-off can be completed asynchronously if the hotfix timeline is critical. All three must be documented before deployment.',
        'Regulatory: if the hotfix changes the behaviour of the hint rendering pipeline or PACS integration, an ISO 14971 risk impact assessment is required even on the hotfix path. A one-line patch to a log message does not require this.',
      ],
    },
    {
      title: 'Release Blocking Conditions',
      what: 'Our goal here: list the conditions that block a release outright, with no exception path. These are not judgment calls - they are hard stops. If any of the following is true, the release does not go out, regardless of timeline, business pressure, or how minor the remaining issue appears.',
      nvsight: [
        'Any open P0 defect in the release build',
        'Any open P1 defect in the release build',
        'P0 or P1 test case not executed (blocked cases without accepted rationale count as not executed)',
        'Any defined hint type without a passing test case in the release cycle',
        'V&V report not signed by QA lead',
        'DHF update not completed for this release cycle',
        'Any of the three stakeholder sign-offs missing',
        'ISO 14971 risk file not updated if the release introduces a new feature or changes the hint delivery behaviour',
        'Real patient data found in any test artifact included in the release package',
      ],
    },
  ];

  const niceToHave = [
    'Release Readiness Dashboard - a live Jira-based view of all gate conditions with green/red status, updated automatically as tickets are closed and documents are attached',
    'Automated Gate Verification - CI checks that confirm P0 test suite green, zero open P0/P1 tickets, and traceability matrix timestamp current - before the release meeting is scheduled',
    'Post-Release Monitoring Criteria - defined signals to watch after deployment to the Sheba pilot: hint delivery failure rate, latency anomalies, physician-reported issues',
    'Rollback Criteria and Procedure - conditions under which the release is rolled back (P0 defect discovered post-deployment, critical integration failure at Sheba) and the documented rollback procedure',
    'Release Retrospective Template - a structured debrief after each release covering what blocked the release, what was discovered late, and what process changes would have caught it earlier',
  ];

  const gateGrid = gates.map(g => `
    <div class="rr-gate-block ${g.cls}">
      <div class="rr-gate-header">
        <span class="rr-gate-icon">${g.icon}</span>
        <span class="rr-gate-title">${g.title}</span>
      </div>
      <ul class="rr-gate-list">
        ${g.items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`).join('');

  const sections = mustHave.map(s => {
    if (s.label === 'gates') {
      return `
      <div class="ts-section">
        <div class="ts-section-header">
          <div class="ts-section-title">${s.title}</div>
        </div>
        <div class="ts-section-what">${s.what}</div>
        <div class="rr-gates-grid">${gateGrid}</div>
      </div>`;
    }
    return `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">Release Readiness Criteria define the conditions under which a build is approved for deployment to the Sheba pilot environment. For NV-Sight - a Class C SaMD used intraoperatively - this is not a formality. Every gate condition exists because a gap in any of them creates a patient safety risk, a regulatory exposure, or both.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">Operational maturity improvements for when the core release process is running reliably and the team wants deeper visibility and automation.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderQualityReport() {

  // ── Report structure preview ───────────────────────────────────────────────
  const reportSections = [
    { icon: '📋', label: 'Header',             desc: 'Report type (sprint / release), cycle dates, build version, author, status (Draft / Final)' },
    { icon: '✅', label: 'Execution Summary',  desc: 'Planned vs. executed TCs, pass / fail / blocked counts by priority tier' },
    { icon: '🐛', label: 'Defect Summary',     desc: 'New / closed / carried-over defects by priority, reopen count, mean time to close P0/P1' },
    { icon: '🗺️', label: 'Coverage Summary',  desc: 'Requirements coverage %, hint type coverage %, risk coverage % (ISO 14971)' },
    { icon: '🚦', label: 'Gate Status',        desc: 'Binary green / red for each gate condition: QA, Documentation, Engineering, Regulatory, Sign-offs' },
    { icon: '⚠️', label: 'Open Risks',         desc: "Won't Fix decisions, blocked test cases, outstanding risk-acceptance items, carried-over P2 defects" },
    { icon: '🔍', label: 'Notable Findings',   desc: 'Anything that does not fit the numbers: unexpected failure patterns, environment instability, spec gaps discovered during testing' },
    { icon: '📝', label: 'Recommendation',     desc: 'Explicit Go / No-Go with a one-paragraph rationale. Signed by QA lead.' },
  ];

  const reportCards = reportSections.map(r => `
    <div class="qr-section-card">
      <div class="qr-section-icon">${r.icon}</div>
      <div class="qr-section-body">
        <div class="qr-section-label">${r.label}</div>
        <div class="qr-section-desc">${r.desc}</div>
      </div>
    </div>`).join('');

  const mustHave = [
    {
      title: 'Purpose and Audience',
      what: 'Our goal here: define what the Quality Report is for and who reads it, so it is written at the right level of detail. A report written for an auditor looks different from a report written for a sprint retrospective. For NV-Sight, the Quality Report serves both - it is the QA summary document that goes into the DHF and the main input for the release readiness review meeting.',
      nvsight: [
        'Primary audience: QA lead (author and owner), Engineering lead, Product. Secondary audience: CTO at release review, regulatory affairs if a submission is in scope.',
        'The report is not a raw data dump from Jira. It is a QA lead\'s assessment of the cycle: numbers plus interpretation. A report that lists 97% pass rate without explaining the 3% is not useful.',
        'Two report types: Sprint Quality Report (end of every sprint, internal, 1-2 pages) and Release Quality Report (end of a release cycle, formal DHF artifact, full detail). Both follow the same structure but differ in scope and sign-off requirements.',
        'The report is the QA lead\'s professional judgment on record. It is signed. If the recommendation is Go and a defect is discovered post-deployment, the report is part of the root cause record. If the recommendation is No-Go and the team ships anyway, the report documents the override.',
      ],
    },
    {
      title: 'Report Cadence and Triggers',
      what: 'Our goal here: define when a Quality Report is produced so it is ready when decisions need to be made, not assembled retrospectively after the meeting where the decision happened.',
      nvsight: [
        'Sprint Quality Report: produced within 24 hours of sprint end. Input to sprint retrospective and next sprint planning. Shared with Engineering lead and Product.',
        'Release Quality Report: produced after the QA gate is confirmed green, before the release readiness meeting. Not produced during testing - only when testing is complete.',
        'Hotfix Quality Report: a condensed version covering the targeted regression scope only. Produced same-day for a P0 hotfix. Includes the same Recommendation section.',
        'On-demand: if a significant defect is found mid-cycle that affects the release timeline or a gate condition, a brief interim report is circulated - not as a DHF artifact, but as a decision-support document for the team.',
        'The release readiness meeting is not scheduled until the Release Quality Report is distributed. A meeting without the report is not a release readiness review.',
      ],
    },
    {
      title: 'Report Structure',
      what: 'Our goal here: standardise what goes into every report so readers can find the information they need without reading the whole document. Consistency matters especially for the DHF - an auditor reviewing reports from three different release cycles should be able to compare them at a glance.',
      label: 'structure',
    },
    {
      title: 'Execution and Defect Numbers',
      what: 'Our goal here: define exactly which numbers the report must contain, and how they are calculated. Inconsistent definitions across reports make trend analysis meaningless.',
      nvsight: [
        '<strong>Execution rate:</strong> executed TC / planned TC × 100. Planned = all TCs in scope for this cycle per the test plan. Blocked TCs are executed but counted separately.',
        '<strong>Pass rate (by priority):</strong> passed TC / executed TC × 100, reported separately for P0, P1, P2, P3. A combined pass rate that hides a P0 failure is not acceptable.',
        '<strong>Defect counts:</strong> new defects filed this cycle, defects closed this cycle, defects carried over from prior cycles - all broken down by P0/P1/P2/P3. Not a single total.',
        '<strong>Reopen rate:</strong> reopened bugs / total closed bugs × 100 for the cycle. A reopen rate above 5% is flagged in Notable Findings with a root cause comment.',
        '<strong>Mean time to close (P0 / P1):</strong> calculated per cycle, compared to the prior cycle. An increasing trend is a signal worth explaining.',
        'All numbers are pulled from Jira at a defined timestamp (end of last test execution day). The timestamp is stated in the report header. Numbers that change between report generation and the release meeting are noted as an addendum, not silently updated.',
      ],
    },
    {
      title: 'Coverage and Gate Status',
      what: 'Our goal here: give the reader a clear, unambiguous view of how much of the product was tested and whether the release gates are met. Coverage percentages without context are noise; gate status without supporting numbers is just a colour.',
      nvsight: [
        'Requirements coverage: number and percentage of P0 requirements with at least one passing TC. Any P0 requirement below 100% coverage is a release blocker - flagged in red in the report.',
        'Hint type coverage: explicitly listed by hint type name, not as an aggregate percentage. "Aneurysm marker: ✅ Occlusion highlight: ✅ Measurement overlay: ✅" - not "100% hint coverage." If any type is missing, that is visible immediately.',
        'Risk coverage: percentage of ISO 14971 risk items with a mitigating test case result. New risk items identified during the cycle are listed by name.',
        'Gate status table: one row per gate (QA / Documentation / Engineering / Regulatory / Sign-offs), one column per condition, green or red cell. No "partial" - a condition is either met or it is not.',
        'If a gate has a red cell, the report explains what is needed to turn it green and who owns the action. The report does not recommend Go with a red gate cell.',
      ],
    },
    {
      title: 'Go / No-Go Recommendation',
      what: 'Our goal here: make the QA lead\'s position explicit, in writing, before the release decision is made. The recommendation is not a consensus output of the release meeting - it is QA\'s input to that meeting. The meeting can override QA\'s recommendation, but that override must also be documented.',
      nvsight: [
        'Format: "Recommendation: GO / NO-GO. [One paragraph rationale citing the specific gate conditions that are met or not met.]"',
        'A Go recommendation means all five gates are confirmed green by the QA lead at the time of writing. If anything changes between report issue and release, the recommendation is revisited.',
        'A No-Go recommendation lists the specific blocking conditions by name: "P1 defect TC-PAC-017 open, hint type coverage incomplete for Measurement overlay - release blocked until both are resolved."',
        'If the business decides to ship against a No-Go recommendation, the override decision is documented in the release Jira ticket by the person authorising the override, with their name and reason. The QA report is not amended.',
        'For NV-Sight specifically: a No-Go recommendation from QA on a P0 or P1 defect cannot be overridden by business or timeline pressure. The only path forward is fixing the defect.',
      ],
    },
  ];

  const niceToHave = [
    'Sprint-over-Sprint Trend Table - pass rate, defect density, and coverage delta across the last 4-6 sprints in a single view, used to spot degradation before it becomes a release problem',
    'Component-Level Quality Breakdown - execution and defect numbers split by component (rendering pipeline, PACS integration, session management) to identify which area is generating the most risk',
    'Automated Report Generation - a Jira query + script that pulls the numbers and populates the report template, leaving only the Notable Findings and Recommendation sections for the QA lead to write',
    'Defect Aging Heatmap - a visual showing how long open defects have been open by priority, useful for identifying stale P2 items that are accumulating risk',
    'Post-Release Quality Report - a brief follow-up 2 weeks after deployment: any defects reported by the Sheba team, latency observations, any physician-reported display issues',
  ];

  const sections = mustHave.map(s => {
    if (s.label === 'structure') {
      return `
      <div class="ts-section">
        <div class="ts-section-header">
          <div class="ts-section-title">${s.title}</div>
        </div>
        <div class="ts-section-what">${s.what}</div>
        <div class="qr-sections-grid">${reportCards}</div>
      </div>`;
    }
    return `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro">The Quality Report is the QA lead's signed assessment of a test cycle - numbers, interpretation, and a Go / No-Go recommendation. It is the primary input to the release readiness meeting and a required DHF artifact for every release cycle. It is not a Jira export or a dashboard screenshot: it is a professional judgment document that puts the QA lead's name on a position.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">Reporting enhancements that add trend visibility and reduce manual effort. Added once the base report structure is stable and producing consistent outputs.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderTraceability() {

  // ── Sample matrix rows ─────────────────────────────────────────────────────
  const sampleRows = [
    { req: 'REQ-001', desc: 'System shall deliver hint overlay within 3 s of DICOM frame arrival', pri: 'P0', tcs: 'TC-LAT-001, TC-RND-001', type: 'System, Perf', gap: false },
    { req: 'REQ-002', desc: 'System shall not terminate abnormally during an active procedure session', pri: 'P0', tcs: 'TC-SES-001', type: 'System', gap: false },
    { req: 'REQ-003', desc: 'PACS connection shall be established within 10 s of session start', pri: 'P1', tcs: 'TC-PAC-001', type: 'Integration', gap: false },
    { req: 'REQ-004', desc: 'Hint overlay position shall match coordinates defined in specification', pri: 'P0', tcs: 'TC-RND-002', type: 'System', gap: false },
    { req: 'REQ-005', desc: 'System shall handle malformed DICOM input without crashing', pri: 'P1', tcs: 'TC-NEG-001', type: 'Negative', gap: false },
    { req: 'REQ-00N', desc: 'Requirement pending specification', pri: '-', tcs: '⚠ Coverage gap - no TC filed', type: '-', gap: true },
  ];

  const tableRows = sampleRows.map(r => {
    const priHtml = (r.pri === '-')
      ? `<span class="trc-pri trc-pri-na">${r.pri}</span>`
      : `<span class="trc-pri trc-pri-${r.pri.toLowerCase()}">${r.pri}</span>`;
    return `<tr class="${r.gap ? 'trc-gap-row' : ''}">
      <td class="trc-td trc-td-req">${r.req}</td>
      <td class="trc-td trc-td-desc">${r.desc}</td>
      <td class="trc-td trc-td-pri">${priHtml}</td>
      <td class="trc-td trc-td-tc">${r.tcs}</td>
      <td class="trc-td trc-td-type">${r.type}</td>
    </tr>`;
  }).join('');

  // ── Content sections ───────────────────────────────────────────────────────
  const mustHave = [
    {
      title: 'Structure and Purpose',
      what: 'The traceability matrix answers the auditor\'s first question: show me the chain from requirement to test case to test result. For a Class C SaMD under 21 CFR Part 820 and IEC 62304, a gap in this chain is a gap in the submission. The matrix is not a reporting tool - it is the legal record that testing happened and what was covered.',
      nvsight: [
        'Columns: Requirement ID, Requirement description, Priority (P0-P3), linked Test Case ID(s), Test Type (System / Integration / Performance / Negative), Execution status, Last result.',
        'Every requirement with a QA coverage obligation has a row. Requirements with no linked test case are flagged as coverage gaps - not omitted silently.',
        'Priority column uses the same P0-P3 scale from the Test Strategy. A P0 requirement with no passing test result blocks release regardless of anything else.',
        'The matrix is generated from Jira linkage (requirement ticket linked to test case ticket), not maintained as a separate spreadsheet. A standalone spreadsheet drifts out of sync within two sprints.',
      ],
    },
    {
      title: 'Coverage Gaps',
      what: 'A coverage gap means either the requirement is not tested (a risk) or the test case exists but is not linked (a traceability failure). Both need resolution before the matrix is used in a release decision. The acceptable reason for a gap at release is narrow.',
      nvsight: [
        'Gap handling rule: if a P0 or P1 requirement has no linked test case at sprint close, QA lead files a blocking task before the release gate review. No exceptions.',
        'Accepted reasons for a gap at release: requirement is formally marked out of scope with written rationale in the DHF, or the requirement was added after the test cycle closed and is deferred to the next cycle with a documented risk acceptance.',
        'P2 and P3 gaps at release: documented in the release readiness report with a brief rationale. Not a release blocker unless the gap introduces a patient safety risk.',
        'Coverage percentage reported in the Quality Report = (requirements with at least one passing TC) / (total requirements with QA obligation) x 100. Comes directly from this matrix.',
      ],
    },
    {
      title: 'Update Cadence and Ownership',
      what: 'A matrix updated only at submission time is a reconstruction, not a living record. IEC 62304 expects the matrix to reflect the actual state of the project at any point during development. An FDA inspector or notified body auditor can request it at any time - not just at submission.',
      nvsight: [
        'Matrix is updated at the end of each sprint cycle as part of the sprint close checklist. QA lead owns the update.',
        'Engineering is responsible for linking requirement tickets to implementation tickets in Jira. QA is responsible for linking test case tickets to requirement tickets and maintaining execution status.',
        'Execution result column is updated immediately after each test cycle closes - not batched at end of release. An outdated result column is a DHF finding.',
        'Any requirement change (scope update, clarification, removal) triggers a matrix review before the next cycle. Linked test cases are updated or flagged for rewrite.',
      ],
    },
    {
      title: 'Use in V&V Report and DHF',
      what: 'The traceability matrix is not standalone - it is embedded in both the V&V Report and the Design History File. Understanding how it is consumed downstream determines what level of detail each column needs and how strictly the update cadence must be enforced.',
      nvsight: [
        'V&V Report: matrix is included as an appendix showing requirement coverage at the time of the release decision. The report narrative references specific matrix rows for all P0 requirements.',
        'DHF: the matrix is part of the design verification and validation records. FDA expects to see that it was maintained throughout development, not assembled before submission.',
        'CAPA linkage: if a P0 or P1 defect is closed as Won\'t Fix or remains open at release, the corresponding matrix row is annotated with the CAPA ticket reference and risk acceptance rationale.',
        'Audit readiness: at any point during the project, QA lead must be able to produce a current matrix on request. A Jira export query is sufficient - no proprietary tooling required.',
      ],
    },
  ];

  const niceToHave = [
    'Automated matrix generation - a Jira query or script that exports requirement-to-TC linkage and execution status on demand, eliminating manual updates',
    'Coverage dashboard - a live view of coverage percentage by priority level (P0 / P1 / P2 / P3), updated after each test run',
    'Change impact tracking - when a requirement changes, the matrix automatically flags all linked test cases as "needs review" in Jira',
    'Bi-directional traceability report - from requirement down to test case and result, and from any test case up to the requirements it covers',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - requirement IDs and test case IDs are placeholders. The actual matrix is built during onboarding once the SRS is available and Jira is configured.</strong></p>
    <p class="ts-intro">The traceability matrix is the spine connecting the test case library to the V&V Report and the DHF. For NV-Sight as a Class C SaMD, a gap in the matrix is a gap in the submission.</p>

    <div class="trc-sample-label">Sample Structure (illustrative - not final data)</div>
    <div class="trc-table-wrap">
      <table class="trc-table">
        <thead>
          <tr>
            <th class="trc-th">Req ID</th>
            <th class="trc-th">Requirement</th>
            <th class="trc-th">Pri</th>
            <th class="trc-th">Test Case(s)</th>
            <th class="trc-th">Test Type</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>

    <div class="trc-internal-note">
      <span class="trc-internal-icon">📌</span>
      <div>
        <strong>Internal tracking matrices</strong> - alongside the regulatory traceability matrix, we maintain separate lightweight matrices for internal needs: requirements coverage progress, test case writing status, test execution progress per sprint, and defect resolution rate. These give every team member and stakeholder a clear picture of where we are, what is in scope for the current sprint, and what remains. Not regulatory artifacts - operational visibility tools.
      </div>
    </div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Tooling improvements that reduce manual effort once the base matrix is stable.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderVnVReport() {

  // ── Report sections visual ─────────────────────────────────────────────────
  const reportSections = [
    { icon: '📋', label: 'Executive Summary',      desc: 'Release decision, scope, outcome, open items' },
    { icon: '🔗', label: 'Traceability Matrix',    desc: 'Requirement - test case - result chain, coverage %' },
    { icon: '📊', label: 'Test Execution Summary', desc: 'Cycles run, pass/fail counts by priority, blocked items' },
    { icon: '🐛', label: 'Defect Summary',         desc: 'P0-P3 counts, open/closed, Won\'t Fix rationale' },
    { icon: '⚠️', label: 'Risk Acceptance Log',    desc: 'Every P2 Won\'t Fix with named approver and rationale' },
    { icon: '✍️', label: 'QA Sign-off',            desc: 'QA lead signature, date, build version, environment' },
  ];

  const sectionCards = reportSections.map(s => `
    <div class="vnv-section-card">
      <div class="vnv-section-icon">${s.icon}</div>
      <div class="vnv-section-body">
        <div class="vnv-section-label">${s.label}</div>
        <div class="vnv-section-desc">${s.desc}</div>
      </div>
    </div>`).join('');

  const mustHave = [
    {
      title: 'What the Report Covers',
      what: 'The V&V Report is the formal record that a specific build of NV-Sight was tested against its requirements and the results met the release criteria. It is the QA deliverable that goes into the DHF and is reviewed by FDA or a notified body. The report documents what was tested, against which requirements, with which results, and who signed off.',
      nvsight: [
        'Scope: every test cycle run against the release candidate build. Includes System, Integration, Performance, Negative, and Regression cycles. UAT results from the Sheba site are referenced as a separate appendix if available.',
        'Build identification: exact build version, component versions, DICOM dataset version, and test environment configuration are listed in the report header. A report without a build version cannot be filed in the DHF.',
        'Coverage statement: the report states the percentage of P0 and P1 requirements covered by at least one passing test case. For NV-Sight, the target is 100% P0 and 100% P1 at release. Any gap is listed with written rationale.',
        'Time-bounded: the report covers a specific test cycle with defined start and end dates. Open items at cycle close are listed with status - not quietly dropped.',
      ],
    },
    {
      title: 'Defect Summary and Risk Acceptance',
      what: 'The defect summary in the V&V Report is not a raw Jira export. It is a structured narrative that gives a decision-maker enough information to assess risk. Every open item at release must have a disposition - fixed, deferred with rationale, or risk-accepted with named approver.',
      nvsight: [
        'Table format: Defect ID, Summary, Priority, Status (Closed / Open / Won\'t Fix), Root cause category, Disposition at release.',
        'P0 and P1 defects: all must be Closed at release. If any P0 or P1 remains open, the release does not proceed. This is stated explicitly in the report.',
        'P2 Won\'t Fix: each entry includes the written rationale, the named approver (QA lead and Product), and a brief clinical risk statement - what is the consequence of this defect remaining open.',
        'Root cause categories are used to identify systemic issues: if three P1 defects in one release share the same root cause category, that is flagged in the Executive Summary as a process risk.',
      ],
    },
    {
      title: 'QA Sign-off and Release Decision',
      what: 'The V&V Report ends with a QA sign-off statement. This is not a formality - it is the QA lead\'s formal attestation that the testing was conducted as described, the results are accurate, and the build meets the defined release criteria. For a Class C SaMD, this document is a regulated artifact.',
      nvsight: [
        'Sign-off format: "I confirm that the testing described in this report was conducted on build [X.Y.Z] in environment [STG / PROD], that the results recorded are accurate, and that the release criteria defined in the Release Readiness Criteria document have been met / not met as noted above." Signed by QA lead, dated.',
        'If release criteria are not fully met (e.g. a P2 gap remains), the sign-off is conditional: it states what is open, what the risk acceptance decision was, and who approved it. A conditional sign-off is still a valid sign-off - it is honest documentation.',
        'Engineering and Product sign-offs are collected separately. QA sign-off is independent - QA does not co-sign with engineering on the same statement. Independence of the QA attestation is important for regulatory credibility.',
        'The signed report is stored in the DHF. Version control applies: the signed report for a given release is never overwritten. If a hotfix release follows, a new report is filed for the hotfix build.',
      ],
    },
    {
      title: 'Cadence - Sprint Reports vs. Release Reports',
      what: 'Two types of V&V reports exist in the project lifecycle. Mixing them up or skipping the sprint-level reports creates a gap in the DHF that is difficult to explain at audit.',
      nvsight: [
        'Sprint test cycle report: produced at the end of each sprint cycle. Covers only the test cases executed in that cycle. Not a release document - it is an internal QA record that feeds into the release report.',
        'Release V&V Report: produced for each release candidate. Aggregates results across all sprint cycles since the last release. This is the DHF artifact.',
        'Hotfix report: a condensed version covering only the hotfix scope - the specific test cases retested for the fix, the regression subset, and the QA sign-off. Filed as a separate DHF entry, not appended to the prior release report.',
        'Timing: the release V&V Report is finalized before the release meeting, not after. The release meeting reviews the report, not the raw test data. An unsigned report at the release meeting means the release is deferred.',
      ],
    },
  ];

  const niceToHave = [
    'Templated report generation - a script that populates the V&V Report structure from Jira data (test cycle results, defect list, traceability matrix export), reducing manual assembly time',
    'Automated executive summary metrics - pass rate, defect counts, and coverage percentage pulled directly from Jira at cycle close, inserted into the report template',
    'Digital sign-off workflow - an approval chain in Jira or a document system that captures QA, Engineering, and Product sign-offs with timestamps, replacing manual signature collection',
    'Sprint report archive - all sprint cycle reports stored and indexed in the DHF folder with consistent naming, so the release report can reference them by ID',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - report templates and exact sign-off format will be confirmed with the compliance consultant during onboarding.</strong></p>
    <p class="ts-intro">The V&V Report is the formal record that a specific build was tested against its requirements and the results met the release criteria. It goes into the DHF and is what an FDA reviewer or notified body auditor reads to assess QA rigor. The structure must be right from the first release - reconstructing it retroactively is not a viable option.</p>

    <div class="vnv-vs-note">
      <span class="vnv-vs-icon">💡</span>
      <div><strong>V&V Report vs. Quality Report</strong> - the V&V Report is a regulatory artifact written for FDA and auditors: formal, signed, filed in the DHF, answers "does this build meet its requirements?" The Quality Report is an operational document written for the team and leadership: live metrics, sprint trends, defect velocity - answers "how are we doing right now?" They share some data but serve different audiences and have different legal weight.</div>
    </div>

    <div class="trc-sample-label">Report Structure</div>
    <div class="vnv-sections-strip">${sectionCards}</div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Tooling and workflow improvements to reduce manual report assembly effort.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderRiskContrib() {

  // ── Risk model visual ──────────────────────────────────────────────────────
  const riskRows = [
    { hazard: 'Pipeline crash during active procedure', situation: 'Hints not rendered, physician loses AI support mid-procedure', harm: 'Procedural delay or suboptimal decision without hint guidance', sev: 'S4', prob: 'P2', level: 'High', mitigation: 'Session watchdog, automatic reconnect, P0 test coverage on crash scenarios' },
    { hazard: 'Hint rendered at wrong position', situation: 'Marker overlaid on incorrect anatomical location', harm: 'Physician acts on misleading spatial information', sev: 'S4', prob: 'P2', level: 'High', mitigation: 'Coordinate validation tests (TC-RND-002), diff against reference overlay' },
    { hazard: 'Silent DICOM delivery failure', situation: 'Frames dropped, hints not generated, no error shown', harm: 'Physician operates without hints, unaware of failure', sev: 'S3', prob: 'P3', level: 'Medium', mitigation: 'DICOM receipt confirmation, negative tests for malformed input (TC-NEG-001)' },
    { hazard: 'Latency spike exceeding 3 s threshold', situation: 'Hint arrives after physician has already acted on the frame', harm: 'Hint becomes irrelevant or actively misleading if anatomy moved', sev: 'S3', prob: 'P2', level: 'Medium', mitigation: 'Performance test suite (TC-LAT-001), load and stress scenarios' },
    { hazard: 'PACS session drop without recovery', situation: 'QA cannot test PACS-dependent scenarios in staging', harm: 'Untested integration path goes to production', sev: 'S2', prob: 'P3', level: 'Low', mitigation: 'PACS mock/replay for integration tests, real PACS tested at Sheba SAT' },
  ];

  const levelColor = { 'High': 'rc-level-high', 'Medium': 'rc-level-med', 'Low': 'rc-level-low' };

  const tableRows = riskRows.map(r => `
    <tr>
      <td class="trc-td rc-td-hazard">${r.hazard}</td>
      <td class="trc-td rc-td-sit">${r.situation}</td>
      <td class="trc-td rc-td-harm">${r.harm}</td>
      <td class="trc-td rc-td-sev">${r.sev}</td>
      <td class="trc-td rc-td-prob">${r.prob}</td>
      <td class="trc-td rc-td-level"><span class="rc-level ${levelColor[r.level]}">${r.level}</span></td>
      <td class="trc-td rc-td-mit">${r.mitigation}</td>
    </tr>`).join('');

  const mustHave = [
    {
      title: 'QA Role in Risk Management',
      what: 'QA does not own the risk file - that is engineering and product. But QA provides the evidence that risk controls work. Every risk mitigation measure that can be tested must have a corresponding test case and a test result. Without that evidence, the risk control is a claim, not a demonstrated fact.',
      nvsight: [
        'QA contribution to ISO 14971: for each risk control in the risk file that involves software behavior, QA provides test case IDs and execution results as the evidence of control effectiveness.',
        'Failure modes identified during testing that are not in the existing risk analysis are flagged to engineering immediately. A new failure mode found in testing is a potential new hazard - it goes into the risk file, not just into Jira.',
        'Patient-safety-relevant defects (hint rendering failure during procedure scenarios) are tagged with the label "patient-safety-relevant" in Jira regardless of priority. This label triggers inclusion in the ISO 14971 risk review at the next release cycle.',
        'QA does not accept a risk control as "tested" based on a passing happy-path test alone. Mitigation tests specifically target the failure mode the control is meant to prevent.',
      ],
    },
    {
      title: 'High-Risk Scenarios and Test Coverage',
      what: 'For NV-Sight, the two highest-risk scenarios are pipeline crash during an active procedure and a hint rendered at the wrong position. These are the scenarios where a system failure directly impacts the physician\'s situational awareness at a critical moment. Both require dedicated test coverage, not just incidental coverage.',
      nvsight: [
        'Pipeline crash: TC-SES-001 covers forced session termination and recovery. The test confirms that the system either recovers gracefully or makes the failure visible to the operator - silent failure is not an acceptable outcome.',
        'Wrong hint position: TC-RND-002 compares rendered overlay coordinates against the specification reference. Any deviation beyond tolerance is a P0 defect regardless of how small the offset looks visually.',
        'Silent DICOM failure: TC-NEG-001 injects malformed and incomplete DICOM input and confirms the system responds with a visible error, not a silent drop. A system that silently discards frames fails the safety requirement.',
        'Latency: TC-LAT-001 measures end-to-end hint delivery time under normal load. TC-LAT-002 measures under peak load. Both must pass before a release that ships to a live procedure environment.',
      ],
    },
    {
      title: 'Probabilistic and AI-Specific Risk Considerations',
      what: 'NV-Sight is an AI/ML system. Classic pass/fail testing is not sufficient to characterize its failure modes. Some failures are probabilistic - the system may produce incorrect hints on a subset of inputs, not deterministically on all inputs. The risk analysis and test coverage must account for this.',
      nvsight: [
        'QA scope boundary: NV-Sight QA validates the hint delivery pipeline - correct DICOM ingestion, correct rendering, correct latency, correct session management. Clinical accuracy of the hints (whether the AI model is medically correct) is validated by clinical teams at Sheba, not by QA.',
        'Dataset representativeness: test DICOM datasets must cover the range of inputs the system will see in production - multiple hint types, multiple series formats, edge-case anatomy. A dataset that only covers the most common case leaves tail-risk untested.',
        'Failure mode taxonomy for AI: in addition to functional pass/fail, QA tracks failure categories - rendering failure, delivery failure, latency failure, session failure. Tracking by category across sprints identifies which components carry the most residual risk.',
        'Confidence intervals: for performance-sensitive requirements (latency thresholds), a single passing test run is not sufficient evidence. Multiple runs across varied conditions are required, with mean and p95 latency both within threshold.',
      ],
    },
    {
      title: 'Risk File Synchronization',
      what: 'The risk file and the test case library must stay synchronized. Any change to either one without updating the other creates a gap between what is documented as mitigated and what is actually tested. This gap is the most common audit finding for AI medical device submissions.',
      nvsight: [
        'Sprint close checklist includes: any new failure modes found this sprint flagged to engineering for risk file review, any new risk controls added to the risk file this sprint reviewed by QA for test coverage.',
        'Risk file version referenced in the V&V Report: the report states the version of the risk file current at the time of the release decision. If the risk file was updated after testing closed, a delta review is conducted before sign-off.',
        'Removed or changed risk controls: if a risk control changes (e.g. the mitigation strategy for latency is revised), QA reviews whether the existing test cases still adequately test the new control. Outdated test cases are updated before the next cycle.',
        'Residual risk statement: the V&V Report includes a brief statement that all risk controls with QA test obligations have been exercised and the results are as recorded in the traceability matrix. This is the QA contribution to the residual risk evaluation.',
      ],
    },
  ];

  const niceToHave = [
    'Risk-tagged test cases - a Jira label on every test case linking it to the specific ISO 14971 risk control it validates, enabling automatic coverage reporting per risk item',
    'Failure mode trend tracking - sprint-over-sprint view of which failure categories (rendering, delivery, latency, session) are generating the most defects, used to prioritize risk file updates',
    'New hazard notification workflow - a Jira automation that flags any defect tagged "patient-safety-relevant" to the risk file owner for review within one business day',
    'Residual risk dashboard - a view showing each risk control, its current test status, and last execution result, updated after each sprint cycle',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - the risk file is owned by engineering and product. This section describes the QA contribution: test evidence for risk controls. Specific hazard IDs and control references will be aligned with the actual risk file during onboarding.</strong></p>

    <p class="ts-intro">Risk assessment serves two audiences simultaneously.<br><br>
      1) For the team - it is an early warning system: knowing which failure scenarios carry the highest risk determines where to focus testing effort first, before a single test case is written.<br><br>
      2) For regulators - it is a required submission artifact: <a href="https://www.iso.org/standard/72704.html" target="_blank" class="slide-ext-link">ISO 14971:2019</a> requires that every identified risk has a documented control, and every control has evidence that it works.<br><br>
      QA provides that evidence through test results. A risk control without a passing test case is an unverified claim - it cannot be included in the residual risk evaluation that goes to FDA.</p>

    <div class="trc-sample-label">Risk File Lifecycle</div>
    <div class="ra-lifecycle">
      <div class="ra-lc-step ra-lc-1">
        <div class="ra-lc-num">1</div>
        <div class="ra-lc-body">
          <div class="ra-lc-title">Before development starts</div>
          <div class="ra-lc-desc">Engineering and product identify obvious failure scenarios from the spec. For NV-Sight: pipeline crash, wrong hint position, silent DICOM loss. This is the initial risk file - written before any code exists.</div>
        </div>
      </div>
      <div class="ra-lc-arrow">→</div>
      <div class="ra-lc-step ra-lc-2">
        <div class="ra-lc-num">2</div>
        <div class="ra-lc-body">
          <div class="ra-lc-title">During development</div>
          <div class="ra-lc-desc">New risks are added as the team discovers them - when engineering implements something and sees a new failure mode, or when QA finds something in testing that was not anticipated. The risk file grows with the product.</div>
        </div>
      </div>
      <div class="ra-lc-arrow">→</div>
      <div class="ra-lc-step ra-lc-3">
        <div class="ra-lc-num">3</div>
        <div class="ra-lc-body">
          <div class="ra-lc-title">QA closes the loop</div>
          <div class="ra-lc-desc">Every risk control in the file that can be tested gets a test case and a result. This is QA's contribution to the risk file - not writing risks, but providing the evidence that each mitigation actually works.</div>
        </div>
      </div>
      <div class="ra-lc-arrow">→</div>
      <div class="ra-lc-step ra-lc-4">
        <div class="ra-lc-num">4</div>
        <div class="ra-lc-body">
          <div class="ra-lc-title">At release</div>
          <div class="ra-lc-desc">The risk file is reviewed: every risk has a control, every control has a test result. Residual risk is evaluated and accepted by the team. This package goes into the DHF and is what FDA reviews during submission.</div>
        </div>
      </div>
    </div>

    <div class="ra-mitigation-example">
      <div class="ra-mit-label">💡 What "evidence that mitigation works" looks like in practice</div>
      <div class="ra-mit-body">
        <div class="ra-mit-row">
          <span class="ra-mit-key">Risk in file</span>
          <span class="ra-mit-val">Pipeline crash during active procedure</span>
        </div>
        <div class="ra-mit-row">
          <span class="ra-mit-key">Mitigation</span>
          <span class="ra-mit-val">Session watchdog + automatic reconnect</span>
        </div>
        <div class="ra-mit-row">
          <span class="ra-mit-key">Evidence (QA)</span>
          <span class="ra-mit-val">TC-SES-001: QA forces connection drop in test environment and confirms the system either recovers or shows a visible error to the operator. Test result logged with date, build, and QA sign-off.</span>
        </div>
        <div class="ra-mit-row">
          <span class="ra-mit-key">Without this</span>
          <span class="ra-mit-val">The mitigation exists on paper only. FDA can reject the submission: "you claim the watchdog protects against crash - show us the test that proves it."</span>
        </div>
      </div>
    </div>

    <div class="ra-cycle-block">
      <div class="ra-cycle-label">🔄 Full QA cycle — how this actually works end to end</div>
      <div class="ra-cycle-steps">
        <div class="ra-cycle-step ra-cs-dev">
          <span class="ra-cs-num">1</span>
          <span class="ra-cs-text">Dev writes watchdog, says "done"</span>
        </div>
        <div class="ra-cs-arrow">→</div>
        <div class="ra-cycle-step ra-cs-qa">
          <span class="ra-cs-num">2</span>
          <span class="ra-cs-text">QA runs TC-SES-001: forces connection drop in test env</span>
        </div>
        <div class="ra-cs-arrow">→</div>
        <div class="ra-cycle-step ra-cs-fail">
          <span class="ra-cs-num">3</span>
          <span class="ra-cs-text">Watchdog does not fire → FAIL → P0 bug → build rejected</span>
        </div>
        <div class="ra-cs-arrow">→</div>
        <div class="ra-cycle-step ra-cs-dev">
          <span class="ra-cs-num">4</span>
          <span class="ra-cs-text">Dev fixes → new build</span>
        </div>
        <div class="ra-cs-arrow">→</div>
        <div class="ra-cycle-step ra-cs-qa">
          <span class="ra-cs-num">5</span>
          <span class="ra-cs-text">QA re-runs TC-SES-001 on new build</span>
        </div>
        <div class="ra-cs-arrow">→</div>
        <div class="ra-cycle-step ra-cs-pass">
          <span class="ra-cs-num">6</span>
          <span class="ra-cs-text">Watchdog fires, system recovers → PASS → logged in Jira with build # and QA sign-off</span>
        </div>
      </div>
      <div class="ra-cycle-note">PASS = mitigation is proven. The Jira ticket is the evidence. Risk file gets the reference. Done.</div>
    </div>

    <div class="trc-sample-label">Preliminary Risk - Test Coverage Map (illustrative)</div>
    <div class="trc-table-wrap">
      <table class="trc-table">
        <thead>
          <tr>
            <th class="trc-th">Hazard</th>
            <th class="trc-th">Hazardous Situation</th>
            <th class="trc-th">Harm</th>
            <th class="trc-th">Sev</th>
            <th class="trc-th">Prob</th>
            <th class="trc-th">Level</th>
            <th class="trc-th">QA Mitigation / Test Coverage</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Tooling that links the risk file to the test case library and keeps them synchronized automatically.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderDhf() {

  // ── DHF folder structure visual ────────────────────────────────────────────
  const folders = [
    {
      icon: '📁', label: 'Design Input',
      items: ['Product requirements (SRS)', 'Intended use specification', 'Risk management plan'],
    },
    {
      icon: '📁', label: 'Design Output',
      items: ['Software architecture documents', 'Component specifications (SDS)', 'Interface specifications'],
    },
    {
      icon: '📁', label: 'Design Reviews',
      items: ['Sprint review records', 'Architecture review records', 'Risk review records'],
    },
    {
      icon: '📁', label: 'Verification & Validation',
      items: ['Test plans (all cycles)', 'Traceability matrix (per release)', 'V&V Reports (per release)', 'Defect records - P0 and P1 histories'],
    },
    {
      icon: '📁', label: 'Risk Management',
      items: ['Risk analysis (ISO 14971)', 'Risk control evidence (QA test results)', 'Residual risk evaluation'],
    },
    {
      icon: '📁', label: 'Change Control',
      items: ['Design change records', 'Impact assessments', 'Re-verification records after change'],
    },
  ];

  const folderCards = folders.map(f => `
    <div class="dhf-folder-card">
      <div class="dhf-folder-header">
        <span class="dhf-folder-icon">${f.icon}</span>
        <span class="dhf-folder-label">${f.label}</span>
      </div>
      <ul class="dhf-folder-items">
        ${f.items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`).join('');

  const mustHave = [
    {
      title: 'What QA Contributes to the DHF',
      what: 'The DHF is assembled by the full team - engineering, product, regulatory affairs, and QA. QA does not own the DHF, but QA owns a significant portion of its content. Every test artifact produced during development is a DHF record. Treating test documents as internal working files that get filed at the end is the most common reason DHFs fail audit.',
      nvsight: [
        'QA-owned DHF records: Test Strategy, all Test Plans, Test Case library (exported from Jira), all sprint test cycle reports, all release V&V Reports, Traceability Matrix per release, Defect records for P0 and P1 tickets (full comment history), Risk acceptance log (P2 Won\'t Fix decisions).',
        'Filing cadence: sprint cycle reports are filed at sprint close. Release V&V Reports are filed at release sign-off. Defect records are filed as part of the release package. QA does not accumulate unfiled records.',
        'Document control: every QA document filed in the DHF has a version number, a date, and the QA lead\'s name. Unsigned documents are not filed. A document with "Draft" status is not a DHF record.',
        'Jira as a DHF source: P0 and P1 Jira ticket histories (including all comments, state transitions, and field changes) are exported as PDF or CSV at each release and filed. Jira itself is not the DHF - the export is.',
      ],
    },
    {
      title: 'Change Control and QA',
      what: 'Under 21 CFR Part 820, any design change must go through change control with an assessment of impact on verification and validation. For QA this means: any change to the software - including small algorithm adjustments - may require re-running specific test cases and updating the V&V records. Building this discipline from the first sprint is essential.',
      nvsight: [
        'Change trigger for QA: any engineering change that touches the hint rendering pipeline, DICOM ingestion, PACS integration, or session management triggers a QA impact assessment before the change is merged.',
        'Impact assessment output: a brief note (can be a Jira comment on the change ticket) stating which test cases cover the changed component, whether re-execution is required, and what the regression scope is.',
        'Regression after change: if the change requires re-execution of test cases, the re-execution results are filed as a supplemental test record linked to the change ticket. Not appended to the original V&V Report.',
        'Algorithm changes and classification: any change that could affect the clinical behavior of hints (position, timing, type, presence) must be assessed against the IEC 62304 change control requirements for Class C software. This is an engineering and regulatory call - QA flags it, does not make the classification decision.',
      ],
    },
    {
      title: 'DHF Readiness at Any Point',
      what: 'A DHF that is only assembled at submission time is a reconstruction, not a record. FDA and notified bodies have seen reconstructed DHFs many times - they can tell. The standard is that the DHF must reflect the actual state of the project at any point in time, which means documents are filed when they are produced, not accumulated.',
      nvsight: [
        'Ongoing check: at each sprint close, QA lead confirms that all records produced this sprint are filed. This takes 15 minutes if filing is current, and several days if it is not.',
        'Naming convention: QA documents use a consistent naming pattern - [DocType]-[Version]-[Date]-[BuildOrSprint]. Example: VnVReport-v1.2-2025-03-14-build-2.4.1. No ambiguity about which document covers which release.',
        'Storage: all DHF records are stored in a shared, access-controlled location (not in individual team members\' local folders). Access control is part of 21 CFR Part 820 document control requirements.',
        'Audit simulation: at least once per release cycle, QA lead walks through the DHF folder and confirms: given a specific P0 defect, can the full chain be traced - requirement, test case, defect ticket, fix build, re-verification result, V&V Report entry? If any link is missing, it is fixed before the release meeting.',
      ],
    },
    {
      title: 'Practical Setup for NV-Sight',
      what: 'NV-Sight is in early development. The DHF structure does not need to be fully built out on day one, but the filing habit must start on day one. A minimal DHF from the first sprint is far easier to extend than a complete reconstruction before submission.',
      nvsight: [
        'Day one setup: create the folder structure (Design Input, Output, Reviews, V&V, Risk, Change Control), store the first version of the Test Strategy and Test Plan, and establish the naming convention. This is a two-hour task.',
        'First sprint close: file the sprint cycle report, the traceability matrix snapshot, and any P0/P1 defect exports. Establish the cadence before it becomes optional.',
        'Tool choice: a shared Google Drive or SharePoint folder with controlled access is sufficient for early stage. Purpose-built eQMS (MasterControl, Veeva, Greenlight Guru) are added later when the team scales. Do not block filing on tool selection.',
        'Regulatory consultant touchpoint: the DHF structure and document templates should be reviewed by the compliance consultant during onboarding. The folder structure proposed here is a starting point, not a final answer.',
      ],
    },
  ];

  const niceToHave = [
    'eQMS integration - a purpose-built electronic Quality Management System (Greenlight Guru, MasterControl, Veeva) that enforces document control, version management, and sign-off workflows automatically',
    'Automated Jira export at release - a script that exports P0 and P1 ticket histories to PDF at each release sign-off and files them in the DHF folder with the correct naming convention',
    'DHF completeness checklist - a sprint close checklist in Jira that requires QA lead to confirm each required record has been filed before the sprint is marked closed',
    'Traceability to DHF sections - every Jira ticket type (test case, defect, change) is tagged with the DHF section it feeds into, enabling automatic completeness reporting',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - DHF structure and document templates will be confirmed with the compliance consultant during onboarding. The folder structure below is a starting point.</strong></p>
    <p class="ts-intro">The Design History File is the complete record of how NV-Sight was designed, built, and tested. Every QA artifact - test plan, test report, defect record, traceability matrix - is a DHF record. The DHF is what FDA reviews during a 510(k) submission or audit. A gap in the DHF is a gap in the submission.</p>

    <div class="trc-sample-label">DHF Folder Structure (QA-relevant sections)</div>
    <div class="dhf-folders-grid">${folderCards}</div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Tooling that enforces document control and automates filing as the team scales.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderSat() {

  // ── What makes our SAT unique ──────────────────────────────────────────────
  const comparisons = [
    { aspect: 'Environment',   typical: 'Separate lab with simulators and PACS mock',        ours: 'No separate lab - real Siemens Artis at Sheba is the only environment' },
    { aspect: 'Team location', typical: 'Travel to site for SAT sessions',                   ours: 'Dev and QA are based at Sheba, one floor above the OR' },
    { aspect: 'DICOM data',    typical: 'Lab uses synthetic data, SAT uses real de-identified', ours: 'Synthetic DICOM only - no real patient data in any testing, ever' },
    { aspect: 'Users',         typical: 'QA executes, physicians participate only at SAT',    ours: 'Interventional neuroradiologists available for feedback continuously' },
    { aspect: 'Testing window',typical: 'Scheduled SAT campaign, dedicated time block',       ours: 'Scheduled windows when OR is not in active use - requires coordination with Sheba' },
    { aspect: 'DHF record',    typical: 'Lab V&V Report + separate SAT report',              ours: 'Single V&V Report + SAT sign-off from Sheba site coordinator' },
  ];

  const compRows = comparisons.map(r => `
    <tr>
      <td class="trc-td sat-td-aspect">${r.aspect}</td>
      <td class="trc-td sat-td-lab">${r.lab}</td>
      <td class="trc-td sat-td-sat">${r.sat}</td>
    </tr>`).join('');

  const mustHave = [
    {
      title: 'What SAT Is and Why It Exists',
      what: 'Site Acceptance Testing is the final validation step before NV-Sight goes live at the Sheba Medical Center pilot site. It confirms that the system works in the actual deployment environment - real hardware, real PACS, real network conditions, real users - not just in a controlled QA lab. For a Class C SaMD used in live procedures, lab testing alone is not sufficient evidence of readiness.',
      nvsight: [
        'SAT is conducted at Sheba Medical Center in Israel, on the actual Siemens Artis angiography system that will be used in procedures. It cannot be fully replicated in the lab.',
        'The PACS integration tested in the lab uses a mock or replay configuration. SAT tests the real PACS connection - the integration layer that has the most environment-specific variability.',
        'Physician involvement: interventional neuroradiologists at Sheba are the real end users. SAT includes scenarios they execute, not just scripted QA test cases. Their feedback is captured as part of the SAT record.',
        'Clinical accuracy of hints is assessed at Sheba by the clinical team. QA SAT scope covers system behavior - rendering, latency, session stability, PACS connectivity - not the medical correctness of AI output.',
      ],
    },
    {
      title: 'SAT Scope and Test Cases',
      what: 'SAT is not a repeat of the full lab test suite. It is a targeted execution focused on the scenarios that are environment-specific or require real users. Running all 200+ test cases on-site is impractical and adds no value for cases already validated in the lab.',
      nvsight: [
        'P0 smoke suite: all P0 test cases are re-executed in the Sheba environment before any physician interaction. This is the go/no-go gate for the rest of SAT. Any P0 failure stops the session.',
        'PACS integration scenarios: TC-PAC-001 through TC-PAC-00N are re-executed against the real Sheba PACS. These are the test cases most likely to behave differently in a live hospital environment vs. the lab.',
        'Latency validation: TC-LAT-001 and TC-LAT-002 are re-run on-site. Network latency between the NV-Sight system and the Siemens Artis varies from the lab baseline. The 3-second threshold applies regardless of environment.',
        'UAT scenarios: a set of 5-10 clinical workflow scenarios defined with the Sheba team are executed by the physicians. These are not scripted pass/fail tests - they are structured observation sessions. QA records what was observed, the physicians confirm the system behaved as expected.',
      ],
    },
    {
      title: 'Go-Live Criteria and Blocking Conditions',
      what: 'SAT has a binary outcome for each phase: go or no-go. A P0 failure at SAT is a hard stop - the session ends and a fix build is required before re-testing. The criteria are agreed with the Sheba site coordinator and the NV-Sight team before SAT begins, not determined on the day.',
      nvsight: [
        'Go-live gate: P0 smoke suite 100% pass, zero open P0 defects, PACS connection stable for the duration of the test session, latency within threshold on real hardware, physician UAT completed with no safety-relevant findings.',
        'Blocking defect found at SAT: the defect is filed in Jira with the label "SAT-blocking". Go-live is suspended. A fix is prepared, tested in the lab, and a targeted SAT re-test is scheduled. Full SAT re-run is not required if the fix scope is narrow and documented.',
        'Non-blocking findings at SAT: P2 and P3 issues found at SAT that were not found in lab testing are filed in Jira and scheduled for the next sprint. They do not block go-live if a risk acceptance decision is made and documented.',
        'Physician feedback: comments from physicians that indicate usability concerns (not clinical accuracy) are filed as P2 or P3 items with the label "physician-feedback". They are reviewed with Product before the next release.',
      ],
    },
    {
      title: 'SAT Record and DHF Filing',
      what: 'The SAT produces its own report, separate from the lab V&V Report. It is filed in the DHF as part of the design validation records. For a submission that includes a clinical pilot, the SAT report is the evidence that the system was validated in its intended operating environment.',
      nvsight: [
        'SAT Report contents: environment description (Sheba hardware, PACS version, network config), test cases executed with pass/fail results, defects found with dispositions, physician UAT session notes, go-live decision and rationale, signatures of QA lead and Sheba site coordinator.',
        'The SAT Report is a separate DHF entry - not appended to the release V&V Report. It references the V&V Report version it is associated with.',
        'Sheba site coordinator sign-off: the SAT report includes a confirmation from the Sheba coordinator that the test session was conducted as described and the go-live decision was agreed. This is the clinical site\'s formal acceptance.',
        'Data handling: any DICOM data used during SAT is de-identified. No real patient data is used in testing. This is both a HIPAA requirement and a contractual obligation with Sheba. QA does not use production environment for bug reproduction.',
      ],
    },
  ];

  const niceToHave = [
    'Remote SAT monitoring - screen sharing or recording of the SAT session for the NV-Sight team members who cannot be on-site, with timestamps correlated to the test execution log',
    'Standardized UAT scenario cards - printed or tablet-based scenario descriptions for the Sheba physicians to follow during UAT, ensuring consistency across sessions and between sites',
    'SAT defect fast-track process - a defined rapid response protocol for P0 defects found at SAT: who builds the hotfix, who tests it in the lab, and what the minimum re-test scope is before scheduling a return SAT session',
    'Multi-site SAT template - if the pilot expands beyond Sheba, a standardized SAT checklist and report template that can be adapted per site without rewriting from scratch each time',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - SAT scope, go-live criteria, and logistics will be defined in coordination with the Sheba Medical Center site coordinator and the NV-Sight team during onboarding.</strong></p>
    <p class="ts-intro">Site Acceptance Testing is the final validation step before NV-Sight goes live. For a Class C SaMD, regulators require validation in the actual intended operating environment - real hardware, real PACS, real physicians. Our setup is unusual: there is no separate lab. Testing happens at Sheba on the real equipment, which is both an advantage and a constraint.</p>

    <div class="sat-context-note">
      <span class="sat-ctx-icon">📍</span>
      <div class="sat-ctx-body">
        <div class="sat-ctx-title">Our setup: co-located at Sheba Medical Center</div>
        <div class="sat-ctx-text">Dev and QA work from Sheba, one floor above the OR. There is no separate lab environment - the real Siemens Artis and real PACS are the only hardware available for testing. This means every test run is effectively a SAT. Key constraint: testing must happen in scheduled windows when the OR is not in active clinical use. Synthetic DICOM only - no real patient data in any test scenario.</div>
      </div>
    </div>

    <div class="trc-sample-label">Typical SAT vs. Our Setup</div>
    <div class="trc-table-wrap">
      <table class="trc-table">
        <thead>
          <tr>
            <th class="trc-th" style="width:130px">Aspect</th>
            <th class="trc-th">Typical approach</th>
            <th class="trc-th">NV-Sight at Sheba</th>
          </tr>
        </thead>
        <tbody>${compRows}</tbody>
      </table>
    </div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Process and tooling improvements for smoother SAT execution and multi-site readiness.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderUsability() {

  // ── Formative vs Summative comparison ─────────────────────────────────────
  const phases = [
    {
      type: 'Formative Testing',
      icon: '🔄',
      cls: 'usab-card-formative',
      when: 'During development - iterative, each major UI change',
      who: 'QA team + 1-2 Sheba physicians when available',
      goal: 'Identify usability hazards early before they reach summative testing',
      output: 'Formative evaluation report, hazard log, design change requests',
      dhf: 'Formative records filed in DHF - not submission-critical individually',
    },
    {
      type: 'Summative Testing',
      icon: '✅',
      cls: 'usab-card-summative',
      when: 'Before submission - on a stable release candidate',
      who: 'Representative end users: interventional neuroradiologists, not QA team',
      goal: 'Demonstrate that real users can complete critical tasks without use errors that cause harm',
      output: 'Summative Usability Evaluation Report - required for 510(k)',
      dhf: 'Summative report is a submission-critical DHF record',
    },
  ];

  const phaseCards = phases.map(p => `
    <div class="usab-phase-card ${p.cls}">
      <div class="usab-phase-header">
        <span class="usab-phase-icon">${p.icon}</span>
        <span class="usab-phase-type">${p.type}</span>
      </div>
      <div class="usab-phase-rows">
        <div class="usab-phase-row"><span class="usab-phase-key">When</span><span class="usab-phase-val">${p.when}</span></div>
        <div class="usab-phase-row"><span class="usab-phase-key">Who</span><span class="usab-phase-val">${p.who}</span></div>
        <div class="usab-phase-row"><span class="usab-phase-key">Goal</span><span class="usab-phase-val">${p.goal}</span></div>
        <div class="usab-phase-row"><span class="usab-phase-key">Output</span><span class="usab-phase-val">${p.output}</span></div>
        <div class="usab-phase-row"><span class="usab-phase-key">DHF</span><span class="usab-phase-val">${p.dhf}</span></div>
      </div>
    </div>`).join('');

  const mustHave = [
    {
      title: 'Safety Focus - Use Errors, Not UX',
      what: 'IEC 62366 is not about making the interface convenient. The question it asks is: can a user make an error that leads to patient harm? For NV-Sight, the physician is the user. A use error is not a click in the wrong place - it is a misinterpretation of a hint or an action taken based on a rendering failure that was not recognized as a failure.',
      nvsight: [
        'Critical task identification: the usability analysis starts by identifying which physician interactions with NV-Sight could lead to patient harm if done incorrectly or misunderstood. These are the critical tasks that must be covered in both formative and summative testing.',
        'For NV-Sight, candidate critical tasks: recognizing a hint overlay as a AI-generated marker (not a native Siemens system indicator), understanding that a missing hint may indicate a system issue rather than no finding, acting on position information from a hint overlay during a time-critical procedure step.',
        'Use error ≠ software defect: a use error can occur with a perfectly functioning system if the interface is ambiguous. Both types of failures feed into the risk file via separate paths - software defects to the anomaly record, use errors to the usability hazard log.',
        'QA scope: QA supports usability testing with scenario design, observation, and recording. Clinical judgment about whether a physician\'s interpretation was medically correct belongs to the clinical team, not QA.',
      ],
    },
    {
      title: 'Formative Testing - Iterative Hazard Identification',
      what: 'Formative testing is conducted during development to catch usability hazards before they are built deeply into the product. Each major UI change - new overlay type, new indicator, modified workflow - is a trigger for a formative evaluation. The output is not a pass/fail verdict - it is a hazard log that drives design improvements.',
      nvsight: [
        'Formative session structure: a QA team member (or available Sheba physician) is given a scenario to complete on the current build. They are observed, not guided. The session is recorded. Observations are logged as usability hazard candidates.',
        'Trigger for formative: any change to hint overlay appearance, position indicator, session status display, or error notification triggers a formative review before the change is merged to the main branch.',
        'Hazard log: each formative session produces a log entry - what was observed, which critical task it relates to, whether a design change is recommended. Hazards that are not addressed are carried forward to the next session with a rationale.',
        'Sheba physician involvement in formative: even a 30-minute session with one physician at Sheba during a site visit is a formative touchpoint. Not a formal summative session - but physician observation data is qualitatively more valuable than internal QA observation.',
      ],
    },
    {
      title: 'Summative Testing - Submission Requirement',
      what: 'Summative usability testing is a regulatory requirement for 510(k) submission. It must be conducted with a representative sample of real end users - not QA team members, not engineers - on a stable version of the device. The summative report is the formal evidence that usability hazards have been identified and mitigated.',
      nvsight: [
        'User population: interventional neuroradiologists. A minimum sample size is required by FDA guidance (typically 15 representative users for summative, though this depends on the number of user groups). Exact requirements to be confirmed with the compliance consultant.',
        'Test environment: summative testing should replicate the actual use environment as closely as possible. At minimum, the same Siemens Artis hardware and PACS configuration used at Sheba. Ideally conducted on-site at Sheba.',
        'Simulated use: scenarios simulate realistic procedure conditions - time pressure, fluoroscopy running, physician attention split between the Artis display and the NV-Sight overlay. The scenario design must reflect actual OR workflow.',
        'Acceptance criteria: the summative report must demonstrate that no use errors leading to serious patient harm occurred. If such a use error occurs during testing, it is a design finding that requires a redesign and re-test - not a pass with a note.',
      ],
    },
    {
      title: 'QA Deliverables for Usability',
      what: 'QA is not the owner of the usability engineering file - that typically belongs to product or regulatory affairs. But QA produces and files the test-related artifacts. Understanding what QA owns prevents gaps at audit.',
      nvsight: [
        'QA-owned usability artifacts: formative session observation logs, summative test execution records (scenario completion, use errors observed, session notes), usability defects filed in Jira with label "usability-hazard".',
        'Not QA-owned: the Use Specification (who the users are, what conditions they work in), the Usability Engineering Plan, the final Summative Usability Evaluation Report. These are regulatory/product ownership.',
        'Usability defects in Jira: any use error identified during a formative or summative session that indicates a design problem is filed as a P1 or P2 defect with label "usability-hazard". It feeds into both the defect workflow and the usability hazard log.',
        'Filing: formative session logs are filed in the DHF at the end of each evaluation cycle. The summative records are filed as part of the submission package. QA retains signed copies of all session observation logs.',
      ],
    },
  ];

  const niceToHave = [
    'Recorded usability sessions - screen and audio recording of all formative and summative sessions (with participant consent) for review by team members who were not present and for DHF filing',
    'Standardized scenario cards - printed scenario descriptions given to test participants, ensuring consistency across sessions and providing a paper record of what each participant was asked to do',
    'Usability hazard tracking in Jira - a dedicated label and dashboard for usability-hazard tickets, separate from functional defects, enabling trend analysis across formative sessions',
    'Think-aloud protocol training - brief guidance for the QA team member facilitating sessions on how to run think-aloud observation without leading the participant',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - usability engineering plan and summative test protocol will be defined by regulatory affairs in coordination with the compliance consultant. QA scope below focuses on the test execution and artifact side.</strong></p>
    <p class="ts-intro">IEC 62366 is about safety, not UX. The question it asks: can a physician make a use error with NV-Sight that leads to patient harm? Formative testing identifies hazards during development. Summative testing - with real physicians in realistic conditions - is required for FDA submission.</p>

    <div class="trc-sample-label">Formative vs. Summative Testing</div>
    <div class="usab-phases-grid">${phaseCards}</div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Process improvements for more rigorous and consistent usability session execution.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderPccp() {

  // ── PCCP components visual ─────────────────────────────────────────────────
  const components = [
    { icon: '📐', label: 'Modification Protocol',      desc: 'What types of AI/ML changes are pre-approved, and under what conditions they can be made without a new 510(k)' },
    { icon: '📊', label: 'Performance Metrics',        desc: 'The specific metrics that define acceptable model performance before and after any change' },
    { icon: '🧪', label: 'Testing Protocol',           desc: 'How changes will be validated - datasets, methods, acceptance criteria, QA scope' },
    { icon: '📋', label: 'Impact Assessment Process',  desc: 'How to evaluate whether a change is within PCCP scope or requires a new submission' },
    { icon: '📁', label: 'Change Documentation',       desc: 'What records must be produced and filed in the DHF for each PCCP-covered change' },
  ];

  const compCards = components.map(c => `
    <div class="pccp-comp-card">
      <div class="pccp-comp-icon">${c.icon}</div>
      <div class="pccp-comp-body">
        <div class="pccp-comp-label">${c.label}</div>
        <div class="pccp-comp-desc">${c.desc}</div>
      </div>
    </div>`).join('');

  const mustHave = [
    {
      title: 'What PCCP Is and Why It Matters for NV-Sight',
      what: 'A Predetermined Change Control Plan is an FDA mechanism that allows an AI/ML medical device to update its model post-market without submitting a new 510(k) for every change - provided those changes fall within a pre-approved scope and follow a defined validation protocol. For NV-Sight as an AI-driven SaMD, the PCCP is what makes continuous model improvement operationally viable after submission.',
      nvsight: [
        'Without a PCCP: every model update that could affect clinical output would require a new 510(k) submission, potentially taking months. For an AI product in active clinical use, this effectively freezes the model at the version submitted.',
        'With a PCCP: model updates that fall within the defined modification scope can be deployed after internal validation, provided the testing protocol and documentation requirements are followed. The PCCP defines the boundaries of that freedom.',
        'NV-Sight relevance: as the model is trained on more data from Sheba and potentially other sites, performance will change. The PCCP is how those improvements reach the clinical environment without a new submission for each iteration.',
        'PCCP is not a loophole: the plan must be rigorous enough that FDA can verify post-market that every change was within scope and properly validated. It shifts the regulatory gate from pre-market submission to post-market audit readiness.',
      ],
    },
    {
      title: 'QA Role in PCCP Development',
      what: 'The PCCP is owned by regulatory affairs, with clinical and engineering input. QA\'s role is to define the testing protocol component - specifically, what validation must happen before any PCCP-covered model change can be deployed. This is a QA deliverable that goes into the submission.',
      nvsight: [
        'QA contribution to the Modification Protocol: for each category of allowed change (e.g. retraining on new data, threshold adjustment, new hint type within defined scope), QA defines the minimum test suite that must pass before the change is deployed.',
        'Performance metrics definition: QA, with engineering and clinical input, defines the quantitative acceptance criteria - latency thresholds, rendering accuracy tolerances, session stability metrics - that apply to the post-change validation.',
        'Dataset requirements: the testing protocol must specify what dataset is used for validation after a model change. Who selects it, how many samples, how representativeness is demonstrated. This is a QA design question with regulatory implications.',
        'Change documentation: QA defines what records must be produced for each PCCP-covered change - a mini V&V report, traceability matrix update, performance metrics report - and files them in the DHF. The structure mirrors the release V&V Report but scoped to the change.',
      ],
    },
    {
      title: 'In-Scope vs. Out-of-Scope Changes',
      what: 'The PCCP must clearly define what types of changes it covers and what falls outside its scope and requires a new submission. This boundary is critical - FDA will scrutinize whether post-market changes were correctly classified. QA must understand this boundary to correctly assess whether a planned model change requires a full 510(k) or falls under PCCP.',
      nvsight: [
        'Likely in-scope (PCCP-covered): retraining the existing model on additional DICOM datasets of the same hint types, adjusting confidence thresholds within defined ranges, performance improvements that do not change the clinical output type.',
        'Likely out-of-scope (new submission): adding a new hint type not covered in the original 510(k), expanding the intended use to a new clinical context, changing the underlying model architecture, expanding to a new device platform.',
        'Gray area - requires assessment: significant expansion of the training dataset to new anatomical regions, changes to the DICOM ingestion pipeline that affect hint timing or position, integration with a new PACS vendor.',
        'QA role in classification: when engineering proposes a model change, QA initiates a change impact assessment that includes a PCCP scope check. If scope is unclear, regulatory affairs is consulted before the change proceeds. QA does not make the final classification decision.',
      ],
    },
    {
      title: 'Post-Market Audit Readiness for PCCP Changes',
      what: 'Each change deployed under the PCCP must be documented well enough that an FDA inspector conducting a post-market audit can reconstruct: what changed, when, why, how it was validated, what the results were, and who approved deployment. The audit burden shifts from pre-market to post-market under PCCP.',
      nvsight: [
        'Change record structure: for each PCCP-covered deployment - change description and scope classification, dataset used for validation, test results with pass/fail against acceptance criteria, comparison to baseline (pre-change) performance, QA sign-off, deployment date and build version.',
        'Performance monitoring post-deployment: the PCCP should include a post-market monitoring protocol. If model performance drifts after deployment, QA is part of the team that detects it. Specific metrics and thresholds should be defined in the PCCP.',
        'Deviation handling: if a PCCP-covered change produces results outside the defined acceptance criteria during validation, it is not deployed. It is treated as a design change requiring a deeper review - potentially out of PCCP scope.',
        'Regulatory touchpoint: any ambiguity about whether a change is within PCCP scope is resolved with the compliance consultant before proceeding. Deploying an out-of-scope change without a new submission is a regulatory violation, not an operational decision.',
      ],
    },
  ];

  const niceToHave = [
    'PCCP change log dashboard - a tracked record of every PCCP-covered change deployed post-market: change ID, date, scope classification, validation summary, sign-off. Audit-ready at any time',
    'Automated performance comparison - a script that runs the validation test suite against the post-change model and generates the performance delta report automatically, reducing manual effort per change cycle',
    'Dataset registry - a versioned registry of all datasets used for PCCP validation, with metadata on composition, source, de-identification status, and representativeness notes',
    'PCCP scope classifier - an internal checklist or decision tree that engineering and QA use to classify any proposed model change as in-scope, out-of-scope, or requires assessment, before work begins',
  ];

  const sections = mustHave.map(s => `
    <div class="ts-section">
      <div class="ts-section-header">
        <div class="ts-section-title">${s.title}</div>
      </div>
      <div class="ts-section-what">${s.what}</div>
      <div class="ts-nvsight-block">
        <div class="ts-nvsight-label">Our preliminary example</div>
        <ul class="ts-nvsight-list">
          ${s.nvsight.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const niceList = niceToHave.map(n => `<li class="ts-nice-item">${n}</li>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - the PCCP is a regulatory submission document owned by regulatory affairs. This section describes the QA contribution: the testing protocol and validation requirements. Exact scope and submission format to be defined with the compliance consultant.</strong></p>
    <p class="ts-intro">The Predetermined Change Control Plan is what allows NV-Sight to improve its AI model post-market without a new 510(k) for every update. It defines in advance what changes are allowed, how they must be validated, and what records must be kept. Without a PCCP, every model improvement is a submission event.</p>

    <div class="trc-sample-label">PCCP Components</div>
    <div class="pccp-comps-grid">${compCards}</div>

    <div class="ts-label-row" style="margin-top:22px">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have</div>
      <p class="ts-nicehave-note">Tooling that makes post-market PCCP change management systematic and audit-ready.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
}

function renderPlanEstimation() {

  // ── Onboarding phases ──────────────────────────────────────────────────────
  const phases = [
    {
      phase: 'Phase 1',
      label: 'Onboarding & Setup',
      duration: 'Weeks 1-3',
      cls: 'pe-phase-1',
      items: [
        'Access: Jira, GitHub, Sheba environment credentials, site coordinator contact setup',
        'Read and review: SRS, SDS, existing architecture docs, risk file (current state)',
        'Regulatory alignment session with compliance consultant - standards coverage, DHF structure, PCCP scope',
        'Finalize Test Strategy (already drafted - review and sign-off with CTO)',
        'Configure Jira: ticket types, priority labels, custom fields, board columns',
        'DHF folder structure created, naming convention agreed, initial documents filed',
      ],
    },
    {
      phase: 'Phase 2',
      label: 'Test Infrastructure & First Cases',
      duration: 'Weeks 4-6',
      cls: 'pe-phase-2',
      items: [
        'Write P0 test cases (TC-RND, TC-SES, TC-PAC, TC-LAT series) - first executable set',
        'First test cycle: execute P0 suite on available build, file all defects found',
        'Traceability matrix v1: link all P0 test cases to SRS requirements',
        'Coordinate with Sheba to define testing windows - scheduled slots when the OR is not in active clinical use',
        'API smoke test feasibility check (pre-P0 gate concept - agreed with CTO)',
        'First sprint cycle report filed in DHF',
      ],
    },
    {
      phase: 'Phase 3',
      label: 'Full Coverage & Regulatory Docs',
      duration: 'Weeks 7-12',
      cls: 'pe-phase-3',
      items: [
        'P1 test cases written and executed across all test types (functional, integration, performance, negative)',
        'Regression suite defined and run after each significant build',
        'Defect workflow running: all filed bugs tracked through the full Jira board cycle',
        'Quality report cadence established - first report produced at sprint 3 close',
        'V&V Report template finalized with compliance consultant',
        'SAT plan drafted with Sheba site coordinator - scope, schedule, logistics',
      ],
    },
    {
      phase: 'Phase 4',
      label: 'Release Readiness & SAT',
      duration: 'Month 4+',
      cls: 'pe-phase-4',
      items: [
        'Release readiness review: all P0/P1 gates met, traceability matrix current, V&V Report signed',
        'SAT execution at Sheba: P0 smoke suite, PACS integration, physician UAT sessions',
        'SAT report filed, go-live decision documented',
        'Post-go-live: defect monitoring, first PCCP-covered model update cycle if applicable',
        'Submission package QA review: DHF completeness check, traceability matrix final version, all V&V records',
      ],
    },
  ];

  const phaseCards = phases.map(p => `
    <div class="pe-phase-card ${p.cls}">
      <div class="pe-phase-header">
        <div>
          <span class="pe-phase-tag">${p.phase}</span>
          <span class="pe-phase-label">${p.label}</span>
        </div>
        <span class="pe-phase-dur">${p.duration}</span>
      </div>
      <ul class="pe-phase-items">
        ${p.items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`).join('');

  // ── Effort estimation table ────────────────────────────────────────────────
  const effortRows = [
    { area: 'Test Strategy & Standards',    setup: '~8h',  ongoing: '-',       notes: 'One-time - already drafted' },
    { area: 'Test Cases (P0 + P1)',         setup: '~40h', ongoing: '~4h/sprint', notes: 'New cases as features added' },
    { area: 'Test Execution (per cycle)',   setup: '-',    ongoing: '~16h',    notes: 'Manual; scales with TC count' },
    { area: 'Defect Management',           setup: '~2h',  ongoing: '~4h/sprint', notes: 'Jira config + triage' },
    { area: 'Traceability Matrix',         setup: '~6h',  ongoing: '~2h/sprint', notes: 'Update at sprint close' },
    { area: 'Sprint Cycle Report',         setup: '-',    ongoing: '~3h',     notes: 'Per cycle, part of DHF' },
    { area: 'V&V Report (per release)',    setup: '-',    ongoing: '~8h',     notes: 'Aggregates cycle reports' },
    { area: 'Regulatory coordination',     setup: '~4h',  ongoing: '~2h/month', notes: 'Consultant touchpoints' },
    { area: 'SAT preparation + execution', setup: '~16h', ongoing: '-',       notes: 'One-time per site' },
    { area: 'DHF filing and maintenance',  setup: '~3h',  ongoing: '~1h/sprint', notes: 'Sprint close task' },
  ];

  const effortTableRows = effortRows.map(r => `
    <tr>
      <td class="trc-td pe-td-area">${r.area}</td>
      <td class="trc-td pe-td-h" style="text-align:center">${r.setup}</td>
      <td class="trc-td pe-td-h" style="text-align:center">${r.ongoing}</td>
      <td class="trc-td pe-td-notes">${r.notes}</td>
    </tr>`).join('');

  return `
    <p class="ts-intro"><strong>Preliminary - timelines and estimates are based on a standard early-stage SaMD QA onboarding. Actual numbers will be adjusted after the first two weeks of onboarding when the codebase, team cadence, and tooling are known.</strong></p>
    <p class="ts-intro">The plan below covers QA onboarding through to the first clinical deployment at Sheba. It is structured in four phases: setup, first test cycle, full coverage, and release readiness. Estimates are given in hours, not story points, to make resource planning concrete.</p>

    <div class="pe-phases">${phaseCards}</div>

    <div class="trc-sample-label" style="margin-top:20px">Effort Estimation (preliminary)</div>
    <div class="trc-table-wrap">
      <table class="trc-table">
        <thead>
          <tr>
            <th class="trc-th">QA Activity</th>
            <th class="trc-th" style="text-align:center;white-space:nowrap">Setup (one-time)</th>
            <th class="trc-th" style="text-align:center;white-space:nowrap">Ongoing</th>
            <th class="trc-th">Notes</th>
          </tr>
        </thead>
        <tbody>${effortTableRows}</tbody>
      </table>
    </div>

    <div class="pe-total-note">
      Total setup investment: <strong>~100h</strong> across the first 3 weeks. Ongoing steady-state: <strong>~30-35h per sprint</strong> (2-week sprints), scaling with test case count and release frequency. These numbers assume a single QA lead. If a second QA resource joins, execution and reporting effort distributes accordingly.
    </div>`;
}

function renderPlan30_90_180() {
  return `
    <p class="ts-intro">Three milestones. Each builds on the previous. By Day 180 the product is validated, documented, and ready for submission.</p>

    <div class="p3-grid">

      <div class="p3-col p3-col-30">
        <div class="p3-header">
          <div class="p3-days">30 days</div>
          <div class="p3-theme">I understand the product</div>
        </div>
        <div class="p3-body">
          <div class="p3-section-label">What I do</div>
          <ul class="p3-list">
            <li>Read all technical and product documentation</li>
            <li>Meet dev team, PM, Sheba coordinator</li>
            <li>Set up Jira: bug workflow, priority labels, board columns</li>
            <li>Write first P0 test cases - the most critical paths</li>
            <li>Run first test cycle on the current build</li>
            <li>File every defect found, prioritized by severity</li>
          </ul>
          <div class="p3-section-label">What the team gets</div>
          <ul class="p3-list">
            <li>First quality report - what works, what doesn't, what's critical</li>
            <li>Structured defect backlog in Jira, ready for sprint planning</li>
            <li>A QA process that runs from day one</li>
          </ul>
          <div class="p3-docs">
            <div class="p3-docs-label">Documents produced</div>
            <div class="p3-docs-list">
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('bugreporting');return false;"><span class="p3-doc-cat p3-doc-cat-f">F</span>Bug Reporting Standards</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('defectworkflow');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Defect Tracking Workflow</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('dhf');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>DHF structure</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('metrics');return false;"><span class="p3-doc-cat p3-doc-cat-f">F</span>Quality Gates v1</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('testcases');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Test Cases - P0 suite</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('qualityreport');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Quality Report #1</a>
            </div>
          </div>
          <div class="p3-outcome">
            <span class="p3-outcome-icon">✓</span>
            First bugs caught. Team knows what's blocking release.
          </div>
        </div>
      </div>

      <div class="p3-col p3-col-90">
        <div class="p3-header">
          <div class="p3-days">90 days</div>
          <div class="p3-theme">QA is running at full speed</div>
        </div>
        <div class="p3-body">
          <div class="p3-section-label">What I do</div>
          <ul class="p3-list">
            <li>Full P0 + P1 test coverage across all product areas</li>
            <li>Every sprint has a test cycle - defects tracked end to end</li>
            <li>Regression suite: run after every significant build</li>
            <li>Traceability: every requirement has a test, every test has a result</li>
            <li>First regulatory documents drafted - V&V Report template, Risk File evidence</li>
            <li>SAT plan agreed with Sheba site coordinator</li>
          </ul>
          <div class="p3-section-label">What the team gets</div>
          <ul class="p3-list">
            <li>Sprint quality reports - visibility into product health every 2 weeks</li>
            <li>Release readiness criteria: clear go/no-go for every release</li>
            <li>No surprises at release - issues caught early in the sprint</li>
          </ul>
          <div class="p3-docs">
            <div class="p3-docs-label">Documents produced</div>
            <div class="p3-docs-list">
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('teststrategy');return false;"><span class="p3-doc-cat p3-doc-cat-f">F</span>Test Strategy</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('testmatrix');return false;"><span class="p3-doc-cat p3-doc-cat-f">F</span>Test Matrix</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('testcases');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Test Cases - P1 suite</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('traceability');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>Traceability Matrix v1</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('releasereadiness');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Release Readiness Criteria</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('qualityreport');return false;"><span class="p3-doc-cat p3-doc-cat-o">O</span>Quality Reports - ongoing</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('vnvreport');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>V&amp;V Report template</a>
            </div>
          </div>
          <div class="p3-outcome">
            <span class="p3-outcome-icon">✓</span>
            Predictable releases. Quality is measurable, not a feeling.
          </div>
        </div>
      </div>

      <div class="p3-col p3-col-180">
        <div class="p3-header">
          <div class="p3-days">180 days</div>
          <div class="p3-theme">Ready for submission</div>
        </div>
        <div class="p3-body">
          <div class="p3-section-label">What I do</div>
          <ul class="p3-list">
            <li>Complete V&V Report - all requirements tested, results documented, signed</li>
            <li>SAT executed at Sheba - real hardware, real physicians, signed off</li>
            <li>Risk File closed - every risk has a test that proves mitigation works</li>
            <li>Design History File complete - full record of how the product was built and validated</li>
            <li>Usability testing with physicians documented</li>
          </ul>
          <div class="p3-section-label">What the team gets</div>
          <ul class="p3-list">
            <li>A complete, audit-ready documentation package</li>
            <li>FDA submission supported by evidence, not assumptions</li>
            <li>A QA process that continues post-submission for ongoing updates</li>
          </ul>
          <div class="p3-docs">
            <div class="p3-docs-label">Documents produced</div>
            <div class="p3-docs-list">
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('vnvreport');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>V&amp;V Report - final, signed</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('sat');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>SAT Report - signed by Sheba</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('usability');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>Usability Testing Report</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('riskcontrib');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>Risk File - QA evidence complete</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('traceability');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>Traceability Matrix - final</a>
              <a class="p3-doc p3-doc-link" href="#" onclick="showSlide('dhf');return false;"><span class="p3-doc-cat p3-doc-cat-r">R</span>DHF - complete</a>
            </div>
          </div>
          <div class="p3-outcome">
            <span class="p3-outcome-icon">✓</span>
            Submission-ready. Every claim backed by a test result.
          </div>
        </div>
      </div>

    </div>

    <div class="p3-note">
      Timeline assumes: SRS is structured, Risk File exists, compliance consultant is engaged, and Sheba testing windows are available. These factors determine whether 180 days is the floor or the target.
    </div>`;
}

function renderDocRegistry() {
  return `
    <p class="ts-intro">All QA documents and artifacts across Foundation, Operational, and Regulatory sections - with submission status, lifecycle, timing, and effort estimates in one place.</p>
    <div class="docr-wrap">
      <table class="docr-full-table">
        <thead>
          <tr>
            <th style="min-width:170px">Document</th>
            <th style="min-width:100px;text-align:center">In FDA submission</th>
            <th style="min-width:90px;text-align:center">Mandatory</th>
            <th class="th-center" style="min-width:140px">Lifecycle</th>
            <th style="min-width:110px">When to start</th>
            <th style="min-width:90px;text-align:center">Est. effort</th>
            <th>What you need to create it</th>
          </tr>
        </thead>
        <tbody>
          <tr class="docr-group-row"><td colspan="7">Foundation</td></tr>
          <tr>
            <td class="trc-td docr-name">Test Strategy</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once + revisit at major scope change</td>
            <td class="trc-td docr-center">Week 2-3</td>
            <td class="trc-td docr-center">~40h</td>
            <td class="trc-td docr-notes">Onboarding complete; SRS read in full; architecture understood; standards scope agreed with CTO</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Test Matrix</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once + updated as test types expand</td>
            <td class="trc-td docr-center">Week 3</td>
            <td class="trc-td docr-center">~16h</td>
            <td class="trc-td docr-notes">Test Strategy done; feature list from PM; risk classification from risk file</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Bug Reporting Standards</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once - team reference doc</td>
            <td class="trc-td docr-center">Week 1-2</td>
            <td class="trc-td docr-center">~8h</td>
            <td class="trc-td docr-notes">Jira access; team agreed on P0-P3 taxonomy; dev lead aligned on severity definitions</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">QA Metrics & Quality Gates</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once + revisit per release</td>
            <td class="trc-td docr-center">Week 2-3</td>
            <td class="trc-td docr-center">~16h</td>
            <td class="trc-td docr-notes">Release goals clear; CTO available for sign-off session; SRS pass/fail thresholds defined</td>
          </tr>
          <tr class="docr-group-row"><td colspan="7">Operational</td></tr>
          <tr>
            <td class="trc-td docr-name">Test Plans</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-ref">Referenced</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Per sprint / per feature</td>
            <td class="trc-td docr-center">Sprint 1</td>
            <td class="trc-td docr-center">~4h/sprint</td>
            <td class="trc-td docr-notes">Feature spec or user story; available build; test strategy in place</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Test Cases</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-ref">Referenced</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Living - added per feature, per sprint</td>
            <td class="trc-td docr-center">Week 3-4</td>
            <td class="trc-td docr-center">~100h setup, ~12h/sprint</td>
            <td class="trc-td docr-notes">SRS requirements numbered; risk file reviewed; each TC needs preconditions, steps, expected result, and SRS link</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Automation Framework</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center">Living - grows with test coverage</td>
            <td class="trc-td docr-center">Phase 3+</td>
            <td class="trc-td docr-center">~60-80h setup</td>
            <td class="trc-td docr-notes">Stable API; test env access; tool stack agreed; P0 manual suite already running - automation adds value only after that</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Defect Tracking Workflow</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once - Jira board config + team convention</td>
            <td class="trc-td docr-center">Week 1</td>
            <td class="trc-td docr-center">~8h</td>
            <td class="trc-td docr-notes">Jira access; board columns agreed with dev lead; label taxonomy defined and documented for team</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Defect Reports (Jira tickets)</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-ref">Referenced</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Per defect - ongoing</td>
            <td class="trc-td docr-center">First test run</td>
            <td class="trc-td docr-center">~6-8h/sprint</td>
            <td class="trc-td docr-notes">Workflow configured; includes triage, follow-up, retest, and closing verification per ticket</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Release Readiness Criteria</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once + revisit per major release</td>
            <td class="trc-td docr-center">Week 2-3</td>
            <td class="trc-td docr-center">~16h</td>
            <td class="trc-td docr-notes">Go/no-go gates defined with CTO; must be signed off before first release cycle begins - not during it</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Quality Report</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No</span></td>
            <td class="trc-td docr-center">Per sprint - internal dashboard</td>
            <td class="trc-td docr-center">Sprint 1 close</td>
            <td class="trc-td docr-center">~5h/sprint</td>
            <td class="trc-td docr-notes">Jira data; test execution results; defect stats; first time includes template setup (+4h)</td>
          </tr>
          <tr class="docr-group-row"><td colspan="7">Regulatory</td></tr>
          <tr>
            <td class="trc-td docr-name">Traceability Matrix</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Living - updated every sprint</td>
            <td class="trc-td docr-center">With first TC</td>
            <td class="trc-td docr-center">~20h setup, ~4h/sprint</td>
            <td class="trc-td docr-notes">SRS with numbered requirements; TC IDs assigned; risk file items identified - all three must exist before matrix is meaningful</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">V&V Report</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Per release - aggregates cycle reports</td>
            <td class="trc-td docr-center">Before release 1</td>
            <td class="trc-td docr-center">~24h first release, ~16h/release after</td>
            <td class="trc-td docr-notes">All sprint reports done; traceability matrix current; defect log with dispositions; template agreed with compliance consultant</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Risk File (ISO 14971)</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Living - QA closes loop with test evidence</td>
            <td class="trc-td docr-center">After onboarding</td>
            <td class="trc-td docr-center">~16h initial mapping, ~6h/sprint</td>
            <td class="trc-td docr-notes">Owned by RA/PM - QA reads risk file, maps each mitigation to a TC, and files evidence per sprint. Initial mapping requires full risk file read + TC creation</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">DHF (container)</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Living - all other docs filed here</td>
            <td class="trc-td docr-center">Week 1</td>
            <td class="trc-td docr-center">~8h setup, ~2h/sprint</td>
            <td class="trc-td docr-notes">Folder structure agreed with RA; naming convention documented; access controls confirmed with Sheba and team</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">SAT Report</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once per site go-live</td>
            <td class="trc-td docr-center">Before go-live</td>
            <td class="trc-td docr-center">~32h total</td>
            <td class="trc-td docr-notes">SAT protocol pre-agreed with Sheba coordinator; testing window scheduled; P0 suite passing in current build; Sheba sign-off required</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">Usability Test Report (Summative)</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center">Once before submission</td>
            <td class="trc-td docr-center">Before submission</td>
            <td class="trc-td docr-center">~40h total</td>
            <td class="trc-td docr-notes">Summative protocol written; physician participants confirmed at Sheba; scenarios validated with clinical team; IEC 62366 protocol followed</td>
          </tr>
          <tr>
            <td class="trc-td docr-name">PCCP</td>
            <td class="trc-td docr-center"><span class="docr-badge docr-yes">Yes</span></td>
            <td class="trc-td docr-center"><span class="docr-badge docr-no">No ¹</span></td>
            <td class="trc-td docr-center">Once - submitted with 510(k)</td>
            <td class="trc-td docr-center">Pre-submission</td>
            <td class="trc-td docr-center">~32h (QA part)</td>
            <td class="trc-td docr-notes">Owned by RA - QA defines testing protocol section. Requires model change taxonomy from engineering and acceptance criteria from clinical.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="docr-legend">
      <div class="docr-legend-group">
        <div class="docr-legend-title">In FDA submission</div>
        <div class="docr-legend-items">
          <div class="docr-legend-item"><span class="docr-badge docr-yes">Yes</span> Included directly in the FDA submission package</div>
          <div class="docr-legend-item"><span class="docr-badge docr-ref">Referenced</span> Not submitted directly — referenced inside documents that are (e.g. test cases cited in V&V Report)</div>
          <div class="docr-legend-item"><span class="docr-badge docr-no">No</span> Internal document only, not part of the submission</div>
        </div>
      </div>
      <div class="docr-legend-group">
        <div class="docr-legend-title">Mandatory</div>
        <div class="docr-legend-items">
          <div class="docr-legend-item"><span class="docr-badge docr-yes">Yes</span> Required by regulation or applicable standard (IEC 62304, ISO 14971, 21 CFR Part 820)</div>
          <div class="docr-legend-item"><span class="docr-badge docr-no">No</span> Not required — internal best practice</div>
          <div class="docr-legend-item"><span class="docr-badge docr-no">No ¹</span> Not required by FDA, but without it every post-market AI model update requires a new 510(k) submission. For an AI/ML SaMD, this effectively blocks iterative model improvement after release.</div>
        </div>
      </div>
    </div>`;
}

function renderFdaSubPlan() {

  const phases = [
    {
      cls:   'fsp-p0',
      phase: 'Phase 0',
      label: 'Onboarding',
      weeks: 'Weeks 1-2',
      activities: [
        'Read SRS, architecture docs, risk file in full',
        'Meet dev lead, PM, compliance consultant, Sheba coordinator',
        'Get access: Jira, GitHub, Sheba environment, DHF storage',
        'Understand current state: what docs exist, what tests have been run',
        'No deliverables — this is input time',
      ],
      deliverables: 'No deliverables — input and setup only',
      startWhen: 'Day 1 — access granted, key contacts introduced by CTO',
      risk: '+1w if SRS is unstructured or Risk File is incomplete draft',
    },
    {
      cls:   'fsp-p1',
      phase: 'Phase 1',
      label: 'Foundation',
      weeks: 'Weeks 2-4',
      activities: [
        'Bug Reporting Standards — priority taxonomy, Jira field conventions',
        'Defect Tracking Workflow — board columns, labels, escalation rules',
        'DHF folder structure — naming convention, access controls',
        'Quality Gates v1 — go/no-go criteria, CTO sign-off',
        'Test Strategy draft — scope, standards coverage, approach',
      ],
      deliverables: '<strong>Bug Reporting Standards</strong>, <strong>Defect Tracking Workflow</strong>, <strong>DHF</strong> structure, <strong>QA Metrics & Quality Gates</strong> v1',
      startWhen: 'Onboarding complete; CTO available for 2h sign-off session in Week 3',
      risk: '+1w if CTO sign-off session delayed; +1w if DHF storage not provisioned',
    },
    {
      cls:   'fsp-p2',
      phase: 'Phase 2',
      label: 'Test Cases + First Cycle',
      weeks: 'Weeks 3-7',
      activities: [
        'Test Strategy finalized and signed off',
        'P0 test cases written — all critical paths, session stability, PACS integration, latency',
        'P0 suite executed on first available build — all defects filed in Jira',
        'Traceability Matrix v1 — P0 cases linked to SRS requirements',
        'First sprint cycle report filed in DHF',
        'Sheba testing window confirmed and first on-site session scheduled',
      ],
      deliverables: '<strong>Test Strategy</strong>, <strong>Test Cases</strong> P0 suite, <strong>Traceability Matrix</strong> v1, <strong>Quality Report</strong> #1',
      startWhen: 'SRS requirements are numbered; Risk File is readable; stable build available; Sheba window confirmed',
      risk: '+2w if SRS needs restructuring before TCs can be written; +1w if no stable build; +1w if Sheba scheduling delayed',
    },
    {
      cls:   'fsp-p3',
      phase: 'Phase 3',
      label: 'Full Coverage',
      weeks: 'Weeks 7-12',
      activities: [
        'P1 test cases written and executed across all test types',
        'Regression suite defined and run after each significant build',
        'Risk File evidence mapped — each mitigation linked to a passing TC',
        'V&V Report template agreed with compliance consultant',
        'Usability Summative protocol written, physician sessions scheduled at Sheba',
        'SAT plan drafted with Sheba site coordinator',
      ],
      deliverables: '<strong>Test Cases</strong> P1 suite, <strong>Risk Assessment</strong> evidence links, <strong>V&V Report</strong> template, <strong>SAT Report</strong> plan, <strong>Usability Testing</strong> protocol',
      startWhen: 'P0 suite passing; compliance consultant engaged; Sheba physicians available for usability sessions',
      risk: '+2w if compliance consultant not yet engaged; +2w if Sheba physician availability limited',
    },
    {
      cls:   'fsp-p4',
      phase: 'Phase 4',
      label: 'Release Readiness + FDA Docs',
      weeks: 'Weeks 12-16',
      activities: [
        'Final test cycle — all P0/P1 cases executed on release candidate build',
        'V&V Report written and signed — aggregates all cycle reports',
        'Traceability Matrix final version — all requirements covered',
        'SAT executed at Sheba — P0 smoke, PACS integration, physician UAT',
        'SAT Report written and signed by Sheba coordinator',
        'Usability Summative sessions completed, report written',
        'DHF completeness check — all documents filed and versioned',
      ],
      deliverables: '<strong>V&V Report</strong> (final), <strong>SAT Report</strong>, <strong>Usability Testing</strong> report, <strong>Traceability Matrix</strong> (final), <strong>DHF</strong> complete',
      startWhen: 'All P0/P1 gates met; no open P0 defects; Sheba OR window scheduled; physicians confirmed',
      risk: '+2-4w if P0 defects remain at release candidate; +2w if Sheba OR scheduling issues; +1w per compliance review round',
    },
  ];

  const phaseRows = phases.map(p => `
    <tr>
      <td class="fsp-td fsp-td-phase">
        <div class="fsp-phase-badge ${p.cls}">${p.phase}</div>
        <div class="fsp-phase-label">${p.label}</div>
        <div class="fsp-phase-weeks">${p.weeks}</div>
      </td>
      <td class="fsp-td fsp-td-act">
        <ul class="fsp-list">${p.activities.map(a => `<li>${a}</li>`).join('')}</ul>
      </td>
      <td class="fsp-td fsp-td-del">${p.deliverables}</td>
      <td class="fsp-td fsp-td-dep">${p.startWhen}</td>
      <td class="fsp-td fsp-td-risk">${p.risk}</td>
    </tr>`).join('');

  return `
    <p class="ts-intro">Critical path from Day 1 to FDA submission-ready. Timelines are conditional — each phase has explicit dependencies. Where those dependencies already exist, the timeline compresses. The total assumes a single QA lead starting from scratch.</p>

    <div class="fsp-summary-strip">
      <div class="fsp-sum-item fsp-sum-opt">
        <div class="fsp-sum-val">~14 weeks</div>
        <div class="fsp-sum-label">Optimistic — SRS numbered, Risk File exists, consultant engaged Day 1, Sheba windows pre-agreed, all equipment and environment access provided on Day 1</div>
      </div>
      <div class="fsp-sum-arrow">→</div>
      <div class="fsp-sum-item fsp-sum-real">
        <div class="fsp-sum-val">~18 weeks</div>
        <div class="fsp-sum-label">Realistic — typical delays in access, doc readiness, Sheba scheduling</div>
      </div>
      <div class="fsp-sum-arrow">→</div>
      <div class="fsp-sum-item fsp-sum-risk">
        <div class="fsp-sum-val">~22+ weeks</div>
        <div class="fsp-sum-label">If SRS unstructured, Risk File missing, or P0 defects remain at release</div>
      </div>
    </div>

    <div class="docr-wrap" style="margin-top:16px">
      <table class="docr-full-table fsp-table">
        <thead>
          <tr>
            <th style="min-width:130px">Phase</th>
            <th style="min-width:220px">Key Activities</th>
            <th style="min-width:180px">FDA Deliverables</th>
            <th style="min-width:180px">Starts when</th>
            <th style="min-width:160px">If delayed</th>
          </tr>
        </thead>
        <tbody>${phaseRows}</tbody>
      </table>
    </div>

    <div class="fsp-note">
      ⚡ Timeline can be shortened significantly if: SRS is already numbered, Risk File exists in structured form, compliance consultant is already engaged, and Sheba testing windows are pre-agreed. First conversation with CTO should establish which of these are ready.
    </div>

    <div class="fsp-factors-label">Timeline Factors</div>
    <div class="fsp-factors">
      <div class="fsp-factor">
        <div class="fsp-factor-title">Phase 2 — First test cycle</div>
        <div class="fsp-factor-body">Writing 100h of test cases is 2.5 weeks of focused work. Execution runs in parallel — P0 defects are filed, fixes are deployed, retests are run. Each bug cycle (file → fix → build → retest) takes 3-5 days. A first cycle on a new product spans 6-8 weeks total.</div>
      </div>
      <div class="fsp-factor">
        <div class="fsp-factor-title">Phase 3 — External dependencies</div>
        <div class="fsp-factor-body">V&V Report template requires compliance consultant input. Consultant availability is typically 2-3 weeks from first contact to first working session. Usability Summative sessions require physician participation — scheduling depends on the OR calendar at Sheba.</div>
      </div>
      <div class="fsp-factor">
        <div class="fsp-factor-title">Phase 4 — Sheba OR scheduling</div>
        <div class="fsp-factor-body">SAT execution requires a scheduled OR window when no clinical procedures are running. OR scheduling is controlled by Sheba administration. Lead time for a dedicated testing window is typically 2-4 weeks from request.</div>
      </div>
    </div>`;
}

function renderRefDocs() {

  const groups = [
    {
      label: 'FDA Regulations',
      icon: '🇺🇸',
      refs: [
        { name: '21 CFR Part 820', full: 'Quality System Regulation (QMSR) - Quality Management System Requirements for Device Manufacturers', version: 'Current (updated 2024 to align with ISO 13485)', url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820' },
        { name: '21 CFR Part 11',  full: 'Electronic Records; Electronic Signatures', version: 'Current', url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11' },
      ],
    },
    {
      label: 'Consensus Standards',
      icon: '📐',
      refs: [
        { name: 'IEC 62304:2006/AMD1:2015', full: 'Medical Device Software - Software Lifecycle Processes', version: 'IEC 62304:2006/AMD1:2015', url: 'https://www.iso.org/standard/38421.html' },
        { name: 'ISO 14971:2019',           full: 'Medical Devices - Application of Risk Management to Medical Devices', version: 'ISO 14971:2019', url: 'https://www.iso.org/standard/72704.html' },
        { name: 'ISO 13485:2016',           full: 'Medical Devices - Quality Management Systems - Requirements for Regulatory Purposes', version: 'ISO 13485:2016', url: 'https://www.iso.org/standard/59752.html' },
        { name: 'IEC 62366-1:2015/AMD1:2020', full: 'Medical Devices - Usability Engineering for Medical Devices', version: 'IEC 62366-1:2015/AMD1:2020', url: 'https://www.iso.org/standard/73007.html' },
      ],
    },
    {
      label: 'FDA Guidance Documents',
      icon: '📋',
      refs: [
        { name: 'FDA SaMD Guidance',       full: 'Software as a Medical Device (SaMD): Clinical Evaluation - FDA Guidance', version: '2017', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation' },
        { name: 'FDA AI/ML Action Plan',   full: 'Artificial Intelligence and Machine Learning (AI/ML)-Based Software as a Medical Device Action Plan', version: '2021', url: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device' },
        { name: 'FDA PCCP Guidance',       full: 'Marketing Submission Recommendations for a Predetermined Change Control Plan for AI/ML-Enabled Devices', version: '2024', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence-and' },
        { name: 'FDA Cybersecurity 2023',  full: 'Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions', version: 'September 2023', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations-and-content-premarket-submissions' },
      ],
    },
    {
      label: 'Other Standards & Frameworks',
      icon: '🌐',
      refs: [
        { name: 'DICOM',  full: 'Digital Imaging and Communications in Medicine - current standard for medical imaging data exchange', version: 'Current (maintained by NEMA)', url: 'https://www.dicomstandard.org/current' },
        { name: 'HIPAA',  full: 'Health Insurance Portability and Accountability Act - Privacy and Security Rules (45 CFR Parts 160 and 164)', version: 'Current', url: 'https://www.hhs.gov/hipaa/index.html' },
      ],
    },
  ];

  const groupsHtml = groups.map(g => {
    const rows = g.refs.map(r => `
      <div class="refdoc-row">
        <div class="refdoc-name"><a href="${r.url}" target="_blank" class="slide-ext-link">${r.name}</a></div>
        <div class="refdoc-full">${r.full}</div>
        <div class="refdoc-version">${r.version}</div>
      </div>`).join('');
    return `
      <div class="refdoc-group">
        <div class="refdoc-group-header">
          <span class="refdoc-group-icon">${g.icon}</span>
          <span class="refdoc-group-label">${g.label}</span>
        </div>
        ${rows}
      </div>`;
  }).join('');

  return `
    <p class="ts-intro">All regulatory documents, standards, and guidance referenced throughout this framework. Links point to the current official versions as of the date of this document.</p>
    <div class="refdoc-groups">${groupsHtml}</div>`;
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
        'P0 (pipeline crash, silent failure, complete hint rendering loss during procedure) - immediate escalation, release is blocked, no exceptions',
        'P1 (hint rendering incorrect or incomplete: wrong overlay, missing hint type, hint on wrong frame; latency above clinical threshold) - must be resolved before release',
        'P2 (edge case rendering issues, rare DICOM format problems, non-blocking functional gaps) - risk-accepted with documented rationale, fixed in planned order',
        'P3 (UI polish, logging gaps, non-critical display issues) - logged in Jira, fixed when there is capacity',
        'All defects in Jira with mandatory fields: steps to reproduce, affected build, DICOM sequence or frame reference where applicable',
        'Clinical accuracy of AI output is not a QA defect category - tracked separately by the clinical team at Sheba',
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
      what: 'Our goal here: define how bugs are classified, who escalates what, and what the resolution standard looks like at each level. We use the same P0-P3 scale as test prioritization - one language across test cases, bug reports, and release decisions. No separate severity vs priority split at this stage.',
      nvsight: [
        'P0 - release blocker, no exceptions. If a P0 issue is open, the release does not go out. <span class="ts-nv-label">For NV-Sight:</span> hints do not reach the screen, pipeline fails silently, system crashes mid-procedure - physician loses the tool during an active intervention.',
        'P1 - must be fixed before release, but does not stop work while the fix is in progress. <span class="ts-nv-label">For NV-Sight:</span> hints arrive but with latency above the clinical threshold, PACS connection drops during a session.',
        'P2 - real problem, not clinically critical. Documented and fixed in planned order. <span class="ts-nv-label">For NV-Sight:</span> hints overlap in a rare rendering scenario, an unusual Siemens DICOM format renders slightly off.',
        'P3 - system works correctly, but something could be better. Logged and fixed when there is capacity. <span class="ts-nv-label">For NV-Sight:</span> incomplete logs, minor UI layout issues, non-critical display elements.',
        'This same P0-P3 scale applies consistently to test cases, Jira bug reports, regression run frequency, and release sign-off criteria - one language across QA, engineering, and product.',
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
  law:        'FDA Regulation',
  standard:   'Consensus Standard',
  guidance:   'FDA Guidance',
  operational:'Operational',
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
    <div class="std-internal-note">
      <span class="std-internal-icon">🗂</span>
      <span>This section is a working reference for the QA lead - not part of the main presentation. It maps regulatory requirements to QA processes and will be reviewed with a compliance consultant during onboarding.</span>
    </div>
    <p class="overview-intro" style="margin-bottom:20px">Regulatory standards and requirements relevant to QA processes and documentation for FDA submission in the US market.</p>
    <div class="std-overview-grid">${rows}</div>`;
}

function renderStandard(id) {
  const d = STANDARDS_DATA[id];
  if (!d) return `<p class="slide-placeholder">Data not found</p>`;

  const docChip = (docId) => {
    const s = SLIDES.find(sl => sl.id === docId);
    return s ? `<span class="std-doc-chip" onclick="showSlide('${s.id}')">${s.icon} ${s.title}</span>` : '';
  };

  const REL_CLASS = {
    'General':          'rel-obshhee',
    'Complement':       'rel-dopolnenie',
    'Interdependency':  'rel-vzaimozavis',
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

    <div class="std-section-title">Key QA Requirements</div>
    <div class="std-reqs">
      ${d.reqs.map(r => `
        <div class="std-req-item">
          <div class="std-req-h">${r.h}</div>
          <div class="std-req-d">${r.d}</div>
        </div>`).join('')}
    </div>

    <div class="std-section-title">Related Documents</div>
    <div class="std-chip-row" style="margin-bottom:20px">${d.docs.map(docChip).join('')}</div>

    <div class="std-section-title">Standard Cross-References</div>
    <div class="std-refs-list" style="margin-bottom:20px">${refRows}</div>

    <div class="std-pitfall-block">
      <div class="std-section-title">⚠️ Common Pitfalls</div>
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

  const cols = [
    { label: 'Unit',        owner: 'Engineering' },
    { label: 'Integration', owner: 'QA + Eng' },
    { label: 'System',      owner: 'QA' },
    { label: 'UAT',         owner: 'Physicians' },
    { label: 'Perf',        owner: 'QA' },
  ];

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
    { sym: '✅', label: 'Covered at this level (by the owner shown in the column header)' },
    { sym: '◑',  label: 'Partially covered - not all scenarios or variants' },
    { sym: '—',  label: 'Not tested at this level - wrong layer for this type of check' },
    { sym: '🏥', label: 'Clinical team at Sheba - outside QA scope' },
  ];
  const legendHtml = legend.map(l =>
    `<span class="tm-legend-item"><span class="tm-legend-sym">${l.sym}</span><span class="tm-legend-label">${l.label}</span></span>`
  ).join('');

  return `
    <p class="ts-intro">Maps test coverage across features and test levels. Shows what is tested, at which level, and at what priority - and makes explicit what falls outside QA scope.</p>
    <p class="ts-intro"><strong>Preliminary matrix - compiled on the basis of CTO conversations, the company presentation, and a short domain investigation. The actual matrix will be built after a full project onboarding.</strong></p>
    <div class="tm-legend">${legendHtml}</div>
    <div class="tm-legend-note">Priority badges (P0-P3) follow the Risk-Based Test Prioritization scale defined in the <span class="tm-legend-link" onclick="showSlide('teststrategy')">Test Strategy</span>: P0 = release blocker, P1 = must fix before release, P2 = fix in planned order, P3 = fix when capacity allows.</div>
    <div class="tm-table-wrap">
      <table class="tm-table">
        <thead>
          <tr>
            <th class="tm-th-label">Feature / Scenario</th>
            ${cols.map(col => `<th class="tm-th-col">${col.label}<div class="tm-th-owner">${col.owner}</div></th>`).join('')}
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
