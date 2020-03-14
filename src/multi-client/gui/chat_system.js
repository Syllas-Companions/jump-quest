var chat_system = {
    initChat() {
        this.chatLog = this.p5.createDiv();
        let PADDING = 20;
        let w = Math.max(this.p5.windowWidth / 3, 400);
        let h = Math.max(this.p5.windowHeight / 4, 200);

        this.chatLog.position(PADDING, this.p5.windowHeight - h - PADDING)
        this.chatLog.size(w, h)
        this.chatLog.style('overflow: auto')
        this.chatLog.style('background-color:rgba(0, 0, 0, 0.2)')

        this.chatLogContent = this.p5.createDiv();
        this.chatLogContent.parent(this.chatLog);

        this.textInput = this.p5.createInput();
        let w2 = this.p5.windowWidth - w - PADDING * 3
        let h2 = this.textInput.size().height;
        this.textInput.position(w + PADDING * 2, this.p5.windowHeight - h2 - PADDING - 5)
        this.textInput.size(w2, h2);
        // console.log(this.textInput);
        this.textInput.hide();
        this.sendMessage = this.sendMessage.bind(this);
    },
    updateChatLog: function() {
        // console.log(this.clientState.messageSystem.newMessages);
        this.clientState.messageSystem.newMessages.forEach(m => this.addEntryChatLog(m));
        this.clientState.messageSystem.newMessages = [];
    },
    addEntryChatLog: function(message) {
        this.chatLogContent.html(`<div>[${new Date(message.time).toLocaleTimeString('it-IT')}] ${message.name}: ${message.content} </div>`, true);
        if (this.chatLog.size().height - this.chatLogContent.size().height > 0) {
            this.chatLogContent.position(0, this.chatLog.size().height - this.chatLogContent.size().height);
        } else {
            this.chatLogContent.position(0, 0, 'relative');
            this.chatLog.elt.scrollTop = this.chatLog.elt.scrollHeight
        }

    },
    sendMessage: function(event) {
        // event.preventDefault();
        if (event.keyCode === 13) {
            // send
            if (this.textInput.value() != "") {
                this.socket.emit('userMessage', this.textInput.value());
                this.textInput.value('');
            }

        };
    },
    toggleChat() {
        this.isChatOn = !this.isChatOn;
        if (this.isChatOn) {
            this.textInput.show();
            this.textInput.elt.focus();
            this.textInput.elt.addEventListener("keydown", this.sendMessage);
            this.clientState.sendingInput = false;
        } else {
            this.textInput.elt.removeEventListener("keydown", this.sendMessage);
            this.textInput.hide();
            this.clientState.sendingInput = true;
        }
    },
    init: function(socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        this.initChat();
    }
}
export default function(socket, clientState, p5Instance) {
    chat_system.init(socket, clientState, p5Instance)
    return chat_system;
}