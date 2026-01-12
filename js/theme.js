function applyTheme() {
  if (State.theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function toggleTheme() {
  State.theme = State.theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", State.theme);
  applyTheme();
}

applyTheme();