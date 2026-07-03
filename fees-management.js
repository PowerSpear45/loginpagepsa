let feesData = [
  {
    feeId: 1,
    studentName: "Abinash Kumar",
    className: "4",
    section: "B",
    feeType: "Tuition Fee",
    dueDate: "2026-07-15",
    totalAmount: 20000,
    paidAmount: 20000,
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    feeId: 2,
    studentName: "Dhivya.S",
    className: "5",
    section: "B",
    feeType: "Transport Fee",
    dueDate: "2026-07-20",
    totalAmount: 30000,
    paidAmount: 20000,
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    feeId: 3,
    studentName: "Babu.U",
    className: "5",
    section: "B",
    feeType: "Tuition Fee",
    dueDate: "2026-07-25",
    totalAmount: 30000,
    paidAmount: 0,
    photoUrl: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    feeId: 4,
    studentName: "Deepika.K",
    className: "6",
    section: "A",
    feeType: "Exam Fee",
    dueDate: "2026-08-01",
    totalAmount: 35000,
    paidAmount: 35000,
    photoUrl: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    feeId: 5,
    studentName: "Krishna.P",
    className: "6",
    section: "B",
    feeType: "Books Fee",
    dueDate: "2026-08-05",
    totalAmount: 35000,
    paidAmount: 30000,
    photoUrl: "https://randomuser.me/api/portraits/men/75.jpg"
  }
];

let currentPage = 1;
const rowsPerPage = 5;

const tableBody = document.getElementById("feesTableBody");

const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const feeTypeFilter = document.getElementById("feeTypeFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");

const feeModal = document.getElementById("feeModal");
const feeForm = document.getElementById("feeForm");
const modalTitle = document.getElementById("modalTitle");

const viewModal = document.getElementById("viewModal");
const collectModal = document.getElementById("collectModal");
const collectForm = document.getElementById("collectForm");

function formatCurrency(amount) {
  return "Rs. " + Number(amount).toLocaleString("en-IN");
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getStatus(item) {
  const pending = item.totalAmount - item.paidAmount;

  if (pending === 0) return "Paid";
  if (item.paidAmount === 0) return "Pending";
  return "Partial";
}

function getFilteredData() {
  const classValue = classFilter.value;
  const sectionValue = sectionFilter.value;
  const feeTypeValue = feeTypeFilter.value;
  const statusValue = statusFilter.value;
  const searchValue = searchInput.value.toLowerCase();

  return feesData.filter(item => {
    const status = getStatus(item);

    return (
      (classValue === "" || item.className === classValue) &&
      (sectionValue === "" || item.section === sectionValue) &&
      (feeTypeValue === "" || item.feeType === feeTypeValue) &&
      (statusValue === "" || status === statusValue) &&
      item.studentName.toLowerCase().includes(searchValue)
    );
  });
}

function renderFees(data) {
  tableBody.innerHTML = "";

  document.getElementById("recordCount").textContent =
    `Showing ${data.length} of ${feesData.length} Records`;

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding:20px;">
          No fee records found
        </td>
      </tr>
    `;
    updateCards(data);
    return;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  paginatedData.forEach((item, index) => {
    const pendingAmount = item.totalAmount - item.paidAmount;
    const status = getStatus(item);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${start + index + 1}</td>

      <td>
        <img 
          src="${item.photoUrl || 'https://via.placeholder.com/48'}" 
          class="student-photo"
          alt="Student Photo"
        >
      </td>

      <td>${item.studentName}</td>
      <td>${item.className} - ${item.section}</td>
      <td>${item.feeType}</td>
      <td>${formatDate(item.dueDate)}</td>
      <td>${formatCurrency(item.totalAmount)}</td>
      <td>${formatCurrency(item.paidAmount)}</td>
      <td>${formatCurrency(pendingAmount)}</td>

      <td>
        <span class="status ${status.toLowerCase()}" onclick="filterByStatus('${status}')">
          ${status}
        </span>
      </td>

      <td>
        <div class="action-buttons">
          <button class="view-btn" onclick="viewFee(${item.feeId})">View</button>
          <button class="edit-btn" onclick="editFee(${item.feeId})">Edit</button>
          <button class="collect-row-btn" onclick="collectPayment(${item.feeId})">Collect</button>
          <button class="delete-btn" onclick="deleteFee(${item.feeId})">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateCards(data);
}

function updateCards(data) {
  const totalFees = feesData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
  const collectedFees = feesData.reduce((sum, item) => sum + Number(item.paidAmount), 0);
  const pendingFees = totalFees - collectedFees;
  const pendingStudents = feesData.filter(item => getStatus(item) !== "Paid").length;

  document.getElementById("totalFees").textContent = formatCurrency(totalFees);
  document.getElementById("collectedFees").textContent = formatCurrency(collectedFees);
  document.getElementById("pendingFees").textContent = formatCurrency(pendingFees);
  document.getElementById("pendingStudents").textContent = pendingStudents;
}

function loadFilters() {
  const classes = [...new Set(feesData.map(item => item.className))].sort();
  const sections = [...new Set(feesData.map(item => item.section))].sort();

  classFilter.innerHTML = `<option value="">All Classes</option>`;
  sectionFilter.innerHTML = `<option value="">All Sections</option>`;

  classes.forEach(cls => {
    classFilter.innerHTML += `<option value="${cls}">${cls}</option>`;
  });

  sections.forEach(sec => {
    sectionFilter.innerHTML += `<option value="${sec}">${sec}</option>`;
  });
}

function applyFilters() {
  currentPage = 1;
  renderFees(getFilteredData());
}

function filterByStatus(status) {
  statusFilter.value = status;
  applyFilters();
}

function openCollectModal() {
  modalTitle.textContent = "Collect New Fee";
  feeForm.reset();
  document.getElementById("feeId").value = "";
  feeModal.style.display = "flex";
}

function closeFeeModal() {
  feeModal.style.display = "none";
}

function editFee(id) {
  const fee = feesData.find(item => item.feeId === id);
  if (!fee) return;

  modalTitle.textContent = "Edit Fee";
  document.getElementById("feeId").value = fee.feeId;
  document.getElementById("studentName").value = fee.studentName;
  document.getElementById("className").value = fee.className;
  document.getElementById("section").value = fee.section;
  document.getElementById("feeType").value = fee.feeType;
  document.getElementById("dueDate").value = fee.dueDate;
  document.getElementById("totalAmount").value = fee.totalAmount;
  document.getElementById("paidAmount").value = fee.paidAmount;
  document.getElementById("photoUrl").value = fee.photoUrl;

  feeModal.style.display = "flex";
}

function viewFee(id) {
  const fee = feesData.find(item => item.feeId === id);
  if (!fee) return;

  const pendingAmount = fee.totalAmount - fee.paidAmount;
  const status = getStatus(fee);

  document.getElementById("viewFeeDetails").innerHTML = `
    <div class="view-fee-card">
      <img src="${fee.photoUrl}" alt="Student Photo">
      <div>
        <h3>${fee.studentName}</h3>
        <p>Class ${fee.className} - ${fee.section}</p>
      </div>
    </div>

    <div class="fee-detail-grid">
      <div><b>Fee Type:</b><br>${fee.feeType}</div>
      <div><b>Due Date:</b><br>${formatDate(fee.dueDate)}</div>
      <div><b>Total Fee:</b><br>${formatCurrency(fee.totalAmount)}</div>
      <div><b>Paid Amount:</b><br>${formatCurrency(fee.paidAmount)}</div>
      <div><b>Pending Amount:</b><br>${formatCurrency(pendingAmount)}</div>
      <div><b>Status:</b><br>${status}</div>
    </div>
  `;

  viewModal.style.display = "flex";
}

function closeViewModal() {
  viewModal.style.display = "none";
}

function collectPayment(id) {
  const fee = feesData.find(item => item.feeId === id);
  if (!fee) return;

  const pendingAmount = fee.totalAmount - fee.paidAmount;

  if (pendingAmount === 0) {
    alert("This student has already paid full fees.");
    return;
  }

  document.getElementById("collectFeeId").value = fee.feeId;
  document.getElementById("collectStudentName").value = fee.studentName;
  document.getElementById("collectPendingAmount").value = pendingAmount;
  document.getElementById("collectAmount").value = "";
  document.getElementById("paymentDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("paymentMode").value = "";
  document.getElementById("paymentRemarks").value = "";

  collectModal.style.display = "flex";
}

function closeCollectModal() {
  collectModal.style.display = "none";
}

collectForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = Number(document.getElementById("collectFeeId").value);
  const fee = feesData.find(item => item.feeId === id);

  const pendingAmount = fee.totalAmount - fee.paidAmount;
  const collectAmount = Number(document.getElementById("collectAmount").value);

  if (collectAmount <= 0 || collectAmount > pendingAmount) {
    alert("Enter a valid amount.");
    return;
  }

  fee.paidAmount += collectAmount;

  alert("Payment collected successfully.");
  closeCollectModal();
  renderFees(getFilteredData());
});

function deleteFee(id) {
  const confirmDelete = confirm("Are you sure you want to delete this fee record?");

  if (!confirmDelete) return;

  feesData = feesData.filter(item => item.feeId !== id);

  loadFilters();
  renderFees(getFilteredData());
}

feeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = document.getElementById("feeId").value;

  const feeObject = {
    feeId: id ? Number(id) : Date.now(),
    studentName: document.getElementById("studentName").value.trim(),
    className: document.getElementById("className").value.trim(),
    section: document.getElementById("section").value.trim(),
    feeType: document.getElementById("feeType").value,
    dueDate: document.getElementById("dueDate").value,
    totalAmount: Number(document.getElementById("totalAmount").value),
    paidAmount: Number(document.getElementById("paidAmount").value),
    photoUrl: document.getElementById("photoUrl").value.trim()
  };

  if (feeObject.paidAmount > feeObject.totalAmount) {
    alert("Paid amount cannot be greater than total fees.");
    return;
  }

  if (id) {
    const index = feesData.findIndex(item => item.feeId === Number(id));
    feesData[index] = feeObject;
    alert("Fee record updated successfully.");
  } else {
    feesData.push(feeObject);
    alert("Fee record added successfully.");
  }

  closeFeeModal();
  loadFilters();
  renderFees(getFilteredData());
});

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderFees(getFilteredData());
  }
}

function nextPage() {
  const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    renderFees(getFilteredData());
  }
}

function goToPage(page) {
  currentPage = page;
  renderFees(getFilteredData());
}

[classFilter, sectionFilter, feeTypeFilter, statusFilter].forEach(filter => {
  filter.addEventListener("change", applyFilters);
});

searchInput.addEventListener("input", applyFilters);

document.querySelectorAll(".card").forEach((card, index) => {
  card.addEventListener("click", function () {
    if (index === 0) statusFilter.value = "";
    if (index === 1) statusFilter.value = "Paid";
    if (index === 2 || index === 3) statusFilter.value = "Partial";

    applyFilters();
  });
});

document.querySelector(".reminder-btn").addEventListener("click", function () {
  const pendingList = feesData.filter(item => getStatus(item) !== "Paid");

  if (pendingList.length === 0) {
    alert("No pending fees. All students have paid.");
    return;
  }

  alert(`Reminder sent to ${pendingList.length} students/parents.`);
});

function loadTodayDate() {
  const today = new Date();

  document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  document.getElementById("todayDay").textContent =
    today.toLocaleDateString("en-IN", {
      weekday: "long"
    });
}

window.onclick = function (event) {
  if (event.target === feeModal) closeFeeModal();
  if (event.target === viewModal) closeViewModal();
  if (event.target === collectModal) closeCollectModal();
};

loadTodayDate();
loadFilters();
renderFees(feesData);