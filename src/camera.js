export default {
    position: {
        x: 0,
        y: 0
    },
    width: 600,
    height: 400,
    ratio: 1,
    // target: Matter.js' body
    follow: function (target) {
        this.target = target;
    },
    update: function () {
        // move camera toward target's position
        if (this.target) {
            this.position.x += (this.target.position.x - this.position.x) * 0.1;
            this.position.y += (this.target.position.y - this.position.y) * 0.1;
        }

    }
}