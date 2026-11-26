const initialStories = [
  {
    id: 1,
    title: "10th Donation Milestone at Shifa International",
    author: "Hamza Tariq",
    role: "Regular Donor",
    city: "Islamabad",
    hospital: "Shifa International Hospital, H-8",
    category: "Donor Journey",
    bloodGroup: "B+",
    date: "October 2026",
    photo: "../images/story-hamza.jpg",
    avatarImg: "../images/story-hamza.jpg",
    summary: "What started as a university blood drive turned into a lifelong commitment to donating every four months.",
    fullStory: "Five years ago, Hamza attended his first campus camp in Islamabad feeling nervous about needles. Today, he has completed 10 voluntary whole-blood donations. 'Every donation takes less than 30 minutes of my day, yet it can give someone else decades with their family,' he shares. His consistency has encouraged six of his colleagues in Blue Area to register as regular Red Hope donors."
  },
   {
    id: 2,
    title: "Thalassemia Care Support for Young Zain",
    author: "Sadia & Imran Raza",
    role: "Recipient Family",
    city: "Rawalpindi",
    hospital: "Holy Family Hospital, Rawalpindi",
    category: "Recipient Story",
    bloodGroup: "A+",
    date: "September 2026",
    photo: "../images/story-nadia.png",
    avatarImg: "../images/story-nadia.png",
    summary: "Monthly cross-matched A+ units arranged reliably through Red Hope's recurring donor network.",
    fullStory: "Seven-year-old Zain requires regular transfusions every three weeks. Before discovering Red Hope, his parents spent stressful days calling relatives before every hospital visit. Through Red Hope's matched donor circle in Rawalpindi, four dedicated A+ donors now coordinate turns on rotation so Zain never faces a delay in care."
  },
  {
    id: 3,
    title: "Highway Trauma Response Within 30 Minutes",
    author: "Dr. Farhan Qureshi",
    role: "Emergency Physician",
    city: "Rawalpindi",
    hospital: "Benazir Bhutto Hospital",
    category: "Emergency Save",
    bloodGroup: "AB-",
    date: "September 2026",
    photo: "../images/doctor-alert.jpg",
    avatarImg: "../images/doctor-alert.jpg",
    summary: "Rare AB-Negative platelets and packed red cells sourced rapidly for an accident survivor.",
    fullStory: "AB-Negative is one of the rarest blood types, making emergency trauma cases especially challenging. When a patient arrived from Murree Road needing three units immediately, Red Hope's helpline team alerted registered AB- donors nearby. Two donors arrived within half an hour, stabilizing the patient ahead of orthopedic surgery."
  },
    {
    id: 4,
    title: "From Recipient to Campus Ambassador",
    author: "Mehwish Zahra",
    role: "Student Organizer",
    city: "Islamabad",
    hospital: "Quaid-i-Azam University Camp",
    category: "Donor Journey",
    bloodGroup: "O+",
    date: "August 2026",
    photo: "../images/story-amina.jpg",
    avatarImg: "../images/story-amina.jpg",
    summary: "After her mother needed blood during childbirth complications, Mehwish now leads student drives.",
    fullStory: "Mehwish remembers watching strangers step forward to donate for her mother years ago. Inspired by their kindness, she joined Red Hope as a volunteer coordinator and organized her department's largest single-day camp, collecting 112 units from first-time student donors."
  },
  {
    id: 5,
    title: "Platelet Heroes During Dengue Season",
    author: "Usman Ghani",
    role: "Apheresis Donor",
    city: "Rawalpindi",
    hospital: "AFIT / CMH Rawalpindi",
    category: "Emergency Save",
    bloodGroup: "A-",
    date: "August 2026",
    photo: "../images/volunteer-team.jpg",
    avatarImg: "../images/story-hamza.jpg",
    summary: "Three emergency platelet donations in one season helped three dengue patients recover safely.",
    fullStory: "During peak dengue season in the twin cities, platelet counts can drop rapidly. Usman signed up for Red Hope's urgent platelet alert list and responded to three separate hospital calls. Because platelet donors can donate more frequently than whole-blood donors, his contributions directly helped three families avoid critical complications."
  },
  {
    id: 6,
    title: "A Mother's Gratitude After Postpartum Care",
    author: "Nadia Waqar",
    role: "Recipient",
    city: "Islamabad",
    hospital: "Polyclinic Hospital, G-6",
    category: "Recipient Story",
    bloodGroup: "O-",
    date: "July 2026",
    photo: "../images/blood-camp.jpg",
    avatarImg: "../images/story-nadia.png",
    summary: "Two anonymous O- donors ensured safe delivery and recovery for both mother and newborn.",
    fullStory: "Unexpected bleeding during delivery required an immediate transfusion. Because Polyclinic's stock of O-Negative was depleted that evening, Red Hope volunteers coordinated two verified donors from F-7 and G-6 within 25 minutes. Both mother and baby went home healthy four days later."
  }
];
let storiesList = loadStoredStories();
document.addEventListener("DOMContentLoaded", function () {
  animateStatCounters();
  renderStories(storiesList);
  bindStoryFilters();
  bindShareStoryForm();
});
function loadStoredStories() {
  try {
    const saved = localStorage.getItem("redHopeStories_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
     }
  return [...initialStories];
}
function saveStories() {
  try {
    localStorage.setItem("redHopeStories_v2", JSON.stringify(storiesList));
  } catch (err) {
     }
}
function animateStatCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  counters.forEach(function (counter) {
    const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
    const duration = 900;
    const steps = 30;
    const increment = Math.max(1, Math.ceil(target / steps));
    let current = 0;
    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        counter.textContent = target.toLocaleString() + "+";
        clearInterval(timer);
      } else {
        counter.textContent = current.toLocaleString();
      }
    }, Math.floor(duration / steps));
  });
}
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function renderStories(list) {
  const grid = document.getElementById("storiesGrid");
  const countText = document.getElementById("storyCountText");
  if (!grid) return;
  grid.innerHTML = "";
  if (countText) {
    countText.textContent = `Showing ${list.length} ${list.length === 1 ? "story" : "stories"}`;
  }
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="bg-white border rounded p-5 text-center">
          <h3 class="h4 mb-2">No matching stories found</h3>
          <p class="text-secondary mb-0">Try clearing your filters or searching with a different keyword.</p>
        </div>
      </div>
    `;
    return;
  }
  list.forEach(function (story) {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    const card = document.createElement("article");
    card.className = "card story-card h-100";
    if (story.photo) {
      const cardPhoto = document.createElement("img");
      cardPhoto.src = story.photo;
      cardPhoto.alt = story.title;
      cardPhoto.className = "story-card-photo";
      card.appendChild(cardPhoto);
    }
    const body = document.createElement("div");
    body.className = "card-body d-flex flex-column p-4";
    const topRow = document.createElement("div");
    topRow.className = "d-flex justify-content-between align-items-center gap-2 mb-3";
    const catBadge = document.createElement("span");
    catBadge.className = "badge category-badge px-2 py-1";
    catBadge.textContent = story.category;
    const bloodBadge = document.createElement("span");
    bloodBadge.className = "badge blood-group-badge px-2 py-1";
    bloodBadge.textContent = story.bloodGroup;
    topRow.appendChild(catBadge);
    topRow.appendChild(bloodBadge);
    const title = document.createElement("h3");
    title.className = "h5 mb-2";
    title.textContent = story.title;
    const meta = document.createElement("p");
    meta.className = "small text-secondary mb-3";
    meta.textContent = `${story.hospital} • ${story.date}`;
    const summary = document.createElement("p");
    summary.className = "story-quote mb-4";
    summary.textContent = story.summary;
     const footerRow = document.createElement("div");
    footerRow.className = "d-flex justify-content-between align-items-center gap-2 mt-auto pt-3 border-top";
    const authorWrap = document.createElement("div");
    authorWrap.className = "d-flex align-items-center gap-2";
    let avatar;
    if (story.avatarImg) {
      avatar = document.createElement("img");
      avatar.src = story.avatarImg;
      avatar.alt = story.author;
      avatar.className = "story-avatar-img";
    } else {
      avatar = document.createElement("span");
      avatar.className = "story-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = getInitials(story.author);
    }
    const authorInfo = document.createElement("div");
    const authorName = document.createElement("strong");
    authorName.className = "d-block small";
    authorName.textContent = story.author;
    const authorCity = document.createElement("small");
    authorCity.className = "text-secondary";
    authorCity.textContent = story.city;
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(authorCity);
    authorWrap.appendChild(avatar);
    authorWrap.appendChild(authorInfo);
    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "btn btn-outline-red btn-sm px-3";
    readBtn.textContent = "Read More";
    readBtn.addEventListener("click", function () {
      openStoryModal(story);
    });
     footerRow.appendChild(authorWrap);
    footerRow.appendChild(readBtn);
    body.appendChild(topRow);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(summary);
    body.appendChild(footerRow);
    card.appendChild(body);
    col.appendChild(card);
    grid.appendChild(col);
  });
}
function openStoryModal(story) {
  document.getElementById("storyModalTitle").textContent = story.title;
  document.getElementById("storyModalBlood").textContent = story.bloodGroup;
  document.getElementById("storyModalCategory").textContent = story.category;
  document.getElementById("storyModalMeta").textContent = `${story.hospital} • ${story.date}`;
  document.getElementById("storyModalBody").textContent = story.fullStory;
  document.getElementById("storyModalAuthor").textContent = `${story.author} (${story.role})`;
  document.getElementById("storyModalLocation").textContent = story.city;
  const modalEl = document.getElementById("storyDetailModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}
function applyStoryFilters() {
  const category = document.getElementById("storyCategoryFilter").value;
  const bloodGroup = document.getElementById("storyBloodFilter").value;
  const keyword = document.getElementById("storySearchInput").value.trim().toLowerCase();
  const filtered = storiesList.filter(function (story) {
    const matchesCategory = !category || story.category === category;
    const matchesBlood = !bloodGroup || story.bloodGroup === bloodGroup;
    const matchesKeyword = !keyword ||
      story.title.toLowerCase().includes(keyword) ||
      story.author.toLowerCase().includes(keyword) ||
      story.hospital.toLowerCase().includes(keyword) ||
      story.city.toLowerCase().includes(keyword) ||
      story.summary.toLowerCase().includes(keyword);
    return matchesCategory && matchesBlood && matchesKeyword;
  });
  renderStories(filtered);
}
function bindStoryFilters() {
  const categoryEl = document.getElementById("storyCategoryFilter");
  const bloodEl = document.getElementById("storyBloodFilter");
  const searchEl = document.getElementById("storySearchInput");
  const resetBtn = document.getElementById("storyResetBtn");
  categoryEl.addEventListener("change", applyStoryFilters);
  bloodEl.addEventListener("change", applyStoryFilters);
  searchEl.addEventListener("input", applyStoryFilters);
  resetBtn.addEventListener("click", function () {
    categoryEl.value = "";
    bloodEl.value = "";
    searchEl.value = "";
    renderStories(storiesList);
  });
}
function bindShareStoryForm() {
  const form = document.getElementById("shareStoryForm");
  const alertBox = document.getElementById("storySubmitAlert");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const author = document.getElementById("storyAuthorInput").value.trim();
    const category = document.getElementById("storyRoleSelect").value;
    const bloodGroup = document.getElementById("storyBloodSelect").value;
    const hospital = document.getElementById("storyHospitalInput").value.trim();
    const title = document.getElementById("storyTitleInput").value.trim();
    const fullStory = document.getElementById("storyTextInput").value.trim();
    const summary = fullStory.length > 135 ? fullStory.slice(0, 132) + "..." : fullStory;
    const city = hospital.toLowerCase().includes("rawalpindi") ? "Rawalpindi" : "Islamabad";
     const newStory = {
      id: Date.now(),
      title: title,
      author: author,
      role: category === "Donor Journey" ? "Voluntary Donor" : "Community Member",
      city: city,
      hospital: hospital,
      category: category,
      bloodGroup: bloodGroup,
      date: "November 2026",
      summary: summary,
      fullStory: fullStory
    };
    storiesList.unshift(newStory);
    saveStories();
    applyStoryFilters();
    form.reset();
    form.classList.remove("was-validated");
    alertBox.classList.remove("d-none");
    setTimeout(function () {
      alertBox.classList.add("d-none");
      const modalEl = document.getElementById("shareStoryModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }, 1200);
  });
}