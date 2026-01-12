const State = {
  view: null, // 👈 IMPORTANT: do NOT hardcode "login"
  theme: localStorage.getItem("theme") || "light",
  user: JSON.parse(localStorage.getItem("paywise_user")),
  groups: JSON.parse(localStorage.getItem("paywise_groups")) || [],
  activeGroupId: null
};

function saveGroups() {
  localStorage.setItem("paywise_groups", JSON.stringify(State.groups));
}
