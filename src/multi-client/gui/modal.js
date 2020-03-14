let BTN_HEIGHT = 50;
let BTN_WIDTH = 200;
let MARGIN = 50;
let SPACING = 30;
export default class ModalBox {

    constructor(p5, data) {
        this.data = data;
        this.p5 = p5;
        this.createBackdrop();
        this.createMenu();
    }
    child(parent) {
        this.parent = parent;
        if (!this.parent.children) {
            this.parent.children = []
        }
        this.parent.children.push(this);
    }
    createBackdrop() {
        // dark background
        this.backdrop = this.p5.createDiv();
        this.backdrop.position(0, 0)
        this.backdrop.size(this.p5.windowWidth, this.p5.windowHeight)
        this.backdrop.addClass('backdrop')
        this.backdrop.hide();
        this.menuContainer = this.p5.createDiv()
        this.menuContainer.addClass('menu-container')
        this.menuContainer.parent(this.backdrop)
    }
    show() {
        this.reogarnizeMenu();
        this.backdrop.style('display: table')
            // this.data.div.show();
        this.data.isActive = true;
        if (this.parent) this.parent.hide(false);
    }
    hide(isRecursive = true) {
        // this.data.div.hide();
        this.backdrop.hide();
        if (this.parent && !isRecursive) this.parent.show();
        if (this.children && isRecursive) {
            this.data.isActive = false;
            this.children.forEach(m => m.hide(isRecursive));
        }
    }
    accept() {
        if (this.data.changed) this.data.changed();
        this.hide();
    }
    createMenu() {
        let div = this.p5.createDiv();
        div.addClass('menu')
            // let lastY = MARGIN;
        let title = this.p5.createElement('h1', this.data.name);
        title.parent(div);
        // title.position(MARGIN, lastY);
        // title.size(BTN_WIDTH, BTN_HEIGHT);
        title.addClass('menu-header')

        // lastY += BTN_HEIGHT + SPACING
        this.data.entries.forEach(info => {
            let ele = null;
            switch (info.type) {
                case 'text':
                    {
                        ele = this.p5.createDiv();
                        let label = this.p5.createDiv(info.label);
                        label.addClass('menu-label')
                        label.parent(ele);
                        let text = this.p5.createInput('', 'text');
                        text.addClass('menu-input')
                        text.parent(ele);
                        info.value = text.value.bind(text);
                        break;
                    }
                case 'option':
                    {
                        ele = this.p5.createDiv();
                        let label = this.p5.createDiv(info.label);
                        label.addClass('menu-label')
                        label.parent(ele);

                        let radio = this.p5.createRadio();
                        info.options.forEach(e => {
                            radio.option(e)
                        });
                        radio.value(info.options[0]);
                        radio.parent(ele);
                        //encloseEachInputLabelPairIntoASubDiv
                        {
                            const inputs = this.p5.selectAll('input', radio),
                                labels = this.p5.selectAll('label', radio),
                                len = inputs.length;

                            for (let i = 0; i < len; ++i) {
                                this.p5.createDiv().parent(radio).child(inputs[i]).child(labels[i]);
                                labels[i].addClass('menu-radio-label')
                            }
                            radio._getInputChildrenArray = function() {
                                return this.elt.getElementsByTagName('input');
                            }
                        }
                        info.value = radio.value.bind(radio);
                        break;
                    }
                case 'color':
                    {
                        ele = this.p5.createDiv();
                        let label = this.p5.createDiv(info.label);
                        label.addClass('menu-label')
                        label.parent(ele);
                        let input = this.p5.createInput('#default color here', 'color');
                        input.addClass('menu-input')
                        input.parent(ele);
                        info.value = input.value.bind(input);
                        break;
                    }
                case 'button':
                default:
                    {
                        ele = this.p5.createElement(info.type, info.label);
                        ele.addClass('menu-button')
                        if (info.func)
                            ele.mousePressed(info.func.bind(this))
                        if (info.condition)
                            info.condition = info.condition.bind(this)
                        break;
                    }
            }
            ele.addClass('menu-entry')
            ele.parent(div);
            info.element = ele;
            // lastY += BTN_HEIGHT + SPACING;
            // }
        })

        div.parent(this.menuContainer);
        // div.hide();
        this.data.div = div;
        return div;
    }
    reogarnizeMenu() {
        // recalib width/height/padding
        // let lastY = MARGIN + BTN_HEIGHT + SPACING;
        this.data.entries.forEach(info => {
            if (!info.condition || info.condition()) {
                // info.element.position(MARGIN, lastY);
                info.element.show();
                console.log(info.element.size())
                console.log(info.element.elt.height)

                // info.element.size(BTN_WIDTH, this.p5.AUTO);
                // lastY += BTN_HEIGHT + SPACING;
            } else if (info.condition && !info.condition()) {
                info.element.hide();
            }
        })

        // let w = BTN_WIDTH + MARGIN * 2,
        //     h = lastY + MARGIN - SPACING;
        // this.data.div.size(w, h);
        // this.data.div.position(
        //     this.p5.windowWidth / 2 - w / 2,
        //     this.p5.windowHeight / 2 - h / 2
        // )
    }
}