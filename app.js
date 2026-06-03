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
  else if (id === 'bugreporting')   content = renderBugReporting();
  else if (id === 'metrics')        content = renderMetrics();
  else if (id === 'testplans')      content = renderTestPlans();
  else if (id === 'testcases')      content = renderTestCases();
  else if (id === 'automation')     content = renderAutomation();
  else if (id === 'defectworkflow') content = renderDefectWorkflow();
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

function renderBugReporting() {
  const fields = [
    {
      label: 'Title',
      hint: '[Component] Short description of the observed behavior',
      ex: '[Rendering] Aneurysm hint missing on frame 14 of series after PACS reconnect',
      note: 'Describe what the system does, not what you expected. Component tag keeps Jira filterable.',
    },
    {
      label: 'Priority',
      hint: 'P0 / P1 / P2 / P3 - required at filing time, not "to be determined"',
      ex: 'P1',
      note: 'Same scale as test case priority and release gates. If unsure between P0 and P1, pick P0 and discuss - not the other way around.',
    },
    {
      label: 'Build Version',
      hint: 'Exact build identifier where the defect was first observed',
      ex: '2.4.1-rc3 (build 20240918)',
      note: 'Without this, the developer cannot determine if the bug is already fixed in a later build.',
    },
    {
      label: 'Environment',
      hint: 'QA / UAT / staging - never production (HIPAA)',
      ex: 'QA env - dedicated Siemens simulator, PACS test instance v3.1',
      note: 'Include PACS version and Siemens simulator config if the bug is at the integration layer.',
    },
    {
      label: 'Steps to Reproduce',
      hint: 'Numbered, minimal path to trigger the defect - no assumptions',
      ex: '1. Load DICOM series [UID]. 2. Wait for hint overlay to render. 3. Simulate PACS disconnect (kill process). 4. Reconnect PACS. 5. Observe hint state.',
      note: 'If steps cannot be condensed to under 10 lines, the reproduction case is not isolated enough.',
    },
    {
      label: 'Expected Result',
      hint: 'What the system should do, ideally referencing the spec or requirement ID',
      ex: 'All previously rendered hints persist through PACS reconnect. No re-render required. Ref: SRS-RND-042.',
      note: 'Linking to a requirement turns the bug into a traceability artifact - useful for the DHF.',
    },
    {
      label: 'Actual Result',
      hint: 'What the system actually does - precise, observable, no interpretation',
      ex: 'Hint overlay clears completely on reconnect. Frame 14 shows no hint after PACS reconnect even though hint was visible before disconnect.',
      note: 'Avoid "it does not work" or "hint is wrong" - describe what is visible on screen.',
    },
    {
      label: 'DICOM Reference',
      hint: 'Series UID, frame number, hint type - mandatory for any rendering or pipeline bug',
      ex: 'Study UID: 1.2.840.xxx | Series UID: 1.2.840.yyy | Frame: 14 | Hint type: Aneurysm marker',
      note: 'Without a DICOM reference, rendering bugs cannot be reproduced by engineering. This field is non-negotiable for hint delivery defects.',
    },
    {
      label: 'Evidence',
      hint: 'Screenshot, screen recording, or DICOM viewer export attached to the ticket',
      ex: 'screen-rec-20240918-frame14-reconnect.mp4 (attached)',
      note: 'For P0 and P1 bugs, a screen recording of the full reproduction sequence is expected, not just a screenshot of the final state.',
    },
    {
      label: 'Related Test Case',
      hint: 'Test case ID from the test plan that covers this scenario',
      ex: 'TC-RND-014',
      note: 'Required for traceability matrix and V&V report. A bug with no linked test case is a gap in coverage that needs to be explained.',
    },
  ];

  const fieldRows = fields.map(f => `
    <div class="br-field-row">
      <div class="br-field-label">${f.label}</div>
      <div class="br-field-body">
        <div class="br-field-hint">${f.hint}</div>
        <div class="br-field-ex"><span class="br-ex-tag">e.g.</span> ${f.ex}</div>
        <div class="br-field-note">${f.note}</div>
      </div>
    </div>`).join('');

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
      desc: 'Tracks how much of the planned test scope has been run. Tells you where you are in the test cycle.',
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
    <p class="ts-intro">Metrics make the QA process visible and auditable. For a Class C SaMD, gut feeling is not a release criterion - every gate decision must be backed by a number that can be shown to an auditor. The metrics below track three things: are we executing enough, are we finding and closing defects fast enough, and is the environment stable enough to trust the results.</p>

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
      what: 'Our goal here: define what this specific test plan covers - which build, which sprint or release, which test levels are included. A test plan without a defined scope is a liability: it creates ambiguity about what was tested and what was not, which is exactly what an auditor will ask about.',
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
        'Hint rendering pipeline: all defined hint types (aneurysm marker, occlusion highlight, measurement overlay) - referenced against SRS-RND-001 through SRS-RND-0XX',
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
      title: 'Test Approach',
      what: 'Our goal here: describe how testing will be done - what techniques, what execution model, and what makes this approach appropriate for the risk level. For a Class C SaMD, "we ran the test cases" is not a sufficient description.',
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
        '<strong>Linked requirement</strong> - SRS or SDS requirement ID this test case covers. If no requirement exists, the test case must not be filed - it signals a gap in the specification.',
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
        'Expected results reference the SRS: "Hint overlay for Aneurysm marker appears within 2 seconds of DICOM delivery, at the position defined in SRS-RND-015." Not "hint appears quickly."',
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

  // ── Lifecycle states diagram ──────────────────────────────────────────────
  const states = [
    { id: 'new',        label: 'New',         desc: 'Filed by QA. Mandatory fields complete. Priority set.',                                         cls: 'dw-st-new' },
    { id: 'triage',     label: 'Triage',       desc: 'Priority confirmed by QA lead. Assigned to engineering. Sprint scheduled.',                     cls: 'dw-st-triage' },
    { id: 'inprog',     label: 'In Progress',  desc: 'Engineering owns. Active fix underway. P0 = same-day start.',                                  cls: 'dw-st-inprog' },
    { id: 'fixed',      label: 'Fixed',        desc: 'Engineering marks fixed, links commit and build number. QA is notified.',                       cls: 'dw-st-fixed' },
    { id: 'verify',     label: 'In Verify',    desc: 'QA re-executes the original test case on the fix build. Must reproduce the failure first.',     cls: 'dw-st-verify' },
    { id: 'closed',     label: 'Closed',       desc: 'Fix confirmed. TC result updated. Traceability matrix updated.',                                cls: 'dw-st-closed' },
    { id: 'rejected',   label: 'Rejected',     desc: 'Not reproducible or filed in error. Reason documented. Original reporter notified.',            cls: 'dw-st-rejected' },
    { id: 'wontfix',    label: "Won't Fix",    desc: "Risk-accepted. Documented rationale, approver named. P0/P1 cannot be Won't Fixed.",            cls: 'dw-st-wontfix' },
    { id: 'reopen',     label: 'Reopened',     desc: 'Fix did not resolve the issue. Returned to Triage with a note on why verification failed.',    cls: 'dw-st-reopen' },
  ];

  const stateCards = states.map(s => `
    <div class="dw-state-card ${s.cls}">
      <div class="dw-state-label">${s.label}</div>
      <div class="dw-state-desc">${s.desc}</div>
    </div>`).join('');

  const mustHave = [
    {
      title: 'Defect Lifecycle - Workflow States',
      what: 'Our goal here: define the states a bug moves through from filing to closure, and what must happen at each transition. State transitions are the audit trail. An auditor reviewing the DHF should be able to reconstruct the full history of any P0 or P1 defect - who filed it, who triaged it, who fixed it, who verified it, and when each step happened.',
      label: 'states',
    },
    {
      title: 'Triage',
      what: 'Our goal here: confirm priority, assign ownership, and schedule resolution within one business day of filing. Triage is a decision point, not a rubber stamp. The filed priority can be adjusted at triage - but the adjustment must be documented with a reason.',
      nvsight: [
        'Triage is conducted by the QA lead, with engineering present for P0 and P1 bugs. P2 and P3 are triaged asynchronously by QA lead and assigned in the next sprint planning slot.',
        'At triage: confirm or adjust priority (with reason documented in Jira), assign to the responsible engineering component owner, agree on resolution target (same sprint / next sprint / backlog), identify if a workaround exists for P1 and P2.',
        'Priority can only be downgraded at triage with written justification and the agreement of both QA lead and Product. Priority cannot be downgraded based on timeline pressure alone.',
        'P0 bugs skip the triage queue - they are escalated immediately per the escalation path defined in Bug Reporting Standards. Triage for P0 means retrospective confirmation of the priority after the fix is underway, not a gate before the fix starts.',
        'Every triage decision is logged as a Jira comment, not in a separate doc. The comment format: "Triage [date]: Priority confirmed P1. Assigned to [name]. Target: sprint [X]. Workaround: [none / description]."',
      ],
    },
    {
      title: 'Fix and Handoff to QA',
      what: 'Our goal here: define what a complete fix handoff looks like. A bug marked "Fixed" by engineering without the information QA needs to verify it is not fixed - it is deferred work. The handoff standard is agreed before the first sprint starts.',
      nvsight: [
        'Engineering transitions the ticket to Fixed and adds a Jira comment with: commit hash or PR link, build number where the fix is included, a brief description of what was changed and why.',
        'If the fix required a change to the DICOM handling, rendering pipeline, or PACS integration layer - a note on what regression risk the change introduces and which test cases QA should prioritise in verification.',
        'QA is notified via Jira ticket update. For P0 and P1 fixes, QA lead is also notified in Slack with a direct link to the ticket and the fix build number.',
        'A fix that changes the expected behaviour of the system (as opposed to restoring it) requires a specification update before QA can verify. QA does not verify against undocumented behaviour.',
        'For NV-Sight specifically: any fix touching the hint rendering pipeline or PACS session management triggers a targeted regression on the P0 suite, even if the bug was P2.',
      ],
    },
    {
      title: 'Verification',
      what: 'Our goal here: define what QA does to confirm a fix is valid. Verification is not a casual rerun of the happy path. For a medical device, a fix that is incorrectly closed as verified is a V&V gap that can surface at audit.',
      nvsight: [
        'Verification starts by reproducing the original failure on a pre-fix build (or the build where the failure was first observed). If the failure cannot be reproduced, the test is marked Blocked and the defect is routed back to Triage for a root cause discussion.',
        'After confirming reproduction, QA applies the fix build and re-runs the original test case. If the original test case passes, the fix is provisionally confirmed.',
        'For P0 and P1: verification also includes a targeted regression covering adjacent test cases that could have been affected by the fix. The regression scope is determined by the engineering handoff note.',
        'Verification result is logged as a Jira comment: "Verified [date] on build [X.Y.Z]. Original failure reproduced on [prior build]. Fix confirmed - TC-[ID] passed. Regression: [TC list] - all passed." The ticket is then moved to Closed.',
        'If verification fails, the ticket is moved to Reopened with a comment explaining what was observed and on which build. The Reopened ticket goes back to Triage, not directly to In Progress - priority is reconfirmed before the next fix attempt.',
      ],
    },
    {
      title: "Won't Fix and Risk Acceptance",
      what: "Our goal here: define how defects that will not be fixed are handled. A Won't Fix is not a way to make a bug disappear - it is a documented risk acceptance decision. For a Class C SaMD, an undocumented Won't Fix is an open regulatory risk.",
      nvsight: [
        "P0 and P1 defects cannot be Won't Fixed. If a P0 or P1 defect cannot be resolved before release, the release does not go out. There is no documented exception to this.",
        "P2 Won't Fix: requires written rationale in Jira, named approver (QA lead and Product), and a risk impact statement - what is the clinical consequence of leaving this defect open. Filed in the DHF.",
        "P3 Won't Fix: requires a Jira comment with rationale. No separate risk document required, but the decision must be visible in the ticket.",
        "Won't Fix is not the same as Deferred. A deferred bug has a target sprint. A Won't Fix is a final decision. If the decision changes, the ticket is reopened - not a new ticket filed.",
        "All Won't Fix decisions for P2 defects are reviewed at the start of the next release cycle. A P2 that was Won't Fixed in three consecutive releases needs a product-level decision on whether the underlying issue should be addressed in the spec.",
      ],
    },
    {
      title: 'Regulatory and Audit Considerations',
      what: 'Our goal here: make the defect tracking system audit-ready from day one. Under 21 CFR Part 820 (CAPA) and IEC 62304, defect records for a medical device are not internal operational data - they are regulated artifacts that an FDA inspector or notified body auditor can request at any time.',
      nvsight: [
        'Every P0 and P1 defect has a CAPA implication: after closure, a brief root cause analysis is documented in the Jira ticket. Not a full CAPA report for every bug - but the root cause category (specification gap, implementation error, test environment issue, regression from prior change) must be tagged.',
        'Defect records are never deleted from Jira. Incorrectly filed tickets are marked Rejected with a reason. Duplicate tickets are linked and one is closed as Duplicate - both remain in the system.',
        'The full comment history of every P0 and P1 ticket is part of the DHF. QA exports P0 and P1 ticket histories as part of the V&V report package.',
        'Jira field changes (priority adjustment, reassignment, state transitions) are logged automatically by Jira. The audit log is not modified. Any bulk state change (e.g. closing old backlog items before a release) is done via a documented triage session, not a silent batch update.',
        'For NV-Sight: a defect that involves hint rendering failure during a procedure scenario is flagged with the label "patient-safety-relevant" regardless of priority. This label triggers automatic inclusion in the ISO 14971 risk review at the next release cycle.',
      ],
    },
  ];

  const niceToHave = [
    'Defect Aging Report - a weekly automated report of open bugs by priority and age, flagging any P1 that has been open longer than one sprint without a fix build',
    'Root Cause Category Taxonomy - a defined tag set in Jira (spec gap, implementation error, env issue, regression, data issue) to enable trend analysis across sprints',
    'SLA Dashboard - live view of mean time to fix and mean time to verify by priority level, used in the QA quality report',
    'Automated Jira Transitions from CI - CI failure on a linked test case automatically transitions the defect to Reopened if it was in Fixed or Closed state',
    'Defect Density Trend - sprint-over-sprint defect count by component, used to identify areas of the codebase with structural quality issues',
  ];

  const sections = mustHave.map(s => {
    if (s.label === 'states') {
      return `
      <div class="ts-section">
        <div class="ts-section-header">
          <div class="ts-section-title">${s.title}</div>
        </div>
        <div class="ts-section-what">${s.what}</div>
        <div class="dw-states-grid">${stateCards}</div>
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
    <p class="ts-intro">A defect workflow is the process that governs a bug from the moment it is filed to the moment it is closed or formally risk-accepted. For NV-Sight, defect records are regulatory artifacts: every P0 and P1 defect is part of the CAPA chain and the DHF. The workflow below ensures that nothing falls through the cracks, and that every decision - fix, defer, reject, or risk-accept - is documented and traceable.</p>

    <div class="ts-label-row">
      <span class="ts-must-label">Must-Have</span>
      <span class="ts-label-sub">sections with preliminary NV-Sight content</span>
    </div>

    <div class="ts-sections">${sections}</div>

    <div class="ts-nicehave-block">
      <div class="ts-nicehave-title">Nice-to-Have sections</div>
      <p class="ts-nicehave-note">Operational improvements that add visibility and automation to the workflow. Added after the base process is stable.</p>
      <ul class="ts-nice-list">${niceList}</ul>
    </div>`;
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
    <p class="ts-intro"><strong>Preliminary matrix - compiled on the basis of CTO conversations, the company presentation, and a short domain investigation. The actual matrix will be built after a full project onboarding.</strong></p>
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
