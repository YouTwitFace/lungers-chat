const socketIO = require(`socket.io`);

const users = {};

function init(server) {
    const io = socketIO(server);

    io.on(`connection`, socket => {
        socket.once(`set-name`, name => {
            users[socket.id] = {
                id: socket.id,
                name: name,
            };

            io.emit(`user-connected`, users);
        });

        socket.on(`message`, message => {
            if (users[socket.id]) {
                io.emit(`message`, {
                    message: message,
                    user: users[socket.id],
                    date: new Date(),
                });
            }
        });

        socket.on(`disconnect`, () => {
            delete users[socket.id];
            io.emit(`user-disconnected`, socket.id);
        });
    });
}

module.exports = { init };
