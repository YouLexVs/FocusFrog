import { getHistory, getPoints } from "./db.js";

document.addEventListener('DOMContentLoaded', async () => {
  const historyContainer = document.getElementsByClassName('task-list')[0];
  const history = await getHistory();
  const points = await getPoints();

  const pointsCount = document.getElementById('points-count');
  if (pointsCount) pointsCount.textContent = `${points}`;


  if(history.length > 0) document.getElementsByClassName('empty-tasks')[0].classList.add('hidden');

  history.forEach(day => {
    day.tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add('task-item');

      const isDone = task.done ? 'checked' : '';
      const priority = getPriorityName(task.priority);
      const points = task.priority * task.difficulty;

      taskItem.innerHTML = `
        <input type="checkbox" class="item-box" disabled ${isDone} />
        <label class="item-label">${task.title}</label>
        <div class="task-attributes">
          <div class="priority">${priority}</div>
          <div class="points">+${points}</div>
        </div>
      `;

      historyContainer.appendChild(taskItem);
    });
  });
});

function getPriorityName(priority) {
  switch (priority) {
    case 1: return 'Niski';
    case 2: return 'Średni';
    case 3: return 'Ważny';
    default: return 'Brak';
  }
}