(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
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

  /* ---------- Кнопки «Записаться» из карточек услуг ---------- */
  const serviceSelect = document.getElementById('service');

  document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      serviceSelect.value = btn.dataset.service;
      clearError(serviceSelect);
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Генерация слотов времени ---------- */
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

  /* ---------- Минимальная дата — сегодня ---------- */
  const dateInput = document.getElementById('date');
  const now = new Date();
  const todayISO =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  dateInput.min = todayISO;

  /* ---------- Валидация ---------- */
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

  /* ---------- Отправка ---------- */
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

    // Сохраняем заявку локально (в реальном проекте — отправка на сервер)
    try {
      const store = JSON.parse(localStorage.getItem('atb_bookings') || '[]');
      store.push(booking);
      localStorage.setItem('atb_bookings', JSON.stringify(store));
    } catch (err) {
      console.warn('Не удалось сохранить заявку локально:', err);
    }

    // Форматируем дату для вывода
    const [y, mo, d] = booking.date.split('-');
    const dateText = `${d}.${mo}.${y}`;

    successDetails.innerHTML = `
      <div><span>Имя</span><span>${escapeHTML(booking.name)}</span></div>
      <div><span>Телефон</span><span>${escapeHTML(booking.phone)}</span></div>
      <div><span>Услуга</span><span>${escapeHTML(booking.service)}</span></div>
      <div><span>Дата и время</span><span>${dateText}, ${booking.time}</span></div>
    `;

    form.style.display = 'none';
    successBox.classList.add('show');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- «Записаться ещё раз» ---------- */
  document.getElementById('againBtn').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
    successBox.classList.remove('show');
    form.style.display = 'grid';
    nameInput.focus();
  });

  /* ---------- Утилита ---------- */
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }
})();