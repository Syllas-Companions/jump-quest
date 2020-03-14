import CharStatus from './status'
var last_id = 0;
export default class UserMessage extends CharStatus {
    constructor(character, message) {
        super(character, 4000);
        this.name = "message";
        this.info = message;
        this.id = last_id;
        last_id += 1;
    }
    finish() {
        super.finish();
    }
    simplify() {
        return Object.assign({ id: this.id }, super.simplify());
    }
}