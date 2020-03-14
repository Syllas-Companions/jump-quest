import ModalBox from './modal'

export default function (socket, clientState, p5Instance) {
    var menu = new ModalBox(p5Instance,{
            div: {},
            name: 'Setting',
            entries: [
                {
                    type: 'text',
                    label: 'Name',
                },
                {
                    type: 'option',
                    label: 'Default Face',
                    options: [
                        '⚆  v  ⚆',
                        '◕‿‿◕',
                        '☉ヮ⚆',
                    ],
                    selectedIndex: 0
                },
                {
                    type: 'color',
                    label: 'Color',
                },
                {
                    type: 'button',
                    label: "Back",
                    func: function () {
                        menu.hide(false);
                    }
                }
            ]
        })
    return menu
};