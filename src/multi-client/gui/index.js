import MainMenu from './main_menu'
import ChatSystem from './chat_system'
import GameOver from './gameover'
import RoomChooser from './room_chooser'
export default {

    init: function(socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        this.mainMenu = MainMenu(socket, clientState, p5Instance);

        this.chatSystem = ChatSystem(socket, clientState, p5Instance);

        this.gameOver = GameOver(socket, clientState, p5Instance);

        this.roomChooser = RoomChooser(socket, clientState, p5Instance);

        this.createToggleMenuButton();
    },
    createToggleMenuButton(){
        this.btnToggleMenu = this.p5.createButton('Menu');
        this.btnToggleMenu.position(40,50);
        this.btnToggleMenu.mousePressed(this.toggleMenu.bind(this));
    },
    showGameOver(){
        this.gameOver.show();
    },
    showRoomChooser(){
        this.roomChooser.show();
    },
    update() {
        if(this.clientState.gameState==='gameOver'){
            this.showGameOver();
            this.clientState.sendingInput = false;
            this.clientState.gameState='gameOverModalDisplayed';
        }
        this.chatSystem.updateChatLog();

    },
    toggleChat() {
        this.chatSystem.toggleChat();
    },
    toggleMenu() {
        if (!this.mainMenu.data.isActive) {
            this.mainMenu.show();
            this.clientState.sendingInput = false;
        } else {
            this.mainMenu.hide();
            this.clientState.sendingInput = true;
        }

    }
}