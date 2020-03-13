import ModalBox from './modal'

export default function (socket, clientState, p5Instance) {
    var menu = new ModalBox(p5Instance,{
            div: {},
            buttons: [
                {
                    type: 'h1',
                    text: "Setting"
                },
                {
                    type: 'button',
                    text: "Back",
                    func: function () {
                        menu.hide(false);
                    }
                }
            ]
        })
    return menu
};