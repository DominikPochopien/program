import { $ } from '../utils.js';

export function bindAuthForm({ onSignIn, onSignUp }) {
  const message = $('#auth-message');
  const credentials = () => [$('#auth-email').value.trim(), $('#auth-password').value];

  const run = async (action) => {
    message.textContent = '';
    try {
      await action(...credentials());
    } catch (error) {
      message.textContent = error.message;
    }
  };

  $('#auth-form').addEventListener('submit', (e) => { e.preventDefault(); run(onSignIn); });
  $('#auth-signup').addEventListener('click', () => run(onSignUp));
}
