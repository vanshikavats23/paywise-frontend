/* ===============================
   GROUP VIEW
================================ */

function renderGroup() {
  const app = document.getElementById("app");
  const group = State.groups.find(g => g.id === State.activeGroupId);

  if (!group) {
    State.view = "dashboard";
    renderApp();
    return;
  }

  normalizeExpenses(group);

  app.innerHTML = `
    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <img src="assets/logo.png" />
        <strong>${group.name}</strong>
      </div>

      <button onclick="toggleTheme()" class="theme-toggle">
        ${State.theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>

    <!-- MAIN -->
    <main class="main">
      <div class="group-container">

        <button onclick="goBack()" class="secondary-btn">← Back</button>

        <!-- MEMBERS -->
        <div class="card">
          <h3>Members</h3>
          <p class="muted">${group.members.join(", ")}</p>
        </div>

        <!-- ADD EXPENSE -->
        <div class="card">
          <h3>Add Expense</h3>

          <div class="add-expense-form">
            <div class="field">
              <label>Description</label>
              <input
                id="expenseDesc"
                placeholder="e.g. Grocery, Dinner"
              />
            </div>

            <div class="row">
              <div class="field">
                <label>Amount</label>
                <input
                  id="expenseAmount"
                  type="number"
                  placeholder="₹0"
                />
              </div>

              <div class="field">
                <label>Paid by</label>
                <select id="expensePaidBy">
                  ${group.members.map(m => `
                    <option value="${m}">${m}</option>
                  `).join("")}
                </select>
              </div>
            </div>

            <div class="field">
              <label>Split type</label>
              <select id="splitType" onchange="renderSplitInputs()">
                <option value="equal">Split equally</option>
                <option value="custom">Unequal split</option>
              </select>
            </div>

            <div id="splitInputs"></div>

            <p id="expenseError" class="error-text"></p>

            <button class="primary-btn" onclick="addExpense()">
              Add Expense
            </button>
          </div>
        </div>

        <!-- EXPENSES -->
        <div class="card">
          <h3>Expenses</h3>
          <div class="stack">
            ${renderExpenses(group)}
          </div>
        </div>

        <!-- SETTLE UP -->
        <div class="card">
          <h3>Settle Up</h3>
          <div class="stack">
            ${renderSettlements(group)}
          </div>
        </div>

      </div>
    </main>
  `;
}

/* ===============================
   NORMALIZE DATA
================================ */

function normalizeExpenses(group) {
  group.expenses.forEach(exp => {
    if (
      exp.splitType === "custom" &&
      (!exp.splits || Object.keys(exp.splits).length === 0)
    ) {
      const equalShare = exp.amount / group.members.length;
      exp.splits = {};
      group.members.forEach(m => (exp.splits[m] = equalShare));
      exp.splitType = "equal";
    }
  });

  saveGroups();
}

/* ===============================
   SPLIT INPUTS
================================ */

function renderSplitInputs() {
  const splitType = document.getElementById("splitType").value;
  const container = document.getElementById("splitInputs");
  const group = State.groups.find(g => g.id === State.activeGroupId);

  if (splitType === "equal") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="field">
      <label>Enter amount per member</label>

      <div class="stack">
        ${group.members.map(m => `
          <div class="row">
            <span style="min-width:80px;">${m}</span>
            <input
              type="number"
              data-member="${m}"
              class="split-input"
            />
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/* ===============================
   ADD EXPENSE
================================ */

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

    inputs.forEach(i => {
      const val = Number(i.value);
      if (val > 0) {
        splits[i.dataset.member] = val;
        total += val;
      }
    });

    if (total !== amount) {
      error.textContent = "Split must equal total amount";
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

/* ===============================
   EXPENSE LIST
================================ */

function renderExpenses(group) {
  if (group.expenses.length === 0) {
    return `<p class="muted">No expenses yet</p>`;
  }

  return group.expenses.map(e => `
    <div class="expense-item">
      <div>
        <strong>${e.description}</strong>
        <div class="muted">
          Paid by ${e.paidBy} ·
          ${e.splitType === "equal" ? "Split equally" : "Unequal split"}
        </div>
      </div>

      <div><strong>₹${e.amount}</strong></div>
    </div>
  `).join("");
}

/* ===============================
   BALANCE & SETTLEMENT
================================ */

function calculateBalances(group) {
  const balances = {};
  group.members.forEach(m => (balances[m] = 0));

  group.expenses.forEach(exp => {
    let splits = {};

    if (exp.splitType === "equal") {
      const share = exp.amount / group.members.length;
      group.members.forEach(m => (splits[m] = share));
    } else {
      splits = exp.splits;
    }

    group.members.forEach(m => {
      balances[m] -= splits[m] || 0;
    });

    balances[exp.paidBy] += exp.amount;
  });

  return balances;
}

function calculateSettlements(group) {
  const balances = calculateBalances(group);
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([name, amount]) => {
    if (amount < 0) debtors.push({ name, amount: -amount });
    if (amount > 0) creditors.push({ name, amount });
  });

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount: pay
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return settlements;
}

function renderSettlements(group) {
  const settlements = calculateSettlements(group);

  if (settlements.length === 0) {
    return `<p class="muted">All settled 🎉</p>`;
  }

  return settlements.map(s => `
    <div class="expense-item">
      <span>${s.from} → ${s.to}</span>
      <strong>₹${s.amount.toFixed(2)}</strong>
    </div>
  `).join("");
}

/* ===============================
   NAVIGATION
================================ */

function goBack() {
  State.activeGroupId = null;
  State.view = "dashboard";
  renderApp();
}
