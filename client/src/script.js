import io from 'socket.io-client';

const SOCKET_API_URL = `http://localhost:5000`;

const nameElement = document.querySelector(`.log-in #name`);
const continueButton = document.querySelector(`.log-in button`);
const chatArea = document.querySelector(`.chat-area`);
const messagesElement = document.querySelector(`.messages`);
const usersElement = document.querySelector(`.users`);
const messageElement = document.querySelector(`#message-content`);
const sendButton = document.querySelector(`.send-message button`);

continueButton.addEventListener(`click`, () => {
    if (!nameElement.value) {
        return nameElement.classList.add(`is-invalid`);
    }

    continueButton.parentElement.style.display = `none`;
    chatArea.style.display = `block`;
    connect();
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
}

function addUsers(users) {
    usersElement.innerHTML = ``;

    Object.values(users)
        .forEach(user => {
            const div = document.createElement(`li`);
            div.className = `list-group-item`;
            div.id = user.id;
            div.innerText = user.name;
            usersElement.appendChild(div);
        });
}

function connect() {
    const socket = io.connect(SOCKET_API_URL);
    socket.emit(`set-name`, nameElement.value);

    socket.on(`connect`, () => {
        messagesElement.innerHTML = ``;
        addMessage(`Status`, `Connected`, `info`, `white`);
    });

    socket.on(`user-connected`, addUsers);

    socket.on(`user-disconnected`, id => {
        const user = document.querySelector(`#${id}`);

        if (user) {
            user.remove();
        }
    });

    socket.on(`message`, ({ user, message }) => {
        addMessage(user.name, message);
    });

    sendButton.addEventListener(`click`, () => {
        socket.emit(`message`, messageElement.value);
        messageElement.value = ``;
        messageElement.focus();
    });
}
