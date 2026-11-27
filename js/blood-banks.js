// ==========================================================================
// Red Hope - Blood Banks Directory Page Script
// Reads the bloodBanks array from directory-data.js, checks open status,
// filters live, and renders blood bank cards.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const bloodBankGrid = document.getElementById("bloodBankGrid");
  const cityFilter = document.getElementById("cityFilter");
  const bankSearchInput = document.getElementById("bankSearchInput");
  const openNowFilter = document.getElementById("openNowFilter");
  const bankFilterForm = document.getElementById("bankFilterForm");
  const resultsCount = document.getElementById("resultsCount");
  const noResultsBox = document.getElementById("noResultsBox");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Guard against missing container or missing data array
  if (!bloodBankGrid || typeof bloodBanks === "undefined") {
    return;
  }

  // Fixed display order for all 8 blood groups
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Map stock levels from directory-data.js to readable labels and CSS classes
  const STOCK_STYLES = {
    high: { label: "High", className: "stock-high" },
    ok: { label: "OK", className: "stock-ok" },
    low: { label: "Low", className: "stock-low" }
  };

  /**
   * Converts a 24-hour "HH:MM" time string into total minutes since midnight.
   */
  function toMinutes(timeString) {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }

  /**
   * Returns true if the current local time falls between openTime and closeTime.
   */
  function isBankOpenNow(bank) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = toMinutes(bank.openTime);
    const closeMinutes = toMinutes(bank.closeTime);

    if (closeMinutes > openMinutes) {
      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    // Handles overnight schedules if a blood bank closes after midnight
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  /**
   * Filters blood banks by city, searched name, and "Open now only" checkbox.
   */
  function applyFilters() {
    const selectedCity = cityFilter ? cityFilter.value : "";
    const searchText = bankSearchInput ? bankSearchInput.value.trim().toLowerCase() : "";
    const onlyOpen = openNowFilter ? openNowFilter.checked : false;

    const filteredBanks = bloodBanks.filter(function (bank) {
      const matchesCity = !selectedCity || bank.city === selectedCity;
      const matchesName = !searchText || bank.name.toLowerCase().includes(searchText);
      const matchesOpen = !onlyOpen || isBankOpenNow(bank);
      return matchesCity && matchesName && matchesOpen;
    });

    showResults(filteredBanks);
  }

  /**
   * Shows matching blood bank cards and count, or displays the empty-state box.
   */
  function showResults(bankList) {
    if (bankList.length === 0) {
      bloodBankGrid.innerHTML = "";
      bloodBankGrid.classList.add("d-none");
      if (resultsCount) {
        resultsCount.classList.add("d-none");
      }
      if (noResultsBox) {
        noResultsBox.classList.remove("d-none");
      }
      return;
    }

    if (noResultsBox) {
      noResultsBox.classList.add("d-none");
    }
    bloodBankGrid.classList.remove("d-none");

    if (resultsCount) {
      const label = bankList.length === 1 ? "blood bank" : "blood banks";
      resultsCount.textContent = `${bankList.length} ${label} found`;
      resultsCount.classList.remove("d-none");
    }

    renderBloodBankCards(bankList);
  }

  /**
   * Builds and appends a Bootstrap card column for each blood bank.
   */
  function renderBloodBankCards(bankList) {
    bloodBankGrid.innerHTML = "";

    bankList.forEach(function (bank) {
      // 1 card per row on mobile (col-12), 2 per row on desktop (col-md-6)
      const col = document.createElement("div");
      col.className = "col-12 col-md-6";

      const card = document.createElement("article");
      card.className = "card bank-card h-100";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body d-flex flex-column p-4";

      // Top row: Bank name + Open now / Closed status badge
      const headerRow = document.createElement("div");
      headerRow.className = "d-flex justify-content-between align-items-start gap-2 mb-2";

      const nameHeading = document.createElement("h3");
      nameHeading.className = "h5 mb-0";
      nameHeading.textContent = bank.name;

      const openNow = isBankOpenNow(bank);
      const statusBadge = document.createElement("span");
      statusBadge.className = openNow ? "badge status-badge status-open" : "badge status-badge status-closed";
      statusBadge.textContent = openNow ? "Open now" : "Closed";

      headerRow.appendChild(nameHeading);
      headerRow.appendChild(statusBadge);

      // Location and operating hours
      const locationText = document.createElement("p");
      locationText.className = "mb-1 text-secondary";
      locationText.textContent = `${bank.area}, ${bank.city}`;

      const hoursText = document.createElement("p");
      hoursText.className = "mb-3 text-secondary";
      hoursText.textContent = `Hours: ${bank.openTime} - ${bank.closeTime}`;

      // Blood stock badges for all 8 blood groups
      const stockHeading = document.createElement("p");
      stockHeading.className = "fw-bold small text-uppercase text-secondary mb-2";
      stockHeading.textContent = "Blood Stock";

      const stockGrid = document.createElement("div");
      stockGrid.className = "d-flex flex-wrap gap-2 mb-4";

      BLOOD_GROUPS.forEach(function (group) {
        const level = bank.stock && bank.stock[group] ? bank.stock[group] : "ok";
        const styleInfo = STOCK_STYLES[level] || STOCK_STYLES.ok;

        const stockBadge = document.createElement("span");
        stockBadge.className = `badge stock-badge ${styleInfo.className}`;
        stockBadge.textContent = `${group}: ${styleInfo.label}`;
        stockGrid.appendChild(stockBadge);
      });

      // Action buttons: Call (tel:) and Directions (Google Maps in new tab)
      const actionsRow = document.createElement("div");
      actionsRow.className = "d-flex flex-wrap gap-2 mt-auto";

      const callLink = document.createElement("a");
      callLink.href = `tel:${bank.phone}`;
      callLink.className = "btn btn-red px-4";
      callLink.textContent = "Call";
      callLink.setAttribute("aria-label", `Call ${bank.name} at ${bank.phone}`);

      const mapQuery = encodeURIComponent(`${bank.name}, ${bank.area}, ${bank.city}`);
      const directionsLink = document.createElement("a");
      directionsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
      directionsLink.target = "_blank";
      directionsLink.rel = "noopener noreferrer";
      directionsLink.className = "btn btn-outline-red px-4";
      directionsLink.textContent = "Directions";
      directionsLink.setAttribute("aria-label", `Directions to ${bank.name} (opens in a new tab)`);

      actionsRow.appendChild(callLink);
      actionsRow.appendChild(directionsLink);

      cardBody.appendChild(headerRow);
      cardBody.appendChild(locationText);
      cardBody.appendChild(hoursText);
      cardBody.appendChild(stockHeading);
      cardBody.appendChild(stockGrid);
      cardBody.appendChild(actionsRow);

      card.appendChild(cardBody);
      col.appendChild(card);
      bloodBankGrid.appendChild(col);
    });
  }

  /**
   * Clears all filters and shows every blood bank again.
   */
  function resetFilters() {
    if (cityFilter) {
      cityFilter.value = "";
    }
    if (bankSearchInput) {
      bankSearchInput.value = "";
    }
    if (openNowFilter) {
      openNowFilter.checked = false;
    }
    showResults(bloodBanks);
  }

  // Live filtering on city selection, search typing, and checkbox toggle
  if (cityFilter) {
    cityFilter.addEventListener("change", applyFilters);
  }
  if (bankSearchInput) {
    bankSearchInput.addEventListener("input", applyFilters);
  }
  if (openNowFilter) {
    openNowFilter.addEventListener("change", applyFilters);
  }
  if (bankFilterForm) {
    bankFilterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });
  }

  // Reset all filters from the empty-state button
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }

  // Render all blood banks on initial page load
  showResults(bloodBanks);
});
