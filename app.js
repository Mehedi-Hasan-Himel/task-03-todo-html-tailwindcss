// app.js

// Select elements
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");

// Load todos from localStorage (or empty array)
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Save to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render tasks
function renderTodos() {
  todoList.innerHTML = ""; // Clear previous list

  if (todos.length === 0) {
    todoList.innerHTML =
      '<p class="text-center text-gray-500">No tasks yet. Add one above!</p>';
    return;
  }

  todos.forEach((todo, index) => {
    const todoItem = document.createElement("div");
    todoItem.className =
      "flex items-center gap-3 p-4 transition bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200";

    // Use data-index on the interactive controls so we always read from the correct element
    todoItem.innerHTML = `
      <input type="checkbox" class="w-5 h-5 accent-blue-500" ${
        todo.completed ? "checked" : ""
      } data-index="${index}">
      <label class="flex-1 font-medium ${
        todo.completed ? "line-through text-gray-400" : "text-gray-700"
      } cursor-pointer" data-index="${index}">${escapeHtml(todo.text)}</label>
      <button class="text-green-500 hover:text-green-700 edit-btn" data-index="${index}" aria-label="Edit task">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="text-red-500 hover:text-red-700 delete-btn" data-index="${index}" aria-label="Delete task">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    todoList.appendChild(todoItem);
  });
}

// Helper: escape text to prevent simple injection if user types HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Add todo
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === "") return alert("Please enter a task!");

  todos.push({ text, completed: false });
  input.value = "";
  saveTodos();   // Save right after mutating
  renderTodos();
});

// Use event delegation for edit / delete / toggle complete
todoList.addEventListener("click", (e) => {
  // Determine what was clicked: checkbox, edit button, or delete button
  // We find the closest control that we expect to have the data-index attribute
  const deleteBtn = e.target.closest(".delete-btn");
  const editBtn = e.target.closest(".edit-btn");
  const checkbox = e.target.closest('input[type="checkbox"]');
  const label = e.target.closest("label");

  if (deleteBtn) {
    const idx = Number(deleteBtn.dataset.index);
    if (!Number.isNaN(idx) && idx >= 0 && idx < todos.length) {
      todos.splice(idx, 1);   // remove from array
      saveTodos();            // persist immediately
      renderTodos();          // re-render
    }
    return;
  }

  if (editBtn) {
    const idx = Number(editBtn.dataset.index);
    if (!Number.isNaN(idx) && idx >= 0 && idx < todos.length) {
      const newText = prompt("Edit your task:", todos[idx].text);
      if (newText !== null) {
        const trimmed = newText.trim();
        if (trimmed.length) {
          todos[idx].text = trimmed;
          saveTodos();
          renderTodos();
        } else {
          alert("Task cannot be empty.");
        }
      }
    }
    return;
  }

  // Toggle complete when clicking the checkbox OR clicking the label
  if (checkbox || label) {
    // Prefer checkbox's dataset if checkbox clicked; otherwise use label's dataset
    const source = checkbox || label;
    const idx = Number(source.dataset.index);
    if (!Number.isNaN(idx) && idx >= 0 && idx < todos.length) {
      // If it's a checkbox click, use its checked state. If label clicked, flip the state.
      if (checkbox) {
        todos[idx].completed = checkbox.checked;
      } else {
        todos[idx].completed = !todos[idx].completed;
      }
      saveTodos();
      renderTodos();
    }
  }
});

// Initial render
renderTodos();
