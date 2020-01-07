export default {
    position: {
        x: 300,
        y: 200
    },
    target: {
        x: 300,
        y: 200
    },
    width: 600,
    height: 400,
    ratio: 1,
    // target: Matter.js' body
    towards: function (x, y) {
        this.target = { x: x, y: y };
    },
    update: function () {
        // move camera toward target's position
        if (this.target) {
            this.position.x += (this.target.x - this.position.x) * 0.05;
            this.position.y += (this.target.y - this.position.y) * 0.05;
        }

    }
}