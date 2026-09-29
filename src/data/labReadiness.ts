// Lab Readiness master data. Mirrors the website's SOP list
// (app/Support/LabReadinessSeed.php) so the app shows the real activities.

export type Phase = 'opening' | 'closing';
export type UnitKind = 'nrl' | 'regional' | 'satellite';

export type LabUnit = { id: string; name: string; kind: UnitKind };

export const unitKinds: Record<UnitKind, { tag: string; detail: string }> = {
  nrl: { tag: 'NRL', detail: 'NRL Hyderabad · by department' },
  regional: { tag: 'Regional', detail: 'Regional laboratory' },
  satellite: { tag: 'Satellite', detail: 'Satellite laboratory' },
};

export const units: LabUnit[] = [
  { id: 'nrl-preanalytical', name: 'Pre-analytical & Accessioning', kind: 'nrl' },
  { id: 'nrl-biochemistry', name: 'Clinical Biochemistry', kind: 'nrl' },
  { id: 'nrl-haematology', name: 'Haematology & Coagulation', kind: 'nrl' },
  { id: 'nrl-clinpath', name: 'Clinical Pathology', kind: 'nrl' },
  { id: 'nrl-serology', name: 'Serology & Immunoassay', kind: 'nrl' },
  { id: 'nrl-microbiology', name: 'Microbiology', kind: 'nrl' },
  { id: 'nrl-molecular', name: 'Molecular Biology', kind: 'nrl' },
  { id: 'nrl-histopath', name: 'Histopathology & Cytology', kind: 'nrl' },
  { id: 'lab-anantapur', name: 'Anantapur', kind: 'regional' },
  { id: 'lab-noida', name: 'Noida', kind: 'regional' },
  { id: 'lab-chandigarh', name: 'Chandigarh', kind: 'regional' },
  { id: 'lab-bangalore', name: 'Bangalore', kind: 'regional' },
  { id: 'lab-satellite-1', name: 'Satellite Lab 1', kind: 'satellite' },
  { id: 'lab-satellite-2', name: 'Satellite Lab 2', kind: 'satellite' },
];

export const HOME_UNIT = 'nrl-biochemistry';

export const unitOptions = units.map(u => ({
  id: u.id,
  label: u.name,
  tag: unitKinds[u.kind].tag,
  detail: unitKinds[u.kind].detail,
}));

export const sectionOrder: Record<Phase, string[]> = {
  opening: [
    'Facility, safety & housekeeping',
    'Environmental monitoring',
    'Equipment start-up',
    'Reagents & consumables',
    'Internal quality control',
    'LIS & pre-analytical readiness',
    'Information systems & stock',
    'Manpower & declaration',
  ],
  closing: [
    'Workload reconciliation',
    'Sample storage & retention',
    'Equipment shutdown',
    'Waste, stock & data',
    'Information systems & stock',
    'Commercial, security & declaration',
  ],
};

export const declarations: Record<Phase, string> = {
  opening:
    'I confirm that all activities above have been completed and recorded, and that the laboratory is fit to accept and examine patient samples.',
  closing:
    'I confirm that all activities above have been completed and recorded, that all deviations have been escalated, and that the laboratory has been secured.',
};

export const dueBy: Record<Phase, string> = { opening: '08:30', closing: '21:50' };

export type Activity = {
  key: string;
  phase: Phase;
  section: string;
  text: string;
  time: string;
  photoRequired: boolean;
};

const F = 'Facility, safety & housekeeping';
const E = 'Environmental monitoring';
const Q = 'Equipment start-up';
const R = 'Reagents & consumables';
const I = 'Internal quality control';
const L = 'LIS & pre-analytical readiness';
const S = 'Information systems & stock';
const M = 'Manpower & declaration';
const W = 'Workload reconciliation';
const T = 'Sample storage & retention';
const D = 'Equipment shutdown';
const B = 'Waste, stock & data';
const C = 'Commercial, security & declaration';

const row = (
  phase: Phase,
  key: string,
  section: string,
  text: string,
  time: string,
  photoRequired = false,
): Activity => ({ key, phase, section, text, time, photoRequired });

const o = (k: string, sec: string, text: string, time: string, photo = false) =>
  row('opening', k, sec, text, time, photo);
const c = (k: string, sec: string, text: string, time: string, photo = false) =>
  row('closing', k, sec, text, time, photo);

export const activities: Activity[] = [
  o('o02', F, 'Check that the laboratory is secure and that CCTV and access control are working', '07:00'),
  o('o03', F, 'Check that mains power supply is available', '07:05'),
  o('o04', F, 'Check that the UPS and backup power are available and charged', '07:05'),
  o('o05', E, 'Record the ambient temperature and humidity', '07:10', true),
  o('o06', F, 'Check that the laboratory is clean and tidy', '07:10', true),
  o('o07', F, 'Check that water supply is available', '07:10'),
  o('o08', E, 'Record refrigerator and freezer temperatures', '07:15', true),
  o('o09', R, 'Check that reagents, controls and calibrators are stored under the required conditions', '07:20'),
  o('o10', R, 'Check reagent expiry dates and the open-vial validity of reagents in use', '07:20'),
  o('o11', Q, 'Check that all analyzers and instruments are in good working condition', '07:25'),
  o('o12', Q, 'Switch on the instruments required for the day', '07:25'),
  o('o13', Q, 'Check instruments for alarms or error messages and resolve them', '07:30'),
  o('o14', Q, 'Carry out the daily maintenance activities for each instrument', '07:30'),
  o('o15', Q, 'Check that the calibration of all equipment is current', '07:35'),
  o('o16', R, 'Check reagent levels on board each analyzer', '07:35'),
  o('o17', F, 'Check that waste containers are in place, labelled and empty', '07:40', true),
  o('o18', F, 'Check that adequate PPE is available', '07:40'),
  o('o19', L, 'Check that the sample collection area is ready for patients', '07:45', true),
  o('o20', I, 'Run IQC and confirm the results meet the acceptance criteria', '07:50', true),
  o('o21', I, 'Confirm that the analyzers are ready for patient testing', '08:10'),
  o('o22', L, 'Check that the LIS/HIS, analyzer interfaces, printers and scanners are working', '08:15'),
  o('o23', S, 'Review QTQMS for open NCs, CAPAs, document reviews and training due', '08:20'),
  o('o24', M, 'Check staff attendance and authorized signatory availability, and conduct the team briefing', '08:25'),
  o('o25', F, 'Check that the washrooms are clean and usable', '08:25'),
  o('o26', F, 'Check that the eyewash station and first-aid kit are complete and ready for use', '08:30'),
  o('o27', M, 'Confirm the laboratory is ready to start testing patient samples for the day', '08:30'),

  c('c01', W, 'Confirm that all samples received during the day have been logged and processed', '20:30'),
  c('c02', W, 'Review pending patient samples and their release timelines', '20:35'),
  c('c03', W, 'Review abnormal, critical and pending results', '20:40', true),
  c('c04', D, 'Shut down the analyzers as per the shutdown procedure', '20:45'),
  c('c05', D, 'Carry out end-of-day cleaning and maintenance of the instruments', '20:50', true),
  c('c06', T, 'Check the condition of reagents in storage', '20:55'),
  c('c07', T, 'Store reagents at the required temperatures (room temperature or refrigerator)', '20:55', true),
  c('c08', T, 'Record the closing refrigerator and freezer temperatures', '21:00', true),
  c('c09', B, 'Segregate and dispose of biomedical waste as per procedure', '21:00', true),
  c('c10', B, 'Clean the work benches', '21:05', true),
  c('c11', B, 'Clean the sample processing area', '21:05', true),
  c('c12', D, 'Inspect the centrifuges, mixers, incubators and other equipment', '21:10'),
  c('c13', D, 'Switch off equipment that is not required overnight', '21:10'),
  c('c14', C, 'Check that water and gas supplies are turned off or secured', '21:15'),
  c('c15', C, 'Check that all doors and windows are locked', '21:15'),
  c('c16', C, 'Check that emergency equipment is in place and ready for use', '21:20'),
  c('c17', C, 'Secure patient records and controlled documents', '21:20'),
  c('c18', B, 'Check that all waste is secured', '21:25', true),
  c('c19', C, 'Switch off lights and air conditioning where applicable', '21:25'),
  c('c20', W, 'Confirm that all authorized reports have been released', '21:30'),
  c('c21', S, 'Run the LIS/server backup and confirm it has completed', '21:30', true),
  c('c22', S, 'Update QTQMS with the day\'s deviations, NCs and CAPAs', '21:35'),
  c('c23', S, 'Update the day\'s consumption in AIMS', '21:35'),
  c('c24', S, 'Review the stock position and raise indents for low inventory', '21:40'),
  c('c25', C, 'Secure the laboratory premises, activate the security systems and confirm CCTV is recording', '21:45', true),
  c('c26', C, 'Carry out a final walk-through inspection of the laboratory', '21:50'),
];

export const activitiesFor = (phase: Phase) =>
  activities.filter(a => a.phase === phase);

export { TODAY_ISO as TODAY, longDate as dateLabel } from '../utils/dates';
