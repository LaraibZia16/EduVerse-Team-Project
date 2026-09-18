/* ==========================================================================
   EduVerse | Teacher Earnings Dashboard
   earnings.js
   Fully functional front-end logic for earnings.html
   Vanilla JS + Bootstrap 5 + Chart.js (both already loaded on the page)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function toast(message, type = 'primary') {
    let container = $('#eduToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'eduToastContainer';
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `alert alert-${type} shadow`;
    el.style.minWidth = '260px';
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.transform = 'translateX(20px)';
    el.textContent = message;

    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function buildModal(id, title, bodyHTML, footerHTML = '') {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
          ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(id, title, bodyHTML, footerHTML = '') {
    const modalEl = buildModal(id, title, bodyHTML, footerHTML);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    return { modalEl, modal };
  }

  function formatCurrency(n) {
    return '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  /* ------------------------------------------------------------------------
     1. SIDEBAR TOGGLE (mobile responsiveness)
     ------------------------------------------------------------------------ */

  function initSidebarToggle() {
    const menuBtn = $('.menu-toggle');
    const wrapper = $('.dashboard-wrapper');
    const sidebar = $('.sidebar');
    if (!menuBtn || !wrapper || !sidebar) return;

    menuBtn.addEventListener('click', () => {
      wrapper.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 992;
      if (!isMobile) return;
      if (
        sidebar.classList.contains('show') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove('show');
      }
    });

    $$('.sidebar-menu ul li a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 992) sidebar.classList.remove('show');
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. NOTIFICATIONS BELL
     ------------------------------------------------------------------------ */

  function initNotifications() {
    const bell = $('.nav-icon');
    if (!bell) return;

    const badge = bell.querySelector('span');

    const notifications = [
      { text: 'New payment received from Ali Khan', time: '1h ago' },
      { text: 'Sara Ahmed\u2019s payment is pending', time: '3h ago' },
      { text: 'Monthly payout report is ready', time: '1d ago' },
      { text: 'Withdrawal of $1000 completed', time: '2d ago' },
      { text: 'New review on Web Development course', time: '3d ago' }
    ];

    bell.style.cursor = 'pointer';
    bell.addEventListener('click', () => {
      const listHTML = notifications
        .map(
          (n) => `
        <div class="d-flex justify-content-between border-bottom py-2">
          <span>${n.text}</span>
          <small class="text-muted ms-3">${n.time}</small>
        </div>`
        )
        .join('');

      showModal(
        'notificationsModal',
        '<i class="fa-solid fa-bell me-2"></i>Notifications',
        listHTML
      );

      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. SEARCH TRANSACTIONS (filters Payment History table)
     ------------------------------------------------------------------------ */

  function initSearch() {
    const input = $('.search-box input');
    const table = $('.earnings-table');
    if (!input || !table) return;

    const rows = $$('tbody tr', table);

    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();

      let visibleCount = 0;
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const match = text.includes(term);
        row.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      let noResults = $('#noTransactionResults');
      const tbody = table.querySelector('tbody');
      if (visibleCount === 0 && term !== '') {
        if (!noResults) {
          noResults = document.createElement('tr');
          noResults.id = 'noTransactionResults';
          noResults.innerHTML = `<td colspan="5" class="text-center text-muted py-3">No transactions match "${input.value}".</td>`;
          tbody.appendChild(noResults);
        }
      } else if (noResults) {
        noResults.remove();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. REVENUE ANALYTICS CHART (Chart.js) + Year Switcher
     ------------------------------------------------------------------------ */

  const REVENUE_DATA = {
    2026: [1200, 1450, 1600, 1800, 2100, 1950, 2300, 2500, 2850, 0, 0, 0],
    2025: [900, 1000, 1150, 1300, 1500, 1650, 1700, 1900, 2050, 2200, 2400, 2600]
  };

  let revenueChart = null;

  function initRevenueChart() {
    const canvas = $('#revenueChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearSelect = $('.card-header-custom select.form-select');
    const initialYear = yearSelect ? yearSelect.value : '2026';

    revenueChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Revenue (${initialYear})`,
            data: REVENUE_DATA[initialYear] || REVENUE_DATA['2026'],
            fill: true,
            tension: 0.35,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.15)',
            pointBackgroundColor: '#4361ee',
            pointRadius: 4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatCurrency(ctx.parsed.y)
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value
            }
          }
        }
      }
    });

    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        const year = yearSelect.value;
        const data = REVENUE_DATA[year] || REVENUE_DATA['2026'];
        revenueChart.data.datasets[0].data = data;
        revenueChart.data.datasets[0].label = `Revenue (${year})`;
        revenueChart.update();
        toast(`Showing revenue analytics for ${year}.`, 'primary');
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. WITHDRAW NOW
     ------------------------------------------------------------------------ */

  function initWithdraw() {
    const withdrawCard = $('.withdraw-card');
    if (!withdrawCard) return;

    const withdrawBtn = withdrawCard.querySelector('button');
    if (!withdrawBtn) return;

    // Available balance comes from the "Available Balance" stat card
    function getAvailableBalance() {
      const statCards = $$('.stat-card');
      const balanceCard = statCards.find((card) =>
        card.querySelector('h5')?.textContent.trim().toLowerCase().includes('available balance')
      );
      const amountText = balanceCard?.querySelector('h2')?.textContent.replace(/[^0-9.]/g, '') || '0';
      return { card: balanceCard, amount: parseFloat(amountText) || 0 };
    }

    withdrawBtn.addEventListener('click', () => {
      const { amount } = getAvailableBalance();

      const { modalEl } = showModal(
        'withdrawModal',
        '<i class="fa-solid fa-money-bill-transfer me-2"></i>Withdraw Earnings',
        `
        <p class="text-muted">Available balance: <strong>${formatCurrency(amount)}</strong></p>
        <div class="mb-3">
          <label class="form-label">Amount to Withdraw</label>
          <input type="number" class="form-control" id="withdrawAmountInput" min="1" max="${amount}" value="${amount}">
        </div>
        <div class="mb-1">
          <label class="form-label">Withdrawal Method</label>
          <select class="form-select" id="withdrawMethodInput">
            <option>Bank Transfer</option>
            <option>Card Payment</option>
            <option>Mobile Wallet</option>
          </select>
        </div>`,
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" id="confirmWithdrawBtn">Confirm Withdrawal</button>`
      );

      $('#confirmWithdrawBtn', modalEl).addEventListener('click', () => {
        const requested = parseFloat($('#withdrawAmountInput', modalEl).value);
        const method = $('#withdrawMethodInput', modalEl).value;

        if (!requested || requested <= 0) {
          toast('Please enter a valid amount.', 'danger');
          return;
        }
        if (requested > amount) {
          toast('Amount exceeds your available balance.', 'danger');
          return;
        }

        // Update the Available Balance stat card
        const { card } = getAvailableBalance();
        if (card) {
          const newBalance = amount - requested;
          card.querySelector('h2').textContent = formatCurrency(newBalance);
        }

        // Prepend to Withdrawal History
        const historyContainer = $('.withdraw-history');
        if (historyContainer) {
          const iconMap = {
            'Bank Transfer': 'fa-building-columns',
            'Card Payment': 'fa-credit-card',
            'Mobile Wallet': 'fa-wallet'
          };
          const today = new Date();
          const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

          const item = document.createElement('div');
          item.className = 'withdraw-item';
          item.innerHTML = `
            <div>
              <i class="fa-solid ${iconMap[method] || 'fa-wallet'}"></i>
              <div>
                <h6>${method}</h6>
                <small>${dateStr}</small>
              </div>
            </div>
            <strong>${formatCurrency(requested)}</strong>
            <span class="badge bg-warning text-dark">Processing</span>`;
          historyContainer.prepend(item);
        }

        bootstrap.Modal.getInstance(modalEl).hide();
        toast(`Withdrawal of ${formatCurrency(requested)} via ${method} submitted.`, 'success');
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. COURSE REVENUE - "View Details"
     ------------------------------------------------------------------------ */

  function initCourseRevenueDetails() {
    const sections = $$('.dashboard-card');
    const revenueSection = sections.find((s) => s.querySelector('.revenue-list'));
    if (!revenueSection) return;

    const viewDetailsBtn = revenueSection.querySelector('.card-header-custom button');
    if (!viewDetailsBtn) return;

    viewDetailsBtn.addEventListener('click', () => {
      const items = $$('.revenue-item', revenueSection);
      const rowsHTML = items
        .map((item) => {
          const title = item.querySelector('h6')?.textContent.trim() || '';
          const students = item.querySelector('small')?.textContent.trim() || '';
          const amount = item.querySelector('strong')?.textContent.trim() || '';
          return `
          <tr>
            <td>${title}</td>
            <td>${students}</td>
            <td class="text-end">${amount}</td>
          </tr>`;
        })
        .join('');

      showModal(
        'courseRevenueModal',
        '<i class="fa-solid fa-chart-pie me-2"></i>Course Revenue Breakdown',
        `
        <table class="table table-striped mb-0">
          <thead>
            <tr><th>Course</th><th>Enrolled</th><th class="text-end">Revenue</th></tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>`
      );
    });
  }

  /* ------------------------------------------------------------------------
     7. DOWNLOAD REPORT (Payment History -> CSV)
     ------------------------------------------------------------------------ */

  function initDownloadReport() {
    const sections = $$('section.dashboard-card, section .dashboard-card');
    const historySection = $$('.dashboard-card').find((s) => s.querySelector('.earnings-table'));
    if (!historySection) return;

    const downloadBtn = Array.from(historySection.querySelectorAll('button')).find((b) =>
      b.textContent.trim().toLowerCase().includes('download')
    );
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
      const table = historySection.querySelector('.earnings-table');
      const rows = $$('tbody tr', table).filter((r) => r.style.display !== 'none' && !r.id);

      if (rows.length === 0) {
        toast('No transactions to export.', 'warning');
        return;
      }

      const header = ['Student', 'Course', 'Amount', 'Date', 'Status'];
      const csvRows = [header.join(',')];

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const student = cells[0]?.querySelector('span')?.textContent.trim() || '';
        const course = cells[1]?.textContent.trim() || '';
        const amount = cells[2]?.textContent.trim() || '';
        const date = cells[3]?.textContent.trim() || '';
        const status = cells[4]?.textContent.trim() || '';
        const line = [student, course, amount, date, status]
          .map((val) => `"${val.replace(/"/g, '""')}"`)
          .join(',');
        csvRows.push(line);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast('Payment history report downloaded.', 'success');
    });
  }

  /* ------------------------------------------------------------------------
     8. PAYMENT HISTORY - status badge click shows quick summary
     ------------------------------------------------------------------------ */

  function initPaymentRowClicks() {
    const table = $('.earnings-table');
    if (!table) return;

    $$('tbody tr', table).forEach((row) => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const cells = row.querySelectorAll('td');
        if (!cells.length) return;

        const student = cells[0]?.querySelector('span')?.textContent.trim() || '';
        const course = cells[1]?.textContent.trim() || '';
        const amount = cells[2]?.textContent.trim() || '';
        const date = cells[3]?.textContent.trim() || '';
        const status = cells[4]?.textContent.trim() || '';

        showModal(
          'transactionDetailModal',
          '<i class="fa-solid fa-receipt me-2"></i>Transaction Details',
          `
          <p class="mb-1"><strong>Student:</strong> ${student}</p>
          <p class="mb-1"><strong>Course:</strong> ${course}</p>
          <p class="mb-1"><strong>Amount:</strong> ${amount}</p>
          <p class="mb-1"><strong>Date:</strong> ${date}</p>
          <p class="mb-0"><strong>Status:</strong> ${status}</p>`
        );
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. WITHDRAWAL HISTORY - click to view status details
     ------------------------------------------------------------------------ */

  function initWithdrawHistoryClicks() {
    const container = $('.withdraw-history');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.withdraw-item');
      if (!item) return;

      const method = item.querySelector('h6')?.textContent.trim() || '';
      const date = item.querySelector('small')?.textContent.trim() || '';
      const amount = item.querySelector('strong')?.textContent.trim() || '';
      const status = item.querySelector('.badge')?.textContent.trim() || '';

      showModal(
        'withdrawDetailModal',
        '<i class="fa-solid fa-clock-rotate-left me-2"></i>Withdrawal Details',
        `
        <p class="mb-1"><strong>Method:</strong> ${method}</p>
        <p class="mb-1"><strong>Date:</strong> ${date}</p>
        <p class="mb-1"><strong>Amount:</strong> ${amount}</p>
        <p class="mb-0"><strong>Status:</strong> ${status}</p>`
      );
    });
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initNotifications();
    initSearch();
    initRevenueChart();
    initWithdraw();
    initCourseRevenueDetails();
    initDownloadReport();
    initPaymentRowClicks();
    initWithdrawHistoryClicks();
  });
})();