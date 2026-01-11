function renderGroup() {
  const app = document.getElementById("app");
  const group = State.groups.find(g => g.id === State.activeGroupId);

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

        <label>Description</label>
        <input id="expenseDesc" placeholder="e.g. Grocery" />

        <label style="margin-top:12px;">Total Amount</label>
        <input id="expenseAmount" type="number" />

        <label style="margin-top:12px;">Paid by</label>
        <select id="expensePaidBy">
          ${group.members.map(m => `<option value="${m}">${m}</option>`).join("")}
        </select>

        <label style="margin-top:12px;">Split type</label>
        <select id="splitType" onchange="renderSplitInputs()">
          <option value="equal">Equal</option>
          <option value="custom">Custom amounts</option>
        </select>

        <div id="splitInputs" style="margin-top:12px;"></div>

        <p id="expenseError" style="color:#dc2626; font-size:13px;"></p>

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

      <!-- SETTLE UP PLACEHOLDER -->
      <div class="auth-card" style="margin-top:24px;">
        <h3>Settle Up</h3>
        <p style="color:#64748B;">
          Smart settlement coming next — this will minimize transactions.
        </p>
        <button disabled style="opacity:0.6;">Settle Balances</button>
      </div>
    </main>
  `;
}

/* ---------------- SPLIT INPUTS ---------------- */

function renderSplitInputs() {
  const splitType = document.getElementById("splitType").value;
  const container = document.getElementById("splitInputs");
  const group = State.groups.find(g => g.id === State.activeGroupId);

  if (splitType === "equal") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <label>Amount per member</label>
    ${group.members.map(m => `
      <div style="display:flex; gap:10px; margin-top:8px;">
        <span style="width:80px;">${m}</span>
        <input
          type="number"
          class="split-input"
          data-member="${m}"
          placeholder="0"
        />
      </div>
    `).join("")}
  `;
}

/* ---------------- ADD EXPENSE ---------------- */

function addExpense() {
  const group = State.groups.find(g => g.id === State.activeGroupId);

  const desc = document.getElementById("expenseDesc").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const paidBy = document.getElementById("expensePaidBy").value;
  const splitType = document.getElementById("splitType").value;
  const error = document.getElementById("expenseError");

  error.textContent = "";

  if (!desc || amount <= 0) {
    error.textContent = "Enter valid expense details";
    return;
  }

  let splits = {};

  if (splitType === "custom") {
    const inputs = document.querySelectorAll(".split-input");
    let total = 0;

    inputs.forEach(input => {
      const value = Number(input.value);
      const member = input.dataset.member;

      if (value > 0) {
        splits[member] = value;
        total += value;
      }
    });

    if (total !== amount) {
      error.textContent = "Split amounts must equal total amount";
      return;
    }
  }

  group.expenses.push({
    id: Date.now(),
    description: desc,
    amount,
    paidBy,
    splitType,
    splits
  });

  saveGroups();
  renderGroup();
}

/* ---------------- EXPENSES LIST ---------------- */

function renderExpenses(group) {
  if (group.expenses.length === 0) {
    return "<p style='color:#64748B;'>No expenses yet</p>";
  }

  return `
    ${group.expenses.map(e => `
      <div style="
        display:flex;
        justify-content:space-between;
        padding:12px;
        margin-top:10px;
        border-radius:12px;
        background:#1E293B;
      ">
        <div>
          <strong>${e.description}</strong><br/>
          <span style="font-size:13px; color:#94A3B8;">
            Paid by ${e.paidBy}
          </span>
        </div>
        <div>₹${e.amount}</div>
      </div>
    `).join("")}
  `;
}

/* ---------------- BALANCE CALCULATION ---------------- */

function renderBalances(group) {
  const balances = {};
  group.members.forEach(m => balances[m] = 0);

  group.expenses.forEach(exp => {
    if (exp.splitType === "equal") {
      const share = exp.amount / group.members.length;

      group.members.forEach(m => {
        if (m === exp.paidBy) {
          balances[m] += exp.amount - share;
        } else {
          balances[m] -= share;
        }
      });
    }

    if (exp.splitType === "custom") {
      group.members.forEach(m => {
        const shouldPay = exp.splits[m] || 0;

        if (m === exp.paidBy) {
          balances[m] += exp.amount - shouldPay;
        } else {
          balances[m] -= shouldPay;
        }
      });
    }
  });

  return `
    ${Object.entries(balances).map(([name, amount]) => `
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px;
        margin-top:8px;
        border-radius:10px;
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
  `;
}

/* ---------------- NAVIGATION ---------------- */

function goBack() {
  State.activeGroupId = null;
  State.view = "dashboard";
  renderApp();
}
