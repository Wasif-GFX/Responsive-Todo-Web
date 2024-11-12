const firebaseConfig = {
    apiKey: "AIzaSyAQEwQGFh7TsS-Ie5en8zCrpBRsILoEDP0",
    authDomain: "todoweb-pk.firebaseapp.com",
    databaseURL: "https://todoweb-pk-default-rtdb.firebaseio.com",
    projectId: "todoweb-pk",
    storageBucket: "todoweb-pk.firebasestorage.app",
    messagingSenderId: "711376657235",
    appId: "1:711376657235:web:89eb43a4f3941a7e921fa6",
    measurementId: "G-SX9HSZS2CL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

function toggleForms() {
    document.getElementById('login-container').style.display =
        document.getElementById('login-container').style.display === 'none' ? 'block' : 'none';
    document.getElementById('signup-container').style.display =
        document.getElementById('signup-container').style.display === 'none' ? 'block' : 'none';
}

function signUp() {
    const email = document.getElementById('signEmail').value;
    const password = document.getElementById('signPas').value;
    const confirmPassword = document.getElementById('signCpas').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            database.ref('users/' + user.uid).set({
                email: user.email,
                tasks: []
            });
            alert('Sign up successful');
            toggleForms();
        })
        .catch(error => {
            console.error('Sign Up Error:', error.message);
            alert(error.message);
        });
}

function logIn() {
    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPas').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert('Login successful');
            showTodoContainer();
        })
        .catch(error => {
            console.error('Login Error:', error.message);
            alert(error.message);
        });
}

auth.onAuthStateChanged(user => {
    if (user) {
        showTodoContainer();
        loadTasks();
    } else {
        showAuthContainer();
    }
});

function showTodoContainer() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('todo-container').style.display = 'block';
}

function showAuthContainer() {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('todo-container').style.display = 'none';
}

function addTask() {
    const taskInput = document.getElementById('input');
    const task = taskInput.value;

    if (task && auth.currentUser) {
        const userId = auth.currentUser.uid;
        const taskId = database.ref('tasks/' + userId).push().key;

        database.ref('tasks/' + userId + '/' + taskId).set({
            task: task,
            timestamp: Date.now()
        });

        addTaskToDOM(taskId, task);
        taskInput.value = ''; // Clear input field after adding a task
    } else {
        alert('Please enter a task or log in.');
    }
}

function loadTasks() {
    const userId = auth.currentUser.uid;
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear previous tasks
    database.ref('tasks/' + userId).once('value', snapshot => {
        const tasks = snapshot.val();
        if (tasks) {
            Object.keys(tasks).forEach(taskId => {
                addTaskToDOM(taskId, tasks[taskId].task);
            });
        }
    });
}

function addTaskToDOM(taskId, task) {
    const liElement = document.createElement('li');
    liElement.textContent = task;
    liElement.setAttribute('data-id', taskId);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editTask(taskId);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(taskId);

    liElement.appendChild(editButton);
    liElement.appendChild(deleteButton);

    document.getElementById('task-list').appendChild(liElement);
}

function deleteTask(taskId) {
    const userId = auth.currentUser.uid;
    database.ref('tasks/' + userId + '/' + taskId).remove();
    document.querySelector(`li[data-id='${taskId}']`).remove();
}

function editTask(taskId) {
    const newTask = prompt('Enter new task:');
    if (newTask) {
        const userId = auth.currentUser.uid;
        database.ref('tasks/' + userId + '/' + taskId).update({
            task: newTask
        });
        document.querySelector(`li[data-id='${taskId}']`).firstChild.textContent = newTask;
    }
}

function deleteAllTasks() {
    const userId = auth.currentUser.uid;
    database.ref('tasks/' + userId).remove();
    document.getElementById('task-list').innerHTML = '';
}

function logOut() {
    auth.signOut().then(() => {
        alert('Logged out');
    });
}
