import { $ } from '../utils.js';

export function bindAuthForm({ onSignIn, onSignUp }) {
  const form = $('#auth-form');
  const emailInput = $('#auth-email');
  const passInput = $('#auth-password');
  const messageEl = $('#auth-message');
  
  // Elementy UI
  const reqsPanel = $('#auth-requirements');
  const buttonsRow = $('#auth-buttons');
  const btnShowSignup = $('#btn-show-signup');
  const btnRealSignup = $('#auth-signup');

  // Wymagania
  const reqLength = $('#req-length');
  const reqLower = $('#req-lower');
  const reqUpper = $('#req-upper');
  const reqNumber = $('#req-number');

  // 1. Zmiana widoku na "Tryb rejestracji"
  btnShowSignup.onclick = () => {
    buttonsRow.hidden = true; // Ukrywa Zaloguj / Załóż konto (szare)
    reqsPanel.hidden = false; // Pokazuje panel wymagań
    btnRealSignup.hidden = false; // Pokazuje pomarańczowe Załóż konto
    validatePassword(); // Sprawdza od razu, co jest wpisane
  };

  // 2. Walidacja hasła na żywo podczas wpisywania
  passInput.addEventListener('input', validatePassword);

  function validatePassword() {
    if (reqsPanel.hidden) return; // Walidujemy tylko w trybie rejestracji

    const p = passInput.value;
    const vLength = p.length >= 8;
    const vLower = /[a-z]/.test(p);
    const vUpper = /[A-Z]/.test(p);
    const vNumber = /[0-9!@#$%^&*(),.?":{}|<>]/.test(p); // Cyfra LUB znak specjalny

    // Aktualizacja zielonych "ptaszków"
    reqLength.className = `req-item ${vLength ? 'req-item--valid' : 'req-item--invalid'}`;
    reqLower.className = `req-item ${vLower ? 'req-item--valid' : 'req-item--invalid'}`;
    reqUpper.className = `req-item ${vUpper ? 'req-item--valid' : 'req-item--invalid'}`;
    reqNumber.className = `req-item ${vNumber ? 'req-item--valid' : 'req-item--invalid'}`;

    // Odblokowanie przycisku jeśli wszystko się zgadza
    const isValid = vLength && vLower && vUpper && vNumber;
    btnRealSignup.disabled = !isValid;
  }

  // 3. Logowanie (przycisk submit z formularza)
  form.onsubmit = async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    try {
      await onSignIn(emailInput.value, passInput.value);
    } catch (error) {
      messageEl.textContent = 'Błędny e-mail lub hasło';
    }
  };

  // 4. Prawdziwe tworzenie konta (pomarańczowy przycisk)
  btnRealSignup.onclick = async () => {
    if (btnRealSignup.disabled) return;
    
    // Sprawdzamy czy użytkownik w ogóle podał e-mail
    if (!emailInput.value.includes('@')) {
       messageEl.textContent = 'Wprowadź poprawny adres e-mail.';
       return;
    }

    messageEl.textContent = '';
    try {
      btnRealSignup.disabled = true;
      btnRealSignup.textContent = 'Tworzenie...';
      await onSignUp(emailInput.value, passInput.value);
    } catch (error) {
      messageEl.textContent = `Błąd: ${error.message}`;
      btnRealSignup.disabled = false;
      btnRealSignup.textContent = 'Załóż konto';
    }
  };
}
