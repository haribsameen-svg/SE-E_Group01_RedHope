// ==========================================================================
// Red Hope - Find a Donor Page Script
// Reads the donors array from directory-data.js, filters it, and builds cards.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const donorGrid = document.getElementById("donorGrid");
  const bloodGroupFilter = document.getElementById("bloodGroupFilter");
  const cityFilter = document.getElementById("cityFilter");
  const searchBtn = document.getElementById("searchBtn");
  const resetLink = document.getElementById("resetLink");
  const filterForm = document.getElementById("donorFilterForm");
  const resultsCount = document.getElementById("resultsCount");
  const noResultsBox = document.getElementById("noResultsBox");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Guard against missing container or missing data array
  if (!donorGrid || typeof donors === "undefined") {
    return;
  }

  /**
   * Filters donors by the selected blood group and city, then updates the page.
   */
  function applyFilters() {
    const selectedBloodGroup = bloodGroupFilter ? bloodGroupFilter.value : "";
    const selectedCity = cityFilter ? cityFilter.value : "";

    // Keep donors that match both dropdowns (empty value means "All")
    const filteredDonors = donors.filter(function (donor) {
      const matchesBloodGroup = !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
      const matchesCity = !selectedCity || donor.city === selectedCity;
      return matchesBloodGroup && matchesCity;
    });

    showResults(filteredDonors, selectedBloodGroup, selectedCity);
  }

  /**
   * Shows matching donor cards and count, or shows the empty-state message.
   */
  function showResults(donorList, selectedBloodGroup, selectedCity) {
    if (donorList.length === 0) {
      // Hide cards and count when nothing matches
      donorGrid.innerHTML = "";
      donorGrid.classList.add("d-none");
      if (resultsCount) {
        resultsCount.classList.add("d-none");
      }

      // Build a clear "No ... donors found ..." message
      if (noResultsBox && noResultsMessage) {
        const bloodPart = selectedBloodGroup ? ` ${selectedBloodGroup}` : "";
        const cityPart = selectedCity ? ` in ${selectedCity}` : "";
        noResultsMessage.textContent = `No${bloodPart} donors found${cityPart}`;
        noResultsBox.classList.remove("d-none");
      }
      return;
    }

    // Show cards and update the count line above them
    if (noResultsBox) {
      noResultsBox.classList.add("d-none");
    }
    donorGrid.classList.remove("d-none");

    if (resultsCount) {
      const label = donorList.length === 1 ? "donor" : "donors";
      resultsCount.textContent = `${donorList.length} ${label} found`;
      resultsCount.classList.remove("d-none");
    }

    renderDonorCards(donorList, donorGrid);
  }

  /**
   * Resets both dropdowns to "All" and displays every donor again.
   */
  function resetFilters(event) {
    if (event) {
      event.preventDefault();
    }
    if (bloodGroupFilter) {
      bloodGroupFilter.value = "";
    }
    if (cityFilter) {
      cityFilter.value = "";
    }
    showResults(donors, "", "");
  }

  // Run search when the Search button is clicked or form is submitted
  if (searchBtn) {
    searchBtn.addEventListener("click", applyFilters);
  }
  if (filterForm) {
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });
  }

  // Reset filters from both the Reset link and the Reset filters button
  if (resetLink) {
    resetLink.addEventListener("click", resetFilters);
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }

  // Show all donors on initial page load
  showResults(donors, "", "");
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
