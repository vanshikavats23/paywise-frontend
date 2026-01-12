function switchView(view) {
  State.view = view;
  renderApp();
}
function renderApp() {
  /* 🔐 SESSION GUARD */
  if (State.user && (State.view === "login" || State.view === "signup")) {
    State.view = "dashboard";
  }

  if (!State.user && (State.view === "dashboard" || State.view === "group")) {
    State.view = "login";
  }

  // Auth background
  if (State.view === "login" || State.view === "signup") {
    document.body.classList.add("auth");
  } else {
    document.body.classList.remove("auth");
  }

  if (State.view === "login") {
    renderLogin();
  } 
  else if (State.view === "signup") {
    renderSignup();
  } 
  else if (State.view === "dashboard") {
    renderDashboard();
  } 
  else if (State.view === "group") {
    renderGroup();
  }
}


// APP BOOTSTRAP
// APP BOOTSTRAP
window.onload = () => {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // 🔑 AUTO LOGIN CHECK
  const savedUser = localStorage.getItem("paywise_user");

  if (savedUser) {
    State.user = JSON.parse(savedUser);
    State.view = "dashboard";
  } else {
    State.view = "login";
  }

  setTimeout(() => {
    loader.style.display = "none";
    app.style.display = "flex";
    renderApp();
  }, 1200);
};
