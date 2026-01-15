function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <header class="header">
      <div class="header-left">
        <img src="assets/logo.png" />
        <span>PayWise</span>
      </div>

      <div style="position:relative;">
        <button class="theme-toggle" onclick="toggleSettings()">⚙️</button>
        ${renderSettingsWidget()}
      </div>
    </header>

    <main class="main">
      <h2>Good evening, ${State.user?.name || "there"} 👋</h2>
      <p style="color:var(--muted);">
        Here’s a quick look at your shared expenses
      </p>

      <div class="dashboard-grid">
        <!-- LEFT -->
        <div class="dashboard-left">
          <div class="card">
            <h3>Summary</h3>
            <p>Total groups: <strong>${State.groups.length}</strong></p>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h3>Your Groups</h3>
              <button onclick="openCreateGroupModal()">+ New</button>
            </div>

            ${
              State.groups.length === 0
                ? `<p style="color:var(--muted);">No groups yet</p>`
                : State.groups
                    .map(
                      g => `
                        <div class="group-item" onclick="openGroup(${g.id})">
                          <strong>${g.name}</strong><br/>
                          <span style="font-size:13px; color:var(--muted);">
                            Members: ${g.members.join(", ")}
                          </span>
                        </div>
                      `
                    )
                    .join("")
            }
          </div>
        </div>

        <!-- RIGHT -->
        <div class="dashboard-right">
          <div class="card">
            <h3>Overall Balance</h3>
            <strong style="color:#22c55e;">You are owed ₹0</strong>
          </div>

          <div class="card">
            <h3>Quick Actions</h3>
            <button onclick="openCreateGroupModal()">+ Create Group</button>
          </div>

          <div class="card">
            <h3>Recent Activity</h3>
            <p style="color:var(--muted); font-size:14px;">
              No recent activity yet
            </p>
          </div>
        </div>
      </div>
    </main>

    ${renderCreateGroupModal()}
  `;
}

/* ---------------- GROUP NAV ---------------- */

function openGroup(id) {
  State.activeGroupId = id;
  State.view = "group";
  renderApp();
}

/* ---------------- CREATE GROUP ---------------- */

function renderCreateGroupModal() {
  return `
    <div id="groupModal"
      style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.4);
      align-items:center; justify-content:center;">
      <div class="card" style="max-width:420px; width:100%;">
        <h3>Create Group</h3>
        <input id="groupName" placeholder="Group name" />
        <input id="groupMembers" placeholder="Members (comma separated)" />
        <p id="groupError" style="color:red; font-size:13px;"></p>
        <button onclick="createGroup()">Create</button>
        <div class="auth-link" onclick="closeGroupModal()">Cancel</div>
      </div>
    </div>
  `;
}

function openCreateGroupModal() {
  document.getElementById("groupModal").style.display = "flex";
}

function closeGroupModal() {
  document.getElementById("groupModal").style.display = "none";
}

function createGroup() {
  const name = document.getElementById("groupName").value.trim();
  const members = document
    .getElementById("groupMembers")
    .value.split(",")
    .map(m => m.trim())
    .filter(Boolean);

  if (!name || members.length === 0) {
    document.getElementById("groupError").textContent =
      "All fields are required";
    return;
  }

  State.groups.push({
    id: Date.now(),
    name,
    members,
    expenses: []
  });

  saveGroups();
  closeGroupModal();
  renderDashboard();
}

/* ---------------- SETTINGS ---------------- */

function renderSettingsWidget() {
  return `
    <div id="settingsWidget"
      style="display:none; position:absolute; right:0; top:48px;
      width:220px; background:var(--card); padding:16px;
      border-radius:14px; box-shadow:var(--shadow);">
      <strong>${State.user?.name}</strong><br/>
      <span style="font-size:13px; color:var(--muted);">
        ${State.user?.email}
      </span>

      <div class="settings-item" onclick="toggleTheme()">Toggle Theme</div>
      <div class="settings-item" onclick="logout()">Logout</div>
    </div>
  `;
}

function toggleSettings() {
  const w = document.getElementById("settingsWidget");
  w.style.display = w.style.display === "block" ? "none" : "block";
}

function logout() {
  localStorage.removeItem("paywise_token");
  State.user = null;
  State.view = "login";
  renderApp();
}

