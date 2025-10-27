// /C:/Users/csisz/Documents/nextlab/schimba-culoarea/script.js
// GitHub Copilot
// To-Do app logic: save/load from localStorage, add/toggle/delete tasks, fade-in animation.
// Works with HTML that has:
// - <input id="taskInput">
// - <button id="addBtn">+</button>
// - <ul id="taskList"></ul>

(() => {
    const STORAGE_KEY = 'todoTasks';

    // Cached DOM elements (will be populated on DOMContentLoaded)
    let taskInput;
    let addBtn;
    let taskList;

    // In-memory tasks array: array of { text: string, done: boolean }
    let tasks = [];

    // Utility: load tasks from localStorage
    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            tasks = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(tasks)) tasks = [];
        } catch (e) {
            // If parsing fails, reset to empty list
            tasks = [];
        }
    }

    // Utility: save tasks to localStorage
    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            // If storage is full or unavailable, fail silently
            // Could show a user message in a real app
            console.error('Failed saving tasks', e);
        }
    }

    // Create a single <li> element for a task.
    // animate: boolean - whether to play a fade-in animation
    function createTaskElement(task, index, animate = false) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.index = String(index);
        li.style.listStyle = 'none';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '8px';
        li.style.padding = '6px 4px';

        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'task-done-btn';
        doneBtn.textContent = '✔️';
        doneBtn.title = 'Mark as done / undone';
        doneBtn.style.cursor = 'pointer';
        doneBtn.style.border = 'none';
        doneBtn.style.background = 'transparent';
        doneBtn.style.fontSize = '1rem';
        doneBtn.style.padding = '4px';

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;
        textSpan.style.flex = '1';
        textSpan.style.wordBreak = 'break-word';

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'task-delete-btn';
        delBtn.textContent = '✖️';
        delBtn.title = 'Delete task';
        delBtn.style.cursor = 'pointer';
        delBtn.style.border = 'none';
        delBtn.style.background = 'transparent';
        delBtn.style.fontSize = '1rem';
        delBtn.style.padding = '4px';

        // Apply "done" visual state
        function applyDoneVisual(isDone) {
            if (isDone) {
                textSpan.style.textDecoration = 'line-through';
                textSpan.style.color = '#999';
                textSpan.style.opacity = '0.9';
            } else {
                textSpan.style.textDecoration = 'none';
                textSpan.style.color = '';
                textSpan.style.opacity = '';
            }
        }
        applyDoneVisual(Boolean(task.done));

        // Event: toggle done/undone
        doneBtn.addEventListener('click', (e) => {
            // determine current index from DOM (safe if list re-rendered)
            const idx = parseInt(li.dataset.index, 10);
            if (Number.isNaN(idx) || idx < 0 || idx >= tasks.length) return;
            tasks[idx].done = !tasks[idx].done;
            saveTasks();
            // Update visuals without full re-render for snappy UI
            applyDoneVisual(tasks[idx].done);
            // Update dataset indexes might remain valid; to keep indexes consistent we re-render
            // Re-render ensures dataset.index values are correct after any mutation
            renderTasks();
        });

        // Event: delete task
        delBtn.addEventListener('click', (e) => {
            const idx = parseInt(li.dataset.index, 10);
            if (Number.isNaN(idx) || idx < 0 || idx >= tasks.length) return;
            tasks.splice(idx, 1);
            saveTasks();
            renderTasks();
        });

        // Clicking the text toggles done as well (UX nicety)
        textSpan.addEventListener('click', () => {
            const idx = parseInt(li.dataset.index, 10);
            if (Number.isNaN(idx) || idx < 0 || idx >= tasks.length) return;
            tasks[idx].done = !tasks[idx].done;
            saveTasks();
            renderTasks();
        });

        li.appendChild(doneBtn);
        li.appendChild(textSpan);
        li.appendChild(delBtn);

        // Fade-in animation using Web Animations API (no external CSS required)
        if (animate && typeof li.animate === 'function') {
            li.style.opacity = '0';
            li.style.transform = 'translateY(-6px)';
            const anim = li.animate(
                [
                    { opacity: 0, transform: 'translateY(-6px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                { duration: 200, easing: 'ease', fill: 'forwards' }
            );
            anim.onfinish = () => {
                li.style.opacity = '1';
                li.style.transform = 'none';
            };
        }

        return li;
    }

    // Render the entire tasks list
    function renderTasks() {
        // Clear current list
        taskList.innerHTML = '';
        // Re-create items with correct indexes
        tasks.forEach((task, idx) => {
            const li = createTaskElement(task, idx, false);
            taskList.appendChild(li);
        });
    }

    // Handler: add a new task from input
    function addNewTask() {
        const text = taskInput.value.trim();
        if (!text) {
            // Do nothing on empty input
            taskInput.value = '';
            taskInput.focus();
            return;
        }
        // Add to data
        const newTask = { text, done: false };
        tasks.push(newTask);
        saveTasks();

        // Create element for newly added task and append with animation
        const li = createTaskElement(newTask, tasks.length - 1, true);
        taskList.appendChild(li);

        // Clear input and keep focus for quick entry
        taskInput.value = '';
        taskInput.focus();

        // After append we re-render to ensure dataset.index values are correct
        // (keeps delete/toggle logic simple)
        renderTasks();
    }

    // Setup event listeners and initial load
    function init() {
        // Get DOM elements
        taskInput = document.getElementById('taskInput');
        addBtn = document.getElementById('addBtn');
        taskList = document.getElementById('taskList');

        if (!taskInput || !addBtn || !taskList) {
            console.error('Missing required HTML elements: #taskInput, #addBtn, #taskList');
            return;
        }

        // Load tasks and render
        loadTasks();
        renderTasks();

        // Add button click
        addBtn.addEventListener('click', (e) => {
            addNewTask();
        });

        // Allow Enter key to add
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewTask();
            }
        });
    }

    // Wait for DOM ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();