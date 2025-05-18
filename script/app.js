import { saveTasksToDB, getPoints, getTasksForToday, markTaskDone } from "./db.js";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('[Service worker] Zarejestrowany', reg);

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[Service worker] Nowa wersja dostępna');
              } else {
                console.log('[Service worker] Gotowa do użycia offline');
              }
            }
          };
        };
      })
      .catch((err) => console.error('[Service worker] Rejestracja nie powiodła się', err));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
    const submitBtn = document.getElementById('decompose-tasks');
    const points = await getPoints();

    const pointsCount = document.getElementById('points-count');
    if (pointsCount) pointsCount.textContent = `${points}`;

    const todayTasks = await getTasksForToday();
    if(todayTasks && todayTasks.tasks && todayTasks.tasks.length > 0) {
      document.getElementsByClassName('empty-tasks')[0].classList.add('hidden');
      showTasks(todayTasks.tasks);
    }
    

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const tasks = document.getElementById('task-description').value;

        if (tasks) {
            handleSubmit(tasks);
        }
    })
})

const handleSubmit = async (input) => {
    document.getElementsByClassName('tasks-loading')[0].classList.remove('hidden');
    document.getElementsByClassName('empty-tasks')[0].classList.add('hidden');
    const response = await fetch('http://localhost:3000/decompose', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    });

    if(!response.ok) {
        document.getElementsByClassName('tasks-loading')[0].classList.add('hidden');
        document.getElementsByClassName('empty-tasks')[0].classList.remove('hidden');
    }

    const json = await response.json();
    const today = new Date().toISOString().split("T")[0];
    const jsonWithDone = json.map(task => ({
      ...task,
      done: false 
    }));
    await saveTasksToDB(today, jsonWithDone);
    document.getElementsByClassName('tasks-loading')[0].classList.add('hidden');
    showTasks(jsonWithDone);

}


const showTasks = (tasks) => {
    const taskList = document.getElementsByClassName("task-list")[0];
    const date = new Date().toISOString().split('T')[0]; 

    tasks.forEach((element, index) => {
        const div = document.createElement("div");
        const elementId = `${date}_${index}`;
        const points = element.priority * element.difficulty;
        const isDone = element.done ? 'checked' : '';

        let priority;

        switch(element.priority) {
            case 1:
                priority = 'niski';
                break;
            case 2:
                priority = 'średni';
                break;
            case 3:
                priority = 'wysoki';
                break;
            default:
                priority = 'brak';
                break;
        }

        div.setAttribute('class', 'task-item');
        div.setAttribute('data-id', elementId);

        div.innerHTML = `<div class="checkbox-group">
                            <label><input type="checkbox" class="item-box" data-id="${elementId}" ${isDone} />${element.title}<label>
                        </div>
                        <div class="task-attributes">
                            <div class="priority">${priority}</div>
                            <div class="time-consumption">${element.timeConsumption} min</div>
                            <div class="points">+${points}</div>
                        </div>`;

        const checkbox = div.querySelector('input[type="checkbox"]');

        checkbox.addEventListener("change", async () => {
            await markTaskDone(date, elementId, element.priority, element.difficulty);

            const updatedPoints = await getPoints();
            const pointsCount = document.getElementById('points-count');
            if (pointsCount) pointsCount.textContent = `${updatedPoints}`;
        })

        taskList.appendChild(div);

        
    });
}