// ==========================================================================
// Red Hope - Find a Donor Page Script
// Reads the donors array from directory-data.js and builds the donor cards.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const donorGrid = document.getElementById("donorGrid");

  // Guard against missing container or missing data array
  if (!donorGrid || typeof donors === "undefined") {
    return;
  }

  renderDonorCards(donors, donorGrid);
});

/**
 * Formats a "YYYY-MM-DD" date string into "Month YYYY" (e.g. "August 2026").
 */
function formatMonthYear(dateString) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parts = dateString.split("-");
  if (parts.length < 2) {
    return dateString;
  }

  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const monthName = months[monthIndex] || "";

  return monthName ? `${monthName} ${year}` : year;
}

/**
 * Builds and appends a Bootstrap card column for each donor object.
 */
function renderDonorCards(donorList, container) {
  container.innerHTML = "";

  donorList.forEach(function (donor) {
    // 1 card per row on mobile (col-12), 3 per row on desktop (col-lg-4)
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "card donor-card h-100";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column p-4";

    // Top row: Donor name + red blood group badge
    const headerRow = document.createElement("div");
    headerRow.className = "d-flex justify-content-between align-items-start gap-2 mb-3";

    const nameHeading = document.createElement("h3");
    nameHeading.className = "h5 mb-0";
    nameHeading.textContent = donor.name;

    const bloodBadge = document.createElement("span");
    bloodBadge.className = "badge blood-group-badge px-2 py-1";
    bloodBadge.textContent = donor.bloodGroup;

    headerRow.appendChild(nameHeading);
    headerRow.appendChild(bloodBadge);

    // Donor city and last donation details
    const cityText = document.createElement("p");
    cityText.className = "mb-1 text-secondary";
    cityText.textContent = `City: ${donor.city}`;

    const donationText = document.createElement("p");
    donationText.className = "mb-4 text-secondary";
    donationText.textContent = `Last Donation: ${formatMonthYear(donor.lastDonation)}`;

    // Red Contact button (popup logic will be added in the next session)
    const contactBtn = document.createElement("button");
    contactBtn.type = "button";
    contactBtn.className = "btn btn-red mt-auto align-self-start px-4";
    contactBtn.textContent = "Contact";

    cardBody.appendChild(headerRow);
    cardBody.appendChild(cityText);
    cardBody.appendChild(donationText);
    cardBody.appendChild(contactBtn);
    card.appendChild(cardBody);
    col.appendChild(card);

    container.appendChild(col);
  });
}
