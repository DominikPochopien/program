import { classesApi, subjectsApi } from './api.js';

const LEGACY_STATUS = { p: 'planned', y: 'present', n: 'absent', c: 'cancelled' };

// Wczytuje kopię .json z poprzedniej wersji aplikacji (dane z localStorage) do Supabase.
export async function importLegacyBackup(file) {
  const data = JSON.parse(await file.text());
  if (!Array.isArray(data.subjects) || !Array.isArray(data.classes)) {
    throw new Error('Nieprawidłowy plik kopii.');
  }

  const idMap = new Map();
  for (const subject of data.subjects) {
    const created = await subjectsApi.add(subject.name, subject.color);
    idMap.set(subject.id, created.id);
  }

  const rows = data.classes
    .filter((c) => idMap.has(c.sid))
    .map((c) => ({
      subject_id: idMap.get(c.sid),
      date: c.date,
      start_time: c.time,
      end_time: c.end || null,
      status: LEGACY_STATUS[c.status] ?? 'planned',
    }));
  if (rows.length) await classesApi.addMany(rows);
}
