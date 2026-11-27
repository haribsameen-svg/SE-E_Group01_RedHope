// ==========================================================================
// Red Hope - Donor Registration Page Script
// Handles form validation, age check, and success modal.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {

  const form        = document.getElementById("donorRegForm");
  const dobInput    = document.getElementById("dob");
  const dobFeedback = document.getElementById("dobFeedback");
  const phoneInput  = document.getElementById("phone");

  // ── 1. Restrict DOB calendar range ───────────────────────────────────────
  const today = new Date();
  dobInput.max = today.toISOString().split("T")[0];

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);
  dobInput.min = minDate.toISOString().split("T")[0];


  // ── 2. Phone auto-format: insert hyphen after 4-digit prefix ─────────────
  phoneInput.addEventListener("input", function () {
    let raw = this.value.replace(/[^\d+]/g, "");
    // Format: 0XXX-XXXXXXX
    if (/^0\d{4,}/.test(raw)) {
      raw = raw.slice(0, 4) + "-" + raw.slice(4, 11);
    }
    this.value = raw;
  });


  // ── 3. Age validator (called before submit) ───────────────────────────────
  function checkAge() {
    if (!dobInput.value) {
      dobInput.setCustomValidity("Please enter your date of birth.");
      dobFeedback.textContent   = "Please enter your date of birth.";
      return false;
    }

    const dob = new Date(dobInput.value);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);

    if (dob > cutoff) {
      dobInput.setCustomValidity("You must be at least 18 years old to donate blood.");
      dobFeedback.textContent   = "You must be at least 18 years old to donate blood.";
      return false;
    }

    // ✅ Clear any previous custom validity so the field passes
    dobInput.setCustomValidity("");
    dobFeedback.textContent = "Please enter your date of birth.";
    return true;
  }

  // Re-run age check whenever the date changes
  dobInput.addEventListener("change", function () {
    checkAge();
    // Reflect validity state immediately after change
    dobInput.classList.toggle("is-invalid", !dobInput.checkValidity());
    dobInput.classList.toggle("is-valid",    dobInput.checkValidity());
  });


  // ── 4. Inline feedback on blur for every field ───────────────────────────
  form.querySelectorAll(".form-control, .form-select, .form-check-input").forEach(function (field) {
    field.addEventListener("blur", function () {
      field.classList.toggle("is-invalid", !field.checkValidity());
      field.classList.toggle("is-valid",    field.checkValidity());
    });

    field.addEventListener("input", function () {
      if (field.classList.contains("is-invalid") && field.checkValidity()) {
        field.classList.replace("is-invalid", "is-valid");
      }
    });
  });


  // ── 5. Submit ─────────────────────────────────────────────────────────────
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Always run the age check first so it sets/clears customValidity
    checkAge();

    // Add Bootstrap's visual validation classes
    form.classList.add("was-validated");

    // Stop if anything is invalid
    if (!form.checkValidity()) {
      const firstBad = form.querySelector(":invalid");
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        firstBad.focus();
      }
      return;
    }

    // ── Collect data ─────────────────────────────────────────────────────
    const data = {
      fullName:    document.getElementById("fullName").value.trim(),
      phone:       document.getElementById("phone").value.trim(),
      email:       document.getElementById("email").value.trim(),
      city:        document.getElementById("city").value,
      bloodGroup:  document.getElementById("bloodGroup").value,
      dob:         document.getElementById("dob").value,
      joiningDate: new Date().toISOString().split("T")[0],
      available:   true
    };

    try {
      localStorage.setItem("rh_registered_donor", JSON.stringify(data));
      localStorage.setItem("rh_donation_logs", JSON.stringify([]));
      localStorage.removeItem("rh_donor_avatar");
    } catch (_) { /* storage unavailable */ }

    console.log("Red Hope — New donor registered:", data);
    // TODO: POST to real API when backend is ready.

    // ── Show success modal ────────────────────────────────────────────────
    const firstName = data.fullName.split(" ")[0];
    document.getElementById("successName").textContent = firstName;

    const modalEl = document.getElementById("successModal");
    const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // ── Reset form once modal closes ──────────────────────────────────────
    modalEl.addEventListener("hidden.bs.modal", function () {
      form.reset();
      form.classList.remove("was-validated");
      form.querySelectorAll(".is-valid, .is-invalid").forEach(function (el) {
        el.classList.remove("is-valid", "is-invalid");
      });
      // Clear any lingering custom validity on dob
      dobInput.setCustomValidity("");
    }, { once: true });

  });

});
