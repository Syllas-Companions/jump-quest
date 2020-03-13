import ModalBox from './modal'
import SettingMenu from './setting_menu'
export default function (socket, clientState, p5Instance) {
    var setting_menu = SettingMenu(socket, clientState, p5Instance);
    var menu = new ModalBox(p5Instance,{
        changed: null,
        isActive: false,
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
                    setting_menu.show();
                }
            },
            {
                type: 'separator'
            },
            {
                type: 'button',
                text: "Back To Lobby",
                func: function () {
                    socket.emit('joinGame', 'lobby');
                    menu.hide();
                },
                condition: function () {
                    return clientState.mapData.name != 'lobby';
                }
            },
            {
                type: 'button',
                text: "Resume",
                func: function () {
                    menu.hide();
                }
            }
        ]
    })
    setting_menu.child(menu);
    return menu
};