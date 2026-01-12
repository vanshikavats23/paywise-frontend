function renderLogin() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-card">
      <h2>Welcome back</h2>

      <input id="loginEmail" placeholder="Email" />
      <input id="loginPassword" type="password" placeholder="Password" />

      <p id="loginError" style="color:#dc2626; font-size:13px;"></p>

      <button onclick="handleLogin()">Sign in</button>

      <div class="auth-link" onclick="switchView('signup')">
        Don’t have an account? Sign up
      </div>
    </div>
  `;
}

function renderSignup() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-card">
      <h2>Create account</h2>

      <input id="signupName" placeholder="Name" />
      <input id="signupEmail" placeholder="Email" />
      <input id="signupPassword" type="password" placeholder="Password" />

      <p id="signupError" style="color:#dc2626; font-size:13px;"></p>

      <button onclick="handleSignup()">Sign up</button>

      <div class="auth-link" onclick="switchView('login')">
        Already have an account? Sign in
      </div>
    </div>
  `;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  error.textContent = "";

  if (!email || !password) {
    error.textContent = "All fields are required";
    return;
  }

  if (!isValidEmail(email)) {
    error.textContent = "Enter a valid email address";
    return;
  }

  const storedUser = JSON.parse(localStorage.getItem("paywise_user"));

  if (!storedUser) {
    error.textContent = "No account found. Please sign up.";
    return;
  }

  if (email !== storedUser.email) {
    error.textContent = "Email not registered";
    return;
  }

  if (password !== storedUser.password) {
    error.textContent = "Incorrect password";
    return;
  }

  // AUTH SUCCESS
  State.view = "dashboard";
  renderApp();
}


function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const error = document.getElementById("signupError");

  error.textContent = "";

  if (!name || !email || !password) {
    error.textContent = "All fields are required";
    return;
  }

  if (!isValidEmail(email)) {
    error.textContent = "Enter a valid email address";
    return;
  }

  if (password.length < 6) {
    error.textContent = "Password must be at least 6 characters";
    return;
  }

  const user = { name, email, password };

  localStorage.setItem("paywise_user", JSON.stringify(user));

  State.view = "dashboard";
  renderApp();
}

