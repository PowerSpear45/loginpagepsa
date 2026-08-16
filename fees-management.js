const API_URL = "https://loginpagepsabackend.onrender.com/api/fees";

let feesData = [];
let currentPage = 1;
const rowsPerPage = 5;

// =============================
// DOM ELEMENTS
// =============================

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


// =============================
// FORMAT CURRENCY
// =============================

function formatCurrency(amount) {
    return "Rs. " + Number(amount || 0).toLocaleString("en-IN");
}


// =============================
// FORMAT DATE
// =============================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    return new Date(dateValue + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// =============================
// GET PENDING AMOUNT
// =============================

function getPendingAmount(item) {

    if (item.pendingAmount !== undefined && item.pendingAmount !== null) {
        return Number(item.pendingAmount);
    }

    const total = Number(item.totalAmount || 0);
    const paid = Number(item.paidAmount || 0);

    return total - paid;
}


// =============================
// GET STATUS
// =============================

function getStatus(item) {

    if (item.status) {
        return item.status;
    }

    const total = Number(item.totalAmount || 0);
    const paid = Number(item.paidAmount || 0);

    if (paid <= 0) {
        return "Pending";
    }

    if (paid >= total) {
        return "Paid";
    }

    return "Partial";
}


// =============================
// FILTER DATA
// =============================

function getFilteredData() {

    const classValue = classFilter.value;
    const sectionValue = sectionFilter.value;
    const feeTypeValue = feeTypeFilter.value;
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();

    return feesData.filter(item => {

        const status = getStatus(item);

        const studentName =
            (item.studentName || "").toLowerCase();

        return (
            (classValue === "" || item.className === classValue) &&
            (sectionValue === "" || item.section === sectionValue) &&
            (feeTypeValue === "" || item.feeType === feeTypeValue) &&
            (statusValue === "" || status === statusValue) &&
            studentName.includes(searchValue)
        );
    });
}


// =============================
// RENDER FEES TABLE
// =============================

function renderFees(data) {

    tableBody.innerHTML = "";

    document.getElementById("recordCount").textContent =
        `Showing ${data.length} of ${feesData.length} Records`;

    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11"
                    style="text-align:center; padding:20px;">
                    No fee records found
                </td>
            </tr>
        `;

        updateCards();

        return;
    }

    const totalPages = Math.ceil(data.length / rowsPerPage);

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * rowsPerPage;

    const paginatedData =
        data.slice(start, start + rowsPerPage);

    paginatedData.forEach((item, index) => {

        const pendingAmount = getPendingAmount(item);
        const status = getStatus(item);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${start + index + 1}</td>

            <td>
                <div class="student-photo-placeholder">
                    <i class="fa-solid fa-user"></i>
                </div>
            </td>

            <td>${item.studentName || "-"}</td>

            <td>
                ${item.className || "-"} - ${item.section || "-"}
            </td>

            <td>${item.feeType || "-"}</td>

            <td>${formatDate(item.dueDate)}</td>

            <td>${formatCurrency(item.totalAmount)}</td>

            <td>${formatCurrency(item.paidAmount)}</td>

            <td>${formatCurrency(pendingAmount)}</td>

            <td>
                <span
                    class="status ${status.toLowerCase()}"
                    onclick="filterByStatus('${status}')">
                    ${status}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        class="view-btn"
                        onclick="viewFee(${item.feeId})">
                        View
                    </button>

                    <button
                        class="edit-btn"
                        onclick="editFee(${item.feeId})">
                        Edit
                    </button>

                    <button
                        class="collect-row-btn"
                        onclick="collectPayment(${item.feeId})">
                        Collect
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteFee(${item.feeId})">
                        Delete
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    updateCards();
}


// =============================
// UPDATE DASHBOARD CARDS
// =============================

function updateCards() {

    const totalFees = feesData.reduce(
        (sum, item) =>
            sum + Number(item.totalAmount || 0),
        0
    );

    const collectedFees = feesData.reduce(
        (sum, item) =>
            sum + Number(item.paidAmount || 0),
        0
    );

    const pendingFees = feesData.reduce(
        (sum, item) =>
            sum + getPendingAmount(item),
        0
    );

    const pendingStudents = feesData.filter(
        item => getStatus(item) !== "Paid"
    ).length;

    document.getElementById("totalFees").textContent =
        formatCurrency(totalFees);

    document.getElementById("collectedFees").textContent =
        formatCurrency(collectedFees);

    document.getElementById("pendingFees").textContent =
        formatCurrency(pendingFees);

    document.getElementById("pendingStudents").textContent =
        pendingStudents;
}


// =============================
// LOAD FILTERS
// =============================

function loadFilters() {

    const classes = [
        ...new Set(
            feesData
                .map(item => item.className)
                .filter(Boolean)
        )
    ].sort();

    const sections = [
        ...new Set(
            feesData
                .map(item => item.section)
                .filter(Boolean)
        )
    ].sort();

    classFilter.innerHTML =
        `<option value="">All Classes</option>`;

    sectionFilter.innerHTML =
        `<option value="">All Sections</option>`;

    classes.forEach(cls => {

        classFilter.innerHTML += `
            <option value="${cls}">
                ${cls}
            </option>
        `;
    });

    sections.forEach(sec => {

        sectionFilter.innerHTML += `
            <option value="${sec}">
                ${sec}
            </option>
        `;
    });
}


// =============================
// APPLY FILTERS
// =============================

function applyFilters() {

    currentPage = 1;

    renderFees(getFilteredData());
}


// =============================
// FILTER BY STATUS
// =============================

function filterByStatus(status) {

    statusFilter.value = status;

    applyFilters();
}


// =============================
// OPEN ADD FEE MODAL
// =============================

function openCollectModal() {

    modalTitle.textContent = "Collect New Fee";

    feeForm.reset();

    document.getElementById("feeId").value = "";

    // Enable fields for new fee
    document.getElementById("section").disabled = false;
    document.getElementById("studentName").disabled = false;

    feeModal.style.display = "flex";
}


// =============================
// CLOSE ADD/EDIT FEE MODAL
// =============================

function closeFeeModal() {

    feeModal.style.display = "none";
}


// =============================
// EDIT FEE
// =============================

function editFee(id) {

    const fee = feesData.find(
        item => item.feeId === id
    );

    if (!fee) {
        return;
    }

    modalTitle.textContent = "Edit Fee";

    document.getElementById("feeId").value =
        fee.feeId;

    document.getElementById("studentName").value =
        fee.studentName || "";

    document.getElementById("className").value =
        fee.className || "";

    document.getElementById("section").value =
        fee.section || "";

    document.getElementById("feeType").value =
        fee.feeType || "";

    document.getElementById("dueDate").value =
        fee.dueDate || "";

    document.getElementById("totalAmount").value =
        fee.totalAmount ?? 0;

    document.getElementById("paidAmount").value =
        fee.paidAmount ?? 0;

    document.getElementById("paymentDate").value =
        fee.paymentDate || "";

    // Enable dropdowns
    document.getElementById("section").disabled = false;
    document.getElementById("studentName").disabled = false;

    feeModal.style.display = "flex";
}


// =============================
// VIEW FEE
// =============================

function viewFee(id) {

    const fee = feesData.find(
        item => item.feeId === id
    );

    if (!fee) {
        return;
    }

    const pendingAmount =
        getPendingAmount(fee);

    const status =
        getStatus(fee);

    document.getElementById("viewFeeDetails").innerHTML = `

        <div class="view-fee-card">

            <div class="student-photo-placeholder large">
                <i class="fa-solid fa-user"></i>
            </div>

            <div>
                <h3>${fee.studentName || "-"}</h3>

                <p>
                    Class ${fee.className || "-"}
                    -
                    ${fee.section || "-"}
                </p>
            </div>

        </div>

        <div class="fee-detail-grid">

            <div>
                <b>Fee Type:</b><br>
                ${fee.feeType || "-"}
            </div>

            <div>
                <b>Due Date:</b><br>
                ${formatDate(fee.dueDate)}
            </div>

            <div>
                <b>Total Fee:</b><br>
                ${formatCurrency(fee.totalAmount)}
            </div>

            <div>
                <b>Paid Amount:</b><br>
                ${formatCurrency(fee.paidAmount)}
            </div>

            <div>
                <b>Pending Amount:</b><br>
                ${formatCurrency(pendingAmount)}
            </div>

            <div>
                <b>Status:</b><br>
                ${status}
            </div>

            <div>
                <b>Payment Date:</b><br>
                ${formatDate(fee.paymentDate)}
            </div>

        </div>
    `;

    viewModal.style.display = "flex";
}


// =============================
// CLOSE VIEW MODAL
// =============================

function closeViewModal() {

    viewModal.style.display = "none";
}


// =============================
// OPEN COLLECT PAYMENT MODAL
// =============================

function collectPayment(id) {

    const fee = feesData.find(
        item => item.feeId === id
    );

    if (!fee) {
        return;
    }

    const pendingAmount =
        getPendingAmount(fee);

    if (pendingAmount <= 0) {

        alert(
            "This student has already paid full fees."
        );

        return;
    }

    document.getElementById("collectFeeId").value =
        fee.feeId;

    document.getElementById("collectStudentName").value =
        fee.studentName || "";

    document.getElementById("collectPendingAmount").value =
        formatCurrency(pendingAmount);

    document.getElementById("collectAmount").value =
        "";

    // Today's date
    document.getElementById("collectPaymentDate").value =
        new Date().toISOString().split("T")[0];

    collectModal.style.display = "flex";
}


// =============================
// CLOSE COLLECT PAYMENT MODAL
// =============================

function closeCollectModal() {

    collectModal.style.display = "none";
}


// =============================
// COLLECT PAYMENT SUBMIT
// =============================

collectForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const id =
            Number(
                document.getElementById("collectFeeId").value
            );

        const amount =
            Number(
                document.getElementById("collectAmount").value
            );

        const paymentDate =
            document.getElementById(
                "collectPaymentDate"
            ).value;

        // Basic validation
        if (!id) {
            alert("Invalid fee record.");
            return;
        }

        if (!amount || amount <= 0) {
            alert(
                "Please enter a valid payment amount."
            );
            return;
        }

        if (!paymentDate) {
            alert(
                "Please select the payment date."
            );
            return;
        }

        const fee = feesData.find(
            item => item.feeId === id
        );

        if (!fee) {
            alert("Fee record not found.");
            return;
        }

        const pendingAmount =
            getPendingAmount(fee);

        if (amount > pendingAmount) {
            alert(
                `Payment cannot be greater than the pending amount of ${formatCurrency(pendingAmount)}.`
            );
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/${id}/collect`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        amount: amount,
                        paymentDate: paymentDate
                    })
                }
            );

            if (!response.ok) {

                let errorMessage =
                    "Collect payment failed.";

                try {

                    const errorText =
                        await response.text();

                    if (errorText) {
                        errorMessage = errorText;
                    }

                } catch (error) {
                    console.error(error);
                }

                alert(errorMessage);

                return;
            }

            alert("Payment collected successfully.");

            closeCollectModal();

            await loadFeesFromAPI();

        } catch (error) {

            console.error(
                "Collect payment error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );
        }
    }
);


// =============================
// DELETE FEE
// =============================

async function deleteFee(id) {

    if (
        !confirm(
            "Are you sure you want to delete this fee record?"
        )
    ) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            alert("Delete failed.");

            return;
        }

        alert("Fee deleted successfully.");

        await loadFeesFromAPI();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
}


// =============================
// ADD / UPDATE FEE
// =============================

feeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const id =
            document.getElementById("feeId").value;

        const studentName =
            document.getElementById("studentName").value.trim();

        const className =
            document.getElementById("className").value.trim();

        const section =
            document.getElementById("section").value.trim();

        const feeType =
            document.getElementById("feeType").value;

        const dueDate =
            document.getElementById("dueDate").value;

        const totalAmount =
            Number(
                document.getElementById("totalAmount").value
            );

        const paidAmount =
            Number(
                document.getElementById("paidAmount").value
            );

        const paymentDate =
            document.getElementById("paymentDate").value;

        // Validation
        if (!studentName) {
            alert("Please select a student.");
            return;
        }

        if (!className) {
            alert("Please select a class.");
            return;
        }

        if (!section) {
            alert("Please select a section.");
            return;
        }

        if (!feeType) {
            alert("Please select a fee type.");
            return;
        }

        if (!dueDate) {
            alert("Please select the due date.");
            return;
        }

        if (totalAmount <= 0) {
            alert(
                "Total fee amount must be greater than 0."
            );
            return;
        }

        if (paidAmount < 0) {
            alert(
                "Paid amount cannot be negative."
            );
            return;
        }

        if (paidAmount > totalAmount) {
            alert(
                "Paid amount cannot be greater than total fee amount."
            );
            return;
        }

        const feeObject = {

            studentName: studentName,

            className: className,

            section: section,

            feeType: feeType,

            dueDate: dueDate,

            paymentDate:
                paymentDate || null,

            totalAmount:
                totalAmount,

            paidAmount:
                paidAmount
        };

        const url =
            id
                ? `${API_URL}/${id}`
                : API_URL;

        const method =
            id
                ? "PUT"
                : "POST";

        try {

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        feeObject
                    )
                }
            );

            if (!response.ok) {

                let errorMessage =
                    "Save failed.";

                try {

                    const errorText =
                        await response.text();

                    if (errorText) {
                        errorMessage = errorText;
                    }

                } catch (error) {
                    console.error(error);
                }

                alert(errorMessage);

                return;
            }

            alert(
                id
                    ? "Fee updated successfully."
                    : "Fee added successfully."
            );

            closeFeeModal();

            await loadFeesFromAPI();

        } catch (error) {

            console.error(
                "Save fee error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );
        }
    }
);


// =============================
// PAGINATION
// =============================

function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        renderFees(
            getFilteredData()
        );
    }
}


function nextPage() {

    const totalPages =
        Math.ceil(
            getFilteredData().length /
            rowsPerPage
        );

    if (currentPage < totalPages) {

        currentPage++;

        renderFees(
            getFilteredData()
        );
    }
}


function goToPage(page) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                getFilteredData().length /
                rowsPerPage
            )
        );

    if (page >= 1 && page <= totalPages) {

        currentPage = page;

        renderFees(
            getFilteredData()
        );
    }
}


// =============================
// FILTER EVENTS
// =============================

[
    classFilter,
    sectionFilter,
    feeTypeFilter,
    statusFilter
].forEach(filter => {

    filter.addEventListener(
        "change",
        applyFilters
    );
});


searchInput.addEventListener(
    "input",
    applyFilters
);


// =============================
// SUMMARY CARD CLICK
// =============================

document
    .querySelectorAll(".card")
    .forEach((card, index) => {

        card.addEventListener(
            "click",
            function () {

                if (index === 0) {
                    statusFilter.value = "";
                }

                if (index === 1) {
                    statusFilter.value = "Paid";
                }

                if (index === 2) {
                    statusFilter.value = "Pending";
                }

                if (index === 3) {
                    statusFilter.value = "Partial";
                }

                applyFilters();
            }
        );
    });


// =============================
// SEND REMINDER
// =============================

document
    .querySelector(".reminder-btn")
    .addEventListener(
        "click",
        function () {

            const pendingList =
                feesData.filter(
                    item =>
                        getStatus(item) !== "Paid"
                );

            if (pendingList.length === 0) {

                alert(
                    "No pending fees. All students have paid."
                );

                return;
            }

            alert(
                `Reminder sent to ${pendingList.length} students/parents.`
            );
        }
    );


// =============================
// TODAY'S DATE
// =============================

function loadTodayDate() {

    const today = new Date();

    document.getElementById(
        "todayDate"
    ).textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    document.getElementById(
        "todayDay"
    ).textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        );
}


// =============================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =============================

window.onclick = function (event) {

    if (event.target === feeModal) {
        closeFeeModal();
    }

    if (event.target === viewModal) {
        closeViewModal();
    }

    if (event.target === collectModal) {
        closeCollectModal();
    }
};


// =============================
// LOAD FEES FROM BACKEND
// =============================

async function loadFeesFromAPI() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to fetch fees"
            );
        }

        feesData =
            await response.json();

        loadFilters();

        currentPage = 1;

        renderFees(
            feesData
        );

    } catch (error) {

        console.error(
            "Error loading fees:",
            error
        );

        alert(
            "Failed to load fees from server."
        );
    }
}


// =============================
// INITIAL LOAD
// =============================

loadTodayDate();

loadFeesFromAPI();