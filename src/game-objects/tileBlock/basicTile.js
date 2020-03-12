import Matter from 'matter-js'
import C from 'myConstants'
import GameObject from 'game-objects/game-object';
// import room_manager from 'room_manager'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

export default class Tile extends GameObject {
    constructor(map, x, y, width, height, tile_id) {
        super(Bodies.rectangle(x, y, width, height,
            {
                isStatic: true,
                objLayer: C.LAYER_MAP_TILES,
                objType: "tile"
            }));
        // this.x = x;
        // this.y = y;
        this.width = width;
        this.height = height;
        // this.tile_id = tile_id;

        this.body.render.tile_id = tile_id
        this.map = map;

        World.add(map.engine.world, this.body);
    }
    get x() { return this.body.position.x }
    get y() { return this.body.position.y }

    destroy() {
        World.remove(this.map.engine.world, this.body);
        this.body = null;
    }
    update() {
    }

    simplify() {
        return Object.assign({
            type: C.LAYER_MAP_TILES,
            size: {
                x:this.width,
                y:this.height
            }
        }, super.simplify())
    }
}
