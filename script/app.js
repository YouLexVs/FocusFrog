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

document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('decompose-tasks');

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
    document.getElementsByClassName('tasks-loading')[0].classList.add('hidden');
    showTasks(json);
}


const showTasks = (tasks) => {
    const taskList = document.getElementsByClassName("task-list")[0];
    const date = new Date().toISOString();

    tasks.forEach((element, index) => {
        const div = document.createElement("div");
        const elementId = `${date}_${index}`;
        const points = element.priority * element.difficulty;

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
                            <label><input type="checkbox" class="item-box" data-id="${elementId}" />${element.title}<label>
                        </div>
                        <div class="task-attributes">
                            <div class="priority">${priority}</div>
                            <div class="time-consumption">${element.timeConsumption} min</div>
                            <div class="points">+${points}</div>
                        </div>`;

        const checkbox = div.querySelector('input[type="checkbox"]');

        checkbox.addEventListener("change", () => {
            console.log(element);
        })

        taskList.appendChild(div);

        
    });
}