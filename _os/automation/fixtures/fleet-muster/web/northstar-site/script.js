'use strict';

const form = document.querySelector('#planning-form');
const postalCode = document.querySelector('#postal-code');
const status = document.querySelector('#postal-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = postalCode.value.trim();
  const valid = /^\d{5}$/.test(value);
  postalCode.setAttribute('aria-invalid', String(!valid));
  if (!valid) {
    status.dataset.state = 'error';
    status.textContent = 'Enter a five-digit ZIP code to create the local preview.';
    postalCode.focus();
    return;
  }
  status.dataset.state = 'success';
  status.textContent = `Synthetic preview ready for ZIP ${value}. Nothing was sent or saved.`;
});
