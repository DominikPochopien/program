import { authApi } from './api.js';
import { SUBJECT_COLORS } from './constants.js';
import { importLegacyBackup } from './legacyImport.js';
import * as store from './store.js';
import { bindAuthForm } from './ui/auth.js';
import { openAddClassDialog, openStatusDialog, openSubjectDialog } from './ui/dialogs.js';
import { renderCalendar } from './ui/calendar.js';
import { renderSubjects } from './ui/subjects.js';
import { $ } from './utils.js';

const authSection = $('#auth');
const appSection = $('#app');

async function safely(action) {
  try {
    await action();
  } catch (error) {
    alert(`Błąd: ${error.message}`);
  }
}

const handlers = {
  onDayClick(date) {
    const { subjects } = store.getState();
    if (!subjects.length) return alert('Najpierw dodaj przedmiot po prawej stronie.');
    openAddClassDialog({ date, subjects, onSave: (data) => safely(() => store.addClassSeries(data)) });
  },
  onClassClick(id) {
    const { classes, subjects } = store.getState();
    const cls = classes.find((c) => c.id === id);
    openStatusDialog({
      cls,
      subject: subjects.find((s) => s.id === cls.subject_id),
      onStatus: (status) => safely(() => store.setClassStatus(id, status)),
      onDelete: () => safely(() => store.removeClass(id)),
    });
  },
  onRemoveSubject(id) {
    const subject = store.getState().subjects.find((s) => s.id === id);
    if (confirm(`Usunąć „${subject.name}" razem ze wszystkimi zajęciami?`)) safely(() => store.removeSubject(id));
  },
};

function render(state) {
  renderCalendar({ titleEl: $('#month-title'), gridEl: $('#calendar') }, state, handlers);
  renderSubjects($('#subjects'), state, { onRemove: handlers.onRemoveSubject });
}

async function showApp() {
  authSection.hidden = true;
  appSection.hidden = false;
  await safely(store.load);
}

function showAuth() {
  appSection.hidden = true;
  authSection.hidden = false;
}

function bindControls() {
  $('#prev-month').onclick = () => store.shiftMonth(-1);
  $('#next-month').onclick = () => store.shiftMonth(1);
  $('#today').onclick = store.goToToday;
  $('#add-subject').onclick = () =>
    openSubjectDialog({
      defaultColor: SUBJECT_COLORS[store.getState().subjects.length % SUBJECT_COLORS.length],
      onSave: (name, color) => safely(() => store.addSubject(name, color)),
    });
  $('#sign-out').onclick = async () => { 
  await authApi.signOut(); 
  if (window.resetAuthForm) window.resetAuthForm(); // Przywraca widok logowania
  showAuth(); 
};

  const fileInput = $('#legacy-file');
  $('#import-legacy').onclick = () => fileInput.click();
  fileInput.onchange = () =>
    safely(async () => {
      if (!fileInput.files[0]) return;
      await importLegacyBackup(fileInput.files[0]);
      fileInput.value = '';
      await store.load();
    });
}

async function init() {
  store.subscribe(render);
  bindControls();
  bindAuthForm({
    onSignIn: async (email, password) => { await authApi.signIn(email, password); await showApp(); },
    onSignUp: async (email, password) => {
      const { session } = await authApi.signUp(email, password);
      if (session) await showApp();
      else alert('Konto utworzone. Potwierdź e-mail i zaloguj się.');
    },
  });
  (await authApi.getSession()) ? await showApp() : showAuth();
}

init();
