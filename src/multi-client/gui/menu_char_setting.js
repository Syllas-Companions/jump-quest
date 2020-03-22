import ModalBox from './modal'

export default function(socket, clientState, p5Instance) {
    var menu = new ModalBox(p5Instance, {
        div: {},
        name: 'Character Setting',
        onLoad: function() {
            menu.entries.name.value(clientState.characterData.name);
            menu.entries.defaultFace.value(clientState.characterData.defaultFace);
            menu.entries.color.value(clientState.characterData.color);
        },
        entries: {
            name: {
                type: 'text',
                label: 'Name',
            },
            defaultFace: {
                type: 'option',
                label: 'Default Face',
                options: [
                    '⚆  v  ⚆',
                    '◕‿‿◕',
                    '☉ヮ⚆',
                ],
                selectedIndex: 0
            },
            color: {
                type: 'color',
                label: 'Color',
            },
            btnSave: {
                type: 'button',
                label: "Save",
                func: function() {
                    let { name, defaultFace, color } = menu.entries;
                    let characterData ={
                        name: name.value(),
                        defaultFace: defaultFace.value(),
                        color: color.value()
                    };
                    localStorage.setItem('characterData', JSON.stringify(characterData))
                    socket.emit('updateCharacterData', characterData)
                }
            },
            btnBack: {
                type: 'button',
                label: "Back",
                func: function() {
                    menu.hide(false);
                }
            }
        }
    })
    return menu
};