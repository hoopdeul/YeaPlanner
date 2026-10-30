const form = document.querySelector(".task-form");
const input = document.querySelector(".task-form__input");
const taskList = document.querySelector(".task-list__items");
const countAll = document.getElementById("countall");
const countDone = document.getElementById("countdone");
const emptyMessage = document.querySelector(".task-list-empty");
const filters = document.querySelector(".task-filters");

let currentFilter = "all";
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showTasks();
}

function showTasks() {
  taskList.innerHTML = "";
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.innerHTML = `<input type="checkbox" class="task-item__checkbox"
                    ${task.completed ? "checked" : ""}>
                    <span class="task-item__text ${task.completed ? "task-item__text-completed" : ""}">
                        ${task.text}
                    </span>
                    <button type="button" class="task-item__button">
                        <img src="images/trash.png" alt="Удалить задачу">
                    </button>`;
    li.dataset.id = task.id;
    taskList.append(li);
  });

  emptyMessage.classList.toggle("hidden", tasks.length > 0);
  countAll.textContent = tasks.length;
  countDone.textContent = `${tasks.filter((task) => task.completed === true).length} из ${tasks.length}`;
}

function addTask(text) {
  if (!text) return;
  const task = {
    id: Date.now(),
    text,
    completed: false
  };
  tasks.push(task);
  saveTasks();
}

function removeTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
    saveTasks();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value.trim());
  input.value = "";
});

taskList.addEventListener("click", (event) => {
  const li = event.target.closest(".task-item");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.closest(".task-item__button")) {
    removeTask(id);
    return;
  }

  if (event.target.matches(".task-item__checkbox")) {
    const task = tasks.find((task) => task.id === id);
    if (task) {
      task.completed = event.target.checked;
      saveTasks();
    }
  }
});

taskList.addEventListener("dblclick", (event) => {
  const taskText = event.target.closest(".task-item__text");
  if (!taskText) return;
  if (taskText.classList.contains("task-item__text-completed")) return;
  const item = taskText.closest(".task-item");
  const id = Number(item.dataset.id);
  const task = tasks.find((task) => task.id === id);
  if (!task) return;
  const input = document.createElement("input");
  input.classList.add("task-item__text-edit");
  input.value = task.text;
  taskText.replaceWith(input);
  input.focus();
  let isCancelled = false;

  function saveEdit() {
    if (!input.isConnected || isCancelled) return;

    const newText = input.value.trim();

    if (newText) {
      task.text = newText;
      saveTasks();
    }
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      saveEdit();
    }
    if (event.key === "Escape") {
      isCancelled = true;
      const text = document.createElement("span");
      text.classList.add("task-item__text");
      text.textContent = task.text;
      input.replaceWith(text);
    }
  });
  input.addEventListener("blur", saveEdit);
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".task-filter");
  if (!button) return;

  currentFilter = button.dataset.filter;

  filters.querySelector(".active")?.classList.remove("active");
  button.classList.add("active");

  showTasks();
});

showTasks();
