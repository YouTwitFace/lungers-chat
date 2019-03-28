# Lungers Chat

> A web-based chat app using web sockets.

## Properties

### `socket: null | SocketIOClient.Socket`

The connection to the socket api.

## Methods

### `connect(name: string)`

Connect to the chat with `name`.

### `disconnect()`

Disconnect from the chat.

### `sendMessage(text: string)`

Send a `text` to the chat.

## Example

```javascript
const LungersChat = require('lungers-chat');
const chat = new LungersChat();

chat.connect('Lungers Chat Bot');

chat.on('message', message => {
    if (chat.socket.id !== message.user.id) {
        if (message.text === '!ping') {
            chat.sendMessage('Pong!');
        } else if (message.text === '!disconnect') {
            chat.sendMessage('Disconnecting...');
            chat.disconnect();
        } else if (message.text.startsWith('!name ')) {
            const name = message.text.slice('!name '.length);

            chat.disconnect();
            chat.connect(name);
            chat.sendMessage(`Changed name to "${name}"`);
        }
    }
});
```
