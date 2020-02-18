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
class HookableWall extends Tile {
    constructor(map, x, y, width, height, tile_id) {
        super(map, x, y, width, height, tile_id);

    }
    update() {
        if (!this.associated_char) {
            Matter.Query.collides(this.body, this.map.engine.world.bodies)
                .forEach((collision) => {
                    if (collision.bodyA.objType == 'character-face' || collision.bodyB.objType == 'character-face') {
                        let char_physics = collision.bodyA.objType == 'character-face' ? collision.bodyA : collision.bodyB;
                        let char_logics = char_physics.character_logic;
                        char_logics.bodyBring = this.body;
                        this.associated_char = char_logics;
                    }
                })
        }else{
            if(Matter.Query.collides(this.body, this.associated_char.composite.parts).length==0){
                this.associated_char.bodyBring = null;;
                this.associated_char = null;
            }
        }
    }
}

export default HookableWall