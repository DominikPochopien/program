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

  // Wymagania hasła
  const reqLength = $('#req-length');
  const reqLower = $('#req-lower');
  const reqUpper = $('#req-upper');
  const reqNumber = $('#req-number');

  // 1. Reset formularza do domyślnego stanu (widok logowania).
  // Zwracamy go na zewnątrz, żeby main.js mogło go wywołać przy wylogowaniu.
  function resetAuthForm() {
    form.reset();
    messageEl.textContent = '';
    buttonsRow.hidden = false;
    reqsPanel.hidden = true;
    btnRealSignup.hidden = true;
    btnRealSignup.textContent = 'Załóż konto';
    validatePassword();
  }

  // 2. Zmiana widoku na "Tryb rejestracji"
  btnShowSignup.onclick = () => {
    buttonsRow.hidden = true;
    reqsPanel.hidden = false;
    btnRealSignup.hidden = false;
    validatePassword();
  };

  // 3. Walidacja hasła na żywo podczas wpisywania
  passInput.addEventListener('input', validatePassword);

  function validatePassword() {
    if (reqsPanel.hidden) return; // Walidujemy tylko w trybie rejestracji

    const p = passInput.value;
    const vLength = p.length >= 8;
    const vLower = /[a-z]/.test(p);
    const vUpper = /[A-Z]/.test(p);
    const vNumber = /[0-9!@#$%^&*(),.?":{}|<>]/.test(p); // Cyfra LUB znak specjalny

    reqLength.className = `req-item ${vLength ? 'req-item--valid' : 'req-item--invalid'}`;
    reqLower.className = `req-item ${vLower ? 'req-item--valid' : 'req-item--invalid'}`;
    reqUpper.className = `req-item ${vUpper ? 'req-item--valid' : 'req-item--invalid'}`;
    reqNumber.className = `req-item ${vNumber ? 'req-item--valid' : 'req-item--invalid'}`;

    btnRealSignup.disabled = !(vLength && vLower && vUpper && vNumber);
  }

  // 4. Logowanie (przycisk submit z formularza)
  form.onsubmit = async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    try {
      await onSignIn(emailInput.value, passInput.value);
    } catch (error) {
      messageEl.textContent = 'Błędny e-mail lub hasło';
    }
  };

  // 5. Prawdziwe tworzenie konta (pomarańczowy przycisk)
  btnRealSignup.onclick = async () => {
    if (btnRealSignup.disabled) return;

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

  return { reset: resetAuthForm };
}