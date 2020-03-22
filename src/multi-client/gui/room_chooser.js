import ModalBox from './modal'
export default function(socket, clientState, p5Instance) {
    var menu = new ModalBox(p5Instance, {
        changed: null,
        isActive: false,
        name: 'Main Menu',
        onLoad: function() {
            menu.data.entries.name.value("room1");
        },
        div: {},
        entries: {
            name: {
                type: 'text',
                label: 'Room name',
            },
            mode: {
                type: 'option',
                label: 'Game mode',
                options: [
                    'Tower explorers',
                    'Fight for the height',
                    'Run for your life',
                ],
                useIndex: true,
                selectedIndex: 0
            },
            btnJoin: {
                type: 'button',
                label: "Join/Create room",
                func: function() {
                    let { name, mode } = menu.data.entries;
                    socket.emit('responseRoomName', name.value(), mode.value());
                    clientState.keyState = {}
                    menu.hide();
                    clientState.sendingInput = true;
                }
            },
            btnLobby: {
                type: 'button',
                label: "Back To Lobby",
                func: function() {
                    socket.emit('joinRoom', 'lobby');
                    menu.hide();
                    clientState.sendingInput = true;
                }
            },
        }
    })
    return menu
};