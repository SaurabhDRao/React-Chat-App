const io = require("./index").io

const {
    VERIFY_USER,
    USER_CONNECTED,
    USER_DISCONNECTED,
    LOGOUT,
    TYPING,
    COMMUNITY_CHAT,
    PRIVATE_MESSAGE,
    MESSAGE_RECEIVED,
    MESSAGE_SENT,
    NEW_CHAT_USER
} = require("../Events");

const {
    createUser,
    createMessage,
    createChat
} = require("../Factories");

let connectedUsers = {}
let communityChat = createChat({ isCommunity: true })

module.exports = function(socket){
    console.log("Socket ID: " + socket.id);

    let sendMessageToChatFromUser;
    let sendTypingFromUser;

    //verify username
    socket.on(VERIFY_USER, (nickname, callback) => {
        if(isUser(connectedUsers, nickname)){
            callback({ isUser: true, user: null });
        } else {
            callback({ isUser: false, user: createUser({ name: nickname, socketId: socket.id }) });
        }
    })

    //user connects with username
    socket.on(USER_CONNECTED, (user) => {
        user.socketId = socket.id;
        connectedUsers = addUser(connectedUsers, user);
        socket.user = user;
        sendMessageToChatFromUser = sendMessageToChat(user.name);
        sendTypingFromUser = sendTypingToChat(user.name)
        io.emit(USER_CONNECTED, connectedUsers);
        console.log(connectedUsers);
    });

    //user disconnects
    socket.on("disconnect", () => {
        if("user" in socket){
            connectedUsers = removeUser(connectedUsers, socket.user.name);
            io.emit(USER_DISCONNECTED, connectedUsers);
            console.log("Disconnect", connectedUsers);
        }
    });

    //User logsout
	socket.on(LOGOUT, () => {
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit(USER_DISCONNECTED, connectedUsers)
		console.log("Disconnect", connectedUsers);
	})

    //Get Community Chat
	socket.on(COMMUNITY_CHAT, (callback) => {
		callback(communityChat)
    })

    socket.on(MESSAGE_SENT, ({chatId, message})=>{
		sendMessageToChatFromUser(chatId, message)
    });
    
    //typing
    socket.on(TYPING, ({ chatId, isTyping }) => {
        sendTypingFromUser(chatId, isTyping);
    });

    socket.on(PRIVATE_MESSAGE, ({ receiver, sender, activeChat }) => {
        if(receiver in connectedUsers){
            const receiverSocket = connectedUsers[receiver].socketId;
            if(activeChat === null || activeChat.id === communityChat.id){
                const newChat = createChat({ name: `${ receiver } & ${ sender }`, users: [receiver, sender] });
                socket.to(receiverSocket).emit(PRIVATE_MESSAGE, newChat);
                socket.emit(PRIVATE_MESSAGE, newChat);
            } else {
                if(!(receiver in activeChat.users)){
                    activeChat.users
                        .filter(user => user in connectedUsers)
                        .map(user => connectedUsers[user])
                        .map(user => {
                            socket.to(user.socketId).emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: receiver });
                        });
                    socket.emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: receiver });
                }
                socket.to(receiverSocket).emit(PRIVATE_MESSAGE, activeChat);
            }
        }
    });

    //send typing to chat
    function sendTypingToChat(user) {
        return (chatId, isTyping) => {
            io.emit(`${ TYPING } - ${ chatId }`, { user, isTyping });
        }
    }
    
    //send message
    function sendMessageToChat(sender) {
        return (chatId, message) => {
            io.emit(`${ MESSAGE_RECEIVED } - ${ chatId }`, createMessage({ message, sender }))
        }
    }

    //add user to list
    function addUser(userList, user){
        let newList = Object.assign({}, userList);
        newList[user.name] = user;
        return newList;
    }

    //remove user from user list
    function removeUser(userList, username){
        let newList = Object.assign({}, userList);
        delete newList[username];
        return newList;
    }

    //check if the user is in the list
    function isUser(userList, username) {
        return username in userList;
    }

}