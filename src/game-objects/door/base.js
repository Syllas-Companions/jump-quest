import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
export default class Door extends GameObject {
    constructor(map, doorJson, callback) {
        let width = doorJson.width == 0 ? 40 : doorJson.width;
        let height = doorJson.height == 0 ? 40 : doorJson.height;
        doorJson.y = doorJson.y - doorJson.height;
        super(Bodies.rectangle(doorJson.x, doorJson.y, width, height, { isStatic: true, isSensor: true }));

        this.ignoreList = []

        this.callback = callback

        if (doorJson.gid)
            this.body.render.tile_id = doorJson.gid
        else this.body.render.fillStyle = "#a86d32"
        console.log(doorJson.gid)
        this.map = map;
        this.name = doorJson.name;
        let t = doorJson.properties.find(prop => prop.name == 'target');
        this.target = t ? t.value : null;

        this.data = doorJson;
        World.add(map.engine.world, this.body);
    }

    addIgnore(id) {
        this.ignoreList.push(id);
    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    update() {
        let curFrameChars = []
        Matter.Query.collides(this.body, this.map.engine.world.bodies)
            .forEach((collision) => {

                if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                    // console.log(collision);
                    // console.log("door");
                    let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                    let char_logics = char_physics.character_logic;
                    curFrameChars.push(char_logics.id);
                    if (this.ignoreList.findIndex(id => (id == char_logics.id)) == -1) {
                        this.ignoreList.push(char_logics.id);
                        console.log(this.ignoreList)
                        if (this.callback) this.callback(char_logics, this);
                    }
                    // NOTE: door's functionalities moved to creation step (in GameMap)
                }
            })
        // filter character which already left from ignorelist
        this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))
    }
}