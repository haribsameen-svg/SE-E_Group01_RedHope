// ==========================================================================
// Red Hope - Donor Profile Page Script
// Manages: profile rendering, stat cards, donation history table,
//          add/edit log modal, availability toggle, localStorage persistence.
// ==========================================================================

// ── Default donor data (used if no donor has registered yet) ─────────────────
const DEFAULT_DONOR = {
  fullName:    "Faizan Ahmed",
  bloodGroup:  "O+",
  email:       "faizan@example.com",
  city:        "Islamabad",
  phone:       "0300-1234567",
  joiningDate: "2026-11-27",   // ISO date
  available:   true,
  lastDonationDate: "2026-11-01"
};

// ── Storage keys ───────────────────────────────────────────────────────────
const DONOR_STORAGE_KEY  = "rh_registered_donor";
const AVATAR_STORAGE_KEY = "rh_donor_avatar";
const STORAGE_KEY        = "rh_donation_logs";

let currentDonor = loadDonor();

function loadDonor() {
  try {
    const raw = localStorage.getItem(DONOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DONOR,
        ...parsed,
        joiningDate: parsed.joiningDate || new Date().toISOString().split("T")[0],
        available: typeof parsed.available === "boolean" ? parsed.available : true
      };
    }
  } catch (_) { /* ignore storage errors */ }
  return { ...DEFAULT_DONOR };
}

function saveDonor(donor) {
  try {
    localStorage.setItem(DONOR_STORAGE_KEY, JSON.stringify(donor));
  } catch (_) { /* storage unavailable */ }
}

// ── Seed logs (shown on first load; cleared/updated by user edits) ─────────
const SEED_LOGS = [
  { date: "2026-11-01", bloodGroup: "O+", location: "PIMS Blood Bank, Islamabad" },
  { date: "2026-07-14", bloodGroup: "O+", location: "Red Crescent Centre, Islamabad" },
  { date: "2026-02-20", bloodGroup: "O+", location: "Holy Family Blood Bank, Rawalpindi" },
  { date: "2025-10-05", bloodGroup: "O+", location: "Federal Polyclinic, Islamabad" },
  { date: "2025-05-30", bloodGroup: "O+", location: "PIMS Blood Bank, Islamabad" },
  { date: "2024-12-18", bloodGroup: "O+", location: "DHQ Blood Bank, Rawalpindi" }
];

// ==========================================================================
// Helpers
// ==========================================================================

/** Format an ISO date string as "DD Month YYYY". */
function fmtDate(iso) {
  if (!iso) return "—";
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

/** Format as "Month YYYY". */
function fmtMonthYear(iso) {
  if (!iso) return "—";
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const [y, m] = iso.split("-");
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

/** Add `days` days to an ISO date and return a new ISO date string. */
function addDays(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Return initials from a full name (up to 2 chars). */
function initials(name) {
  return name.trim().split(/\s+/)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

// ==========================================================================
// Load / Save logs from localStorage
// ==========================================================================

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (_) { /* storage unavailable */ }
}

// ==========================================================================
// Render profile card
// ==========================================================================

function renderProfile(donor) {
  // Avatar initials
  document.getElementById("avatarInitials").textContent = initials(donor.fullName);

  // Name + blood group
  document.getElementById("profileName").textContent         = donor.fullName;
  document.getElementById("profileBloodGroup").textContent   = donor.bloodGroup;
  document.getElementById("profileBloodGroupDetail").textContent =
    donor.bloodGroup + " (" + expandBloodGroup(donor.bloodGroup) + ")";

  // Detail fields
  document.getElementById("profileEmail").textContent   = donor.email;
  document.getElementById("profileCity").textContent    = donor.city;
  document.getElementById("profilePhone").textContent   = donor.phone;
  document.getElementById("profileJoining").textContent = fmtMonthYear(donor.joiningDate);

  // Availability badge on the profile card
  const availBadge = document.getElementById("profileAvailBadge");
  if (donor.available) {
    availBadge.className = "badge rounded-pill bg-success-subtle text-success px-3 py-2 mb-3";
    availBadge.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Available to Donate';
  } else {
    availBadge.className = "badge rounded-pill bg-danger-subtle text-danger px-3 py-2 mb-3";
    availBadge.innerHTML = '<i class="bi bi-x-circle-fill me-1"></i> Currently Unavailable';
  }
}

function expandBloodGroup(bg) {
  const map = {
    "A+":"A Positive","A-":"A Negative",
    "B+":"B Positive","B-":"B Negative",
    "AB+":"AB Positive","AB-":"AB Negative",
    "O+":"O Positive","O-":"O Negative"
  };
  return map[bg] || bg;
}

// ==========================================================================
// Render stat cards
// ==========================================================================

function renderStats(donor, logs) {
  // Total donations
  document.getElementById("statTotal").textContent = logs.length;

  // Availability
  const statCard  = document.getElementById("statAvailCard");
  const statVal   = document.getElementById("statAvail");
  const statIcon  = document.getElementById("statAvailIcon");

  if (donor.available) {
    statCard.className = "card border-0 border-top border-4 border-success shadow-sm rounded-4 p-3 text-center h-100 bg-white";
    statVal.className = "fs-2 fw-bold text-success d-block";
    statVal.textContent = "On";
    statIcon.className = "bi bi-heart-pulse-fill fs-3 text-success mb-1 d-block";
  } else {
    statCard.className = "card border-0 border-top border-4 border-danger shadow-sm rounded-4 p-3 text-center h-100 bg-white";
    statVal.className = "fs-2 fw-bold text-danger d-block";
    statVal.textContent = "Off";
    statIcon.className = "bi bi-dash-circle-fill fs-3 text-danger mb-1 d-block";
  }

  // Next eligible: 56 days after the most recent donation
  const nextEl = document.getElementById("statNextEligible");
  if (logs.length === 0) {
    nextEl.textContent = "Now";
    nextEl.className = "fs-2 fw-bold text-dark d-block";
  } else {
    // Sort descending to find latest donation
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const nextIso = addDays(sorted[0].date, 56);
    const nextDate = new Date(nextIso);
    const now = new Date();
    if (nextDate <= now) {
      nextEl.textContent = "Now";
      nextEl.className = "fs-2 fw-bold text-dark d-block";
    } else {
      const months = ["Jan","Feb","Mar","Apr","May","Jun",
                      "Jul","Aug","Sep","Oct","Nov","Dec"];
      nextEl.textContent = `${months[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
      nextEl.className = "fs-4 fw-bold text-dark d-block";
    }
  }
}

// ==========================================================================
// Render donation history table
// ==========================================================================

function renderHistory(logs) {
  const tbody = document.getElementById("historyBody");
  const empty = document.getElementById("historyEmpty");
  tbody.innerHTML = "";

  if (logs.length === 0) {
    empty.classList.remove("d-none");
    return;
  }

  empty.classList.add("d-none");

  // Show most recent first
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(function (log, idx) {
    // find original index in unsorted logs for editing
    const origIdx = logs.findIndex(
      l => l.date === log.date && l.bloodGroup === log.bloodGroup && l.location === log.location
    );

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmtDate(log.date)}</td>
      <td><span class="badge bg-danger">${log.bloodGroup}</span></td>
      <td>${escHtml(log.location)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger btn-edit-row" title="Edit this log" data-idx="${origIdx}">
          <i class="bi bi-pencil-square"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach edit button handlers
  tbody.querySelectorAll(".btn-edit-row").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openEditModal(parseInt(this.dataset.idx, 10));
    });
  });
}

/** Minimal HTML escape to prevent XSS from location text. */
function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ==========================================================================
// Modal: open in ADD mode
// ==========================================================================

function openAddModal() {
  document.getElementById("logModalLabel").innerHTML =
    '<i class="bi bi-plus-circle-fill me-2"></i>Add Donation Log';
  document.getElementById("logEditIndex").value = "-1";
  document.getElementById("logForm").reset();
  document.getElementById("logForm").classList.remove("was-validated");

  // Default date to today
  document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
  // Default blood group to donor's
  document.getElementById("logBloodGroup").value = currentDonor.bloodGroup;
}

// ==========================================================================
// Modal: open in EDIT mode
// ==========================================================================

function openEditModal(idx) {
  const logs = loadLogs() || SEED_LOGS;
  const log  = logs[idx];
  if (!log) return;

  document.getElementById("logModalLabel").innerHTML =
    '<i class="bi bi-pencil-square me-2"></i>Edit Donation Log';
  document.getElementById("logEditIndex").value = idx;
  document.getElementById("logDate").value       = log.date;
  document.getElementById("logBloodGroup").value = log.bloodGroup;
  document.getElementById("logLocation").value   = log.location;
  document.getElementById("logForm").classList.remove("was-validated");

  bootstrap.Modal.getOrCreateInstance(document.getElementById("logModal")).show();
}

// ==========================================================================
// Save log (add or edit)
// ==========================================================================

function saveLog() {
  const form = document.getElementById("logForm");
  form.classList.add("was-validated");

  if (!form.checkValidity()) {
    const bad = form.querySelector(":invalid");
    if (bad) { bad.focus(); }
    return;
  }

  const logs    = loadLogs() || [...SEED_LOGS];
  const editIdx = parseInt(document.getElementById("logEditIndex").value, 10);
  const entry   = {
    date:       document.getElementById("logDate").value,
    bloodGroup: document.getElementById("logBloodGroup").value,
    location:   document.getElementById("logLocation").value.trim()
  };

  if (editIdx >= 0) {
    logs[editIdx] = entry;        // update existing
  } else {
    logs.push(entry);             // add new
  }

  saveLogs(logs);
  renderHistory(logs);
  renderStats(currentDonor, logs);

  bootstrap.Modal.getOrCreateInstance(document.getElementById("logModal")).hide();
}

// ==========================================================================
// Bootstrap date max constraint (can't donate in the future)
// ==========================================================================

function setDateConstraints() {
  const logDate = document.getElementById("logDate");
  logDate.max   = new Date().toISOString().split("T")[0];
  logDate.min   = "2000-01-01";
}

// ==========================================================================
// DOMContentLoaded — wire everything up
// ==========================================================================

function loadAvatar() {
  try {
    const dataUrl = localStorage.getItem(AVATAR_STORAGE_KEY);
    const imgEl = document.getElementById("avatarImg");
    const initEl = document.getElementById("avatarInitials");
    if (dataUrl && imgEl && initEl) {
      imgEl.src = dataUrl;
      imgEl.classList.remove("d-none");
      initEl.classList.add("d-none");
    }
  } catch (_) { /* ignore */ }
}

document.addEventListener("DOMContentLoaded", function () {

  // Load or seed logs (only seed demo logs if no donor has registered yet)
  let logs = loadLogs();
  if (logs === null) {
    logs = localStorage.getItem(DONOR_STORAGE_KEY) ? [] : [...SEED_LOGS];
    saveLogs(logs);
  }

  // Render all sections
  renderProfile(currentDonor);
  renderStats(currentDonor, logs);
  renderHistory(logs);
  loadAvatar();
  setDateConstraints();

  // Toggle Availability On / Off
  const availCard = document.getElementById("statAvailCard");
  availCard.style.cursor = "pointer";
  function toggleAvailability() {
    currentDonor.available = !currentDonor.available;
    saveDonor(currentDonor);
    renderProfile(currentDonor);
    renderStats(currentDonor, loadLogs() || []);
  }
  availCard.addEventListener("click", toggleAvailability);
  availCard.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleAvailability();
    }
  });

  // Profile picture circle sizing & hover overlay via JS (no custom CSS)
  const avatarWrap = document.getElementById("avatarWrap");
  const avatarOverlay = document.getElementById("avatarOverlay");
  const avatarInput = document.getElementById("avatarInput");
  avatarWrap.style.width = "110px";
  avatarWrap.style.height = "110px";
  avatarWrap.style.cursor = "pointer";
  avatarWrap.addEventListener("mouseenter", function () {
    avatarOverlay.classList.remove("opacity-0");
  });
  avatarWrap.addEventListener("mouseleave", function () {
    avatarOverlay.classList.add("opacity-0");
  });
  avatarWrap.addEventListener("click", function () {
    avatarInput.click();
  });
  avatarWrap.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      avatarInput.click();
    }
  });
  avatarInput.addEventListener("change", function () {
    const file = this.files && this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const dataUrl = ev.target.result;
      try { localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl); } catch (_) {}
      loadAvatar();
    };
    reader.readAsDataURL(file);
  });

  // "Add / Edit Log" button → open ADD mode
  document.getElementById("btnAddLog").addEventListener("click", function () {
    openAddModal();
  });

  // Save button in modal
  document.getElementById("btnSaveLog").addEventListener("click", saveLog);

  // Also allow Enter key inside modal inputs to save
  document.getElementById("logForm").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); saveLog(); }
  });

  // Reset form validation state when modal closes
  document.getElementById("logModal").addEventListener("hidden.bs.modal", function () {
    document.getElementById("logForm").classList.remove("was-validated");
  });

});
