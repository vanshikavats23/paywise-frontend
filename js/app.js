function switchView(view) {
  State.view = view;
  renderApp();
}

function renderApp() {
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
window.onload = () => {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  setTimeout(() => {
    loader.style.display = "none";
    app.style.display = "flex";
    renderApp();
  }, 1200);
};