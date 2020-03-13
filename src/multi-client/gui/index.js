import MainMenu from './main_menu'
import ChatSystem from './chat_system'
export default {

    init: function (socket, clientState, p5Instance) {
        this.socket = socket;
        this.clientState = clientState;
        this.p5 = p5Instance;

        this.mainMenu = MainMenu(socket, clientState, p5Instance);

        this.chatSystem = ChatSystem(socket, clientState, p5Instance);
    },
    toggleChat() {
        this.chatSystem.toggleChat();
    },
    toggleMenu() {
        if (!this.mainMenu.data.isActive) {
            this.mainMenu.show();
        }
        else {
            this.mainMenu.hide();
        }

    }
}