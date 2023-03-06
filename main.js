const taskList = document.querySelector('.tasks-list');
const addForm = document.querySelector('#form')
const taskInput = document.querySelector('#taskInput');
const progressBar = document.querySelector('#progressBar')
const progressBarDone = document.querySelector('#progressBarDone')
const progressBarWork = document.querySelector('#progressBarWork')

let tasksState = []

if (tasksState.length === 0) {
    tasksState = JSON.parse(localStorage.getItem('tasks')) || []
    tasksState?.forEach(t => renderTask(t))
    
} 



addForm.addEventListener('submit', addTask)
taskList.addEventListener('click', deleteTask)
taskList.addEventListener('click', completeTask)
taskList.addEventListener('click', editTask)

function addTask(event) {
    event.preventDefault()

    const taskTitle = taskInput.value

    if (!taskTitle) return

    const newTask = {
        id: String(Date.now()),
        title: taskTitle,
        complete: false
    }


    tasksState.push(newTask)
    renderTask(newTask)
    saveToStorage()

    taskInput.value = ''
    taskInput.focus()

}

function deleteTask(event) {
    if (event.target.dataset.action !== 'delete') return
   
    const {taskId, taskParent} = getTask(event)

    tasksState = tasksState.filter(t => t.id !== taskId)
    saveToStorage()
    taskParent.remove()
}

function completeTask(event) {
    if (event.target.dataset.action !== 'complete') return

    const {taskId, taskParent} = getTask(event)

    const task = tasksState.find(t => t.id === taskId)
    task.complete = !task.complete

    completeRenderButton(taskParent, task)
    saveToStorage()
}

function editTask(event) {
    if (event.target.dataset.action !== 'edit') return

    const {taskId, taskParent} = getTask(event)

    const titleNode = taskParent.querySelector('.task-title')
    const inputNode = document.createElement('input')

    inputNode.classList.add('form-control')
    inputNode.value = titleNode.innerHTML
    taskParent.replaceChild(inputNode, titleNode)

    inputNode.focus()
    inputNode.setSelectionRange(0, inputNode.value.length)

    inputNode.addEventListener('focusout', finishEditing)

    inputNode.addEventListener('keypress', e => {
        if (e.key === 'Enter') finishEditing()
    })

    

    function finishEditing() {
        if (!inputNode.value) {
            inputNode.placeholder = 'Is not be empty'
            return
        }

        inputNode.removeEventListener('focusout', finishEditing)
        inputNode.removeEventListener('keypress', finishEditing)
    
        
        const task = tasksState.find(t => t.id === taskId)
        task.title = inputNode.value
        saveToStorage()

        titleNode.innerHTML = inputNode.value

        inputNode.removeEventListener('focusout', () => {})
        window.removeEventListener('keypress', () => {})

        taskParent.replaceChild(titleNode, inputNode)
        inputNode.remove()
    }

}

function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasksState))
    changeProgressBar()

}

function renderTask(task) {
    const taskHTML = `
        <li class="list-group-item tasks-item d-flex justify-content-between align-items-center" id="${task.id}">
            ${task.complete ? '<span class="badge bg-secondary">Done</span>' : '<span class="badge bg-secondary d-none">Done</span>'}
            <div class="task-title ${task.complete && ' task-title__complete'}">${task.title}</div>
            <div class="task-btns btn-group">
                <button data-action="complete" class="btn ${task.complete ? 'btn-outline-success' : 'btn-success'} task-complete">${task.complete ? 'No completed' : 'Complete'}</button>
                <button data-action="edit" class="task-edit btn btn-warning">Edit</button>
                <button data-action="delete" class="btn btn-danger task-delete">Delete</button>
            </div>
        </li>
    `
    taskList.insertAdjacentHTML('beforeend', taskHTML) 
}

function getTask(event) {
    return {
        taskParent: event.target.closest('.list-group-item'),
        taskId: event.target.closest('.list-group-item').id
    }
}

function completeRenderButton(parent, task) {
    parent.querySelector('.task-title').classList.toggle('task-title__complete')
    parent.querySelector('.task-complete').classList.toggle('btn-success')
    parent.querySelector('.task-complete').classList.toggle('btn-outline-success')
    parent.querySelector('.task-complete').innerHTML = task.complete ? 'No completed' : 'Complete'
    parent.querySelector('.badge').classList.toggle('d-none')
}

function changeProgressBar () {
    if (tasksState.length < 1) {
        setWidthBars(0, 0, false)
    } else {
        const completedTasks = tasksState.filter(t => t.complete === true).length
        const inWorkTasks = tasksState.filter(t => t.complete === false).length 

        setWidthBars(completedTasks, inWorkTasks, true)
    }

    function setWidthBars(done, work, renderText) {

        progressBarDone.style.width = (done / tasksState.length) * 100 + '%'
        progressBarWork.style.width = (work / tasksState.length) * 100 + '%'
        if (renderText) {
            progressBarDone.querySelector('.progress-bar').innerHTML = done + ' completed'
            progressBarWork.querySelector('.progress-bar').innerHTML = work + ' in work'
        } else {
            progressBarDone.querySelector('.progress-bar').innerHTML = ''
            progressBarWork.querySelector('.progress-bar').innerHTML = ''
            progressBarDone.style.width = '0'
            progressBarWork.style.width = '0'
        }
    }
    
    

}


changeProgressBar()