import CharStatus from './status'
export default class UserMessage extends CharStatus {
    constructor(character, message) {
        super(character, 4000);
        this.name = "message";
        this.info = message;
    }
    finish() {
        super.finish();
    }
}