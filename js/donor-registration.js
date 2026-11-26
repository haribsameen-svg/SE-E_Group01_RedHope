/**
 * Red Hope - Donor Registration Logic
 * Covers: Data-driven dropdowns & rules, live form validation with edge cases,
 * age/eligibility & blood compatibility calculation, interactive modals,
 * and localStorage persistence across reloads.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DATA DEFINITIONS (Data & Display - generated dynamically via JS)
  // =========================================================================
  const BASE_DONOR_COUNT = 1240;
  const MIN_DONOR_AGE = 18;
  const MAX_DONOR_AGE = 65;

  const STORAGE_KEYS = {
    DONORS: 'redhope_registered_donors',
    DRAFT: 'redhope_donor_draft'
  };

  const CITIES = [
    'Islamabad',
    'Rawalpindi',
    'Lahore',
    'Karachi',
    'Peshawar',
    'Multan'
  ];

  const BLOOD_GROUPS = [
    { group: 'A+', canDonateTo: ['A+', 'AB+'], note: 'Common positive type needed daily by hospitals.' },
    { group: 'A-', canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], note: 'Valuable negative type for A and AB recipients.' },
    { group: 'B+', canDonateTo: ['B+', 'AB+'], note: 'Frequently requested across Islamabad & Rawalpindi.' },
    { group: 'B-', canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], note: 'Rare negative type for B and AB patients.' },
    { group: 'AB+', canDonateTo: ['AB+'], note: 'Red cells help AB+ patients; plasma is universally needed.' },
    { group: 'AB-', canDonateTo: ['AB+', 'AB-'], note: 'One of the rarest blood types — high emergency value.' },
    { group: 'O+', canDonateTo: ['O+', 'A+', 'B+', 'AB+'], note: 'Helps all positive blood groups in urgent cases.' },
    { group: 'O-', canDonateTo: ['All Blood Groups (Universal Donor)'], note: 'Universal red-cell donor for critical emergencies.' }
  ];

  const ELIGIBILITY_RULES = [
    'You are between 18 and 65 years of age and in good general health.',
    'Your phone number and city may be used to coordinate urgent local blood requests.',
    'You provide accurate blood group information and will complete medical screening at the blood bank.',
    'Your registration details are stored in your browser so your profile remains available after reload.'
  ];

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  const form = document.getElementById('donorRegistrationForm');
  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const emailInput = document.getElementById('emailAddress');
  const citySelect = document.getElementById('city');
  const bloodGroupSelect = document.getElementById('bloodGroup');
  const dobInput = document.getElementById('dateOfBirth');
  const agreeTermsCheckbox = document.getElementById('agreeTerms');
  const clearFormBtn = document.getElementById('clearFormBtn');
  const acceptTermsModalBtn = document.getElementById('acceptTermsModalBtn');
  const clearAllDonorsBtn = document.getElementById('clearAllDonorsBtn');

  const formAlert = document.getElementById('formAlert');
  const thankYouBanner = document.getElementById('thankYouBanner');
  const termsBox = document.getElementById('termsBox');
  const liveInsightBox = document.getElementById('liveInsightBox');
  const communityDonorCount = document.getElementById('communityDonorCount');
  const savedDonorsSection = document.getElementById('savedDonorsSection');
  const savedDonorsList = document.getElementById('savedDonorsList');
  const termsRulesList = document.getElementById('termsRulesList');
  const successModalBody = document.getElementById('successModalBody');
  const successModalEl = document.getElementById('successModal');

  const THANK_YOU_MESSAGE = 'Welcome to our Family . Thank You for being our Hero';

  // =========================================================================
  // 3. HELPER FUNCTIONS: STORAGE, CALCULATIONS & SANITIZATION
  // =========================================================================

  /** Safely parse JSON from localStorage with a fallback value. */
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /** Safely persist JSON data into localStorage. */
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/private-mode storage errors without breaking the UI
    }
  }

  /** Safely remove a key from localStorage. */
  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Calculate exact age in completed years from a YYYY-MM-DD date string.
   * Returns null if date is empty or invalid.
   */
  function calculateExactAge(dobString) {
    if (!dobString) return null;
    const dob = new Date(`${dobString}T00:00:00`);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    if (dob > today) return -1; // Future date edge case

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }
    return age;
  }

  /** Normalize Pakistani phone input into digits for validation and duplicate checks. */
  function normalizePhone(phone) {
    return phone.replace(/[\s\-()]/g, '').replace(/^\+92/, '0');
  }

  /** Escape text before rendering user-entered strings into HTML templates. */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Format today's date + 90 days as the recommended next donation interval. */
  function getNextEligibleDateText() {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 90);
    return nextDate.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // =========================================================================
  // 4. DATA-DRIVEN UI RENDERING
  // =========================================================================

  function populateDynamicContent() {
    // Populate City select from CITIES array
    CITIES.forEach((cityName) => {
      const option = document.createElement('option');
      option.value = cityName;
      option.textContent = cityName;
      citySelect.appendChild(option);
    });

    // Populate Blood Group select from BLOOD_GROUPS array
    BLOOD_GROUPS.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.group;
      option.textContent = item.group;
      bloodGroupSelect.appendChild(option);
    });

    // Populate Terms Modal list from ELIGIBILITY_RULES array
    ELIGIBILITY_RULES.forEach((rule) => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.textContent = rule;
      termsRulesList.appendChild(li);
    });

    // Prevent picking a future date in the native date picker
    const todayIso = new Date().toISOString().split('T')[0];
    dobInput.setAttribute('max', todayIso);
  }

  /** Render live age eligibility & blood compatibility insight box. */
  function updateLiveInsights() {
    const selectedBlood = BLOOD_GROUPS.find((b) => b.group === bloodGroupSelect.value);
    const age = calculateExactAge(dobInput.value);

    const insights = [];
    let boxState = '';

    if (age !== null) {
      if (age < 0) {
        insights.push('<strong>Date of Birth:</strong> Future dates are not valid.');
        boxState = 'is-warning';
      } else if (age < MIN_DONOR_AGE || age > MAX_DONOR_AGE) {
        insights.push(
          `<strong>Calculated Age (${age} yrs):</strong> Donors must be between ${MIN_DONOR_AGE} and ${MAX_DONOR_AGE} years old.`
        );
        boxState = 'is-warning';
      } else {
        insights.push(
          `<strong>Calculated Age (${age} yrs):</strong> Eligible to donate blood.`
        );
        boxState = 'is-success';
      }
    }

    if (selectedBlood) {
      insights.push(
        `<strong>${selectedBlood.group} Compatibility:</strong> Can donate red cells to ${selectedBlood.canDonateTo.join(', ')}. ${selectedBlood.note}`
      );
      if (!boxState) boxState = 'is-success';
    }

    if (insights.length === 0) {
      liveInsightBox.classList.add('d-none');
      liveInsightBox.innerHTML = '';
      return;
    }

    liveInsightBox.className = `live-insight-box mb-3 ${boxState}`;
    liveInsightBox.innerHTML = insights.join('<br>');
  }

  /** Render saved donor profiles & update community counter from localStorage. */
  function renderSavedDonors() {
    const donors = readStorage(STORAGE_KEYS.DONORS, []);
    communityDonorCount.textContent = (BASE_DONOR_COUNT + donors.length).toLocaleString();

    if (donors.length === 0) {
      savedDonorsSection.classList.add('d-none');
      savedDonorsList.innerHTML = '';
      return;
    }

    savedDonorsSection.classList.remove('d-none');
    savedDonorsList.innerHTML = donors
      .map(
        (donor) => `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="border rounded-3 p-3 h-100 bg-light d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <div class="fw-bold">${escapeHtml(donor.fullName)}</div>
                    <div class="small text-muted">ID: ${escapeHtml(donor.donorId)}</div>
                  </div>
                  <span class="blood-badge">${escapeHtml(donor.bloodGroup)}</span>
                </div>
                <div class="small text-muted mb-1">
                  <strong>City:</strong> ${escapeHtml(donor.city)} &bull; <strong>Age:</strong> ${donor.age} yrs
                </div>
                <div class="small text-muted">
                  <strong>Phone:</strong> ${escapeHtml(donor.phoneNumber)}
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small">
                <span class="text-success fw-bold">Registered</span>
                <button type="button" class="btn btn-sm btn-link text-danger p-0 remove-donor-btn"
                        data-donor-id="${escapeHtml(donor.donorId)}">
                  Remove
                </button>
              </div>
            </div>
          </div>
        `
      )
      .join('');
  }

  // =========================================================================
  // 5. FORM VALIDATION (Forms & Input + Edge Cases)
  // =========================================================================

  function setFieldState(inputEl, errorElId, message) {
    const errorEl = document.getElementById(errorElId);
    if (message) {
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      return false;
    }
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    inputEl.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    return true;
  }

  function validateFullName() {
    const value = fullNameInput.value.trim();
    if (!value) {
      return setFieldState(fullNameInput, 'fullNameError', 'Please enter your full name.');
    }
    if (value.length < 3) {
      return setFieldState(fullNameInput, 'fullNameError', 'Full name must be at least 3 characters.');
    }
    if (!/^[A-Za-z\s.'-]+$/.test(value)) {
      return setFieldState(fullNameInput, 'fullNameError', 'Full name should only contain letters and spaces.');
    }
    return setFieldState(fullNameInput, 'fullNameError', '');
  }

  function validatePhoneNumber() {
    const raw = phoneInput.value.trim();
    const normalized = normalizePhone(raw);
    if (!raw) {
      return setFieldState(phoneInput, 'phoneNumberError', 'Please enter your phone number.');
    }
    if (!/^0\d{9,10}$/.test(normalized)) {
      return setFieldState(phoneInput, 'phoneNumberError', 'Enter a valid number (e.g. 0300-1234567 or 051-1234567).');
    }
    return setFieldState(phoneInput, 'phoneNumberError', '');
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      return setFieldState(emailInput, 'emailAddressError', 'Please enter your email address.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return setFieldState(emailInput, 'emailAddressError', 'Please enter a valid email address.');
    }
    return setFieldState(emailInput, 'emailAddressError', '');
  }

  function validateCity() {
    if (!citySelect.value) {
      return setFieldState(citySelect, 'cityError', 'Please select your city.');
    }
    return setFieldState(citySelect, 'cityError', '');
  }

  function validateBloodGroup() {
    if (!bloodGroupSelect.value) {
      return setFieldState(bloodGroupSelect, 'bloodGroupError', 'Please select your blood group.');
    }
    return setFieldState(bloodGroupSelect, 'bloodGroupError', '');
  }

  function validateDob() {
    const value = dobInput.value;
    if (!value) {
      return setFieldState(dobInput, 'dateOfBirthError', 'Please select your date of birth.');
    }
    const age = calculateExactAge(value);
    if (age === null || age < 0) {
      return setFieldState(dobInput, 'dateOfBirthError', 'Date of birth cannot be in the future.');
    }
    if (age < MIN_DONOR_AGE) {
      return setFieldState(dobInput, 'dateOfBirthError', `You must be at least ${MIN_DONOR_AGE} years old to donate.`);
    }
    if (age > MAX_DONOR_AGE) {
      return setFieldState(dobInput, 'dateOfBirthError', `Donors must be ${MAX_DONOR_AGE} years old or younger.`);
    }
    return setFieldState(dobInput, 'dateOfBirthError', '');
  }

  function validateTerms() {
    if (!agreeTermsCheckbox.checked) {
      termsBox.classList.add('is-invalid-box');
      return setFieldState(
        agreeTermsCheckbox,
        'agreeTermsError',
        'Please check "I agree to the terms and conditions" to continue.'
      );
    }
    termsBox.classList.remove('is-invalid-box');
    return setFieldState(agreeTermsCheckbox, 'agreeTermsError', '');
  }

  function showFormAlert(type, message) {
    formAlert.className = `alert alert-${type}`;
    formAlert.textContent = message;
  }

  function hideFormAlert() {
    formAlert.className = 'alert d-none';
    formAlert.textContent = '';
  }

  function showThankYouBanner(donor, bloodInfo) {
    thankYouBanner.classList.remove('d-none');
    thankYouBanner.innerHTML = `
      <div class="h5 mb-1 text-success">${THANK_YOU_MESSAGE}</div>
      <p class="mb-1 small">
        <strong>${escapeHtml(donor.fullName)}</strong> (${escapeHtml(donor.bloodGroup)}, Age ${donor.age})
        from <strong>${escapeHtml(donor.city)}</strong> is now registered with ID
        <strong>${escapeHtml(donor.donorId)}</strong>.
      </p>
      <p class="mb-0 small">
        <strong>Can donate to:</strong> ${escapeHtml(bloodInfo ? bloodInfo.canDonateTo.join(', ') : donor.bloodGroup)}
        &bull; <strong>Next eligible date (90 days):</strong> ${getNextEligibleDateText()}
      </p>
    `;
  }

  function hideThankYouBanner() {
    thankYouBanner.classList.add('d-none');
    thankYouBanner.innerHTML = '';
  }

  // =========================================================================
  // 6. DRAFT PERSISTENCE (State & Memory)
  // =========================================================================

  function saveDraft() {
    const draft = {
      fullName: fullNameInput.value,
      phoneNumber: phoneInput.value,
      emailAddress: emailInput.value,
      city: citySelect.value,
      bloodGroup: bloodGroupSelect.value,
      dateOfBirth: dobInput.value
    };
    writeStorage(STORAGE_KEYS.DRAFT, draft);
  }

  function restoreDraft() {
    const draft = readStorage(STORAGE_KEYS.DRAFT, null);
    if (!draft) return;

    fullNameInput.value = draft.fullName || '';
    phoneInput.value = draft.phoneNumber || '';
    emailInput.value = draft.emailAddress || '';
    citySelect.value = draft.city || '';
    bloodGroupSelect.value = draft.bloodGroup || '';
    dobInput.value = draft.dateOfBirth || '';
    updateLiveInsights();
  }

  function clearFormAndDraft() {
    form.reset();
    removeStorage(STORAGE_KEYS.DRAFT);
    hideFormAlert();
    termsBox.classList.remove('is-invalid-box');
    updateLiveInsights();

    [fullNameInput, phoneInput, emailInput, citySelect, bloodGroupSelect, dobInput, agreeTermsCheckbox].forEach((el) => {
      el.classList.remove('is-valid', 'is-invalid');
      el.removeAttribute('aria-invalid');
    });
    ['fullNameError', 'phoneNumberError', 'emailAddressError', 'cityError', 'bloodGroupError', 'dateOfBirthError', 'agreeTermsError']
      .forEach((id) => {
        document.getElementById(id).textContent = '';
      });
  }

  // =========================================================================
  // 7. EVENT LISTENERS & SUBMISSION FLOW
  // =========================================================================

  function bindEvents() {
    const fieldValidators = [
      [fullNameInput, validateFullName, 'input'],
      [phoneInput, validatePhoneNumber, 'input'],
      [emailInput, validateEmail, 'input'],
      [citySelect, validateCity, 'change'],
      [bloodGroupSelect, validateBloodGroup, 'change'],
      [dobInput, validateDob, 'change'],
      [agreeTermsCheckbox, validateTerms, 'change']
    ];

    fieldValidators.forEach(([el, validator, eventName]) => {
      el.addEventListener('blur', validator);
      el.addEventListener(eventName, () => {
        if (el.classList.contains('is-invalid') || el.classList.contains('is-valid')) {
          validator();
        }
        saveDraft();
        updateLiveInsights();
      });
    });

    // Accept terms button inside the Terms modal
    acceptTermsModalBtn.addEventListener('click', () => {
      agreeTermsCheckbox.checked = true;
      validateTerms();
    });

    // Clear form button
    clearFormBtn.addEventListener('click', () => {
      clearFormAndDraft();
      hideThankYouBanner();
    });

    // Delete single saved donor profile
    savedDonorsList.addEventListener('click', (event) => {
      const btn = event.target.closest('.remove-donor-btn');
      if (!btn) return;
      const targetId = btn.dataset.donorId;
      const updated = readStorage(STORAGE_KEYS.DONORS, []).filter((d) => d.donorId !== targetId);
      writeStorage(STORAGE_KEYS.DONORS, updated);
      renderSavedDonors();
    });

    // Clear all saved donor profiles
    clearAllDonorsBtn.addEventListener('click', () => {
      removeStorage(STORAGE_KEYS.DONORS);
      renderSavedDonors();
    });

    // Main form submission
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      hideFormAlert();
      hideThankYouBanner();

      const results = [
        validateFullName(),
        validatePhoneNumber(),
        validateEmail(),
        validateCity(),
        validateBloodGroup(),
        validateDob(),
        validateTerms()
      ];

      const missingCount = results.filter((ok) => !ok).length;
      if (missingCount > 0) {
        showFormAlert(
          'danger',
          `Please complete or fix ${missingCount} highlighted ${missingCount === 1 ? 'field' : 'fields'} below before submitting.`
        );
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const donors = readStorage(STORAGE_KEYS.DONORS, []);
      const normalizedEmail = emailInput.value.trim().toLowerCase();
      const normalizedPhone = normalizePhone(phoneInput.value.trim());

      // Duplicate edge case check
      const duplicate = donors.find(
        (d) => d.emailAddress.toLowerCase() === normalizedEmail || normalizePhone(d.phoneNumber) === normalizedPhone
      );

      if (duplicate) {
        showFormAlert(
          'warning',
          `A donor with this email or phone number is already registered (ID: ${duplicate.donorId}).`
        );
        return;
      }

      const age = calculateExactAge(dobInput.value);
      const bloodInfo = BLOOD_GROUPS.find((b) => b.group === bloodGroupSelect.value);
      const uniqueSuffix = String(Date.now()).slice(-4);
      const newDonor = {
        donorId: `RH-${new Date().getFullYear()}-${uniqueSuffix}`,
        fullName: fullNameInput.value.trim(),
        phoneNumber: phoneInput.value.trim(),
        emailAddress: emailInput.value.trim(),
        city: citySelect.value,
        bloodGroup: bloodGroupSelect.value,
        dateOfBirth: dobInput.value,
        age,
        registeredAt: new Date().toISOString()
      };

      donors.unshift(newDonor);
      writeStorage(STORAGE_KEYS.DONORS, donors);
      renderSavedDonors();
      clearFormAndDraft();
      showThankYouBanner(newDonor, bloodInfo);

      // Populate and open interactive Digital Donor Pass modal
      successModalBody.innerHTML = `
        <p class="fw-bold text-success mb-2">${THANK_YOU_MESSAGE}</p>
        <p class="mb-3 small text-muted">Your donor profile has been saved and added to the Red Hope community.</p>
        <div class="donor-pass-preview mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small text-uppercase opacity-75">Red Hope Donor Pass</span>
            <span class="badge bg-light text-danger fs-6">${escapeHtml(newDonor.bloodGroup)}</span>
          </div>
          <div class="h5 mb-1">${escapeHtml(newDonor.fullName)}</div>
          <div class="small opacity-90 mb-2">${escapeHtml(newDonor.city)} &bull; Age ${newDonor.age} yrs &bull; ${escapeHtml(newDonor.donorId)}</div>
          <div class="small border-top border-white border-opacity-25 pt-2">
            <strong>Compatible Recipients:</strong> ${escapeHtml(bloodInfo ? bloodInfo.canDonateTo.join(', ') : newDonor.bloodGroup)}
          </div>
        </div>
        <p class="small text-muted mb-0">
          Recommended 90-day next donation date after first donation: <strong>${getNextEligibleDateText()}</strong>
        </p>
      `;

      if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(successModalEl).show();
      }
    });
  }

  // =========================================================================
  // 8. INITIALIZE PAGE
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    populateDynamicContent();
    restoreDraft();
    renderSavedDonors();
    bindEvents();
  });
})();
