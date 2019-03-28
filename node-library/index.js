const { EventEmitter } = require(`events`);
const io = require(`socket.io-client`);

const SOCKET_API_URL = `https://lungers-chat-api.now.sh`;

class LungersChat extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
    }

    connect(name) {
        if (this.socket !== null) throw new Error(`Already connected to chat.`);

        const socket = this.socket = io.connect(SOCKET_API_URL);
        socket.emit(`set-name`, name);

        socket.on(`connect`, () => this.emit(`connect`));
        socket.on(`user-connected`, users => this.emit(`user-connected`, users));
        socket.on(`user-disconnected`, id => this.emit(`user-disconnected`, id));

        socket.on(`message`, message => {
            this.emit(`message`, {
                date: message.date,
                user: message.user,
                text: message.message,
            });
        });
    }

    disconnect() {
        this.socket.disconnect();
        this.socket = null;
    }

    sendMessage(text) {
        this.socket.emit(`message`, text);
    }
}

module.exports = LungersChat;
