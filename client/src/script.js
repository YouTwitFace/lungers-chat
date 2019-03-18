import io from 'socket.io-client';
import xss from 'xss';
import markdown from './markdown';

const SOCKET_API_URL = `http://localhost:5000`;

const nameElement = document.querySelector(`.log-in #name`);
const continueButton = document.querySelector(`.log-in button`);
const chatArea = document.querySelector(`.chat-area`);
const messagesElement = document.querySelector(`.messages`);
const usersElement = document.querySelector(`.users`);
const messageElement = document.querySelector(`#message-content`);
const sendButton = document.querySelector(`.send-message button`);

if (window.Notification && Notification.permission === `default`) {
    Notification.requestPermission();
}

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
    const parsedMessage = markdown.render(xss(message)).replace(/^<p>([\s\S]+)<\/p>/, `$1`);

    const div = document.createElement(`div`);
    div.className = `message bg-${background} text-${text} rounded pl-3 py-2 mt-2`;
    div.innerHTML = parsedMessage;

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

function notify(user, message) {
    if (!window.Notification || document.hasFocus()) return;
    else if (Notification.permission === `default`) {
        Notification.requestPermission(() => notify(user, message));
    } else if (Notification.permission !== `denied`) {
        const notification = new Notification(`New Message`, {
            body: `${user}: ${message}`,
        });

        notification.onclick = () => (window.focus(), notification.close());
    }
}

function connect() {
    const socket = io.connect(SOCKET_API_URL);
    socket.emit(`set-name`, nameElement.value);

    socket.on(`connect`, () => {
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

    socket.on(`user-connected`, addUsers);

    socket.on(`user-disconnected`, id => {
        const user = document.querySelector(`#${id}`);

        if (user) {
            user.remove();
        }
    });

    socket.on(`message`, ({ user, message, date }) => {
        const localeDate = new Date(date).toLocaleString();
        addMessage(`${user.name} (${localeDate})`, message);

        if (user.id !== socket.id) {
            notify(user.name, message);
        }

        const messages = JSON.parse(localStorage.messages || `[]`);
        messages.push({ user, message, date });
        localStorage.messages = JSON.stringify(messages);
    });

    sendButton.addEventListener(`click`, () => {
        socket.emit(`message`, messageElement.value);
        messageElement.value = ``;
        messageElement.focus();
    });
}
