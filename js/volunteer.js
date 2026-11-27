const initialVolunteers = [
  {
    id: "RH-VOL-2026-1042",
    name: "Saad Mahmood",
    city: "Islamabad",
    area: "F-10",
    role: "Camp Operations Assistant",
    availability: ["Weekends"]
  },
  {
    id: "RH-VOL-2026-1087",
    name: "Hira Naveed",
    city: "Rawalpindi",
    area: "Chaklala Scheme III",
    role: "Registration & Data Entry Assistant",
    availability: ["Weekdays", "Emergency On-Call"]
  },
  {
    id: "RH-VOL-2026-1115",
    name: "Daniyal Akhtar",
    city: "Islamabad",
    area: "H-12",
    role: "Community Outreach Worker",
    availability: ["Weekdays", "Weekends"]
  }
];
let volunteers = loadVolunteers();
document.addEventListener("DOMContentLoaded", function () {
  renderVolunteerRoster();
  bindRoleCards();
  bindVolunteerForm();
});
function loadVolunteers() {
  try {
    const saved = localStorage.getItem("redHopeVolunteers");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
            }
    }
  } catch (err) {
    // Fallback to initial roster
  }
  return [...initialVolunteers];
}
function saveVolunteers() {
  try {
    localStorage.setItem("redHopeVolunteers", JSON.stringify(volunteers));
  } catch (err) {
    // Ignore storage errors
  }
}
function renderVolunteerRoster() {
  const listContainer = document.getElementById("recentVolunteersList");
  const countBadge = document.getElementById("volunteerCountBadge");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  if (countBadge) {
    countBadge.textContent = volunteers.length;
  }
  volunteers.slice(0, 6).forEach(function (vol) {
    const item = document.createElement("div");
    item.className = "volunteer-chip";
    const nameEl = document.createElement("strong");
    nameEl.className = "d-block";
    nameEl.textContent = vol.name;
    const roleEl = document.createElement("span");
    roleEl.className = "d-block small text-danger fw-bold";
    roleEl.textContent = vol.role;
    const metaEl = document.createElement("small");
    metaEl.className = "text-secondary";
    metaEl.textContent = `${vol.area}, ${vol.city} • ${vol.availability.join(", ")}`;
    item.appendChild(nameEl);
    item.appendChild(roleEl);
    item.appendChild(metaEl);
    listContainer.appendChild(item);
      });
}
function bindRoleCards() {
  const roleCards = document.querySelectorAll(".role-card[data-role]");
  const roleSelect = document.getElementById("volRole");
  if (!roleSelect) return;
  roleCards.forEach(function (card) {
    function selectRole() {
      const chosenRole = card.getAttribute("data-role");
      roleSelect.value = chosenRole;
      roleSelect.focus();
      roleSelect.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    card.addEventListener("click", selectRole);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectRole();
      }
    });
  });
}
function getSelectedAvailability() {
  const checks = document.querySelectorAll(".availability-check:checked");
  return Array.from(checks).map(function (cb) {
    return cb.value;
  });
}
function bindVolunteerForm() {
  const form = document.getElementById("volunteerForm");
  const availabilityError = document.getElementById("availabilityError");
  const confirmationBox = document.getElementById("volunteerConfirmation");
  const confirmationMessage = document.getElementById("confirmationMessage");
  const formWrapper = document.getElementById("volunteerFormWrapper");
  const registerAnotherBtn = document.getElementById("registerAnotherBtn");
  const resetBtn = document.getElementById("volResetBtn");
  if (!form) return;
  document.querySelectorAll(".availability-check").forEach(function (cb) {
    cb.addEventListener("change", function () {
      if (getSelectedAvailability().length > 0) {
        availabilityError.classList.add("d-none");
      }
    });
  });
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.classList.remove("was-validated");
      availabilityError.classList.add("d-none");
    });
  }
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener("click", function () {
      confirmationBox.classList.add("d-none");
      formWrapper.classList.remove("d-none");
      form.reset();
      form.classList.remove("was-validated");
      availabilityError.classList.add("d-none");
    });
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const availability = getSelectedAvailability();
    const hasAvailability = availability.length > 0;
    availabilityError.classList.toggle("d-none", hasAvailability);
    if (!form.checkValidity() || !hasAvailability) {
      form.classList.add("was-validated");
      return;
    }
    const name = document.getElementById("volName").value.trim();
    const city = document.getElementById("volCity").value;
    const area = document.getElementById("volArea").value.trim();
    const role = document.getElementById("volRole").value;
    const regId = "RH-VOL-2026-" + Math.floor(1000 + Math.random() * 9000);
    const newVolunteer = {
      id: regId,
      name: name,
      city: city,
      area: area,
      role: role,
      availability: availability
    };
    volunteers.unshift(newVolunteer);
    saveVolunteers();
    renderVolunteerRoster();
    confirmationMessage.textContent = "";
    confirmationMessage.appendChild(
      document.createTextNode(
        `Thank you, ${name}! Your registration for ${role} in ${area}, ${city} has been received.`
      )
    );
    confirmationMessage.appendChild(document.createElement("br"));
    confirmationMessage.appendChild(document.createTextNode("Your Volunteer ID is "));
    const codeEl = document.createElement("code");
    codeEl.textContent = regId;
    confirmationMessage.appendChild(codeEl);
    confirmationMessage.appendChild(document.createTextNode("."));
    formWrapper.classList.add("d-none");
     confirmationBox.classList.remove("d-none");
    confirmationBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}