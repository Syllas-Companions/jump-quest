export default {
    mainMenuData: {
        div: {},
        buttons: [
            {
                type: 'h1',
                text: "Main Menu"
            },
            {
                type: 'button',
                text: "Setting",
                func: function () {
                    this.menuSetting.show();
                    this.menu.hide();
                }
            },
            {
                type: 'separator'
            },
            {
                type: 'button',
                text: "Back To Lobby",
                func: function () {
                    this.socket.emit('joinGame', 'lobby');
                    this.toggleMenu();
                },
                condition: function () {
                    return this.clientState.mapData.name != 'lobby';
                }
            },
            {
                type: 'button',
                text: "Resume",
                func: function () {
                    this.toggleMenu()
                }
            }
        ]
    },
    settingMenuData: {
        div: {},
        buttons: [
            {
                type: 'h1',
                text: "Setting"
            },
            {
                type: 'button',
                text: "Back",
                func: function () {
                    this.menuSetting.hide();
                    this.menu.show();
                }
            }
        ]
    },
    createMenu(data, parent) {
        let BTN_HEIGHT = 50;
        let BTN_WIDTH = 200;
        let MARGIN = 50;
        let SPACING = 30;
        let div = this.p5.createDiv();
        let lastY = MARGIN;

        data.buttons.forEach(info => {

            // if (info.type == 'button') {
            let btn = this.p5.createElement(info.type, info.text);
            btn.parent(div);
            btn.position(MARGIN, lastY);
            btn.size(BTN_WIDTH, BTN_HEIGHT);
            btn.style('text-align: center')
            if (info.type == 'h1')
                btn.style('color: #FFF')
            if (info.func)
                btn.mousePressed(info.func.bind(this))
            if (info.condition)
                info.condition = info.condition.bind(this)
            info.element = btn;
            lastY += BTN_HEIGHT + SPACING;
            // }
        })
        let w = BTN_WIDTH + MARGIN * 2, h = lastY + MARGIN - SPACING;
        div.size(w, h);
        div.position(
            this.p5.windowWidth / 2 - w / 2,
            this.p5.windowHeight / 2 - h / 2
        )
        div.style('background-color:rgba(17, 30, 108, 0.5)')


        div.parent(parent);
        div.hide();
        data.div = div;
        return div;
    },
    reogarnizeMenu(menu) {
        // recalib width/height/padding
        let BTN_HEIGHT = 50;
        let BTN_WIDTH = 200;
        let MARGIN = 50;
        let SPACING = 30;
        let lastY = MARGIN;
        menu.buttons.forEach(info => {
            if (!info.condition || info.condition()) {
                info.element.position(MARGIN, lastY);
                info.element.size(BTN_WIDTH, BTN_HEIGHT);
                info.element.show();
                lastY += BTN_HEIGHT + SPACING;
            } else if (info.condition && !info.condition()) {
                info.element.hide();
            }
        })

        let w = BTN_WIDTH + MARGIN * 2, h = lastY + MARGIN - SPACING;
        menu.div.size(w, h);
        menu.div.position(
            this.p5.windowWidth / 2 - w / 2,
            this.p5.windowHeight / 2 - h / 2
        )
    },
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
        this.socket.on('userMessage', (data) => {
            this.chatLogContent.html(`<div>[${new Date().toLocaleTimeString('it-IT')}] ${data.userId}: ${data.message} </div>`, true);
            if (this.chatLog.size().height - this.chatLogContent.size().height > 0) {
                this.chatLogContent.position(0, this.chatLog.size().height - this.chatLogContent.size().height);
            } else {
                this.chatLogContent.position(0, 0, 'relative');
                this.chatLog.elt.scrollTop = this.chatLog.elt.scrollHeight
            }
        })
    },
    sendMessage: function (event) {
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
        }
        else {
            this.textInput.elt.removeEventListener("keydown", this.sendMessage);
            this.textInput.hide();
            this.clientState.sendingInput = true;
        }
    },
    init: function (socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        // dark background
        this.backdrop = this.p5.createDiv();
        this.backdrop.position(0, 0)
        this.backdrop.size(this.p5.windowWidth, this.p5.windowHeight)
        this.backdrop.style('display:block')
        this.backdrop.style('background-color:rgba(0, 0, 0, 0.3)')
        this.backdrop.hide();
        this.menuSetting = this.createMenu(this.settingMenuData, this.backdrop);
        this.menu = this.createMenu(this.mainMenuData, this.backdrop);

        this.initChat();
    },
    toggleMenu() {
        this.isMenuOn = !this.isMenuOn;
        if (this.isMenuOn) {
            this.backdrop.show();
            this.menu.show();
            this.menuSetting.hide();
            this.reogarnizeMenu(this.settingMenuData);
            this.reogarnizeMenu(this.mainMenuData);
            this.clientState.sendingInput = false;
        }
        else {
            this.backdrop.hide();
            this.menu.hide();
            this.menuSetting.hide();
            this.clientState.sendingInput = true;
        }

    }
}