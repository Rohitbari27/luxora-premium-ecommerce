/* Login / register demo: validates input and gives friendly feedback. Nothing is stored or sent. */
(function () {
  'use strict';

  const ui = window.Luxora.ui;
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (!loginForm || !registerForm) return;

  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = { login: document.getElementById('loginPanel'), register: document.getElementById('registerPanel') };

  function showTab(name, moveFocus) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== name; });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { showTab(tab.dataset.tab, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        showTab(tab.dataset.tab === 'login' ? 'register' : 'login', true);
      }
    });
  });

  // Honour links like login.html#register
  showTab(window.location.hash === '#register' ? 'register' : 'login', false);

  document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
    button.addEventListener('click', function () {
      const input = document.getElementById(button.dataset.togglePassword);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      button.querySelector('.bi').className = 'bi ' + (show ? 'bi-eye-slash' : 'bi-eye');
    });
  });

  function showStatus(id, message) {
    document.getElementById(id).textContent = message;
  }

  ui.attachValidation(loginForm, {
    email: ui.emailMessage,
    password: function (value) { return value ? '' : 'Enter your password.'; }
  }, function (form) {
    showStatus('loginStatus', 'Thanks. This is a demo, so no credentials were checked and nothing was saved.');
    form.reset();
  });

  ui.attachValidation(registerForm, {
    name: function (value) { return value.length < 2 ? 'Enter your name.' : ''; },
    email: ui.emailMessage,
    password: function (value) {
      if (!value) return 'Create a password.';
      return value.length < 8 ? 'Use at least 8 characters.' : '';
    }
  }, function (form) {
    showStatus('registerStatus', 'Thanks. This is a demo, so no account was created and nothing was saved.');
    form.reset();
  });
})();
