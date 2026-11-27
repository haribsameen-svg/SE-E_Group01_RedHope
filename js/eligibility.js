/**
 * Red Hope - Donor Eligibility Checker & Guide Logic
 * Covers: Data-driven Yes/No rules with keyword filter, interactive screening test
 * with edge-case validation, score & wait-days calculation, and localStorage persistence.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DATA DEFINITIONS (Data & Display)
  // =========================================================================
  const STORAGE_KEY = 'redhope_eligibility_state';
  const MIN_AGE = 18;
  const MAX_AGE = 65;
  const MIN_WEIGHT_KG = 50;

  const YES_CRITERIA = [
    'Age is between 18 and 65 years old.',
    'Body weight is at least 50 kg (110 lbs).',
    'Feeling healthy today with normal temperature, pulse, and blood pressure.',
    'At least 90 days (3 months) have passed since your last whole-blood donation.',
    'Had a balanced meal and plenty of water within the last 4 hours.'
  ];

  const NO_CRITERIA = [
    'Under 18 years old, over 65 years old, or weighing less than 50 kg.',
    'Currently experiencing fever, cold, flu, sore throat, or active infection.',
    'Donated whole blood within the last 90 days.',
    'Got a tattoo, body piercing, or major dental/surgical procedure in the past 6 months.',
    'Currently taking antibiotics, blood thinners, or pregnant / recently gave birth.'
  ];

  const SCREENING_QUESTIONS = [
    {
      id: 'feelingWell',
      label: 'Are you feeling healthy today (no fever, flu, or infection)?',
      requiredAnswer: 'yes',
      failType: 'deferred',
      failReason: 'Wait until you have completely recovered from fever, cold, or infection.'
    },
    {
      id: 'recentProcedure',
      label: 'Have you had a tattoo, piercing, or surgery in the last 6 months?',
      requiredAnswer: 'no',
      failType: 'deferred',
      failReason: 'A 6-month waiting period is required after tattoos, piercings, or surgery.'
    },
    {
      id: 'takingMeds',
      label: 'Are you currently taking antibiotics or blood thinners?',
      requiredAnswer: 'no',
      failType: 'deferred',
      failReason: 'Complete your medication course and wait the advised clearance window.'
    },
    {
      id: 'mealHydrated',
      label: 'Have you eaten a meal and stayed hydrated in the last 4 hours?',
      requiredAnswer: 'yes',
      failType: 'deferred',
      failReason: 'Eat a light meal and drink water before donating to prevent dizziness.'
    }
  ];

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  const eligibilityForm = document.getElementById('eligibilityForm');
  const donorAgeInput = document.getElementById('donorAge');
  const donorWeightInput = document.getElementById('donorWeight');
  const daysSinceSelect = document.getElementById('daysSinceDonation');
  const screeningContainer = document.getElementById('screeningQuestionsContainer');
  const resetCheckBtn = document.getElementById('resetCheckBtn');
  const eligibilityAlert = document.getElementById('eligibilityAlert');
  const eligibilityResultBox = document.getElementById('eligibilityResultBox');

  const criteriaSearchInput = document.getElementById('criteriaSearchInput');
  const yesCriteriaList = document.getElementById('yesCriteriaList');
  const noCriteriaList = document.getElementById('noCriteriaList');
  const yesEmptyMsg = document.getElementById('yesEmptyMsg');
  const noEmptyMsg = document.getElementById('noEmptyMsg');

  // =========================================================================
  // 3. STORAGE & SANITIZATION HELPERS
  // =========================================================================

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors safely
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors safely
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // =========================================================================
  // 4. DATA-DRIVEN RENDERING (Yes/No Criteria & Screening Questions)
  // =========================================================================

  function renderCriteriaLists(query = '') {
    const term = query.trim().toLowerCase();

    const filteredYes = YES_CRITERIA.filter((item) => item.toLowerCase().includes(term));
    const filteredNo = NO_CRITERIA.filter((item) => item.toLowerCase().includes(term));

    yesCriteriaList.innerHTML = filteredYes
      .map(
        (text) => `
          <li>
            <svg class="criteria-icon" width="18" height="18" viewBox="0 0 24 24" fill="#059669" aria-hidden="true">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
            </svg>
            <span>${escapeHtml(text)}</span>
          </li>
        `
      )
      .join('');
    yesEmptyMsg.classList.toggle('d-none', filteredYes.length > 0);

    noCriteriaList.innerHTML = filteredNo
      .map(
        (text) => `
          <li>
            <svg class="criteria-icon" width="18" height="18" viewBox="0 0 24 24" fill="#DC2626" aria-hidden="true">
              <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/>
            </svg>
            <span>${escapeHtml(text)}</span>
          </li>
        `
      )
      .join('');
    noEmptyMsg.classList.toggle('d-none', filteredNo.length > 0);
  }

  function renderScreeningQuestions() {
    screeningContainer.innerHTML = SCREENING_QUESTIONS.map(
      (q, index) => `
        <div id="qBlock-${q.id}" class="question-block">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <span class="small fw-bold">${index + 1}. ${escapeHtml(q.label)}</span>
            <div class="btn-group btn-group-sm flex-shrink-0" role="group" aria-label="${escapeHtml(q.label)}">
              <input type="radio" class="btn-check" name="q_${q.id}" id="${q.id}_yes" value="yes">
              <label class="btn btn-outline-success" for="${q.id}_yes">Yes</label>
              <input type="radio" class="btn-check" name="q_${q.id}" id="${q.id}_no" value="no">
              <label class="btn btn-outline-danger" for="${q.id}_no">No</label>
            </div>
          </div>
          <div id="${q.id}Error" class="field-error-msg"></div>
        </div>
      `
    ).join('');
  }

  // =========================================================================
  // 5. VALIDATION & ELIGIBILITY CALCULATION
  // =========================================================================

  function setFieldError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (message) {
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      return false;
    }
    inputEl.classList.remove('is-invalid');
    inputEl.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    return true;
  }

  function validateAgeField() {
    const raw = donorAgeInput.value.trim();
    const age = Number(raw);
    if (!raw) {
      return setFieldError(donorAgeInput, 'donorAgeError', 'Please enter your age.');
    }
    if (!Number.isFinite(age) || age < 1 || age > 120) {
      return setFieldError(donorAgeInput, 'donorAgeError', 'Enter a realistic age between 1 and 120.');
    }
    return setFieldError(donorAgeInput, 'donorAgeError', '');
  }

  function validateWeightField() {
    const raw = donorWeightInput.value.trim();
    const weight = Number(raw);
    if (!raw) {
      return setFieldError(donorWeightInput, 'donorWeightError', 'Please enter your weight in kg.');
    }
    if (!Number.isFinite(weight) || weight < 10 || weight > 300) {
      return setFieldError(donorWeightInput, 'donorWeightError', 'Enter a realistic weight between 10 and 300 kg.');
    }
    return setFieldError(donorWeightInput, 'donorWeightError', '');
  }

  function validateDonationGap() {
    if (!daysSinceSelect.value) {
      return setFieldError(daysSinceSelect, 'daysSinceDonationError', 'Please select when you last donated.');
    }
    return setFieldError(daysSinceSelect, 'daysSinceDonationError', '');
  }

  function validateQuestions() {
    let allAnswered = true;
    SCREENING_QUESTIONS.forEach((q) => {
      const checked = eligibilityForm.querySelector(`input[name="q_${q.id}"]:checked`);
      const block = document.getElementById(`qBlock-${q.id}`);
      const errEl = document.getElementById(`${q.id}Error`);

      if (!checked) {
        block.classList.add('is-invalid-question');
        errEl.textContent = 'Please select Yes or No.';
        allAnswered = false;
      } else {
        block.classList.remove('is-invalid-question');
        errEl.textContent = '';
      }
    });
    return allAnswered;
  }

  function evaluateEligibility(values) {
    const reasons = [];
    let status = 'eligible'; // 'eligible' | 'deferred' | 'ineligible'
    let passedCount = 0;
    const totalChecks = 3 + SCREENING_QUESTIONS.length;

    // 1. Age check
    if (values.age < MIN_AGE || values.age > MAX_AGE) {
      status = 'ineligible';
      reasons.push(
        values.age < MIN_AGE
          ? `Age is ${values.age}: donors must be at least ${MIN_AGE} years old.`
          : `Age is ${values.age}: standard voluntary donation age limit is ${MAX_AGE} years.`
      );
    } else {
      passedCount += 1;
    }

    // 2. Weight check
    if (values.weight < MIN_WEIGHT_KG) {
      status = 'ineligible';
      reasons.push(`Weight is ${values.weight} kg: minimum safe weight is ${MIN_WEIGHT_KG} kg.`);
    } else {
      passedCount += 1;
    }

    // 3. Donation interval check
    const waitDaysMap = {
      '60to89': 30,
      '30to59': 60,
      under30: 90
    };
    if (waitDaysMap[values.daysSince]) {
      if (status !== 'ineligible') status = 'deferred';
      reasons.push(
        `Wait at least ${waitDaysMap[values.daysSince]} more days (90-day minimum interval between whole-blood donations).`
      );
    } else {
      passedCount += 1;
    }

    // 4. Screening questions
    SCREENING_QUESTIONS.forEach((q) => {
      if (values.answers[q.id] === q.requiredAnswer) {
        passedCount += 1;
      } else {
        if (status !== 'ineligible') status = q.failType;
        reasons.push(q.failReason);
      }
    });

    const readinessPercent = Math.round((passedCount / totalChecks) * 100);
    return { status, reasons, passedCount, totalChecks, readinessPercent };
  }

  function renderResult(outcome) {
    eligibilityResultBox.classList.remove('d-none', 'is-eligible', 'is-deferred', 'is-ineligible');

    if (outcome.status === 'eligible') {
      eligibilityResultBox.classList.add('is-eligible');
      eligibilityResultBox.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="h5 mb-0">Yes! You Are Available &amp; Eligible to Donate</h3>
          <span class="badge bg-success">${outcome.readinessPercent}% Ready</span>
        </div>
        <p class="small mb-3">
          All ${outcome.totalChecks} screening checks passed. Please carry a valid CNIC and hydrate well before visiting the blood bank.
        </p>
        <a href="donate.html" class="btn btn-sm btn-success">Proceed to Donor Registration &rarr;</a>
      `;
      return;
    }

    const isDeferred = outcome.status === 'deferred';
    eligibilityResultBox.classList.add(isDeferred ? 'is-deferred' : 'is-ineligible');
    const title = isDeferred
      ? 'Temporarily Unavailable — Please Wait Before Donating'
      : 'Not Eligible to Donate Blood';
    const badgeClass = isDeferred ? 'bg-warning text-dark' : 'bg-danger';

    eligibilityResultBox.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="h5 mb-0">${title}</h3>
        <span class="badge ${badgeClass}">${outcome.passedCount}/${outcome.totalChecks} Passed</span>
      </div>
      <ul class="small mb-2 ps-3">
        ${outcome.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
      <p class="small mb-0">
        You can still help by sharing Red Hope or checking back once the waiting criteria clear.
      </p>
    `;
  }

  // =========================================================================
  // 6. STATE PERSISTENCE & RESET
  // =========================================================================

  function restoreSavedCheck() {
    const saved = readStorage(STORAGE_KEY, null);
    if (!saved) return;

    donorAgeInput.value = saved.age || '';
    donorWeightInput.value = saved.weight || '';
    daysSinceSelect.value = saved.daysSince || '';

    if (saved.answers) {
      Object.entries(saved.answers).forEach(([qId, val]) => {
        const radio = document.getElementById(`${qId}_${val}`);
        if (radio) radio.checked = true;
      });
    }

    if (saved.outcome) {
      renderResult(saved.outcome);
    }
  }

  function resetCheck() {
    eligibilityForm.reset();
    removeStorage(STORAGE_KEY);
    eligibilityAlert.className = 'alert d-none';
    eligibilityAlert.textContent = '';
    eligibilityResultBox.classList.add('d-none');
    eligibilityResultBox.innerHTML = '';

    [donorAgeInput, donorWeightInput, daysSinceSelect].forEach((el) => {
      el.classList.remove('is-invalid');
      el.removeAttribute('aria-invalid');
    });
    ['donorAgeError', 'donorWeightError', 'daysSinceDonationError'].forEach((id) => {
      document.getElementById(id).textContent = '';
    });

    SCREENING_QUESTIONS.forEach((q) => {
      document.getElementById(`qBlock-${q.id}`).classList.remove('is-invalid-question');
      document.getElementById(`${q.id}Error`).textContent = '';
    });
  }

  // =========================================================================
  // 7. EVENT BINDINGS
  // =========================================================================

  function bindEvents() {
    criteriaSearchInput.addEventListener('input', () => {
      renderCriteriaLists(criteriaSearchInput.value);
    });

    donorAgeInput.addEventListener('blur', validateAgeField);
    donorWeightInput.addEventListener('blur', validateWeightField);
    daysSinceSelect.addEventListener('change', validateDonationGap);

    screeningContainer.addEventListener('change', (event) => {
      const radio = event.target.closest('input[type="radio"]');
      if (!radio) return;
      const qId = radio.name.replace(/^q_/, '');
      document.getElementById(`qBlock-${qId}`).classList.remove('is-invalid-question');
      document.getElementById(`${qId}Error`).textContent = '';
    });

    resetCheckBtn.addEventListener('click', resetCheck);

    eligibilityForm.addEventListener('submit', (event) => {
      event.preventDefault();
      eligibilityAlert.className = 'alert d-none';

      const okAge = validateAgeField();
      const okWeight = validateWeightField();
      const okGap = validateDonationGap();
      const okQuestions = validateQuestions();

      if (!okAge || !okWeight || !okGap || !okQuestions) {
        eligibilityAlert.className = 'alert alert-danger';
        eligibilityAlert.textContent = 'Please complete all highlighted fields and screening questions.';
        return;
      }

      const answers = {};
      SCREENING_QUESTIONS.forEach((q) => {
        const checked = eligibilityForm.querySelector(`input[name="q_${q.id}"]:checked`);
        answers[q.id] = checked ? checked.value : '';
      });

      const values = {
        age: Number(donorAgeInput.value),
        weight: Number(donorWeightInput.value),
        daysSince: daysSinceSelect.value,
        answers
      };

      const outcome = evaluateEligibility(values);
      writeStorage(STORAGE_KEY, { ...values, outcome });
      renderResult(outcome);
    });
  }

  // =========================================================================
  // 8. INITIALIZE PAGE
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    renderCriteriaLists();
    renderScreeningQuestions();
    restoreSavedCheck();
    bindEvents();
  });
})();
