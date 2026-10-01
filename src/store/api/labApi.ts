import { baseApi } from './baseApi';

// Shapes exactly as the API sends them.

export type Phase = 'opening' | 'closing';

export type LabUnit = {
  id: number;
  key: string;
  name: string;
  kind: 'nrl' | 'regional' | 'satellite';
  label: string;
};

export type LabPhoto = { id: number; url: string; name: string };

export type LabItem = {
  key: string;
  text: string;
  section: string;
  time: string | null;
  photoReq: boolean;
  status: 'done' | 'deviation' | 'na' | null;
  remark: string | null;
  actionedAt: string | null;
  actionedBy: string | null;
  photos: LabPhoto[];
};

export type Point = {
  lat: number;
  lng: number;
  accuracy: number | null;
  label: string;
  mapUrl: string;
};

export type Reopen = {
  ts: string;
  by: string | null;
  signedBy: string | null;
  signedAt: string | null;
  reason: string;
};

export type LabRun = {
  id: number;
  startedAt: string | null;
  startedBy: string | null;
  location: { start: Point | null; signoff: Point | null };
  signed: boolean;
  signedBy: string | null;
  signedRole: string | null;
  signedAt: string | null;
  declaration: string | null;
  selfie: string | null;
  reopenLog: Reopen[];
};

export type LabSummary = {
  total: number;
  done: number;
  dev: number;
  na: number;
  pending: number;
  photos: number;
  blockers: string[];
  complete: boolean;
};

export type LabState = {
  ok: true;
  unit: LabUnit;
  date: string;
  phase: Phase;
  run: LabRun | null;
  items: LabItem[];
  summary: LabSummary;
  declaration: string;
  signer: { name: string; role: string };
};

// Every write returns the fresh record, without the unit block.
type Written = { ok: true; run: LabRun | null; items: LabItem[]; summary: LabSummary };

export type Target = { unit: string; date: string; phase: Phase };
export type GeoPoint = { lat: number; lng: number; accuracy: number | null } | null;

export type HistoryRow = {
  id: number;
  date: string;
  unitId: number;
  unitKey: string;
  unitName: string;
  unitKind: string;
  phase: Phase;
  startedAt: string | null;
  startedBy: string | null;
  signedAt: string | null;
  located: boolean;
  done: number;
  dev: number;
  na: number;
  photos: number;
  signed: boolean;
  signedBy: string | null;
  reopens: number;
};

export type PageMeta = { page: number; per_page: number; total: number; last_page: number };

export type HistoryQuery = {
  unit?: string;
  phase?: Phase;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type LabRecordItem = {
  taskKey: string;
  text: string;
  section: string;
  time: string | null;
  status: LabItem['status'];
  remark: string | null;
  actionedAt: string | null;
  actionedBy: string | null;
  photos: LabPhoto[];
};

export type LabRecord = {
  id: number;
  unitName: string;
  unitKind: string;
  startedAt: string | null;
  startedBy: string | null;
  location: { start: Point | null; signoff: Point | null };
  phase: Phase;
  date: string;
  dateLabel: string;
  done: number;
  dev: number;
  na: number;
  signed: boolean;
  signedBy: string | null;
  signedRole: string | null;
  signedAt: string | null;
  declaration: string | null;
  selfie: string | null;
  reopenLog: Reopen[];
  purgedAt: string | null;
  items: LabRecordItem[];
};

// A file the phone picked, in the shape React Native's FormData wants.
export type UploadFile = { uri: string; name: string; type: string };

const withPoint = (form: FormData, point: GeoPoint) => {
  if (point) {
    form.append('lat', String(point.lat));
    form.append('lng', String(point.lng));
    if (point.accuracy != null) {
      form.append('accuracy', String(point.accuracy));
    }
  }
};

// After any write, the record's state is refetched and the history list too.
const touches = (t: Target) => [
  { type: 'LabState' as const, id: `${t.unit}|${t.date}|${t.phase}` },
  { type: 'LabHistory' as const, id: 'LIST' },
];

export const labApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['LabState', 'LabHistory', 'LabRecord'] })
  .injectEndpoints({
    endpoints: build => ({
      labUnits: build.query<LabUnit[], void>({
        query: () => 'lab/units',
        transformResponse: (r: { data: LabUnit[] }) => r.data,
      }),
      labMeta: build.query<
        { sections: Record<Phase, string[]>; declarations: Record<Phase, string> },
        void
      >({
        query: () => 'lab/meta',
      }),
      labState: build.query<LabState, Target>({
        query: t => ({ url: 'lab/state', params: t }),
        providesTags: (_r, _e, t) => [
          { type: 'LabState', id: `${t.unit}|${t.date}|${t.phase}` },
        ],
      }),
      setLabItem: build.mutation<
        Written,
        Target & { task: string; status: LabItem['status']; point?: GeoPoint }
      >({
        query: ({ point, ...body }) => ({
          url: 'lab/item',
          method: 'POST',
          body: { ...body, ...(point ?? {}) },
        }),
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      setLabRemark: build.mutation<Written, Target & { task: string; remark: string }>({
        query: body => ({ url: 'lab/remark', method: 'POST', body }),
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      addLabPhotos: build.mutation<
        Written,
        Target & { task: string; files: UploadFile[]; point?: GeoPoint }
      >({
        query: ({ unit, date, phase, task, files, point }) => {
          const form = new FormData();
          form.append('unit', unit);
          form.append('date', date);
          form.append('phase', phase);
          form.append('task', task);
          files.forEach(f => form.append('photos[]', f as unknown as Blob));
          withPoint(form, point ?? null);
          return { url: 'lab/photos', method: 'POST', body: form };
        },
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      removeLabPhoto: build.mutation<{ ok: true; photoCount: number }, Target & { id: number }>({
        query: ({ id }) => ({ url: `lab/photos/${id}`, method: 'DELETE' }),
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      labSignOff: build.mutation<Written, Target & { selfie: UploadFile; point?: GeoPoint }>({
        query: ({ unit, date, phase, selfie, point }) => {
          const form = new FormData();
          form.append('unit', unit);
          form.append('date', date);
          form.append('phase', phase);
          form.append('selfie', selfie as unknown as Blob);
          withPoint(form, point ?? null);
          return { url: 'lab/signoff', method: 'POST', body: form };
        },
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      labReopen: build.mutation<Written, Target & { reason: string }>({
        query: body => ({ url: 'lab/reopen', method: 'POST', body }),
        invalidatesTags: (_r, _e, t) => touches(t),
      }),
      labHistory: build.query<{ data: HistoryRow[]; meta: PageMeta }, HistoryQuery>({
        query: q => ({ url: 'lab/history', params: q }),
        providesTags: [{ type: 'LabHistory', id: 'LIST' }],
      }),
      labRecord: build.query<LabRecord, number>({
        query: id => `lab/records/${id}`,
        transformResponse: (r: { record: LabRecord }) => r.record,
        providesTags: (_r, _e, id) => [{ type: 'LabRecord', id }],
      }),
    }),
  });

export const {
  useLabUnitsQuery,
  useLabMetaQuery,
  useLabStateQuery,
  useSetLabItemMutation,
  useSetLabRemarkMutation,
  useAddLabPhotosMutation,
  useRemoveLabPhotoMutation,
  useLabSignOffMutation,
  useLabReopenMutation,
  useLabHistoryQuery,
  useLabRecordQuery,
} = labApi;
