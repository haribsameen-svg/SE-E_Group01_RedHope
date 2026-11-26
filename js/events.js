const initialCampaigns = [
  {
    id: 1,
    date: "05 DEC, 2026",
    title: "Winter Life-Savers Mega Camp",
    description: "Every unit donated during winter helps hospitals maintain safe reserves for emergency surgeries and thalassemia patients.",
    time: "10:00 AM - 04:00 PM",
    location: "F-9 Fatima Jinnah Park, Islamabad",
    city: "Islamabad",
    status: "Upcoming",
    slotsLeft: 28,
    focusGroup: "All Blood Groups",
    image: "../images/volunteer-team.jpg"
  },
  {
    id: 2,
    date: "12 DEC, 2026",
    title: "O- Blood Donors Needed",
    description: "O-Negative red blood cells are universal and vital for trauma wards. Walk-in screening and refreshments provided for all donors.",
    time: "09:30 AM - 03:30 PM",
    location: "Rawalpindi Arts Council, Murree Road",
    city: "Rawalpindi",
    status: "Urgent Drive",
    slotsLeft: 14,
    focusGroup: "O- & O+ Priority",
    image: "../images/doctor-alert.jpg"
  },
  {
    id: 3,
    date: "19 DEC, 2026",
    title: "You Are Somebody's Type",
    description: "Campus-wide voluntary blood drive bringing students and faculty together to encourage first-time donors.",
    time: "10:00 AM - 03:00 PM",
    location: "NUST H-12 Main Auditorium, Islamabad",
    city: "Islamabad",
    status: "Upcoming",
    slotsLeft: 35,
    focusGroup: "First-Time Donors Welcome",
    image: "../images/blood-camp.jpg"
  },
  {
    id: 4,
    date: "26 DEC, 2026",
    title: "Donation - Feel Real Peace",
    description: "A single 15-minute donation can save up to three lives. Registered medical staff will conduct quick hemoglobin screening on site.",
    time: "10:00 AM - 04:00 PM",
    location: "Bahria Town Phase 4 Civic Center, Rawalpindi",
    city: "Rawalpindi",
    status: "Upcoming",
    slotsLeft: 22,
    focusGroup: "Whole Blood & Platelets",
    image: "../images/camp-donor-chair.svg"
  },
  {
    id: 5,
    date: "14 NOV, 2026",
    title: "Twin Cities Youth Blood Drive",
    description: "Over 130 voluntary donors stepped forward at our autumn university drive, supporting three public blood banks.",
    time: "09:00 AM - 03:00 PM",
    location: "COMSATS University Park Road, Islamabad",
    city: "Islamabad",
    status: "Completed",
    slotsLeft: 0,
    focusGroup: "134 Units Collected",
    image: "../images/camp-campus-drive.svg"
  },
  {
        id: 6,
    date: "02 NOV, 2026",
    title: "Saddar Community Platelet Camp",
    description: "Special awareness and platelet screening camp organized with local physicians to support dengue recovery wards.",
    time: "10:00 AM - 03:30 PM",
    location: "Saddar Bank Road Medical Plaza, Rawalpindi",
    city: "Rawalpindi",
    status: "Completed",
    slotsLeft: 0,
    focusGroup: "89 Units Collected",
    image: "../images/camp-screening.svg"
  }
];
let campaigns = loadCampaigns();
let selectedCampaignId = null;
document.addEventListener("DOMContentLoaded", function () {
  renderCampaigns(campaigns);
  bindEventFilters();
  bindSlotBookingForm();
});
function loadCampaigns() {
  try {
    const saved = localStorage.getItem("redHopeCampaigns_v3");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
     }
  return initialCampaigns.map(function (c) { return { ...c }; });
}
function saveCampaigns() {
  try {
    localStorage.setItem("redHopeCampaigns_v3", JSON.stringify(campaigns));
  } catch (err) {
     }
}
function getStatusBadgeClass(status) {
  if (status === "Urgent Drive") return "status-badge-urgent";
  if (status === "Completed") return "status-badge-completed";
  return "status-badge-upcoming";
}
function renderCampaigns(list) {
  const grid = document.getElementById("eventsGrid");
  const countText = document.getElementById("eventCountText");
  if (!grid) return;
  grid.innerHTML = "";
  if (countText) {
    countText.textContent = `Showing ${list.length} ${list.length === 1 ? "campaign" : "campaigns"}`;
  }
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="bg-white border rounded p-5 text-center">
          <h3 class="h4 mb-2">No campaigns match your filter</h3>
          <p class="text-secondary mb-0">Try selecting All Cities or resetting your search.</p>
        </div>
      </div>
    `;
    return;
  }
   list.forEach(function (camp) {
    const col = document.createElement("div");
    col.className = "col-12 col-lg-6";
    const card = document.createElement("article");
    card.className = "campaign-card h-100";
    const row = document.createElement("div");
    row.className = "row g-0 h-100";
     const leftCol = document.createElement("div");
    leftCol.className = "col-12 col-sm-5";
    leftCol.innerHTML = `
      <div class="campaign-thumb">
        <span class="badge bg-dark campaign-city-tag fw-bold">${camp.city}</span>
        <img src="${camp.image}" alt="${camp.title}" class="campaign-img">
      </div>
    `;
     const rightCol = document.createElement("div");
    rightCol.className = "col-12 col-sm-7 p-4 d-flex flex-column";
    const badgeRow = document.createElement("div");
    badgeRow.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2";
    const dateBadge = document.createElement("span");
    dateBadge.className = "campaign-date-badge";
    dateBadge.textContent = camp.date;
    const statusBadge = document.createElement("span");
    statusBadge.className = `badge px-2 py-1 ${getStatusBadgeClass(camp.status)}`;
    statusBadge.textContent = camp.status;
    badgeRow.appendChild(dateBadge);
    badgeRow.appendChild(statusBadge);
    const title = document.createElement("h3");
    title.className = "campaign-title mt-1 mb-2";
    title.textContent = camp.title;
    const desc = document.createElement("p");
    desc.className = "text-secondary small mb-3";
    desc.textContent = camp.description;
    const meta = document.createElement("div");
    meta.className = "campaign-meta mt-auto";
    meta.innerHTML = `
      <div class="d-flex flex-wrap gap-3 mb-3">
        <span>&#128339; ${camp.time}</span>
        <span>&#128205; ${camp.location}</span>
      </div>
    `;
    const actionRow = document.createElement("div");
    actionRow.className = "d-flex justify-content-between align-items-center gap-2";
    const slotsText = document.createElement("small");
    slotsText.className = camp.status === "Completed" ? "text-secondary fw-bold" : "text-dark fw-bold";
    slotsText.textContent = camp.status === "Completed"
      ? "Camp Completed"
      : `${camp.slotsLeft} donor slots left`;
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    if (camp.status === "Completed" || camp.slotsLeft <= 0) {
      actionBtn.className = "btn btn-outline-secondary btn-sm px-3";
      actionBtn.textContent = "Closed";
      actionBtn.disabled = true;
    } else {
      actionBtn.className = "btn btn-red btn-sm px-3";
      actionBtn.textContent = "Book Slot";
      actionBtn.addEventListener("click", function () {
        openBookingModal(camp);
      });
    }
    actionRow.appendChild(slotsText);
    actionRow.appendChild(actionBtn);
    meta.appendChild(actionRow);
    rightCol.appendChild(badgeRow);
    rightCol.appendChild(title);
    rightCol.appendChild(desc);
    rightCol.appendChild(meta);
    row.appendChild(leftCol);
    row.appendChild(rightCol);
    card.appendChild(row);
    col.appendChild(card);
    grid.appendChild(col);
  });
}
function openBookingModal(camp) {
  selectedCampaignId = camp.id;
  document.getElementById("modalEventName").textContent = camp.title;
  document.getElementById("modalEventMeta").textContent = `${camp.date} • ${camp.time} • ${camp.location}`;
  const successBox = document.getElementById("slotBookingSuccess");
  const fieldsBox = document.getElementById("slotFormFields");
  const confirmBtn = document.getElementById("confirmSlotBtn");
  const form = document.getElementById("bookSlotForm");
  successBox.classList.add("d-none");
  fieldsBox.classList.remove("d-none");
  confirmBtn.classList.remove("d-none");
  form.reset();
  form.classList.remove("was-validated");
  const modalEl = document.getElementById("bookSlotModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}
function applyEventFilters() {
  const city = document.getElementById("eventCityFilter").value;
  const status = document.getElementById("eventStatusFilter").value;
  const keyword = document.getElementById("eventSearchInput").value.trim().toLowerCase();
  const filtered = campaigns.filter(function (camp) {
    const matchesCity = !city || camp.city === city;
    const matchesStatus = !status || camp.status === status;
    const matchesKeyword = !keyword ||
      camp.title.toLowerCase().includes(keyword) ||
      camp.location.toLowerCase().includes(keyword) ||
      camp.description.toLowerCase().includes(keyword);
    return matchesCity && matchesStatus && matchesKeyword;
  });
  renderCampaigns(filtered);
}
function bindEventFilters() {
  const cityEl = document.getElementById("eventCityFilter");
  const statusEl = document.getElementById("eventStatusFilter");
  const searchEl = document.getElementById("eventSearchInput");
  const resetBtn = document.getElementById("eventResetBtn");
  cityEl.addEventListener("change", applyEventFilters);
  statusEl.addEventListener("change", applyEventFilters);
  searchEl.addEventListener("input", applyEventFilters);
  resetBtn.addEventListener("click", function () {
    cityEl.value = "";
    statusEl.value = "";
    searchEl.value = "";
    renderCampaigns(campaigns);
  });
}
function bindSlotBookingForm() {
  const form = document.getElementById("bookSlotForm");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
      const donorName = document.getElementById("slotDonorName").value.trim();
    const bloodGroup = document.getElementById("slotBloodGroup").value;
    const timeWindow = document.getElementById("slotTimeWindow").value;
    const refCode = "RH-CAMP-" + Math.floor(1000 + Math.random() * 9000);
    const campIndex = campaigns.findIndex(function (c) { return c.id === selectedCampaignId; });
    if (campIndex !== -1 && campaigns[campIndex].slotsLeft > 0) {
      campaigns[campIndex].slotsLeft -= 1;
      saveCampaigns();
      applyEventFilters();
    }
    const successBox = document.getElementById("slotBookingSuccess");
    successBox.textContent = "";
    const titleEl = document.createElement("strong");
    titleEl.textContent = "Slot Confirmed! ";
    const refLabel = document.createTextNode("Reference ID: ");
    const codeEl = document.createElement("code");
    codeEl.textContent = refCode;
    const br = document.createElement("br");
    const msgEl = document.createTextNode(
      `Thank you, ${donorName} (${bloodGroup}). Your slot for ${timeWindow} is reserved. Please bring a valid CNIC.`
    );
    successBox.appendChild(titleEl);
    successBox.appendChild(refLabel);
    successBox.appendChild(codeEl);
    successBox.appendChild(br);
    successBox.appendChild(msgEl);
    successBox.classList.remove("d-none");
    document.getElementById("slotFormFields").classList.add("d-none");
    document.getElementById("confirmSlotBtn").classList.add("d-none");
  });
}
