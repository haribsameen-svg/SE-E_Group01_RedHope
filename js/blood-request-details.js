/**
 * ==============================================================================
 * RED HOPE - BLOOD REQUEST DETAILS JAVASCRIPT
 * Page 3: Query Parameter ID Resolver, LocalStorage Lookup & Interactive Actions
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

// Fetch requests from localStorage
function getStoredRequests() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_REQUESTS));
    return SAMPLE_INITIAL_REQUESTS;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error parsing stored requests:', err);
    return [];
  }
}

// Format date into human-readable format
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

// Format creation date / time
function formatCreatedTime(isoStr) {
  if (!isoStr) return 'Recently';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const detailsContainer = document.getElementById('detailsContainer');
  const errorState = document.getElementById('errorState');
  const errorMessageTitle = document.getElementById('errorMessageTitle');
  const errorMessageText = document.getElementById('errorMessageText');

  // Breadcrumb & Headings
  const breadcrumbRequestId = document.getElementById('breadcrumbRequestId');
  const detailId = document.getElementById('detailId');
  const detailPatientName = document.getElementById('detailPatientName');
  const detailCreatedAt = document.getElementById('detailCreatedAt');
  const detailUrgencyBadge = document.getElementById('detailUrgencyBadge');

  // Information Grid
  const detailBloodGroup = document.getElementById('detailBloodGroup');
  const detailUnits = document.getElementById('detailUnits');
  const detailAge = document.getElementById('detailAge');
  const detailRequiredDate = document.getElementById('detailRequiredDate');
  const detailCity = document.getElementById('detailCity');
  const detailStatus = document.getElementById('detailStatus');

  // Hospital & Location
  const detailHospital = document.getElementById('detailHospital');
  const detailHospitalLocation = document.getElementById('detailHospitalLocation');
  const detailNotes = document.getElementById('detailNotes');

  // Sidebar
  const sidebarBloodBadge = document.getElementById('sidebarBloodBadge');
  const detailContactNumber = document.getElementById('detailContactNumber');
  const copyPhoneBtn = document.getElementById('copyPhoneBtn');
  const callNowBtn = document.getElementById('callNowBtn');

  // Modal Elements
  const modalPatientName = document.getElementById('modalPatientName');
  const modalHospital = document.getElementById('modalHospital');
  const modalPhone = document.getElementById('modalPhone');
  const modalCallBtn = document.getElementById('modalCallBtn');

  // Extract ID from URL (?id=REQ-XXXXXX)
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');

  if (!requestId) {
    showError('No Request ID Provided', 'Please select a blood request from the Active Requests board to view its full details.');
    return;
  }

  const allRequests = getStoredRequests();
  const request = allRequests.find(r => String(r.id).trim().toUpperCase() === String(requestId).trim().toUpperCase());

  if (!request) {
    showError('Blood Request Not Found', `We could not find any active blood request with tracking ID "${requestId}". It may have expired or been fulfilled.`);
    return;
  }

  // Populate Details
  showDetails(request);

  function showError(title, msg) {
    if (detailsContainer) detailsContainer.classList.add('d-none');
    if (errorState) {
      errorState.classList.remove('d-none');
      if (errorMessageTitle) errorMessageTitle.textContent = title;
      if (errorMessageText) errorMessageText.textContent = msg;
    }
  }

  function showDetails(req) {
    if (errorState) errorState.classList.add('d-none');
    if (detailsContainer) detailsContainer.classList.remove('d-none');

    // Breadcrumb & Meta
    document.title = `${req.patientName} (${req.bloodGroup}) | Red Hope Details`;
    if (breadcrumbRequestId) breadcrumbRequestId.textContent = `${req.patientName} (${req.id})`;
    if (detailId) detailId.textContent = req.id;
    if (detailPatientName) detailPatientName.textContent = req.patientName;
    if (detailCreatedAt) detailCreatedAt.textContent = formatCreatedTime(req.createdAt);

    // Urgency Badge
    if (detailUrgencyBadge) {
      detailUrgencyBadge.textContent = req.urgency || 'Active';
      detailUrgencyBadge.className = 'urgency-badge fs-6';
      if (req.urgency === 'Urgent') {
        detailUrgencyBadge.classList.add('urgency-urgent');
      } else if (req.urgency === 'Moderate') {
        detailUrgencyBadge.classList.add('urgency-moderate');
      } else {
        detailUrgencyBadge.classList.add('urgency-normal');
      }
    }

    // Grid Info
    if (detailBloodGroup) detailBloodGroup.textContent = req.bloodGroup;
    if (detailUnits) detailUnits.textContent = `${req.unitsRequired} ${req.unitsRequired > 1 ? 'Bags' : 'Bag'}`;
    if (detailAge) detailAge.textContent = `${req.patientAge} Years`;
    if (detailRequiredDate) detailRequiredDate.textContent = formatDate(req.requiredDate);
    if (detailCity) detailCity.textContent = req.city;
    if (detailStatus) detailStatus.textContent = req.status || 'Active Requisition';

    // Hospital & Notes
    if (detailHospital) detailHospital.textContent = req.hospitalName;
    if (detailHospitalLocation) detailHospitalLocation.textContent = `${req.city}, Pakistan`;
    if (detailNotes) {
      detailNotes.textContent = req.additionalInfo || 'No additional case notes provided.';
    }

    // Sidebar & Call Actions
    if (sidebarBloodBadge) sidebarBloodBadge.textContent = req.bloodGroup;
    if (detailContactNumber) detailContactNumber.textContent = req.contactNumber;

    const telLink = `tel:${req.contactNumber}`;
    if (callNowBtn) {
      callNowBtn.setAttribute('href', telLink);
    }

    // Modal data
    if (modalPatientName) modalPatientName.textContent = req.patientName;
    if (modalHospital) modalHospital.textContent = `${req.hospitalName}, ${req.city}`;
    if (modalPhone) modalPhone.textContent = req.contactNumber;
    if (modalCallBtn) modalCallBtn.setAttribute('href', telLink);

    // Copy Phone button functionality
    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(req.contactNumber).then(() => {
          const originalText = copyPhoneBtn.textContent;
          copyPhoneBtn.textContent = 'Copied!';
          copyPhoneBtn.classList.replace('btn-outline-secondary', 'btn-success');
          setTimeout(() => {
            copyPhoneBtn.textContent = originalText;
            copyPhoneBtn.classList.replace('btn-success', 'btn-outline-secondary');
          }, 2000);
        }).catch(() => {
          alert(`Attendant Phone: ${req.contactNumber}`);
        });
      });
    }
  }
});
