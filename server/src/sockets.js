const socketIO = require(`socket.io`);

const users = new Map();

function init(server) {
    const io = socketIO(server);

    io.on(`connection`, socket => {
        socket.once(`set-name`, name => {
            users.set(socket.id, {
                id: socket.id,
                name: name,
            });

            io.emit(`user-connected`, [...users.values()]);
        });

        socket.on(`message`, message => {
            if (users.get(socket.id)) {
                io.emit(`message`, {
                    message: message,
                    user: users.get(socket.id),
                    date: new Date(),
                });
            }
        });

        socket.on(`disconnect`, () => {
            users.delete(socket.id);
            io.emit(`user-disconnected`, socket.id);
        });
    });
}

module.exports = { init };
