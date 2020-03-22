import ModalBox from './modal'
import SettingMenu from './menu_char_setting'
export default function(socket, clientState, p5Instance) {
    var setting_menu = SettingMenu(socket, clientState, p5Instance);
    var menu = new ModalBox(p5Instance, {
        changed: null,
        isActive: false,
        name: 'Main Menu',
        div: {},
        entries: {
            btnCharSetting: {
                type: 'button',
                label: "Character Setting",
                func: function() {
                    setting_menu.show();
                }
            },
            btnControlSetting: {
                type: 'button',
                label: "Control Setting",
                func: function() {
                    setting_menu.show();
                }
            },
            btnSoundSetting: {
                type: 'button',
                label: "Sound Setting",
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
                    clientState.sendingInput = true;
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
                    clientState.sendingInput = true;
                }
            }
        }
    })
    setting_menu.child(menu);
    return menu
};