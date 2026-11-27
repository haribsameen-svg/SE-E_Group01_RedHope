// ==========================================================================
// Red Hope - Hospital Directory Page Script
// Reads the hospitals array from directory-data.js, supports live filtering,
// sorting (A-Z / Z-A), and saving favorite hospitals in localStorage.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
  const hospitalList = document.getElementById("hospitalList");
  const hospitalSearchInput = document.getElementById("hospitalSearchInput");
  const emergencyOnlyFilter = document.getElementById("emergencyOnlyFilter");
  const sortOrderFilter = document.getElementById("sortOrderFilter");
  const hospitalFilterForm = document.getElementById("hospitalFilterForm");
  const resultsCount = document.getElementById("resultsCount");
  const noResultsBox = document.getElementById("noResultsBox");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Saved hospitals UI elements
  const savedHospitalsTitle = document.getElementById("savedHospitalsTitle");
  const savedEmptyMessage = document.getElementById("savedEmptyMessage");
  const savedChipsContainer = document.getElementById("savedChipsContainer");

  const STORAGE_KEY = "redHopeSavedHospitals";

  // Guard against missing container or missing data array
  if (!hospitalList || typeof hospitals === "undefined") {
    return;
  }

  /**
   * Safely reads saved hospital IDs from localStorage.
   * Falls back to an empty array if localStorage is missing or contains bad data.
   */
  function loadSavedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      // Keep only IDs that actually match a hospital in our directory
      const validIds = hospitals.map(function (hospital) {
        return hospital.id;
      });
      return parsed.filter(function (id) {
        return validIds.includes(id);
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Saves the array of hospital IDs to localStorage as JSON.
   */
  function persistSavedIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      // Ignore storage write errors (e.g., private browsing quota)
    }
  }

  let savedIds = loadSavedIds();

  /**
   * Adds or removes a hospital ID from savedIds, stores it, and refreshes the UI.
   */
  function toggleSavedHospital(hospitalId) {
    if (savedIds.includes(hospitalId)) {
      savedIds = savedIds.filter(function (id) {
        return id !== hospitalId;
      });
    } else {
      savedIds.push(hospitalId);
    }

    persistSavedIds(savedIds);
    renderSavedHospitals();
    applyFilters();
  }

  /**
   * Creates an inline heart SVG icon (filled red when saved, outline when not).
   */
  function createHeartIcon(isSaved) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", isSaved ? "#E53935" : "none");
    svg.setAttribute("stroke", isSaved ? "#E53935" : "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    );
    svg.appendChild(path);
    return svg;
  }

  /**
   * Updates the "Your saved hospitals (N)" box and its removable chips.
   */
  function renderSavedHospitals() {
    const savedHospitals = hospitals.filter(function (hospital) {
      return savedIds.includes(hospital.id);
    });

    if (savedHospitalsTitle) {
      savedHospitalsTitle.textContent = `Your saved hospitals (${savedHospitals.length})`;
    }

    if (!savedEmptyMessage || !savedChipsContainer) {
      return;
    }

    if (savedHospitals.length === 0) {
      savedEmptyMessage.classList.remove("d-none");
      savedChipsContainer.classList.add("d-none");
      savedChipsContainer.innerHTML = "";
      return;
    }

    savedEmptyMessage.classList.add("d-none");
    savedChipsContainer.classList.remove("d-none");
    savedChipsContainer.innerHTML = "";

    savedHospitals.forEach(function (hospital) {
      const chip = document.createElement("span");
      chip.className = "saved-chip d-inline-flex align-items-center gap-2";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = hospital.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "saved-chip-remove";
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", `Remove ${hospital.name} from saved hospitals`);
      removeBtn.addEventListener("click", function () {
        toggleSavedHospital(hospital.id);
      });

      chip.appendChild(nameSpan);
      chip.appendChild(removeBtn);
      savedChipsContainer.appendChild(chip);
    });
  }

  /**
   * Filters hospitals by search text and 24/7 emergency checkbox, then sorts A-Z or Z-A.
   */
  function applyFilters() {
    const searchText = hospitalSearchInput ? hospitalSearchInput.value.trim().toLowerCase() : "";
    const onlyEmergency = emergencyOnlyFilter ? emergencyOnlyFilter.checked : false;
    const sortOrder = sortOrderFilter ? sortOrderFilter.value : "az";

    const filtered = hospitals.filter(function (hospital) {
      const matchesName = !searchText || hospital.name.toLowerCase().includes(searchText);
      const matchesEmergency = !onlyEmergency || hospital.emergency24x7;
      return matchesName && matchesEmergency;
    });

    // Sort a shallow copy alphabetically (A-Z or Z-A)
    filtered.sort(function (a, b) {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "za" ? -comparison : comparison;
    });

    showResults(filtered);
  }

  /**
   * Shows the filtered hospital rows and count, or displays the empty-state box.
   */
  function showResults(list) {
    if (list.length === 0) {
      hospitalList.innerHTML = "";
      hospitalList.classList.add("d-none");
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
    hospitalList.classList.remove("d-none");

    if (resultsCount) {
      const label = list.length === 1 ? "hospital" : "hospitals";
      resultsCount.textContent = `${list.length} ${label} found`;
      resultsCount.classList.remove("d-none");
    }

    renderHospitalRows(list);
  }

  /**
   * Builds and appends one row per hospital with details, emergency badge, and save heart.
   */
  function renderHospitalRows(list) {
    hospitalList.innerHTML = "";

    list.forEach(function (hospital) {
      const isSaved = savedIds.includes(hospital.id);

      const rowCard = document.createElement("article");
      rowCard.className = "card hospital-row p-3 p-md-4";

      const rowInner = document.createElement("div");
      rowInner.className = "d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3";

      // Left side: hospital name, area, city, phone, and 24/7 badge
      const infoBlock = document.createElement("div");

      const titleLine = document.createElement("div");
      titleLine.className = "d-flex flex-wrap align-items-center gap-2 mb-1";

      const nameHeading = document.createElement("h3");
      nameHeading.className = "h5 mb-0";
      nameHeading.textContent = hospital.name;

      const emergencyBadge = document.createElement("span");
      emergencyBadge.className = hospital.emergency24x7
        ? "badge emergency-badge emergency-yes"
        : "badge emergency-badge emergency-no";
      emergencyBadge.textContent = hospital.emergency24x7 ? "24/7 Emergency" : "Not 24/7";

      titleLine.appendChild(nameHeading);
      titleLine.appendChild(emergencyBadge);

      const detailsLine = document.createElement("p");
      detailsLine.className = "text-secondary mb-1";
      detailsLine.textContent = `${hospital.area}, ${hospital.city}`;

      const phoneLine = document.createElement("p");
      phoneLine.className = "text-secondary mb-0";
      const phoneLabel = document.createTextNode("Phone: ");
      const phoneLink = document.createElement("a");
      phoneLink.href = `tel:${hospital.phone}`;
      phoneLink.className = "hospital-phone-link";
      phoneLink.textContent = hospital.phone;
      phoneLine.appendChild(phoneLabel);
      phoneLine.appendChild(phoneLink);

      infoBlock.appendChild(titleLine);
      infoBlock.appendChild(detailsLine);
      infoBlock.appendChild(phoneLine);

      // Right side: heart button to save or unsave the hospital
      const heartBtn = document.createElement("button");
      heartBtn.type = "button";
      heartBtn.className = isSaved ? "btn heart-btn saved align-self-end align-self-md-center" : "btn heart-btn align-self-end align-self-md-center";
      heartBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
      heartBtn.setAttribute(
        "aria-label",
        isSaved ? `Unsave ${hospital.name}` : `Save ${hospital.name}`
      );
      heartBtn.appendChild(createHeartIcon(isSaved));
      heartBtn.addEventListener("click", function () {
        toggleSavedHospital(hospital.id);
      });

      rowInner.appendChild(infoBlock);
      rowInner.appendChild(heartBtn);
      rowCard.appendChild(rowInner);
      hospitalList.appendChild(rowCard);
    });
  }

  /**
   * Resets search, 24/7 checkbox, and sort order back to defaults.
   */
  function resetFilters() {
    if (hospitalSearchInput) {
      hospitalSearchInput.value = "";
    }
    if (emergencyOnlyFilter) {
      emergencyOnlyFilter.checked = false;
    }
    if (sortOrderFilter) {
      sortOrderFilter.value = "az";
    }
    applyFilters();
  }

  // Live filtering and sorting
  if (hospitalSearchInput) {
    hospitalSearchInput.addEventListener("input", applyFilters);
  }
  if (emergencyOnlyFilter) {
    emergencyOnlyFilter.addEventListener("change", applyFilters);
  }
  if (sortOrderFilter) {
    sortOrderFilter.addEventListener("change", applyFilters);
  }
  if (hospitalFilterForm) {
    hospitalFilterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }

  // Initial render of saved hospitals box and full sorted hospital list
  renderSavedHospitals();
  applyFilters();
});
