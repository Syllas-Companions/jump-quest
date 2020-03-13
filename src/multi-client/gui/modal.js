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
        this.backdrop.style('display:block')
        this.backdrop.style('background-color:rgba(0, 0, 0, 0.3)')
        this.backdrop.hide();
    }
    show() {
        this.reogarnizeMenu();
        this.backdrop.show();
        this.data.div.show();
        this.data.isActive = true;
        if (this.parent) this.parent.hide(false);
    }
    hide(isRecursive=true) {
        this.data.div.hide();
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
        let lastY = MARGIN;
        this.data.buttons.forEach(info => {

            let btn = this.p5.createElement(info.type, info.text);
            btn.parent(div);
            btn.position(MARGIN, lastY);
            btn.size(BTN_WIDTH, BTN_HEIGHT);
            btn.style('text-align: center')
            if (info.type == 'h1')
                btn.style('color: #FFF')
            if (info.func)
                btn.mousePressed(info.func.bind(this))
            if (info.condition)
                info.condition = info.condition.bind(this)
            info.element = btn;
            lastY += BTN_HEIGHT + SPACING;
            // }
        })
        let w = BTN_WIDTH + MARGIN * 2, h = lastY + MARGIN - SPACING;
        div.size(w, h);
        div.position(
            this.p5.windowWidth / 2 - w / 2,
            this.p5.windowHeight / 2 - h / 2
        )
        div.style('background-color:rgba(17, 30, 108, 0.5)')

        div.parent(this.backdrop);
        div.hide();
        this.data.div = div;
        return div;
    }
    reogarnizeMenu() {
        // recalib width/height/padding
        let lastY = MARGIN;
        this.data.buttons.forEach(info => {
            if (!info.condition || info.condition()) {
                info.element.position(MARGIN, lastY);
                info.element.size(BTN_WIDTH, BTN_HEIGHT);
                info.element.show();
                lastY += BTN_HEIGHT + SPACING;
            } else if (info.condition && !info.condition()) {
                info.element.hide();
            }
        })

        let w = BTN_WIDTH + MARGIN * 2, h = lastY + MARGIN - SPACING;
        this.data.div.size(w, h);
        this.data.div.position(
            this.p5.windowWidth / 2 - w / 2,
            this.p5.windowHeight / 2 - h / 2
        )
    }
}