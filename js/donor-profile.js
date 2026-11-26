/**
 * Red Hope - Donor Profile Logic
 * Connects with donors registered on donate.html via localStorage,
 * renders donation history & stats dynamically, calculates next eligible date
 * and lives impacted, and persists profile edits, availability, and donations.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DATA DEFINITIONS
  // =========================================================================
  const STORAGE_KEYS = {
    DONORS: 'redhope_registered_donors',
    PROFILE_STATE: 'redhope_donor_profile_state'
  };

  const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Multan'];
  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const RECOVERY_DAYS = 90;

  // Fallback sample donor profile matching the paper prototype if none registered yet
  const DEFAULT_PROFILE = {
    donorId: 'RH-2025-1001',
    fullName: 'Muhammad Faizan',
    phoneNumber: '+92 319 1234567',
    emailAddress: 'abc@gmail.com',
    city: 'Rawalpindi',
    bloodGroup: 'O-',
    registeredAt: '2025-05-01T00:00:00.000Z'
  };

  const DEFAULT_HISTORY = [
    { id: 'don-1', date: '2025-06-15', bloodGroup: 'O-', location: 'Lifeline Bank, Rwp' },
    { id: 'don-2', date: '2024-12-10', bloodGroup: 'O-', location: 'Shifa International' }
  ];

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  const bannerDonorId = document.getElementById('bannerDonorId');
  const bannerEligibilityText = document.getElementById('bannerEligibilityText');
  const profileSwitcherWrap = document.getElementById('profileSwitcherWrap');
  const profileSwitcher = document.getElementById('profileSwitcher');
  const profileAlert = document.getElementById('profileAlert');

  const profileInitials = document.getElementById('profileInitials');
  const profileName = document.getElementById('profileName');
  const profileBloodGroupBadge = document.getElementById('profileBloodGroupBadge');
  const profilePhone = document.getElementById('profilePhone');
  const profileEmail = document.getElementById('profileEmail');
  const profileCity = document.getElementById('profileCity');
  const profileJoined = document.getElementById('profileJoined');

  const statDonationsCount = document.getElementById('statDonationsCount');
  const statAvailabilityValue = document.getElementById('statAvailabilityValue');
  const toggleAvailabilityBtn = document.getElementById('toggleAvailabilityBtn');
  const statNextEligibleValue = document.getElementById('statNextEligibleValue');

  const donationHistoryBody = document.getElementById('donationHistoryBody');
  const emptyHistoryMessage = document.getElementById('emptyHistoryMessage');
  const impactSummaryText = document.getElementById('impactSummaryText');

  const openEditProfileBtn = document.getElementById('openEditProfileBtn');
  const editProfileModalEl = document.getElementById('editProfileModal');
  const editProfileForm = document.getElementById('editProfileForm');
  const editFullName = document.getElementById('editFullName');
  const editPhone = document.getElementById('editPhone');
  const editEmail = document.getElementById('editEmail');
  const editCity = document.getElementById('editCity');
  const editBloodGroup = document.getElementById('editBloodGroup');

  const logDonationModalEl = document.getElementById('logDonationModal');
  const logDonationForm = document.getElementById('logDonationForm');
  const donationDate = document.getElementById('donationDate');
  const donationBloodGroup = document.getElementById('donationBloodGroup');
  const donationLocation = document.getElementById('donationLocation');

  let activeDonorId = DEFAULT_PROFILE.donorId;

  // =========================================================================
  // 3. STORAGE & CALCULATION HELPERS
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
      // Ignore storage errors cleanly
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getInitials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'RH';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDisplayDate(isoDate) {
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatJoinedDate(isoTimestamp) {
    const parsed = new Date(isoTimestamp);
    if (Number.isNaN(parsed.getTime())) return 'Joined May 2025';
    return `Joined ${parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  function calculateNextEligible(history) {
    if (!history || history.length === 0) {
      return { label: 'Eligible Now', isReady: true };
    }
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    const latest = new Date(`${sorted[0].date}T00:00:00`);
    if (Number.isNaN(latest.getTime())) {
      return { label: 'Eligible Now', isReady: true };
    }
    const nextDate = new Date(latest);
    nextDate.setDate(nextDate.getDate() + RECOVERY_DAYS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (nextDate <= today) {
      return { label: 'Eligible Now', isReady: true };
    }
    return {
      label: nextDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isReady: false
    };
  }

  function showAlert(type, message) {
    profileAlert.className = `alert alert-${type} mb-4`;
    profileAlert.textContent = message;
  }

  // =========================================================================
  // 4. PROFILE STATE MANAGEMENT (Cross-page with donate.html)
  // =========================================================================

  function getAllProfiles() {
    const registered = readStorage(STORAGE_KEYS.DONORS, []);
    return registered.length > 0 ? registered : [DEFAULT_PROFILE];
  }

  function getProfileStateMap() {
    return readStorage(STORAGE_KEYS.PROFILE_STATE, {});
  }

  function getDonorExtras(donorId, bloodGroup) {
    const map = getProfileStateMap();
    if (!map[donorId]) {
      const isDefault = donorId === DEFAULT_PROFILE.donorId;
      map[donorId] = {
        available: true,
        history: isDefault ? DEFAULT_HISTORY : []
      };
      writeStorage(STORAGE_KEYS.PROFILE_STATE, map);
    }
    // Keep blood group aligned if newly initialized
    if (!Array.isArray(map[donorId].history)) {
      map[donorId].history = [];
    }
    return { ...map[donorId], defaultBloodGroup: bloodGroup };
  }

  function saveDonorExtras(donorId, extras) {
    const map = getProfileStateMap();
    map[donorId] = extras;
    writeStorage(STORAGE_KEYS.PROFILE_STATE, map);
  }

  function resolveInitialDonorId() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const profiles = getAllProfiles();

    if (requestedId && profiles.some((p) => p.donorId === requestedId)) {
      return requestedId;
    }
    return profiles[0].donorId;
  }

  // =========================================================================
  // 5. RENDERING
  // =========================================================================

  function populateSelectControls() {
    CITIES.forEach((city) => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      editCity.appendChild(opt);
    });

    BLOOD_GROUPS.forEach((bg) => {
      const opt1 = document.createElement('option');
      opt1.value = bg;
      opt1.textContent = bg;
      editBloodGroup.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = bg;
      opt2.textContent = bg;
      donationBloodGroup.appendChild(opt2);
    });

    const todayIso = new Date().toISOString().split('T')[0];
    donationDate.setAttribute('max', todayIso);
  }

  function renderProfileSwitcher(profiles) {
    if (profiles.length <= 1) {
      profileSwitcherWrap.classList.add('d-none');
      return;
    }
    profileSwitcherWrap.classList.remove('d-none');
    profileSwitcher.innerHTML = profiles
      .map(
        (p) =>
          `<option value="${escapeHtml(p.donorId)}" ${p.donorId === activeDonorId ? 'selected' : ''}>
            ${escapeHtml(p.fullName)} (${escapeHtml(p.bloodGroup)})
          </option>`
      )
      .join('');
  }

  function renderActiveProfile() {
    const profiles = getAllProfiles();
    let donor = profiles.find((p) => p.donorId === activeDonorId);
    if (!donor) {
      donor = profiles[0];
      activeDonorId = donor.donorId;
    }

    renderProfileSwitcher(profiles);

    const extras = getDonorExtras(donor.donorId, donor.bloodGroup);
    const sortedHistory = [...extras.history].sort((a, b) => b.date.localeCompare(a.date));
    const nextEligible = calculateNextEligible(sortedHistory);
    const livesSaved = sortedHistory.length * 3;

    // Banner & Card Header
    bannerDonorId.textContent = donor.donorId;
    bannerEligibilityText.textContent = nextEligible.isReady
      ? 'Eligible to donate now'
      : `Next donation cycle: ${nextEligible.label}`;

    profileInitials.textContent = getInitials(donor.fullName);
    profileName.textContent = donor.fullName;
    profileBloodGroupBadge.textContent = donor.bloodGroup;
    profilePhone.textContent = donor.phoneNumber;
    profileEmail.textContent = donor.emailAddress;
    profileCity.textContent = donor.city;
    profileJoined.textContent = formatJoinedDate(donor.registeredAt);

    // Stat Cards
    statDonationsCount.textContent = String(sortedHistory.length);
    statAvailabilityValue.textContent = extras.available ? '100%' : 'Paused';
    toggleAvailabilityBtn.textContent = extras.available ? 'Available (Toggle)' : 'Unavailable (Toggle)';
    toggleAvailabilityBtn.className = extras.available
      ? 'btn btn-sm btn-outline-success availability-toggle-btn'
      : 'btn btn-sm btn-outline-secondary availability-toggle-btn';

    statNextEligibleValue.textContent = nextEligible.label;

    // Impact Summary
    impactSummaryText.textContent =
      sortedHistory.length > 0
        ? `Your ${sortedHistory.length} ${sortedHistory.length === 1 ? 'donation has' : 'donations have'} helped save up to ${livesSaved} lives in ${donor.city} and nearby hospitals.`
        : `Ready to make your first donation! One donation in ${donor.city} can help save up to 3 lives.`;

    // Pre-select donor's blood group in Log Donation modal
    donationBloodGroup.value = donor.bloodGroup;

    // Donation History Table
    if (sortedHistory.length === 0) {
      donationHistoryBody.innerHTML = '';
      emptyHistoryMessage.classList.remove('d-none');
      return;
    }

    emptyHistoryMessage.classList.add('d-none');
    donationHistoryBody.innerHTML = sortedHistory
      .map(
        (entry) => `
          <tr>
            <td data-label="Date" class="fw-bold">${escapeHtml(formatDisplayDate(entry.date))}</td>
            <td data-label="Blood Group"><span class="blood-badge">${escapeHtml(entry.bloodGroup)}</span></td>
            <td data-label="Location">${escapeHtml(entry.location)}</td>
            <td data-label="Action" class="text-end">
              <button type="button" class="btn btn-sm btn-link text-danger p-0 delete-history-btn"
                      data-entry-id="${escapeHtml(entry.id)}">
                Remove
              </button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  // =========================================================================
  // 6. VALIDATION HELPERS
  // =========================================================================

  function setError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (message) {
      inputEl.classList.add('is-invalid');
      errorEl.textContent = message;
      return false;
    }
    inputEl.classList.remove('is-invalid');
    errorEl.textContent = '';
    return true;
  }

  function validateEditForm() {
    const nameVal = editFullName.value.trim();
    const phoneRaw = editPhone.value.trim();
    const phoneDigits = phoneRaw.replace(/[\s\-()]/g, '').replace(/^\+92/, '0');
    const emailVal = editEmail.value.trim();

    const okName =
      !nameVal
        ? setError(editFullName, 'editFullNameError', 'Full name is required.')
        : nameVal.length < 3 || !/^[A-Za-z\s.'-]+$/.test(nameVal)
        ? setError(editFullName, 'editFullNameError', 'Enter a valid name (letters only, min 3 chars).')
        : setError(editFullName, 'editFullNameError', '');

    const okPhone =
      !phoneRaw
        ? setError(editPhone, 'editPhoneError', 'Phone number is required.')
        : !/^0\d{9,10}$/.test(phoneDigits)
        ? setError(editPhone, 'editPhoneError', 'Enter a valid phone number (e.g. 0319-1234567).')
        : setError(editPhone, 'editPhoneError', '');

    const okEmail =
      !emailVal
        ? setError(editEmail, 'editEmailError', 'Email address is required.')
        : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)
        ? setError(editEmail, 'editEmailError', 'Enter a valid email address.')
        : setError(editEmail, 'editEmailError', '');

    const okCity = !editCity.value
      ? setError(editCity, 'editCityError', 'Select a city.')
      : setError(editCity, 'editCityError', '');

    const okBg = !editBloodGroup.value
      ? setError(editBloodGroup, 'editBloodGroupError', 'Select a blood group.')
      : setError(editBloodGroup, 'editBloodGroupError', '');

    return okName && okPhone && okEmail && okCity && okBg;
  }

  function validateLogDonationForm() {
    const dateVal = donationDate.value;
    const todayIso = new Date().toISOString().split('T')[0];
    const locVal = donationLocation.value.trim();

    const okDate =
      !dateVal
        ? setError(donationDate, 'donationDateError', 'Donation date is required.')
        : dateVal > todayIso
        ? setError(donationDate, 'donationDateError', 'Donation date cannot be in the future.')
        : setError(donationDate, 'donationDateError', '');

    const okBg = !donationBloodGroup.value
      ? setError(donationBloodGroup, 'donationBloodGroupError', 'Select a blood group.')
      : setError(donationBloodGroup, 'donationBloodGroupError', '');

    const okLoc =
      !locVal
        ? setError(donationLocation, 'donationLocationError', 'Hospital or blood bank name is required.')
        : locVal.length < 3
        ? setError(donationLocation, 'donationLocationError', 'Location must be at least 3 characters.')
        : setError(donationLocation, 'donationLocationError', '');

    return okDate && okBg && okLoc;
  }

  // =========================================================================
  // 7. EVENT BINDINGS
  // =========================================================================

  function bindEvents() {
    profileSwitcher.addEventListener('change', () => {
      activeDonorId = profileSwitcher.value;
      renderActiveProfile();
    });

    toggleAvailabilityBtn.addEventListener('click', () => {
      const profiles = getAllProfiles();
      const donor = profiles.find((p) => p.donorId === activeDonorId) || profiles[0];
      const extras = getDonorExtras(donor.donorId, donor.bloodGroup);
      extras.available = !extras.available;
      saveDonorExtras(donor.donorId, extras);
      renderActiveProfile();
      showAlert(
        'info',
        `Availability updated to ${extras.available ? '100% Available' : 'Paused'}.`
      );
    });

    // Populate Edit Profile Modal with current active donor info
    openEditProfileBtn.addEventListener('click', () => {
      const profiles = getAllProfiles();
      const donor = profiles.find((p) => p.donorId === activeDonorId) || profiles[0];
      editFullName.value = donor.fullName;
      editPhone.value = donor.phoneNumber;
      editEmail.value = donor.emailAddress;
      editCity.value = CITIES.includes(donor.city) ? donor.city : CITIES[0];
      editBloodGroup.value = BLOOD_GROUPS.includes(donor.bloodGroup) ? donor.bloodGroup : BLOOD_GROUPS[0];
    });

    editProfileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateEditForm()) return;

      const registered = readStorage(STORAGE_KEYS.DONORS, []);
      const idx = registered.findIndex((p) => p.donorId === activeDonorId);

      const updatedFields = {
        fullName: editFullName.value.trim(),
        phoneNumber: editPhone.value.trim(),
        emailAddress: editEmail.value.trim(),
        city: editCity.value,
        bloodGroup: editBloodGroup.value
      };

      if (idx >= 0) {
        registered[idx] = { ...registered[idx], ...updatedFields };
        writeStorage(STORAGE_KEYS.DONORS, registered);
      } else {
        // Persist edited default profile into registered donors so edits survive reload
        const created = { ...DEFAULT_PROFILE, ...updatedFields };
        writeStorage(STORAGE_KEYS.DONORS, [created]);
        activeDonorId = created.donorId;
      }

      if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(editProfileModalEl).hide();
      }
      renderActiveProfile();
      showAlert('success', 'Donor profile updated and saved.');
    });

    logDonationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateLogDonationForm()) return;

      const profiles = getAllProfiles();
      const donor = profiles.find((p) => p.donorId === activeDonorId) || profiles[0];
      const extras = getDonorExtras(donor.donorId, donor.bloodGroup);

      extras.history.unshift({
        id: `don-${Date.now()}`,
        date: donationDate.value,
        bloodGroup: donationBloodGroup.value,
        location: donationLocation.value.trim()
      });
      saveDonorExtras(donor.donorId, extras);
      logDonationForm.reset();

      if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(logDonationModalEl).hide();
      }
      renderActiveProfile();
      showAlert('success', 'New blood donation added to your history!');
    });

    donationHistoryBody.addEventListener('click', (event) => {
      const btn = event.target.closest('.delete-history-btn');
      if (!btn) return;
      const entryId = btn.dataset.entryId;
      const profiles = getAllProfiles();
      const donor = profiles.find((p) => p.donorId === activeDonorId) || profiles[0];
      const extras = getDonorExtras(donor.donorId, donor.bloodGroup);

      extras.history = extras.history.filter((item) => item.id !== entryId);
      saveDonorExtras(donor.donorId, extras);
      renderActiveProfile();
      showAlert('warning', 'Donation record removed from history.');
    });
  }

  // =========================================================================
  // 8. INITIALIZE PAGE
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    populateSelectControls();
    activeDonorId = resolveInitialDonorId();
    renderActiveProfile();
    bindEvents();
  });
})();
