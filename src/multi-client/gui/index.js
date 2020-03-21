import MainMenu from './main_menu'
import ChatSystem from './chat_system'
import GameOver from './gameover'

export default {

    init: function(socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        this.mainMenu = MainMenu(socket, clientState, p5Instance);

        this.chatSystem = ChatSystem(socket, clientState, p5Instance);

        this.gameOver = GameOver(socket, clientState, p5Instance);
    },
    showGameOver(){
        this.gameOver.show();
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
        } else {
            this.mainMenu.hide();
        }

    }
}