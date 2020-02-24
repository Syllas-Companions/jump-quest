import Matter from 'matter-js'
import Tile from "../basicTile"
import Character from 'character'
import './character-behaviour'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
// TODO: implement
const DEFAULT_DURABILITY = 3000;
class HookableWall extends Tile {
    constructor(map, x, y, width, height, tile_id) {
        super(map, x, y, width, height, tile_id);
        this.durability = DEFAULT_DURABILITY;
        this.timestamp = Date.now();
    }
    update() {
        if (!this.associated_char) {
            Matter.Query.collides(this.body, this.map.engine.world.bodies)
                .forEach((collision) => {
                    if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                        let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                        let char_logics = char_physics.character_logic;
                        char_logics.hw_touch = this.body;
                        this.associated_char = char_logics;
                        //for duration break
                        this.timestamp = Date.now();
                    }
                });
        } else {
            if (Matter.Query.collides(this.body, this.associated_char.body.parts).length == 0) {
                this.associated_char.hw_touch = null;;
                this.associated_char = null;
            }
        }
        // console.log(this.associated_char)
        this.breakByDuraction();
    }
    breakByDuraction() {
        if (this.associated_char) {
            this.timeHookedWall = Date.now();
            this.duration = this.durability - (this.timeHookedWall - this.timestamp)
            if (this.duration < 0) {
                World.remove(this.associated_char.gm.engine.world, this.associated_char.tileConstraint);
                this.tileConstraint = null;

            }
            console.log(this.duration);
        }
    }
}

export default HookableWall