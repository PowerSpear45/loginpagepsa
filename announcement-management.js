let announcements = [
  {
    id: 1,
    title: "Annual Sports Day 2025",
    description: "All Students are informed that Annual Sports Day will be conducted next week.",
    audience: "All Students",
    postedBy: "Admin 1",
    date: "2025-05-21",
    time: "10:30",
    status: "Published"
  },
  {
    id: 2,
    title: "Summer Vacation Notice",
    description: "School will remain closed for summer vacation from next month.",
    audience: "All Students",
    postedBy: "Admin 1",
    date: "2025-05-18",
    time: "09:15",
    status: "Published"
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    description: "PTM is scheduled for next week. Parents are requested to attend.",
    audience: "Parents",
    postedBy: "Admin 2",
    date: "2025-05-15",
    time: "11:45",
    status: "Scheduled"
  },
  {
    id: 4,
    title: "New Academic Session",
    description: "New academic session will begin soon. Students must collect books.",
    audience: "All Students",
    postedBy: "Admin 1",
    date: "2025-05-11",
    time: "16:20",
    status: "Published"
  },
  {
    id: 5,
    title: "Fee Payment Reminder",
    description: "This is a reminder to clear pending fee payments before due date.",
    audience: "Parents",
    postedBy: "Admin 2",
    date: "2025-05-06",
    time: "18:00",
    status: "Draft"
  }
];

let selectedAnnouncementId = null;
let activeCardStatus = "All";

document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("announcementTableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const audienceFilter = document.getElementById("audienceFilter");
  const modal = document.getElementById("announcementModal");
  const viewModal = document.getElementById("viewModal");
  const form = document.getElementById("announcementForm");

  setTodayDate();
  loadAnnouncements();

  document.getElementById("createBtn").addEventListener("click", openAddModal);
  document.getElementById("draftBtn").addEventListener("click", () => filterByCard("Draft"));
  document.getElementById("scheduledBtn").addEventListener("click", () => filterByCard("Scheduled"));

  document.getElementById("publishedCard").addEventListener("click", () => filterByCard("Published"));
  document.getElementById("scheduledCard").addEventListener("click", () => filterByCard("Scheduled"));
  document.getElementById("draftCard").addEventListener("click", () => filterByCard("Draft"));

  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("closeViewModalBtn").addEventListener("click", closeViewModal);

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", function () {
    activeCardStatus = statusFilter.value;
    updateActiveCard();
    applyFilters();
  });
  audienceFilter.addEventListener("change", applyFilters);

  form.addEventListener("submit", saveAnnouncement);

  tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "view") viewAnnouncement(id);
    if (action === "edit") editAnnouncement(id);
    if (action === "delete") deleteAnnouncement(id);
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
    if (event.target === viewModal) closeViewModal();
  });
});

function setTodayDate() {
  const today = new Date();

  document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  document.getElementById("todayDay").textContent =
    today.toLocaleDateString("en-GB", {
      weekday: "long"
    });
}

function loadAnnouncements(data = announcements) {
  const tableBody = document.getElementById("announcementTableBody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:25px;">
          No announcements found
        </td>
      </tr>
    `;
    updateCards();
    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="title-cell">
          <div class="row-icon ${getIconColorClass(item)}">
            <i class="${getAudienceIcon(item)}"></i>
          </div>
          <div>
            <h4>${item.title}</h4>
            <p>${item.description}</p>
          </div>
        </div>
      </td>

      <td>
        <span class="badge ${getAudienceClass(item.audience)}">${item.audience}</span>
      </td>

      <td class="posted-by">${item.postedBy}</td>

      <td>
        <div class="date-text">
          ${formatDate(item.date)}
          <br>
          <span>${formatTime(item.time)}</span>
        </div>
      </td>

      <td>
        <span class="badge ${getStatusClass(item.status)}">${item.status}</span>
      </td>

      <td>
        <div class="action-buttons">
          <button type="button" class="view-btn" data-action="view" data-id="${item.id}">
            <i class="fa-solid fa-eye"></i>
          </button>

          <button type="button" class="edit-btn" data-action="edit" data-id="${item.id}">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button type="button" class="delete-btn" data-action="delete" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateCards();
}

function updateCards() {
  document.getElementById("publishedCount").textContent =
    announcements.filter(item => item.status === "Published").length;

  document.getElementById("scheduledCount").textContent =
    announcements.filter(item => item.status === "Scheduled").length;

  document.getElementById("draftCount").textContent =
    announcements.filter(item => item.status === "Draft").length;
}

function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase().trim();
  const statusValue = document.getElementById("statusFilter").value;
  const audienceValue = document.getElementById("audienceFilter").value;

  const filteredData = announcements.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchValue) ||
      item.description.toLowerCase().includes(searchValue) ||
      item.audience.toLowerCase().includes(searchValue) ||
      item.postedBy.toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "All" || item.status === statusValue;
    const matchesAudience = audienceValue === "All" || item.audience === audienceValue;

    return matchesSearch && matchesStatus && matchesAudience;
  });

  loadAnnouncements(filteredData);
}

function filterByCard(status) {
  const statusFilter = document.getElementById("statusFilter");

  if (activeCardStatus === status) {
    activeCardStatus = "All";
    statusFilter.value = "All";
  } else {
    activeCardStatus = status;
    statusFilter.value = status;
  }

  updateActiveCard();
  applyFilters();
}

function updateActiveCard() {
  document.querySelectorAll(".clickable-card").forEach(card => {
    card.classList.remove("active-card");
  });

  if (activeCardStatus === "Published") {
    document.getElementById("publishedCard").classList.add("active-card");
  }

  if (activeCardStatus === "Scheduled") {
    document.getElementById("scheduledCard").classList.add("active-card");
  }

  if (activeCardStatus === "Draft") {
    document.getElementById("draftCard").classList.add("active-card");
  }
}

function openAddModal() {
  selectedAnnouncementId = null;

  document.getElementById("modalTitle").textContent = "Create Announcement";
  document.getElementById("announcementForm").reset();

  document.getElementById("postedBy").value = "Admin 1";
  document.getElementById("status").value = "Published";
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  document.getElementById("time").value = "09:00";

  document.getElementById("announcementModal").classList.add("show");
}

function closeModal() {
  document.getElementById("announcementModal").classList.remove("show");
}

function saveAnnouncement(event) {
  event.preventDefault();

  const announcementData = {
    id: selectedAnnouncementId || Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    audience: document.getElementById("audience").value,
    postedBy: document.getElementById("postedBy").value.trim(),
    status: document.getElementById("status").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value
  };

  if (selectedAnnouncementId) {
    announcements = announcements.map(item =>
      item.id === selectedAnnouncementId ? announcementData : item
    );
    showToast("Announcement updated successfully");
  } else {
    announcements.push(announcementData);
    showToast("Announcement added successfully");
  }

  closeModal();
  applyFilters();
}

function editAnnouncement(id) {
  const item = announcements.find(a => a.id === id);
  if (!item) return;

  selectedAnnouncementId = id;

  document.getElementById("modalTitle").textContent = "Edit Announcement";
  document.getElementById("title").value = item.title;
  document.getElementById("description").value = item.description;
  document.getElementById("audience").value = item.audience;
  document.getElementById("postedBy").value = item.postedBy;
  document.getElementById("status").value = item.status;
  document.getElementById("date").value = item.date;
  document.getElementById("time").value = item.time;

  document.getElementById("announcementModal").classList.add("show");
}

function deleteAnnouncement(id) {
  if (!confirm("Are you sure you want to delete this announcement?")) return;

  announcements = announcements.filter(item => item.id !== id);
  showToast("Announcement deleted successfully");
  applyFilters();
}

function viewAnnouncement(id) {
  const item = announcements.find(a => a.id === id);
  if (!item) return;

  document.getElementById("viewTitle").textContent = item.title;
  document.getElementById("viewDescription").textContent = item.description;
  document.getElementById("viewAudience").textContent = item.audience;
  document.getElementById("viewPostedBy").textContent = item.postedBy;
  document.getElementById("viewDate").textContent = `${formatDate(item.date)} - ${formatTime(item.time)}`;
  document.getElementById("viewStatus").textContent = item.status;

  document.getElementById("viewModal").classList.add("show");
}

function closeViewModal() {
  document.getElementById("viewModal").classList.remove("show");
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function getAudienceClass(audience) {
  if (audience === "All Students") return "audience-students";
  if (audience === "Parents") return "audience-parents";
  if (audience === "Teachers") return "audience-teachers";
  return "audience-everyone";
}

function getStatusClass(status) {
  if (status === "Published") return "status-published";
  if (status === "Scheduled") return "status-scheduled";
  return "status-draft";
}

function getIconColorClass(item) {
  const title = item.title.toLowerCase();

  if (title.includes("fee")) return "orange";
  if (title.includes("parent")) return "orange";
  if (title.includes("summer") || title.includes("vacation")) return "green";
  if (title.includes("academic")) return "gray";

  return "blue";
}

function getAudienceIcon(item) {
  const title = item.title.toLowerCase();

  if (title.includes("fee")) return "fa-solid fa-hand-holding-dollar";
  if (title.includes("parent")) return "fa-solid fa-users";
  if (title.includes("summer") || title.includes("vacation")) return "fa-solid fa-calendar-days";
  if (title.includes("academic")) return "fa-solid fa-school";

  return "fa-solid fa-bullhorn";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  }).replace(/ /g, "-");
}

function formatTime(timeValue) {
  if (!timeValue) return "-";

  const [hour, minute] = timeValue.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
document.addEventListener("click", function(event) {
  const button = event.target.closest(".view-btn, .edit-btn, .delete-btn");

  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.classList.contains("view-btn")) {
    viewAnnouncement(id);
  }

  if (button.classList.contains("edit-btn")) {
    editAnnouncement(id);
  }

  if (button.classList.contains("delete-btn")) {
    deleteAnnouncement(id);
  }
});