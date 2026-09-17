/* ==========================================================
   EduVerse Student Dashboard — Fees & Payments
   Vanilla JS, LocalStorage powered (no backend/API)
   ========================================================== */

(function () {
  "use strict";

  const FEES_KEY = "eduverse_student_course_fees";
  const TXN_KEY = "eduverse_student_transactions";
  const REFUND_KEY = "eduverse_student_refunds";
  const BUDGET_KEY = "eduverse_student_budget";
  const SAVINGS_KEY = "eduverse_student_coupon_savings";
  const INVOICE_SEQ_KEY = "eduverse_student_invoice_seq";

  const COUPONS = {
    WELCOME10: { type: "percent", value: 10, label: "10% off" },
    SAVE20: { type: "percent", value: 20, label: "20% off" },
    FLAT50: { type: "flat", value: 50, label: "$50 off" }
  };

  const DEFAULT_FEES = [
    { id: "c1", course: "Web Development", totalFee: 500, paidAmount: 500, dueDate: "2026-07-20" },
    { id: "c2", course: "Python Programming", totalFee: 450, paidAmount: 150, dueDate: "2026-08-25" },
    { id: "c3", course: "UI / UX Design", totalFee: 400, paidAmount: 0, dueDate: "2026-08-05" },
    { id: "c4", course: "Database Management", totalFee: 300, paidAmount: 300, dueDate: "2026-07-10" }
  ];

  const DEFAULT_TXNS = [
    { id: "t1", course: "Web Development", amount: 500, date: "2026-07-20", method: "Bank Transfer", status: "Completed", invoiceNo: "INV-2026-0001" },
    { id: "t2", course: "Python Programming", amount: 150, date: "2026-07-18", method: "Card Payment", status: "Completed", invoiceNo: "INV-2026-0002" },
    { id: "t3", course: "Database Management", amount: 300, date: "2026-07-10", method: "Mobile Wallet", status: "Completed", invoiceNo: "INV-2026-0003" }
  ];

  const DEFAULT_REFUNDS = [
    { id: "r1", course: "Digital Marketing Basics", amount: 200, date: "2026-06-20", method: "Bank Transfer", status: "Completed" }
  ];

  let courseFees = loadJSON(FEES_KEY, DEFAULT_FEES);
  let transactions = loadJSON(TXN_KEY, DEFAULT_TXNS);
  let refunds = loadJSON(REFUND_KEY, DEFAULT_REFUNDS);
  let monthlyBudget = parseFloat(localStorage.getItem(BUDGET_KEY)) || 0;
  let couponSavings = parseFloat(localStorage.getItem(SAVINGS_KEY)) || 0;

  let currentCourseFilter = "all";
  let currentSearch = "";
  let pendingPayment = null; // { fee, baseAmount, discountedAmount, coupon }
  let currentReceiptTxn = null;

  let spendingChartInstance = null;

  /* -------------------- Storage helpers -------------------- */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
    localStorage.setItem(key, JSON.stringify(fallback));
    return JSON.parse(JSON.stringify(fallback));
  }

  function saveFees() { localStorage.setItem(FEES_KEY, JSON.stringify(courseFees)); }
  function saveTxns() { localStorage.setItem(TXN_KEY, JSON.stringify(transactions)); }
  function saveRefunds() { localStorage.setItem(REFUND_KEY, JSON.stringify(refunds)); }
  function saveBudget() { localStorage.setItem(BUDGET_KEY, String(monthlyBudget)); }
  function saveSavings() { localStorage.setItem(SAVINGS_KEY, String(couponSavings)); }

  function nextInvoiceNo() {
    let seq = parseInt(localStorage.getItem(INVOICE_SEQ_KEY), 10);
    if (isNaN(seq)) seq = transactions.length;
    seq += 1;
    localStorage.setItem(INVOICE_SEQ_KEY, String(seq));
    return `INV-2026-${String(seq).padStart(4, "0")}`;
  }

  /* -------------------- Utilities -------------------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str === null || str === undefined ? "" : String(str);
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function money(n) {
    return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function recomputeFeeStatus(fee) {
    const remaining = fee.totalFee - fee.paidAmount;
    if (remaining <= 0) {
      fee.status = "paid";
    } else if (fee.dueDate < todayISO()) {
      fee.status = "overdue";
    } else {
      fee.status = "pending";
    }
    return fee;
  }

  courseFees.forEach(recomputeFeeStatus);

  function showToast(message) {
    const toastEl = document.getElementById("feesToast");
    document.getElementById("feesToastBody").textContent = message;
    new bootstrap.Toast(toastEl, { delay: 2500 }).show();
  }

  /* -------------------- Stats -------------------- */
  function renderStats() {
    const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
    const paidCoursesCount = courseFees.filter(f => f.status === "paid").length;

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthPaid = transactions
      .filter(t => t.date.startsWith(thisMonthKey))
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = courseFees.filter(f => f.status === "pending");
    const overdue = courseFees.filter(f => f.status === "overdue");
    const pendingAmount = pending.reduce((s, f) => s + (f.totalFee - f.paidAmount), 0);
    const overdueAmount = overdue.reduce((s, f) => s + (f.totalFee - f.paidAmount), 0);

    document.getElementById("statTotalPaid").textContent = money(totalPaid);
    document.getElementById("statPaidCourses").textContent = `${paidCoursesCount} courses fully paid`;

    document.getElementById("statThisMonth").textContent = money(thisMonthPaid);
    document.getElementById("statBudgetLine").textContent = monthlyBudget
      ? `of ${money(monthlyBudget)} budget`
      : "Budget not set";

    document.getElementById("statPending").textContent = money(pendingAmount);
    document.getElementById("statPendingCount").textContent = `${pending.length} payments due`;

    document.getElementById("statOverdue").textContent = money(overdueAmount);
    document.getElementById("statOverdueCount").textContent = `${overdue.length} overdue`;

    document.getElementById("summaryCourses").textContent = courseFees.length;
    document.getElementById("summaryPaidCourses").textContent = paidCoursesCount;
    document.getElementById("summaryCouponSavings").textContent = money(couponSavings);
    document.getElementById("summaryRefunds").textContent = money(refunds.reduce((s, r) => s + r.amount, 0));

    renderBudgetBar(thisMonthPaid);
    renderBudgetAlert(thisMonthPaid);

    const total = courseFees.length || 1;
    const paidPct = Math.round((paidCoursesCount / total) * 100);
    const pendingPct = Math.round((pending.length / total) * 100);
    const overduePct = Math.round((overdue.length / total) * 100);

    document.getElementById("perfCompletedPct").textContent = paidPct + "%";
    document.getElementById("perfCompletedBar").style.width = paidPct + "%";
    document.getElementById("perfPendingPct").textContent = pendingPct + "%";
    document.getElementById("perfPendingBar").style.width = pendingPct + "%";
    document.getElementById("perfOverduePct").textContent = overduePct + "%";
    document.getElementById("perfOverdueBar").style.width = overduePct + "%";
  }

  function renderBudgetBar(thisMonthPaid) {
    document.getElementById("monthlyBudgetInput").value = monthlyBudget || "";
    const bar = document.getElementById("budgetProgressBar");
    const text = document.getElementById("budgetProgressText");

    text.textContent = `${money(thisMonthPaid)} / ${monthlyBudget ? money(monthlyBudget) : "-"}`;

    if (!monthlyBudget) {
      bar.style.width = "0%";
      bar.className = "progress-bar";
      return;
    }
    const pct = Math.min(100, Math.round((thisMonthPaid / monthlyBudget) * 100));
    bar.style.width = pct + "%";
    bar.className = "progress-bar " + (pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-success");
  }

  function renderBudgetAlert(thisMonthPaid) {
    const banner = document.getElementById("budgetAlertBanner");
    const text = document.getElementById("budgetAlertText");

    if (monthlyBudget && thisMonthPaid >= monthlyBudget) {
      text.textContent = `You've reached or exceeded your monthly budget of ${money(monthlyBudget)} (spent ${money(thisMonthPaid)} so far).`;
      banner.classList.remove("d-none");
    } else if (monthlyBudget && thisMonthPaid >= monthlyBudget * 0.8) {
      text.textContent = `Heads up — you've spent ${money(thisMonthPaid)} of your ${money(monthlyBudget)} monthly budget.`;
      banner.classList.remove("d-none");
    } else {
      banner.classList.add("d-none");
    }
  }

  /* -------------------- Course-wise Fees -------------------- */
  function statusBadgeHtml(status) {
    if (status === "paid") return '<span class="badge bg-success">Paid</span>';
    if (status === "overdue") return '<span class="badge bg-danger">Overdue</span>';
    return '<span class="badge bg-warning text-dark">Pending</span>';
  }

  function renderCourseFees() {
    const container = document.getElementById("courseFeeList");
    const filter = currentCourseFilter;
    const list = courseFees.filter(f => filter === "all" || f.status === filter);

    if (!list.length) {
      container.innerHTML = '<p class="text-muted mb-0">No courses match this filter.</p>';
      return;
    }

    container.innerHTML = list.map(f => {
      const remaining = f.totalFee - f.paidAmount;
      const actionBtn = f.status === "paid"
        ? `<button class="btn btn-sm btn-outline-primary receipt-course-btn" data-id="${f.id}">Receipt</button>`
        : `<button class="btn btn-sm btn-primary pay-course-btn" data-id="${f.id}">Pay ${money(remaining)}</button>`;

      return `
        <div class="revenue-item">
          <div>
            <h6>${escapeHtml(f.course)} ${statusBadgeHtml(f.status)}</h6>
            <small>${money(f.paidAmount)} paid of ${money(f.totalFee)} • Due ${formatDate(f.dueDate)}</small>
          </div>
          ${actionBtn}
        </div>`;
    }).join("");

    container.querySelectorAll(".pay-course-btn").forEach(btn => {
      btn.addEventListener("click", () => openPayModal(btn.dataset.id));
    });
    container.querySelectorAll(".receipt-course-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const fee = courseFees.find(f => f.id === btn.dataset.id);
        const txn = transactions.slice().reverse().find(t => t.course === fee.course);
        if (txn) openReceiptModal(txn);
      });
    });
  }

  /* -------------------- Payment History -------------------- */
  function getFilteredTransactions() {
    const q = currentSearch.trim().toLowerCase();
    return transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(t => !q || t.course.toLowerCase().includes(q) || t.method.toLowerCase().includes(q));
  }

  function renderPaymentHistory() {
    const tbody = document.getElementById("paymentHistoryBody");
    const emptyMsg = document.getElementById("noTransactionsMsg");
    const list = getFilteredTransactions();

    if (!list.length) {
      tbody.innerHTML = "";
      emptyMsg.classList.remove("d-none");
      return;
    }
    emptyMsg.classList.add("d-none");

    tbody.innerHTML = list.map(t => `
      <tr>
        <td>${escapeHtml(t.course)}</td>
        <td>${money(t.amount)}</td>
        <td>${formatDate(t.date)}</td>
        <td>${escapeHtml(t.method)}</td>
        <td><span class="badge bg-success">${escapeHtml(t.status)}</span></td>
        <td><button class="btn btn-sm btn-outline-primary view-receipt-btn" data-id="${t.id}"><i class="fa-solid fa-receipt"></i></button></td>
      </tr>`).join("");

    tbody.querySelectorAll(".view-receipt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const txn = transactions.find(t => t.id === btn.dataset.id);
        if (txn) openReceiptModal(txn);
      });
    });
  }

  /* -------------------- Refund History -------------------- */
  function renderRefunds() {
    const container = document.getElementById("refundHistoryList");
    if (!refunds.length) {
      container.innerHTML = '<p class="text-muted mb-0">No refunds issued yet.</p>';
      return;
    }
    container.innerHTML = refunds.map(r => `
      <div class="withdraw-item">
        <div>
          <i class="fa-solid fa-rotate-left"></i>
          <div>
            <h6>${escapeHtml(r.course)}</h6>
            <small>${formatDate(r.date)} • ${escapeHtml(r.method)}</small>
          </div>
        </div>
        <strong>${money(r.amount)}</strong>
        <span class="badge bg-success">${escapeHtml(r.status)}</span>
      </div>`).join("");
  }

  /* -------------------- Spending Chart -------------------- */
  function renderChart() {
    const year = document.getElementById("chartYearSelect").value;
    const monthly = new Array(12).fill(0);

    transactions.forEach(t => {
      if (t.date.startsWith(year)) {
        const m = parseInt(t.date.split("-")[1], 10) - 1;
        monthly[m] += t.amount;
      }
    });

    const ctx = document.getElementById("spendingChart").getContext("2d");
    if (spendingChartInstance) spendingChartInstance.destroy();

    spendingChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Fees Paid (${year})`,
          data: monthly,
          backgroundColor: "rgba(99, 102, 241, 0.6)",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /* -------------------- Pay Fees flow -------------------- */
  function refreshPayCourseOptions() {
    const select = document.getElementById("payCourseSelect");
    const unpaid = courseFees.filter(f => f.status !== "paid");
    if (!unpaid.length) {
      select.innerHTML = '<option value="">No pending fees 🎉</option>';
      return;
    }
    select.innerHTML = unpaid.map(f =>
      `<option value="${f.id}">${escapeHtml(f.course)} — ${money(f.totalFee - f.paidAmount)} due</option>`
    ).join("");
  }

  function openPayModal(preselectId) {
    refreshPayCourseOptions();
    if (preselectId) document.getElementById("payCourseSelect").value = preselectId;
    document.getElementById("couponInput").value = "";
    document.getElementById("installmentToggle").checked = false;
    document.getElementById("couponAppliedMsg").classList.add("d-none");
    document.getElementById("couponErrorMsg").classList.add("d-none");
    updatePaySummary();

    const modal = new bootstrap.Modal(document.getElementById("payFeesModal"));
    modal.show();
  }

  function getSelectedFee() {
    const id = document.getElementById("payCourseSelect").value;
    return courseFees.find(f => f.id === id);
  }

  function updatePaySummary() {
    const fee = getSelectedFee();
    const summaryEl = document.getElementById("payAmountSummary");
    const couponErr = document.getElementById("couponErrorMsg");
    const couponMsg = document.getElementById("couponAppliedMsg");
    couponErr.classList.add("d-none");
    couponMsg.classList.add("d-none");

    if (!fee) {
      summaryEl.innerHTML = "";
      pendingPayment = null;
      return;
    }

    const remaining = fee.totalFee - fee.paidAmount;
    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    let discount = 0;
    let couponLabel = "";

    if (code) {
      const coupon = COUPONS[code];
      if (coupon) {
        discount = coupon.type === "percent" ? remaining * (coupon.value / 100) : Math.min(coupon.value, remaining);
        couponLabel = coupon.label;
        couponMsg.textContent = `Coupon "${code}" applied — ${coupon.label}.`;
        couponMsg.classList.remove("d-none");
      } else {
        couponErr.textContent = `Coupon "${code}" is not valid.`;
        couponErr.classList.remove("d-none");
      }
    }

    const discountedTotal = Math.max(0, remaining - discount);
    const installment = document.getElementById("installmentToggle").checked;
    const payNow = installment ? discountedTotal / 2 : discountedTotal;
    const payLater = installment ? discountedTotal - payNow : 0;

    pendingPayment = { fee, remaining, discount, discountedTotal, payNow, payLater, couponCode: discount > 0 ? code : null };

    summaryEl.innerHTML = `
      <div class="d-flex justify-content-between"><span>Amount Due</span><strong>${money(remaining)}</strong></div>
      ${discount > 0 ? `<div class="d-flex justify-content-between text-success"><span>Coupon Discount</span><strong>-${money(discount)}</strong></div>` : ""}
      <div class="d-flex justify-content-between"><span>${installment ? "Pay Now (1st installment)" : "Total to Pay"}</span><strong>${money(payNow)}</strong></div>
      ${installment ? `<div class="d-flex justify-content-between text-muted"><span>Remaining (2nd installment, due in 30 days)</span><strong>${money(payLater)}</strong></div>` : ""}
    `;
  }

  function confirmPayment() {
    if (!pendingPayment || !pendingPayment.fee) {
      showToast("Please select a course to pay for.");
      return;
    }

    const { fee, payNow, payLater, discount, couponCode } = pendingPayment;
    const method = document.getElementById("payMethodSelect").value;

    fee.paidAmount += payNow;

    if (payLater > 0) {
      // Installment: extend the due date 30 days out for the remaining balance.
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 30);
      fee.dueDate = nextDue.toISOString().slice(0, 10);
      fee.totalFee = fee.paidAmount + payLater; // keep totalFee consistent with remaining balance
    }
    recomputeFeeStatus(fee);
    saveFees();

    if (discount > 0) {
      couponSavings += discount;
      saveSavings();
    }

    const txn = {
      id: "t" + Date.now(),
      course: fee.course,
      amount: Math.round(payNow * 100) / 100,
      date: todayISO(),
      method,
      status: "Completed",
      invoiceNo: nextInvoiceNo(),
      couponCode: couponCode || null
    };
    transactions.unshift(txn);
    saveTxns();

    renderAll();
    showToast(`Payment of ${money(txn.amount)} for ${fee.course} successful.`);

    bootstrap.Modal.getInstance(document.getElementById("payFeesModal")).hide();
    openReceiptModal(txn);
  }

  /* -------------------- Receipt / Invoice -------------------- */
  function openReceiptModal(txn) {
    currentReceiptTxn = txn;
    const body = document.getElementById("receiptModalBody");
    body.innerHTML = `
      <p class="mb-1"><strong>Invoice No:</strong> ${escapeHtml(txn.invoiceNo)}</p>
      <p class="mb-1"><strong>Course:</strong> ${escapeHtml(txn.course)}</p>
      <p class="mb-1"><strong>Amount Paid:</strong> ${money(txn.amount)}</p>
      <p class="mb-1"><strong>Date:</strong> ${formatDate(txn.date)}</p>
      <p class="mb-1"><strong>Method:</strong> ${escapeHtml(txn.method)}</p>
      ${txn.couponCode ? `<p class="mb-1"><strong>Coupon Used:</strong> ${escapeHtml(txn.couponCode)}</p>` : ""}
      <p class="mb-0"><strong>Status:</strong> <span class="badge bg-success">${escapeHtml(txn.status)}</span></p>
    `;
    new bootstrap.Modal(document.getElementById("receiptModal")).show();
  }

  function downloadReceipt() {
    if (!currentReceiptTxn) return;
    const t = currentReceiptTxn;
    const content = `EduVerse Fee Payment Receipt
--------------------------------
Invoice No: ${t.invoiceNo}
Course: ${t.course}
Amount Paid: ${money(t.amount)}
Date: ${formatDate(t.date)}
Payment Method: ${t.method}
${t.couponCode ? "Coupon Used: " + t.couponCode + "\n" : ""}Status: ${t.status}

Thank you for your payment.
`;
    downloadTextFile(`${t.invoiceNo}.txt`, content);
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportHistoryCsv() {
    let csv = "Invoice No,Course,Amount,Date,Method,Status\n";
    transactions.forEach(t => {
      csv += `"${t.invoiceNo}","${t.course}","${t.amount}","${t.date}","${t.method}","${t.status}"\n`;
    });
    downloadTextFile("payment-history.csv", csv);
    showToast("Payment history exported.");
  }

  /* -------------------- Budget -------------------- */
  function saveBudgetHandler() {
    const val = parseFloat(document.getElementById("monthlyBudgetInput").value);
    monthlyBudget = isNaN(val) ? 0 : val;
    saveBudget();
    renderStats();
    showToast(monthlyBudget ? `Monthly budget set to ${money(monthlyBudget)}.` : "Monthly budget cleared.");
  }

  /* -------------------- Render all -------------------- */
  function renderAll() {
    renderStats();
    renderCourseFees();
    renderPaymentHistory();
    renderRefunds();
    renderChart();
    document.getElementById("notifCount").textContent =
      courseFees.filter(f => f.status === "overdue").length + courseFees.filter(f => f.status === "pending").length;
  }

  /* -------------------- Init -------------------- */
  function init() {
    document.getElementById("courseFeeFilter").addEventListener("change", e => {
      currentCourseFilter = e.target.value;
      renderCourseFees();
    });

    document.getElementById("transactionSearch").addEventListener("input", e => {
      currentSearch = e.target.value;
      renderPaymentHistory();
    });

    document.getElementById("payFeesBtn").addEventListener("click", () => openPayModal());
    document.getElementById("payCourseSelect").addEventListener("change", updatePaySummary);
    document.getElementById("couponInput").addEventListener("input", updatePaySummary);
    document.getElementById("installmentToggle").addEventListener("change", updatePaySummary);
    document.getElementById("confirmPayBtn").addEventListener("click", confirmPayment);

    document.getElementById("downloadReceiptBtn").addEventListener("click", downloadReceipt);
    document.getElementById("exportHistoryBtn").addEventListener("click", exportHistoryCsv);

    document.getElementById("chartYearSelect").addEventListener("change", renderChart);
    document.getElementById("saveBudgetBtn").addEventListener("click", saveBudgetHandler);

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();