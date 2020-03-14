export default class CharStatus {
    constructor(character, duration) {
        this.character = character;
        this.name = "basic";
        this.info = "basic status";
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
    simplify() {
        return { name: this.name, info: this.info, active_time: this.active_time, duration: this.duration }
    }
}