(function () {
  'use strict';

  /* ---------- Ìîáèëüíîå ìåíþ ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Êíîïêè «Çàïèñàòüñÿ» èç êàðòî÷åê óñëóã ---------- */
  const serviceSelect = document.getElementById('service');

  document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      serviceSelect.value = btn.dataset.service;
      clearError(serviceSelect);
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Ãåíåðàöèÿ ñëîòîâ âðåìåíè ---------- */
  const timeSelect = document.getElementById('time');
  const START = 9 * 60;   // 09:00
  const END = 19 * 60;    // 19:00

  for (let m = START; m <= END; m += 30) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const min = String(m % 60).padStart(2, '0');
    const opt = document.createElement('option');
    opt.value = `${h}:${min}`;
    opt.textContent = `${h}:${min}`;
    timeSelect.appendChild(opt);
  }

  /* ---------- Ìèíèìàëüíàÿ äàòà — ñåãîäíÿ ---------- */
  const dateInput = document.getElementById('date');
  const now = new Date();
  const todayISO =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  dateInput.min = todayISO;

  /* ---------- Âàëèäàöèÿ ---------- */
  const form = document.getElementById('bookingForm');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const successBox = document.getElementById('success');
  const successDetails = document.getElementById('successDetails');

  function setError(el) {
    el.closest('.field').classList.add('invalid');
  }
  function clearError(el) {
    el.closest('.field').classList.remove('invalid');
  }

  [nameInput, phoneInput, serviceSelect, dateInput, timeSelect].forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  function validate() {
    let ok = true;

    if (nameInput.value.trim().length < 2) { setError(nameInput); ok = false; }

    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) { setError(phoneInput); ok = false; }

    if (!serviceSelect.value) { setError(serviceSelect); ok = false; }
    if (!dateInput.value) { setError(dateInput); ok = false; }
    if (!timeSelect.value) { setError(timeSelect); ok = false; }

    return ok;
  }

  /* ---------- Îòïðàâêà ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) {
      const firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const booking = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      service: serviceSelect.value,
      date: dateInput.value,
      time: timeSelect.value,
      comment: document.getElementById('comment').value.trim(),
      createdAt: new Date().toISOString()
    };

    // Ñîõðàíÿåì çàÿâêó ëîêàëüíî (â ðåàëüíîì ïðîåêòå — îòïðàâêà íà ñåðâåð)
   // try {
   //   const store = JSON.parse(localStorage.getItem('atb_bookings') || '[]');
    //  store.push(booking);
   //   localStorage.setItem('atb_bookings', JSON.stringify(store));
 //   } catch (err) {
 //     console.warn('Íå óäàëîñü ñîõðàíèòü çàÿâêó ëîêàëüíî:', err);
 //   }
 fetch('https://formspree.io/f/mrppyvra',{
    
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(booking)
}).catch(err => console.error(err));
    // Ôîðìàòèðóåì äàòó äëÿ âûâîäà
    const [y, mo, d] = booking.date.split('-');
    const dateText = `${d}.${mo}.${y}`;

    successDetails.innerHTML = `
      <div><span>Èìÿ</span><span>${escapeHTML(booking.name)}</span></div>
      <div><span>Òåëåôîí</span><span>${escapeHTML(booking.phone)}</span></div>
      <div><span>Óñëóãà</span><span>${escapeHTML(booking.service)}</span></div>
      <div><span>Äàòà è âðåìÿ</span><span>${dateText}, ${booking.time}</span></div>
    `;

    form.style.display = 'none';
    successBox.classList.add('show');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- «Çàïèñàòüñÿ åù¸ ðàç» ---------- */
  document.getElementById('againBtn').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
    successBox.classList.remove('show');
    form.style.display = 'grid';
    nameInput.focus();
  });

  /* ---------- Óòèëèòà ---------- */
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }
})();
