/**
 * Red Hope — Homepage Interactivity (Pure Vanilla JavaScript)
 * Handles Donor Eligibility Checker (#eligibilityForm)
 */
(function () {
  "use strict";

  const MIN_AGE = 18;
  const MAX_AGE = 65;
  const MIN_WEIGHT_KG = 50;
  const MIN_DAYS_BETWEEN_DONATIONS = 90;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  function showResult(container, isEligible, title, message) {
    container.classList.remove("d-none", "alert-success", "alert-warning", "alert-danger");
    container.classList.add(isEligible ? "alert-success" : "alert-warning");

    container.innerHTML = "";

    const heading = document.createElement("strong");
    heading.className = "d-block mb-1";
    heading.textContent = title;

    const body = document.createElement("span");
    body.textContent = message;

    container.appendChild(heading);
    container.appendChild(body);
  }

  function showValidationError(container, message) {
    container.classList.remove("d-none", "alert-success", "alert-warning", "alert-danger");
    container.classList.add("alert-danger");
    container.textContent = message;
  }

  function initEligibilityChecker() {
    const form = document.getElementById("eligibilityForm");
    const ageInput = document.getElementById("donorAge");
    const weightInput = document.getElementById("donorWeight");
    const dateInput = document.getElementById("lastDonationDate");
    const neverCheckbox = document.getElementById("neverDonated");
    const resultEl = document.getElementById("eligibilityResult");

    if (!form || !ageInput || !weightInput || !dateInput || !neverCheckbox || !resultEl) {
      return;
    }

    // Set max attribute to today's local date so future dates are discouraged in picker
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.setAttribute("max", yyyy + "-" + mm + "-" + dd);

    function syncDateDisabledState() {
      if (neverCheckbox.checked) {
        dateInput.disabled = true;
        dateInput.required = false;
        dateInput.value = "";
      } else {
        dateInput.disabled = false;
        dateInput.required = true;
      }
    }

    neverCheckbox.addEventListener("change", syncDateDisabledState);
    syncDateDisabledState();

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const ageVal = Number(ageInput.value);
      const weightVal = Number(weightInput.value);
      const hasNeverDonated = neverCheckbox.checked;
      const dateStr = dateInput.value;

      if (!ageInput.value || Number.isNaN(ageVal) || ageVal <= 0) {
        showValidationError(resultEl, "Please enter a valid age in years.");
        ageInput.focus();
        return;
      }

      if (!weightInput.value || Number.isNaN(weightVal) || weightVal <= 0) {
        showValidationError(resultEl, "Please enter a valid body weight in kilograms.");
        weightInput.focus();
        return;
      }

      if (!hasNeverDonated && !dateStr) {
        showValidationError(
          resultEl,
          'Please select your last donation date or check "Never donated before".'
        );
        dateInput.focus();
        return;
      }

      const reasons = [];

      if (ageVal < MIN_AGE || ageVal > MAX_AGE) {
        reasons.push(
          "Donors must be between " + MIN_AGE + " and " + MAX_AGE + " years old (entered: " + ageVal + ")."
        );
      }

      if (weightVal < MIN_WEIGHT_KG) {
        reasons.push(
          "Minimum donor weight is " + MIN_WEIGHT_KG + " kg (entered: " + weightVal + " kg)."
        );
      }

      if (!hasNeverDonated) {
        const parts = dateStr.split("-").map(Number);
        const lastDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (lastDate > todayMidnight) {
          showValidationError(resultEl, "Last donation date cannot be in the future.");
          dateInput.focus();
          return;
        }

        const daysElapsed = Math.floor((todayMidnight - lastDate) / MS_PER_DAY);
        if (daysElapsed < MIN_DAYS_BETWEEN_DONATIONS) {
          const daysRemaining = MIN_DAYS_BETWEEN_DONATIONS - daysElapsed;
          reasons.push(
            "You donated " +
              daysElapsed +
              " day(s) ago. Please wait " +
              daysRemaining +
              " more day(s) to complete the standard 90-day recovery interval."
          );
        }
      }

      if (reasons.length === 0) {
        showResult(
          resultEl,
          true,
          "You are eligible to donate blood!",
          "Based on your age, weight, and donation interval, you meet the primary Red Hope guidelines for Islamabad & Rawalpindi centers. Final hemoglobin and blood pressure screening will be completed on site."
        );
      } else {
        showResult(
          resultEl,
          false,
          "Not currently eligible to donate:",
          reasons.join(" ")
        );
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initEligibilityChecker);
})();
