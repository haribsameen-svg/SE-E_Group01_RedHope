/**
 * ==============================================================================
 * RED HOPE - ACTIVE BLOOD REQUESTS JAVASCRIPT
 * Page 2: Fetch LocalStorage, Dynamic Rendering, Live Search & Filters
 * ==============================================================================
 */

// Shared key used across all three pages
const STORAGE_KEY = 'blood_requests_data';

// Default initial realistic requests loaded on first visit if storage is empty
const SAMPLE_INITIAL_REQUESTS = [
  {
    id: "REQ-481920",
    patientName: "Zainab Bibi",
    patientAge: 45,
    bloodGroup: "O-",
    unitsRequired: 3,
    hospitalName: "Holy Family Hospital",
    city: "Rawalpindi",
    contactNumber: "03009876543",
    requiredDate: "2026-11-26",
    urgency: "Urgent",
    additionalInfo: "Emergency ICU admission, thalassemia patient requires urgent packed cells.",
    status: "Active",
    createdAt: "2026-11-25T18:30:00.000Z"
  },
  {
    id: "REQ-639104",
    patientName: "Muhammad Usman",
    patientAge: 34,
    bloodGroup: "B+",
    unitsRequired: 2,
    hospitalName: "Shifa International Hospital",
    city: "Islamabad",
    contactNumber: "03214567890",
    requiredDate: "2026-11-27",
    urgency: "Urgent",
    additionalInfo: "Cardiac surgery scheduled early morning. Attendant waiting at main blood bank.",
    status: "Active",
    createdAt: "2026-11-25T19:15:00.000Z"
  },
  {
    id: "REQ-820512",
    patientName: "Hamza Tariq",
    patientAge: 22,
    bloodGroup: "A+",
    unitsRequired: 1,
    hospitalName: "PIMS Hospital",
    city: "Islamabad",
    contactNumber: "03335551234",
    requiredDate: "2026-11-30",
    urgency: "Moderate",
    additionalInfo: "Dengue fever recovery with low platelet count. Direct donor requested.",
    status: "Active",
    createdAt: "2026-11-25T20:00:00.000Z"
  },
  {
    id: "REQ-910245",
    patientName: "Fatima Noor",
    patientAge: 29,
    bloodGroup: "AB+",
    unitsRequired: 2,
    hospitalName: "Benazir Bhutto Hospital",
    city: "Rawalpindi",
    contactNumber: "03451122334",
    requiredDate: "2026-12-02",
    urgency: "Normal",
    additionalInfo: "Scheduled orthopedic replacement surgery. Donors requested to register in advance.",
    status: "Active",
    createdAt: "2026-11-25T20:30:00.000Z"
  }
];

// Initialize storage if empty
function getStoredRequests() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_REQUESTS));
    return SAMPLE_INITIAL_REQUESTS;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error parsing stored blood requests:', err);
    return [];
  }
}

// Format date into human-readable string (e.g. Nov 28, 2026)
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIndex, day);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

// Escape HTML characters to protect against XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  const requestsGrid = document.getElementById('requestsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const bloodGroupFilter = document.getElementById('bloodGroupFilter');
  const cityFilter = document.getElementById('cityFilter');
  const searchBtn = document.getElementById('searchBtn');
  const resetLink = document.getElementById('resetLink');
  const clearFilterBtn = document.getElementById('clearFilterBtn');

  // Load requests
  let allRequests = getStoredRequests();

  // Render cards
  function renderRequests(items) {
    requestsGrid.innerHTML = '';

    if (!items || items.length === 0) {
      emptyState.classList.remove('d-none');
      resultsCount.textContent = 'Showing 0 requests';
      return;
    }

    emptyState.classList.add('d-none');
    resultsCount.textContent = `Showing ${items.length} ${items.length === 1 ? 'request' : 'requests'}`;

    items.forEach(req => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';

      let urgencyClass = 'urgency-normal';
      if (req.urgency === 'Urgent') {
        urgencyClass = 'urgency-urgent';
      } else if (req.urgency === 'Moderate') {
        urgencyClass = 'urgency-moderate';
      }

      col.innerHTML = `
        <div class="request-card p-3 p-md-4 shadow-sm">
          <!-- Card Header: Blood Group & Urgency Badge -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="blood-group-badge">${escapeHtml(req.bloodGroup)}</span>
            <span class="urgency-badge ${urgencyClass}">
              <svg width="8" height="8" fill="currentColor" class="me-1 mb-1 d-inline-block" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8"/>
              </svg>
              ${escapeHtml(req.urgency || 'Active')}
            </span>
          </div>

          <!-- Patient Name & Hospital -->
          <h3 class="h5 fw-bold text-dark mb-1">${escapeHtml(req.patientName)}</h3>
          <p class="text-muted small mb-3">
            <svg width="13" height="13" fill="currentColor" class="me-1" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
            ${escapeHtml(req.hospitalName)}, ${escapeHtml(req.city)}
          </p>

          <!-- Vitals List -->
          <div class="border-top border-bottom py-2 my-2 small text-secondary">
            <div class="d-flex justify-content-between mb-1">
              <span>Required Units:</span>
              <strong class="text-dark">${escapeHtml(String(req.unitsRequired))} ${req.unitsRequired > 1 ? 'Bags' : 'Bag'}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Needed By:</span>
              <strong class="text-danger">${formatDate(req.requiredDate)}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>Patient Age:</span>
              <span class="text-dark">${escapeHtml(String(req.patientAge))} Years</span>
            </div>
          </div>

          <!-- Card Action Button -->
          <div class="mt-auto pt-3">
            <a href="blood-request-details.html?id=${encodeURIComponent(req.id)}" class="btn btn-red w-100 py-2">
              View Details
            </a>
          </div>
        </div>
      `;

      requestsGrid.appendChild(col);
    });
  }

  // Filter & Search Logic
  function applyFilters() {
    allRequests = getStoredRequests(); // refresh in case user opened in another tab

    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const bloodVal = bloodGroupFilter ? bloodGroupFilter.value.trim() : '';
    const cityVal = cityFilter ? cityFilter.value.trim() : '';

    const filtered = allRequests.filter(item => {
      // Search matching patient name or hospital name
      const matchesSearch = !searchVal ||
        (item.patientName && item.patientName.toLowerCase().includes(searchVal)) ||
        (item.hospitalName && item.hospitalName.toLowerCase().includes(searchVal));

      // Filter by blood group
      const matchesBlood = !bloodVal || (item.bloodGroup === bloodVal);

      // Filter by city
      const matchesCity = !cityVal || (item.city === cityVal);

      return matchesSearch && matchesBlood && matchesCity;
    });

    renderRequests(filtered);
  }

  // Reset Filters
  function resetFilters() {
    if (searchInput) searchInput.value = '';
    if (bloodGroupFilter) bloodGroupFilter.value = '';
    if (cityFilter) cityFilter.value = '';
    applyFilters();
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (bloodGroupFilter) {
    bloodGroupFilter.addEventListener('change', applyFilters);
  }
  if (cityFilter) {
    cityFilter.addEventListener('change', applyFilters);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }
  if (resetLink) {
    resetLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetFilters();
    });
  }
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', resetFilters);
  }

  // Initial render
  renderRequests(allRequests);
});
