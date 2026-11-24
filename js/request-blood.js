/**
 * ==============================================================================
 * RED IT - REQUEST BLOOD JAVASCRIPT
 * Page 1: Form Validation, Unique ID Generator, and LocalStorage Integration
 * Pure Vanilla JavaScript (Zero Frameworks, Zero Libraries)
 * ==============================================================================
 */

// Key used across all three pages for localStorage persistence
const STORAGE_KEY = 'blood_requests_data';

// Default realistic sample requests loaded on first visit if storage is empty
const SAMPLE_INITIAL_REQUESTS = [
  {
    id: "REQ-481920",
    patientName: "Zainab Bibi",
    patientAge: 45,
    bloodGroup: "O-",
    unitsRequired: 3,
    hospitalName: "Mayo Hospital",
    city: "Lahore",
    contactNumber: "03009876543",
    requiredDate: "2026-11-26",
    urgency: "Urgent",
    additionalInfo: "Emergency ICU admission, thalassemia patient requires urgent packed cells.",
    status: "Active",
    createdAt: "2026-11-24T18:30:00.000Z"
  },
  {
    id: "REQ-639104",
    patientName: "Muhammad Usman",
    patientAge: 34,
    bloodGroup: "B+",
    unitsRequired: 2,
    hospitalName: "Aga Khan University Hospital",
    city: "Karachi",
    contactNumber: "03214567890",
    requiredDate: "2026-11-27",
    urgency: "Urgent",
    additionalInfo: "Cardiac surgery scheduled early morning. Attendant waiting at main blood bank.",
    status: "Active",
    createdAt: "2026-11-24T19:15:00.000Z"
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
    createdAt: "2026-11-24T20:00:00.000Z"
  }
];

// Initialize localStorage with sample data if not already present
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_REQUESTS));
  }
}

// Generate a unique request ID (e.g., REQ-749201)
function generateUniqueId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `REQ-${randomNum}`;
}

// Calculate urgency status dynamically based on required date
function calculateUrgency(requiredDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reqDate = new Date(requiredDateStr);
  reqDate.setHours(0, 0, 0, 0);

  const diffTime = reqDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return 'Urgent';
  } else if (diffDays <= 5) {
    return 'Moderate';
  } else {
    return 'Normal';
  }
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Ensure seed data is initialized
  initializeStorage();

  // Mobile menu toggle functionality
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navbarNav = document.getElementById('navbarNav');

  if (mobileMenuToggle && navbarNav) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = navbarNav.classList.toggle('is-open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Get Form & Input Elements
  const form = document.getElementById('bloodRequestForm');
  const patientName = document.getElementById('patientName');
  const patientAge = document.getElementById('patientAge');
  const bloodGroup = document.getElementById('bloodGroup');
  const bloodUnits = document.getElementById('bloodUnits');
  const hospitalName = document.getElementById('hospitalName');
  const city = document.getElementById('city');
  const contactNumber = document.getElementById('contactNumber');
  const requiredDate = document.getElementById('requiredDate');
  const additionalInfo = document.getElementById('additionalInfo');

  const submissionAlert = document.getElementById('submissionAlert');
  const alertGeneratedId = document.getElementById('alertGeneratedId');
  const alertNewRequestBtn = document.getElementById('alertNewRequestBtn');

  // Prevent past dates in HTML5 datepicker: Set min attribute to today's date
  const todayStr = new Date().toISOString().split('T')[0];
  if (requiredDate) {
    requiredDate.setAttribute('min', todayStr);
    // Pre-fill with tomorrow's date for user convenience
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    requiredDate.value = tomorrow.toISOString().split('T')[0];
  }

  // Helper function to set invalid state
  function setInvalid(input, errorElementId, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    const errEl = document.getElementById(errorElementId);
    if (errEl) {
      if (message) errEl.textContent = message;
      errEl.style.display = 'flex';
    }
    return false;
  }

  // Helper function to clear invalid state
  function setValid(input, errorElementId) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    const errEl = document.getElementById(errorElementId);
    if (errEl) {
      errEl.style.display = 'none';
    }
    return true;
  }

  // Individual Field Validators
  function validatePatientName() {
    const val = patientName.value.trim();
    if (!val || val.length < 3) {
      return setInvalid(patientName, 'patientNameError', 'Patient name must be at least 3 letters long.');
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
      return setInvalid(patientName, 'patientNameError', 'Patient name should only contain letters and spaces.');
    }
    return setValid(patientName, 'patientNameError');
  }

  function validatePatientAge() {
    const val = parseInt(patientAge.value, 10);
    if (isNaN(val) || val < 1 || val > 120) {
      return setInvalid(patientAge, 'patientAgeError', 'Please enter a valid age between 1 and 120.');
    }
    return setValid(patientAge, 'patientAgeError');
  }

  function validateBloodGroup() {
    const val = bloodGroup.value.trim();
    const allowed = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!val || !allowed.includes(val)) {
      return setInvalid(bloodGroup, 'bloodGroupError', 'Please select a valid blood group.');
    }
    return setValid(bloodGroup, 'bloodGroupError');
  }

  function validateBloodUnits() {
    const val = parseInt(bloodUnits.value, 10);
    if (isNaN(val) || val < 1 || val > 10) {
      return setInvalid(bloodUnits, 'bloodUnitsError', 'Required units must be between 1 and 10 bags.');
    }
    return setValid(bloodUnits, 'bloodUnitsError');
  }

  function validateHospitalName() {
    const val = hospitalName.value.trim();
    if (!val || val.length < 3) {
      return setInvalid(hospitalName, 'hospitalNameError', 'Please enter a valid hospital or clinic name.');
    }
    return setValid(hospitalName, 'hospitalNameError');
  }

  function validateCity() {
    const val = city.value.trim();
    if (!val) {
      return setInvalid(city, 'cityError', 'Please choose the city where blood is needed.');
    }
    return setValid(city, 'cityError');
  }

  function validateContactNumber() {
    const rawVal = contactNumber.value.trim();
    // Normalize: remove dashes or spaces
    const cleanNum = rawVal.replace(/[\s-]/g, '');

    // Standard phone check: 10 to 12 digits (e.g. 03001234567 or +923001234567)
    const phoneRegex = /^(\+92|92|0)?3[0-9]{9}$/;
    const genericPhoneRegex = /^[0-9]{10,12}$/;

    if (!cleanNum || (!phoneRegex.test(cleanNum) && !genericPhoneRegex.test(cleanNum))) {
      return setInvalid(contactNumber, 'contactNumberError', 'Please enter a valid 11-digit mobile number (e.g. 03001234567).');
    }
    return setValid(contactNumber, 'contactNumberError');
  }

  function validateRequiredDate() {
    const val = requiredDate.value;
    if (!val) {
      return setInvalid(requiredDate, 'requiredDateError', 'Please choose the required date.');
    }

    const selectedDate = new Date(val);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return setInvalid(requiredDate, 'requiredDateError', 'Required date cannot be in the past. Please select today or a future date.');
    }
    return setValid(requiredDate, 'requiredDateError');
  }

  // Attach live validation on input & blur events
  patientName.addEventListener('blur', validatePatientName);
  patientName.addEventListener('input', () => {
    if (patientName.classList.contains('is-invalid')) validatePatientName();
  });

  patientAge.addEventListener('blur', validatePatientAge);
  patientAge.addEventListener('input', () => {
    if (patientAge.classList.contains('is-invalid')) validatePatientAge();
  });

  bloodGroup.addEventListener('change', validateBloodGroup);

  bloodUnits.addEventListener('blur', validateBloodUnits);
  bloodUnits.addEventListener('input', () => {
    if (bloodUnits.classList.contains('is-invalid')) validateBloodUnits();
  });

  hospitalName.addEventListener('blur', validateHospitalName);
  hospitalName.addEventListener('input', () => {
    if (hospitalName.classList.contains('is-invalid')) validateHospitalName();
  });

  city.addEventListener('change', validateCity);

  contactNumber.addEventListener('blur', validateContactNumber);
  contactNumber.addEventListener('input', () => {
    if (contactNumber.classList.contains('is-invalid')) validateContactNumber();
  });

  requiredDate.addEventListener('change', validateRequiredDate);

  // Form Submit Handler
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Run all validations
    const isNameValid = validatePatientName();
    const isAgeValid = validatePatientAge();
    const isGroupValid = validateBloodGroup();
    const isUnitsValid = validateBloodUnits();
    const isHospitalValid = validateHospitalName();
    const isCityValid = validateCity();
    const isPhoneValid = validateContactNumber();
    const isDateValid = validateRequiredDate();

    const isFormValid = isNameValid && isAgeValid && isGroupValid &&
                        isUnitsValid && isHospitalValid && isCityValid &&
                        isPhoneValid && isDateValid;

    if (!isFormValid) {
      // Find the first invalid element and scroll it smoothly into view
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // Build Request Object
    const newId = generateUniqueId();
    const calculatedUrgency = calculateUrgency(requiredDate.value);

    const newRequest = {
      id: newId,
      patientName: patientName.value.trim(),
      patientAge: parseInt(patientAge.value, 10),
      bloodGroup: bloodGroup.value.trim(),
      unitsRequired: parseInt(bloodUnits.value, 10),
      hospitalName: hospitalName.value.trim(),
      city: city.value.trim(),
      contactNumber: contactNumber.value.trim().replace(/[\s-]/g, ''),
      requiredDate: requiredDate.value,
      urgency: calculatedUrgency,
      additionalInfo: additionalInfo.value.trim() || 'No additional notes provided.',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const requests = stored ? JSON.parse(stored) : [];
      // Put the newest request at the beginning of the list
      requests.unshift(newRequest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

      // Display Success Alert
      if (submissionAlert && alertGeneratedId) {
        alertGeneratedId.textContent = newId;
        submissionAlert.style.display = 'block';
        submissionAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Reset form and clear validation classes
      form.reset();
      const allInputs = form.querySelectorAll('.form-control');
      allInputs.forEach(input => {
        input.classList.remove('is-valid');
        input.classList.remove('is-invalid');
      });

      // Reset min date and default date again
      requiredDate.setAttribute('min', todayStr);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      requiredDate.value = tomorrow.toISOString().split('T')[0];

    } catch (err) {
      console.error('Error saving request to localStorage:', err);
      alert('An error occurred while saving your blood request. Please check your browser storage.');
    }
  });

  // Handle "Submit Another Request" button in alert box
  if (alertNewRequestBtn) {
    alertNewRequestBtn.addEventListener('click', () => {
      submissionAlert.style.display = 'none';
      patientName.focus();
    });
  }

  // Handle Form Reset button
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      submissionAlert.style.display = 'none';
      const allInputs = form.querySelectorAll('.form-control');
      allInputs.forEach(input => {
        input.classList.remove('is-valid');
        input.classList.remove('is-invalid');
      });
      const allErrors = form.querySelectorAll('.invalid-feedback');
      allErrors.forEach(err => err.style.display = 'none');
    });
  }
});
