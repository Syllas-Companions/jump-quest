import ModalBox from './modal'

export default function(socket, clientState, p5Instance) {
    var menu = new ModalBox(p5Instance, {
        changed: null,
        isActive: false,
        name: 'Game Over',
        div: {},
        entries: {
            btnLobby: {
                type: 'button',
                label: "Back To Lobby",
                func: function() {
                    socket.emit('joinGame', 'lobby');
                    clientState.sendingInput = true;
                    menu.hide();
                },
                condition: function() {
                    return clientState.mapData.name != 'lobby';
                }
            }
        }
    })
    return menu
};