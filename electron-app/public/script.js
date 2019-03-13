const io = require(`socket.io-client`);

const SOCKET_API_URL = `http://localhost:5000`;

const nameElement = document.querySelector(`.log-in #name`);
const continueButton = document.querySelector(`.log-in button`);
const chatArea = document.querySelector(`.chat-area`);
const messagesElement = document.querySelector(`.messages`);
const usersElement = document.querySelector(`.users`);
const messageElement = document.querySelector(`#message-content`);
const sendButton = document.querySelector(`.send-message button`);

if (localStorage.name) {
    nameElement.value = localStorage.name;
}

continueButton.addEventListener(`click`, () => {
    if (!nameElement.value) {
        return nameElement.classList.add(`is-invalid`);
    }

    continueButton.parentElement.style.display = `none`;
    chatArea.style.display = `block`;
    localStorage.name = nameElement.value;
    connect();
});

window.addEventListener(`keyup`, e => {
    if (e.ctrlKey && e.keyCode === 46) {
        localStorage.messages = `[]`;
    }
});

messageElement.addEventListener(`keydown`, e => {
    if (!e.ctrlKey && !e.shiftKey && e.keyCode === 13) {
        e.preventDefault();
    }
});

messageElement.addEventListener(`keyup`, e => {
    if (!e.ctrlKey && !e.shiftKey && e.keyCode === 13) {
        sendButton.click();
    }
});

function addMessage(user, message, background = `light`, text = `black`) {
    const div = document.createElement(`div`);
    div.className = `message bg-${background} text-${text} rounded pl-3 py-2 mt-2`;
    div.innerText = message;

    const nameDiv = document.createElement(`div`);
    nameDiv.className = `font-weight-bold`;
    nameDiv.innerText = user;

    div.prepend(nameDiv);
    messagesElement.appendChild(div);

    messagesElement.scrollTop = messagesElement.scrollHeight - messagesElement.clientHeight;
}

function addUsers(users) {
    usersElement.innerHTML = ``;

    users.forEach(user => {
        const div = document.createElement(`li`);
        div.className = `list-group-item`;
        div.id = user.id;
        div.innerText = user.name;
        usersElement.appendChild(div);
    });
}

function connect() {
    const socket = io.connect(SOCKET_API_URL);
    let connected = false;

    socket.on(`connect`, () => {
        socket.emit(`set-name`, nameElement.value);
        messagesElement.innerHTML = ``;
        addMessage(`Status`, `Connected`, `info`, `white`);

        if (localStorage.messages) {
            const messages = JSON.parse(localStorage.messages);

            messages.forEach(({ user, message, date }) => {
                const localeDate = new Date(date).toLocaleString();
                addMessage(`${user.name} (${localeDate})`, message);
            });
        }
    });

    socket.on(`user-connected`, users => {
        if (connected) {
            addMessage(`Info`, `User joined`, `info`, `white`);
        }

        connected = true;
        addUsers(users);
    });

    socket.on(`user-disconnected`, id => {
        addMessage(`Info`, `User left`, `info`, `white`);

        const user = [...usersElement.children]
            .find(user => user.id === id);

        if (user) {
            user.remove();
        }
    });

    socket.on(`message`, ({ user, message, date }) => {
        if (message !== ``) {
            const localeDate = new Date(date).toLocaleString();
            addMessage(`${user.name} (${localeDate})`, message);

            const messages = JSON.parse(localStorage.messages || `[]`);
            messages.push({ user, message, date });
            localStorage.messages = JSON.stringify(messages);
        }
    });

    sendButton.addEventListener(`click`, () => {
        if (messageElement.value !== ``) {
            socket.emit(`message`, messageElement.value);
            messageElement.value = ``;
        }

        messageElement.focus();
    });
}
