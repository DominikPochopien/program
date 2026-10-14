import { authApi } from './api.js';
import { SUBJECT_COLORS } from './constants.js';
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
      const applyAllCheckbox = $('#apply-to-all-months');
    const applyIndicator = $('#apply-indicator');
    if (applyAllCheckbox) {
      applyAllCheckbox.onchange = (e) => {
        applyIndicator.textContent = e.target.checked ? '(Tak ✓)' : '(Tylko tutaj)';
        e.target.parentElement.style.background = e.target.checked ? 'color-mix(in srgb, #0ea5e9 10%, transparent)' : 'transparent';
    };
  }
    });
    
  $('#sign-out').onclick = async () => { 
    await authApi.signOut(); 
    if (window.resetAuthForm) window.resetAuthForm(); // Powrót do logowania
    showAuth(); 
  };

  // --- Obsługa okienka ustawień (zębatki) ---
  const settingsModal = $('#settings-modal');
  const mainModal = $('#modal');
  const overlay = $('#overlay');
  
  $('#btn-settings').onclick = () => {
    // Ukrywamy ewentualne okienka z zajęciami i pokazujemy ustawienia
    mainModal.hidden = true;
    settingsModal.hidden = false;
    overlay.classList.add('open');
    
    // Zaznacz checkboxy na podstawie aktualnego stanu aplikacji
    const currentDays = store.getState().visibleDays;
    document.querySelectorAll('#settings-days input').forEach(input => {
      input.checked = currentDays.includes(Number(input.value));
    });
  };

  $('#btn-save-settings').onclick = () => {
    // Zbieramy wartości wszystkich zaznaczonych checkboxów
    const selected = Array.from(document.querySelectorAll('#settings-days input:checked'))
      .map(input => Number(input.value));
      
    if (selected.length === 0) return alert('Wybierz chociaż jeden dzień do wyświetlenia!');
    
    // Zapisujemy nowy stan kalendarza i zamykamy okienko
    store.setVisibleDays(selected);
    overlay.classList.remove('open');
    settingsModal.hidden = true;
    mainModal.hidden = false; // Przywracamy domyślny kontener okienek
  };
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
