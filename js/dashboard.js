function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <img src="assets/logo.png" alt="PayWise logo" />
        <span>PayWise</span>
      </div>

     <div style="position:relative;">
    <button class="theme-toggle" onclick="toggleSettings()">⚙️</button>
    ${renderSettingsWidget()}
        </div>

    </header>

    <!-- MAIN -->
    <main class="main">
      <h2>Good evening, ${State.user?.name || "there"} 👋</h2>
      <p style="color:#64748B; margin-bottom:32px;">
        Here’s a quick look at your shared expenses
      </p>

      <!-- SUMMARY -->
      <div class="auth-card">
        <h3>Summary</h3>
        <p>Total groups: <strong>${State.groups.length}</strong></p>
      </div>

      <!-- GROUPS -->
      <div class="auth-card" style="margin-top:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Your Groups</h3>
          <button onclick="openCreateGroupModal()" style="width:auto;">+ New</button>
        </div>

        ${
          State.groups.length === 0
            ? `<p style="margin-top:12px; color:#64748B;">No groups yet</p>`
            : State.groups.map(g => `
                <div
                  onclick="openGroup(${g.id})"
                  style="
                    margin-top:12px;
                    padding:12px;
                    border-radius:12px;
                    background:#1E293B;
                    cursor:pointer;
                  "
                >
                  <strong>${g.name}</strong><br/>
                  <span style="font-size:13px; color:#94A3B8;">
                    Members: ${g.members.join(", ")}
                  </span>
                </div>
              `).join("")
        }
      </div>
    </main>

    ${renderCreateGroupModal()}
  `;
}

/* ---------------- GROUP NAVIGATION ---------------- */

function openGroup(groupId) {
  State.activeGroupId = groupId;
  State.view = "group";
  renderApp();
}

/* ---------------- CREATE GROUP MODAL ---------------- */

function renderCreateGroupModal() {
  return `
    <div
      id="groupModal"
      style="
        display:none;
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.4);
        align-items:center;
        justify-content:center;
        z-index:1000;
      "
    >
      <div class="auth-card">
        <h3>Create Group</h3>

        <input id="groupName" placeholder="Group name" />
        <input id="groupMembers" placeholder="Members (comma separated)" />

        <p id="groupError" style="color:#dc2626; font-size:13px;"></p>

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

/* ---------------- CREATE GROUP LOGIC ---------------- */

function createGroup() {
  const name = document.getElementById("groupName").value.trim();
  const membersInput = document.getElementById("groupMembers").value.trim();
  const error = document.getElementById("groupError");

  error.textContent = "";

  if (!name || !membersInput) {
    error.textContent = "All fields are required";
    return;
  }

  const members = membersInput
    .split(",")
    .map(m => m.trim())
    .filter(Boolean);

  if (members.length < 1) {
    error.textContent = "Add at least one member";
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
/* ---------------- SETTINGS WIDGET ---------------- */
function renderSettingsWidget() {
  return `
    <div
      id="settingsWidget"
      style="
        display:none;
        position:absolute;
        right:0;
        top:48px;
        width:220px;
        background:#0F172A;
        border-radius:14px;
        padding:16px;
        box-shadow:0 10px 30px rgba(0,0,0,0.4);
        z-index:1000;
      "
    >
      <div style="margin-bottom:12px;">
        <strong>${State.user?.name || "User"}</strong><br/>
        <span style="font-size:13px; color:#94A3B8;">
          ${State.user?.email || ""}
        </span>
      </div>

      <div class="settings-item" onclick="toggleTheme()">
        🌗 Toggle Theme
      </div>

      <div class="settings-item" onclick="logout()">
        🚪 Logout
      </div>
    </div>
  `;
}
// ---------------- SETTINGS WIDGET LOGIC ---------------- //
function toggleSettings() {
  const widget = document.getElementById("settingsWidget");
  if (!widget) return;

  widget.style.display =
    widget.style.display === "block" ? "none" : "block";
}
/* ---------------- LOGOUT ---------------- */
function logout() {
  localStorage.removeItem("paywise_user");
  State.user = null;
  State.view = "login";
  renderApp();
}

