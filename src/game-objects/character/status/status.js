export default class CharStatus {
    constructor(character, duration) {
        this.character = character;
        this.duration = duration;
        this.active_time = Date.now();
    }
    update() {
        if (Date.now() - this.active_time > this.duration) {
            this.finish();
        }
    }
    finish() {
        if (this.character && this.character.statuses) {
            let index = this.character.statuses.indexOf(this)
            this.character.statuses.splice(index, 1);
        }
    }
}