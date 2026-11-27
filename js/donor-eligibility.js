// ==========================================================================
// Red Hope - Donor Eligibility Page Script
// Evaluates the quick eligibility test modal and shows guidance.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("eligibilityForm");
  const checkBtn = document.getElementById("btnCheckEligibility");
  const proceedBtn = document.getElementById("btnProceedRegister");
  const resultBox = document.getElementById("eligibilityResult");
  const modalEl = document.getElementById("eligibilityModal");

  if (!form || !checkBtn || !resultBox) {
    return;
  }

  const questionNames = ["qAge", "qWeight", "qHealth", "qInterval", "qRecent"];

  checkBtn.addEventListener("click", function () {
    const answers = questionNames.map(function (name) {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : null;
    });

    if (answers.includes(null)) {
      resultBox.className = "alert alert-warning mb-0 mt-3";
      resultBox.innerHTML =
        '<i class="bi bi-exclamation-triangle-fill me-2"></i>Please answer all 5 questions first.';
      proceedBtn.classList.add("d-none");
      return;
    }

    const allYes = answers.every(function (val) { return val === "yes"; });

    if (allYes) {
      resultBox.className = "alert alert-success mb-0 mt-3";
      resultBox.innerHTML =
        '<i class="bi bi-check-circle-fill me-2"></i><strong>You look eligible to donate!</strong> Please confirm with our team at the donation center.';
      proceedBtn.classList.remove("d-none");
    } else {
      resultBox.className = "alert alert-danger mb-0 mt-3";
      resultBox.innerHTML =
        '<i class="bi bi-x-circle-fill me-2"></i><strong>You may not be eligible right now.</strong> If you are unsure, always confirm with a doctor or call <strong>051-1234567</strong>.';
      proceedBtn.classList.add("d-none");
    }
  });

  modalEl.addEventListener("hidden.bs.modal", function () {
    form.reset();
    resultBox.className = "alert d-none mb-0 mt-3";
    resultBox.textContent = "";
    proceedBtn.classList.add("d-none");
  });
});
