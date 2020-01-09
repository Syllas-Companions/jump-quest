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
    scale: 2,
    towards: function (x, y) {
        this.target = { x: x, y: y };
    },
    min: function () {
        return { x: this.position.x - this.width / 2 / this.scale, y: this.position.y - this.height / 2 / this.scale}
    },
    max: function () {
        return { x: this.position.x + this.width / 2 / this.scale, y: this.position.y + this.height / 2 / this.scale}
    },
    update: function () {
        // move camera toward target's position
        if (this.target) {
            this.position.x += (this.target.x - this.position.x) * 0.05;
            this.position.y += (this.target.y - this.position.y) * 0.05;
        }

    }
}