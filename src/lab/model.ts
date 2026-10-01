import type { LabItem as ApiItem, LabRecordItem, Phase } from '../store/api/labApi';

// The shapes the Lab screens draw from, built from what the API sends.

export type { Phase };
export type LabStatus = 'done' | 'deviation' | 'na';

export type LabPhoto = { id: string; uri?: string; name?: string };

export type Activity = {
  key: string;
  section: string;
  text: string;
  time: string;
  photoRequired: boolean;
};

export type LabItem = {
  status: LabStatus | null;
  remark: string;
  photos: LabPhoto[];
  actionedAt?: string;
  actionedBy?: string;
};

export type LabSection = { title: string; rows: Activity[]; complete: number };

export const MAX_PHOTOS = 12;

export const needsRemark = (item: LabItem) =>
  (item.status === 'deviation' || item.status === 'na') && !item.remark.trim();

export const needsPhoto = (activity: Activity, item: LabItem) =>
  item.status === 'done' && activity.photoRequired && item.photos.length === 0;

export const isComplete = (activity: Activity, item: LabItem) =>
  item.status !== null && !needsRemark(item) && !needsPhoto(activity, item);

export const unitKinds: Record<string, { tag: string; detail: string }> = {
  nrl: { tag: 'NRL', detail: 'NRL Hyderabad · by department' },
  regional: { tag: 'Regional', detail: 'Regional laboratory' },
  satellite: { tag: 'Satellite', detail: 'Satellite laboratory' },
};

export const dueBy: Record<Phase, string> = { opening: '08:30', closing: '21:50' };

export const phaseName = (phase: Phase) => (phase === 'opening' ? 'Opening' : 'Closing');

const photoOf = (p: { id: number; url: string; name?: string }): LabPhoto => ({
  id: String(p.id),
  uri: p.url,
  name: p.name,
});

// The API sends items already in running order; group them by section.
export function groupItems(list: ApiItem[]) {
  const items: Record<string, LabItem> = {};
  const activities: Activity[] = [];
  for (const it of list) {
    activities.push({
      key: it.key,
      section: it.section,
      text: it.text,
      time: it.time ?? '',
      photoRequired: it.photoReq,
    });
    items[it.key] = {
      status: it.status,
      remark: it.remark ?? '',
      photos: it.photos.map(photoOf),
      actionedAt: it.actionedAt ?? undefined,
      actionedBy: it.actionedBy ?? undefined,
    };
  }
  return { activities, items, sections: toSections(activities, items) };
}

// A past record lists only the activities that were actioned.
export function groupRecordItems(list: LabRecordItem[]) {
  const items: Record<string, LabItem> = {};
  const activities: Activity[] = [];
  for (const it of list) {
    activities.push({
      key: it.taskKey,
      section: it.section,
      text: it.text,
      time: it.time ?? '',
      photoRequired: false,
    });
    items[it.taskKey] = {
      status: it.status,
      remark: it.remark ?? '',
      photos: it.photos.map(photoOf),
      actionedAt: it.actionedAt ?? undefined,
      actionedBy: it.actionedBy ?? undefined,
    };
  }
  return { activities, items, sections: toSections(activities, items) };
}

export function toSections(activities: Activity[], items: Record<string, LabItem>): LabSection[] {
  const order: string[] = [];
  const bySection: Record<string, Activity[]> = {};
  for (const a of activities) {
    if (!bySection[a.section]) {
      bySection[a.section] = [];
      order.push(a.section);
    }
    bySection[a.section].push(a);
  }
  return order.map(title => {
    const rows = bySection[title];
    return {
      title,
      rows,
      complete: rows.filter(a => isComplete(a, items[a.key])).length,
    };
  });
}

export const emptyItem: LabItem = { status: null, remark: '', photos: [] };

// A photo picked on the phone, in the shape the upload wants.
export const uploadFile = (uri: string, name = 'photo.jpg') => ({
  uri,
  name,
  type: 'image/jpeg',
});
