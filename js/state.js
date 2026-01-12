const State = {
  view: "login",
  theme: localStorage.getItem("theme") || "light",
  user: JSON.parse(localStorage.getItem("paywise_user")),
  groups: JSON.parse(localStorage.getItem("paywise_groups")) || []
};

function saveGroups() {
  localStorage.setItem("paywise_groups", JSON.stringify(State.groups));
}
State.activeGroupId = null;