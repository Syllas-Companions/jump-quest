import Matter from 'matter-js'
import C from 'constants'
// import room_manager from 'room_manager'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

export default class Tile {
    constructor(map, x, y, width, height, tile_id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.tile_id = tile_id;

        this.body = Bodies.rectangle(x, y, width, height,
            {
                isStatic: true,
                objLayer: C.LAYER_MAP_TILES,
                objType: "tile",
                tile_id: tile_id
            });
        this.map = map;
        
        World.add(map.engine.world, this.body);
    }

    update() {
        // let curFrameChars = []
        // Matter.Query.collides(this.sensorIn, this.map.engine.world.bodies)
        //     .forEach((collision) => {

        //         if (collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
        //             // console.log(collision);
        //             // console.log("door");
        //             let char_physics = collision.bodyA.objType == 'character' ? collision.bodyA : collision.bodyB;
        //             let char_logics = char_physics.character_logic;
        //             curFrameChars.push(char_logics.id);
        //             if (this.ignoreList.findIndex(id => (id == char_logics.id)) == -1) {
        //                 this.ignoreList.push(char_logics.id);
        //                 console.log(this.ignoreList)
        //                 if (this.callback) this.callback(char_logics, this);
        //             }
        //             // NOTE: door's functionalities moved to creation step (in GameMap)
        //         }
        //     })
        // // filter character which already left from ignorelist
        // this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))
    }
}
