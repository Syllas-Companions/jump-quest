import Matter from 'matter-js'
import Tile from "./basicTile";
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

const DEFAULT_DURABILITY = 10000
class TileWDurability extends Tile {
    constructor(map, x, y, width, height, tile_id) {
        super(map, x, y, width, height, tile_id);
        this.durability = DEFAULT_DURABILITY;
        this.timestamp = Date.now();
    }
    update() {
        if (!this.isDestroyed) {
            let lastTimestamp = this.timestamp;
            this.timestamp = Date.now();
            let touched = Matter.Query.ray(this.map.engine.world.bodies, { x: this.x, y: this.y }, { x: this.x, y: this.y - this.height }, this.width - 10)
                .filter(collision => (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body'))
                .length > 0;
            if (touched) {
                this.durability -= (this.timestamp - lastTimestamp);
                this.body.render.opacity = this.durability / DEFAULT_DURABILITY
                console.log(this.durability);
                if (this.durability < 0) {
                    this.isDestroyed = true;
                    this.destroy();
                }
            }
        }
    }
}

export default TileWDurability;