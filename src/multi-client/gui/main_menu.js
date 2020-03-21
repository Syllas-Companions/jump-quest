import ModalBox from './modal'
import SettingMenu from './setting_menu'
export default function(socket, clientState, p5Instance) {
    var setting_menu = SettingMenu(socket, clientState, p5Instance);
    var menu = new ModalBox(p5Instance, {
        changed: null,
        isActive: false,
        name: 'Main Menu',
        div: {},
        entries: {
            btnSetting: {
                type: 'button',
                label: "Setting",
                func: function() {
                    setting_menu.show();
                }
            },
            btnLobby: {
                type: 'button',
                label: "Back To Lobby",
                func: function() {
                    socket.emit('joinRoom', 'lobby');
                    menu.hide();
                },
                condition: function() {
                    return clientState.mapData.name != 'lobby';
                }
            },
            btnResume: {
                type: 'button',
                label: "Resume",
                func: function() {
                    menu.hide();
                }
            }
        }
    })
    setting_menu.child(menu);
    return menu
};