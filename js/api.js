import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// Postgres zwraca czas jako "10:30:00" - przycinamy do "10:30".
const normalizeClass = (c) => ({ ...c, start_time: c.start_time.slice(0, 5), end_time: c.end_time?.slice(0, 5) ?? null });

export const authApi = {
  getSession: async () => (await client.auth.getSession()).data.session,
  signIn: (email, password) => client.auth.signInWithPassword({ email, password }).then(unwrap),
  signUp: (email, password) => client.auth.signUp({ email, password }).then(unwrap),
  signOut: () => client.auth.signOut(),
};

export const subjectsApi = {
  list: () => client.from('subjects').select().order('created_at').then(unwrap),
  add: (name, color) => client.from('subjects').insert({ name, color }).select().single().then(unwrap),
  remove: (id) => client.from('subjects').delete().eq('id', id).then(unwrap),
};

export const classesApi = {
  list: () => client.from('classes').select().order('date').order('start_time').then(unwrap).then((rows) => rows.map(normalizeClass)),
  addMany: (rows) => client.from('classes').insert(rows).select().then(unwrap).then((r) => r.map(normalizeClass)),
  setStatus: (id, status) => client.from('classes').update({ status }).eq('id', id).then(unwrap),
  remove: (id) => client.from('classes').delete().eq('id', id).then(unwrap),
};
