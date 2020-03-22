import MainMenu from './menu_main'
import ChatSystem from './chat_system'
import GameOver from './gameover'
import RoomChooser from './room_chooser'
export default {

    init: function (socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        this.mainMenu = MainMenu(socket, clientState, p5Instance);

        this.chatSystem = ChatSystem(socket, clientState, p5Instance);
        this.chatSystem.onCancel = () => {
            this.chatSystem.hide();
        }
        this.gameOver = GameOver(socket, clientState, p5Instance);

        this.roomChooser = RoomChooser(socket, clientState, p5Instance);

        this.menuList = new Map();
        this.menuList.set("main", this.mainMenu);
        this.menuList.set("chat", this.chatSystem);
        this.menuList.set("gameOver", this.gameOver);
        this.menuList.set("roomChooser", this.roomChooser);

        this.createToggleMenuButton();
    },
    escHandler() {
        let hasMenuOn = false;
        this.menuList.forEach((menu, name) => {
            if (menu.isActive) {
                this.setActive(name, false);
                if (menu.cancel) menu.cancel();
                hasMenuOn = true;
            }
        });
        if (!hasMenuOn) {
            this.setActive('main', true);
        }
    },
    setActive(menuName, isActive = true) {
        let e = this.menuList.get(menuName);
        if (isActive)
            e.show();
        else
            e.hide();
        this.clientState.sendingInput = !isActive;
    },
    keyPressed(keyCode) {
        if (keyCode === this.p5.ESCAPE) {
            this.escHandler();
            // if (this.chatSystem.isChatOn)
            //     this.toggleChat()
            // else
            //     this.toggleMenu();
        }
        if (keyCode === this.p5.ENTER) {
            // console.log(clientState.messageSystem);
            if (this.menuList.get('chat').isActive) {
                this.setActive('chat', false);
            } else this.setActive('chat', true);

        }
    },
    createToggleMenuButton() {
        this.btnToggleMenu = this.p5.createButton('Menu');
        this.btnToggleMenu.position(40, 50);
        this.btnToggleMenu.mousePressed(this.toggleMenu.bind(this));
    },
    showGameOver() {
        this.gameOver.show();
    },
    showRoomChooser() {
        this.roomChooser.show();
    },
    update() {
        if (this.clientState.gameState === 'gameOver') {
            this.showGameOver();
            this.clientState.sendingInput = false;
            this.clientState.gameState = 'gameOverModalDisplayed';
        }
        this.chatSystem.updateChatLog();

    },
    toggleMenu() {
        if (!this.mainMenu.isActive) {
            this.setActive('main', true);
        } else {
            this.setActive('main', false);
        }

    }
}