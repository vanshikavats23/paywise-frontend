function renderGroup() {
  const app = document.getElementById("app");
  const group = State.groups.find(g => g.id === State.activeGroupId);

  // Safety fallback
  if (!group) {
    State.view = "dashboard";
    renderApp();
    return;
  }

  app.innerHTML = `
    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <img src="assets/logo.png" alt="PayWise logo" />
        <span>${group.name}</span>
      </div>

      <button class="theme-toggle" onclick="toggleTheme()">
        ${State.theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>

    <!-- MAIN -->
    <main class="main">
      <button onclick="goBack()" style="margin-bottom:16px;">← Back</button>

      <!-- MEMBERS -->
      <div class="auth-card">
        <h3>Members</h3>
        <p>${group.members.join(", ")}</p>
      </div>

      <!-- ADD EXPENSE -->
      <div class="auth-card" style="margin-top:24px;">
        <h3>Add Expense</h3>

        <div style="margin-bottom:16px;">
          <label style="font-size:13px; color:#64748B;">Description</label>
          <input
            id="expenseDesc"
            placeholder="e.g. Grocery, Dinner"
            style="margin-top:6px;"
          />
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:13px; color:#64748B;">Amount</label>
          <input
            id="expenseAmount"
            type="number"
            placeholder="Enter amount"
            style="margin-top:6px;"
          />
        </div>

        <div style="margin-bottom:20px;">
          <label style="font-size:13px; color:#64748B;">Paid by</label>
          <select id="expensePaidBy" style="margin-top:6px;">
            ${group.members.map(m => `<option value="${m}">${m}</option>`).join("")}
          </select>
        </div>

        <p id="expenseError" style="color:#dc2626; font-size:13px; margin-bottom:8px;"></p>

        <button onclick="addExpense()" style="width:100%;">
          Add Expense
        </button>
      </div>

      <!-- EXPENSES -->
      <div class="auth-card" style="margin-top:24px;">
        <h3>Expenses</h3>
        ${renderExpenses(group)}
      </div>

      <!-- BALANCES -->
      <div class="auth-card" style="margin-top:24px;">
        <h3>Balances</h3>
        ${renderBalances(group)}
      </div>

      <!-- SETTLE UP (COMING NEXT) -->
      <div class="auth-card" style="margin-top:24px;">
        <h3>Settle Up</h3>
        <p style="color:#64748B;">
          Smart settlement coming next — this will minimize transactions.
        </p>
        <button disabled style="opacity:0.6; cursor:not-allowed;">
          Settle Balances
        </button>
      </div>
    </main>
  `;
}

/* ---------------- ADD EXPENSE LOGIC ---------------- */

function addExpense() {
  const group = State.groups.find(g => g.id === State.activeGroupId);

  const desc = document.getElementById("expenseDesc").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const paidBy = document.getElementById("expensePaidBy").value;
  const error = document.getElementById("expenseError");

  error.textContent = "";

  if (!desc || amount <= 0) {
    error.textContent = "Enter valid expense details";
    return;
  }

  group.expenses.push({
    id: Date.now(),
    description: desc,
    amount,
    paidBy,
    splitType: "equal",   // future-ready
    splits: {}
  });

  saveGroups();
  renderGroup();
}

/* ---------------- EXPENSES LIST UI ---------------- */

function renderExpenses(group) {
  if (group.expenses.length === 0) {
    return "<p style='color:#64748B;'>No expenses yet</p>";
  }

  return `
    <div style="margin-top:12px;">
      ${group.expenses.map(e => `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px;
          margin-bottom:10px;
          border-radius:12px;
          background:#1E293B;
        ">
          <div>
            <strong>${e.description}</strong><br/>
            <span style="font-size:13px; color:#94A3B8;">
              Paid by ${e.paidBy}
            </span>
          </div>

          <div style="font-weight:600;">
            ₹${e.amount}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------------- BALANCE CALCULATION ---------------- */

function renderBalances(group) {
  const balances = {};
  group.members.forEach(m => balances[m] = 0);

  group.expenses.forEach(exp => {
    const share = exp.amount / group.members.length;

    group.members.forEach(m => {
      if (m === exp.paidBy) {
        balances[m] += exp.amount - share;
      } else {
        balances[m] -= share;
      }
    });
  });

  return `
    <div style="margin-top:12px;">
      ${Object.entries(balances).map(([name, amount]) => `
        <div style="
          display:flex;
          justify-content:space-between;
          padding:10px 12px;
          border-radius:10px;
          margin-bottom:8px;
          background:${amount >= 0 ? "#052e1c" : "#3f1d1d"};
          color:${amount >= 0 ? "#22c55e" : "#ef4444"};
        ">
          <span>${name}</span>
          <span>
            ${amount >= 0
              ? `gets ₹${amount.toFixed(2)}`
              : `owes ₹${Math.abs(amount).toFixed(2)}`
            }
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------------- NAVIGATION ---------------- */

function goBack() {
  State.activeGroupId = null;
  State.view = "dashboard";
  renderApp();
}


