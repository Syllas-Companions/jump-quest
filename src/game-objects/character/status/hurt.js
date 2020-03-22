import CharStatus from './status'
export default class HurtStatus extends CharStatus {
    constructor(character, duration) {
        super(character, duration);
        this.name = "hurt";
        this.character.faceAscii = "ಠ╭╮ಠ";
    }
    finish() {
        this.character.faceAscii = this.character.metadata.defaultFace;
        super.finish();
    }
}