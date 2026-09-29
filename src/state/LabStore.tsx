import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import {
  activitiesFor,
  Activity,
  HOME_UNIT,
  Phase,
  sectionOrder,
  TODAY,
} from '../data/labReadiness';
import { currentUser } from '../data/user';
import type { Point } from '../utils/location';
import { clockNow } from './Store';

// In-memory Lab Readiness records for the UI round.

export type LabStatus = 'done' | 'deviation' | 'na';
// A photo without a uri is sample data; it is drawn as a placeholder tile.
export type LabPhoto = { id: string; uri?: string };

export type LabItem = {
  status: LabStatus | null;
  remark: string;
  photos: LabPhoto[];
  actionedAt?: string;
  actionedBy?: string;
};

export type Reopen = {
  at: string;
  by: string;
  signedBy: string;
  signedAt: string;
  reason: string;
};

export type LabRecord = {
  unitId: string;
  date: string;
  phase: Phase;
  items: Record<string, LabItem>;
  startedAt?: string;
  startedBy?: string;
  // Where the phone was when the first activity was marked.
  startPoint?: Point | null;
  signed?: {
    by: string;
    role: string;
    at: string;
    selfie?: string;
    point?: Point | null;
  };
  reopenLog: Reopen[];
};

export const recordKey = (unitId: string, date: string, phase: Phase) =>
  `${unitId}|${date}|${phase}`;

const emptyItem: LabItem = { status: null, remark: '', photos: [] };

export const itemOf = (record: LabRecord | undefined, key: string): LabItem =>
  record?.items[key] ?? emptyItem;

export const needsRemark = (item: LabItem) =>
  (item.status === 'deviation' || item.status === 'na') && !item.remark.trim();

export const needsPhoto = (activity: Activity, item: LabItem) =>
  item.status === 'done' && activity.photoRequired && item.photos.length === 0;

export const isComplete = (activity: Activity, item: LabItem) =>
  item.status !== null && !needsRemark(item) && !needsPhoto(activity, item);

export type LabSection = { title: string; rows: Activity[]; complete: number };

export function summarise(phase: Phase, record: LabRecord | undefined) {
  const list = activitiesFor(phase);
  const complete = list.filter(a => isComplete(a, itemOf(record, a.key)));
  const count = (st: LabStatus) =>
    complete.filter(a => itemOf(record, a.key).status === st).length;

  const sections: LabSection[] = sectionOrder[phase]
    .map(title => {
      const rows = list.filter(a => a.section === title);
      return {
        title,
        rows,
        complete: rows.filter(a => isComplete(a, itemOf(record, a.key))).length,
      };
    })
    .filter(sec => sec.rows.length > 0);

  // Counts by chosen status, used in history where blockers do not matter.
  const chosen = (st: LabStatus) =>
    list.filter(a => itemOf(record, a.key).status === st).length;

  return {
    total: list.length,
    complete: complete.length,
    open: list.length - complete.length,
    done: count('done'),
    deviation: count('deviation'),
    na: count('na'),
    chosen: { done: chosen('done'), deviation: chosen('deviation'), na: chosen('na') },
    photos: list.reduce((n, a) => n + itemOf(record, a.key).photos.length, 0),
    sections,
  };
}

// ---------------------------------------------------------------------------
// Sample records

// NRL Begumpet, used on the sample records.
const SAMPLE_POINT: Point = { lat: 17.4437, lng: 78.4651, accuracy: 12 };

let photoCounter = 0;
const samplePhotos = (n: number): LabPhoto[] =>
  Array.from({ length: n }, () => ({ id: `sample-${++photoCounter}` }));

function filled(
  unitId: string,
  date: string,
  phase: Phase,
  by: string,
  signedAt: string | null,
  options: { skip?: string[]; deviation?: Record<string, string>; na?: Record<string, string> } = {},
): LabRecord {
  const items: Record<string, LabItem> = {};
  for (const a of activitiesFor(phase)) {
    if (options.skip?.includes(a.key)) {
      continue;
    }
    const deviation = options.deviation?.[a.key];
    const na = options.na?.[a.key];
    items[a.key] = {
      status: deviation !== undefined ? 'deviation' : na !== undefined ? 'na' : 'done',
      remark: deviation ?? na ?? '',
      photos: samplePhotos(a.photoRequired ? 1 : 0),
      actionedAt: a.time,
      actionedBy: by,
    };
  }
  const first = activitiesFor(phase)[0].time;
  return {
    unitId,
    date,
    phase,
    items,
    startedAt: first,
    startedBy: by,
    startPoint: SAMPLE_POINT,
    signed: signedAt
      ? { by, role: 'Section in-charge', at: signedAt, point: SAMPLE_POINT }
      : undefined,
    reopenLog: [],
  };
}

const seed: LabRecord[] = [
  // Today, in progress: 15 done, 2 deviations, 1 N/A, 8 open.
  filled(HOME_UNIT, TODAY, 'opening', 'Priya Sharma', null, {
    skip: ['o19', 'o20', 'o21', 'o22', 'o23', 'o24', 'o26', 'o27'],
    deviation: {
      o08: 'Freezer 2 reading −16 °C at 07:15. Door seal loose — Biomedical team informed, samples moved to Freezer 1.',
      o13: 'Analyser 3 showed a reagent probe alarm. Probe cleaned and alarm cleared at 07:42.',
    },
    na: { o15: 'Calibration is scheduled with the service visit tomorrow.' },
  }),
  filled(HOME_UNIT, '2026-09-28', 'opening', 'Priya Sharma', '08:34'),
  {
    ...filled(HOME_UNIT, '2026-09-28', 'closing', 'Ravi Kumar', '21:56', {
      deviation: {
        c21: 'Backup failed on the first attempt. Rerun by IT completed at 21:50.',
      },
    }),
    reopenLog: [
      {
        at: '28 Sep 2026, 21:40',
        by: 'Ravi Kumar',
        signedBy: 'Ravi Kumar',
        signedAt: '21:32',
        reason: 'Backup status was recorded before the rerun finished.',
      },
    ],
  },
  filled('nrl-haematology', '2026-09-28', 'opening', 'Suresh Naidu', '08:41', {
    na: { o19: 'No sample collection area in this section.' },
  }),
  filled('lab-anantapur', '2026-09-28', 'opening', 'Anitha Rao', null, {
    skip: ['o24', 'o25', 'o26', 'o27'],
  }),
  filled(HOME_UNIT, '2026-09-27', 'opening', 'Priya Sharma', '08:29'),
  filled(HOME_UNIT, '2026-09-27', 'closing', 'Ravi Kumar', '21:52'),
  filled('lab-bangalore', '2026-09-26', 'closing', 'Kiran Varma', '22:05', {
    deviation: { c09: 'Waste vendor pickup delayed. Waste sealed and stored in the holding room.' },
  }),
];

// ---------------------------------------------------------------------------

type LabStore = {
  records: Record<string, LabRecord>;
  setStatus: (unitId: string, date: string, phase: Phase, key: string, status: LabStatus | null) => void;
  setRemark: (unitId: string, date: string, phase: Phase, key: string, remark: string) => void;
  addPhotos: (unitId: string, date: string, phase: Phase, key: string, uris: string[]) => void;
  removePhoto: (unitId: string, date: string, phase: Phase, key: string, photoId: string) => void;
  signOff: (
    unitId: string,
    date: string,
    phase: Phase,
    selfie?: string,
    point?: Point | null,
  ) => void;
  // The latest position the phone reported; stamped on new records.
  setPosition: (point: Point | null) => void;
  reopen: (unitId: string, date: string, phase: Phase, reason: string) => void;
};

const LabContext = createContext<LabStore | null>(null);

export const MAX_PHOTOS = 12;

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record<string, LabRecord>>(() =>
    Object.fromEntries(seed.map(r => [recordKey(r.unitId, r.date, r.phase), r])),
  );

  const position = useRef<Point | null>(null);

  const value = useMemo<LabStore>(() => {
    const change = (
      unitId: string,
      date: string,
      phase: Phase,
      edit: (record: LabRecord) => LabRecord,
    ) =>
      setRecords(all => {
        const key = recordKey(unitId, date, phase);
        const current: LabRecord = all[key] ?? {
          unitId,
          date,
          phase,
          items: {},
          startedAt: clockNow(),
          startedBy: currentUser.name,
          startPoint: position.current,
          reopenLog: [],
        };
        return { ...all, [key]: edit(current) };
      });

    const editItem = (
      unitId: string,
      date: string,
      phase: Phase,
      key: string,
      edit: (item: LabItem) => LabItem,
    ) =>
      change(unitId, date, phase, record =>
        record.signed
          ? record
          : {
              ...record,
              items: { ...record.items, [key]: edit(itemOf(record, key)) },
            },
      );

    const stamp = { actionedAt: clockNow(), actionedBy: currentUser.name };

    return {
      records,
      setStatus: (unitId, date, phase, key, status) =>
        editItem(unitId, date, phase, key, item => ({
          ...item,
          status,
          actionedAt: clockNow(),
          actionedBy: currentUser.name,
        })),
      setRemark: (unitId, date, phase, key, remark) =>
        editItem(unitId, date, phase, key, item => ({ ...item, remark })),
      addPhotos: (unitId, date, phase, key, uris) =>
        editItem(unitId, date, phase, key, item => ({
          ...item,
          ...stamp,
          photos: [
            ...item.photos,
            ...uris.map(uri => ({ id: `p-${++photoCounter}`, uri })),
          ].slice(0, MAX_PHOTOS),
        })),
      removePhoto: (unitId, date, phase, key, photoId) =>
        editItem(unitId, date, phase, key, item => ({
          ...item,
          photos: item.photos.filter(p => p.id !== photoId),
        })),
      setPosition: point => {
        position.current = point;
      },
      signOff: (unitId, date, phase, selfie, point) =>
        change(unitId, date, phase, record => ({
          ...record,
          signed: {
            by: currentUser.name,
            role: currentUser.role,
            at: clockNow(),
            selfie,
            point: point ?? position.current,
          },
        })),
      reopen: (unitId, date, phase, reason) =>
        change(unitId, date, phase, record =>
          record.signed
            ? {
                ...record,
                signed: undefined,
                reopenLog: [
                  ...record.reopenLog,
                  {
                    at: `Today, ${clockNow()}`,
                    by: currentUser.name,
                    signedBy: record.signed.by,
                    signedAt: record.signed.at,
                    reason,
                  },
                ],
              }
            : record,
        ),
    };
  }, [records]);

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const store = useContext(LabContext);
  if (!store) {
    throw new Error('useLab must be used inside LabProvider');
  }
  return store;
}
