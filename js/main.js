import { authApi } from './api.js';
import { SUBJECT_COLORS } from './constants.js';
import * as store from './store.js';
import { bindAuthForm } from './ui/auth.js';
import { openAddClassDialog, openDayDialog, openSubjectDialog, refreshOpenDialog } from './ui/dialogs.js';
import { renderCalendar } from './ui/calendar.js';
import { renderSubjects } from './ui/subjects.js';
import { $, mobileQuery } from './utils.js';

const authSection = $('#auth');
const appSection = $('#app');

async function safely(action) {
  try {
    await action();
  } catch (error) {
    alert(`Błąd: ${error.message}`);
  }
}

// Panel dnia: lista zajęć z możliwością zaznaczenia frekwencji
function openDay(date) {
  openDayDialog({
    date,
    getItems: () => {
      const { subjects } = store.getState();
      return store
        .classesOfDay(date)
        .map((cls) => ({ cls, subject: subjects.find((s) => s.id === cls.subject_id) }))
        .filter((item) => item.subject);
    },
    onStatus: (id, status) => safely(() => store.setClassStatus(id, status)),
    onDelete: (id) => {
      if (confirm('Usunąć te zajęcia?')) safely(() => store.removeClass(id));
    },
    onAdd: () => openAddClass(date),
  });
}

// Dodawanie zajęć z panelu dnia (po zapisie lub anulowaniu wracamy do panelu)
function openAddClass(date) {
  const { subjects } = store.getState();
  if (!subjects.length) return alert('Najpierw dodaj przedmiot po prawej stronie.');
  openAddClassDialog({
    date,
    subjects,
    onSave: (data) => {
      safely(() => store.addClassSeries(data));
      openDay(data.date);
    },
    onCancel: () => openDay(date),
  });
}

const handlers = {
  onDayClick: (date) => openDay(date),
  onRemoveSubject(id) {
    const subject = store.getState().subjects.find((s) => s.id === id);
    if (confirm(`Usunąć „${subject.name}" razem ze wszystkimi zajęciami?`)) {
      safely(() => store.removeSubject(id));
    }
  },
};

function render(state) {
  renderCalendar({ titleEl: $('#month-title'), gridEl: $('#calendar') }, state, handlers);
  renderSubjects($('#subjects'), state, { onRemove: handlers.onRemoveSubject });
  refreshOpenDialog(); // jeśli panel dnia jest otwarty, odśwież jego listę
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
}

// Okienko ustawień (zębatka): widoczne dni tygodnia, w tym miesiącu albo we wszystkich.
function bindSettings() {
  const settingsModal = $('#settings-modal');
  const mainModal = $('#modal');
  const overlay = $('#overlay');
  const applyAll = $('#apply-to-all-months');
  const applyToggle = $('#apply-toggle');
  const applyIndicator = $('#apply-indicator');
  const dayInputs = () => document.querySelectorAll('#settings-days input');

  const updateApplyToggle = () => {
    const monthName = store.getState().month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    applyIndicator.textContent = applyAll.checked ? '(Tak ✓)' : `(Tylko: ${monthName})`;
    applyToggle.classList.toggle('apply-toggle--on', applyAll.checked);
  };

  $('#btn-settings').onclick = () => {
    const state = store.getState();
    const days = store.visibleDaysOf(state);

    mainModal.hidden = true;
    settingsModal.hidden = false;
    overlay.classList.add('open');

    dayInputs().forEach((input) => {
      input.checked = days.includes(Number(input.value));
    });
    // Jeśli ten miesiąc ma własne ustawienie, domyślnie edytujemy tylko jego.
    applyAll.checked = !store.hasMonthOverride(state);
    updateApplyToggle();
  };

  applyAll.onchange = updateApplyToggle;

  $('#btn-save-settings').onclick = () => {
    const selected = Array.from(dayInputs())
      .filter((input) => input.checked)
      .map((input) => Number(input.value));

    if (selected.length === 0) return alert('Wybierz chociaż jeden dzień!');

    safely(() => store.setVisibleDays(selected, { allMonths: applyAll.checked }));
    overlay.classList.remove('open');
    settingsModal.hidden = true;
    mainModal.hidden = false;
  };
}

async function init() {
  store.subscribe(render);
  mobileQuery.addEventListener('change', () => render(store.getState()));
  bindControls();
  bindSettings();

  const authForm = bindAuthForm({
    onSignIn: async (email, password) => {
      await authApi.signIn(email, password);
      await showApp();
    },
    onSignUp: async (email, password) => {
      const { session } = await authApi.signUp(email, password);
      if (session) await showApp();
      else alert('Konto utworzone. Potwierdź e-mail i zaloguj się.');
    },
  });

  $('#sign-out').onclick = async () => {
    await authApi.signOut();
    authForm.reset();
    showAuth();
  };

  (await authApi.getSession()) ? await showApp() : showAuth();
}

init();
