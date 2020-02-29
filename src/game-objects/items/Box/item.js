import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class items
export default class Item extends GameObject {

    constructor(map, pos) {
        super(Bodies.rectangle(pos.x, pos.y, 40, 40, { inertia: Infinity, objType: "ItemBox" }));
        this.map = map;

        this.body.item_logic = this;
        World.add(map.engine.world, this.body);
        this.isPickedUp = false;

    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    //function update beforce update
    update() {
        if (!this.associated_char) {
            Matter.Query.collides(this.body, this.map.engine.world.bodies)
                .forEach((collision) => {
                    // console.log(collision.bodyA.objType+"   "+collision.bodyB.objType)
                    if (collision.bodyA.objType == 'character-face' || collision.bodyB.objType == 'character-face') {
                        let char_physics = collision.bodyA.objType == 'character-face' ? collision.bodyA : collision.bodyB;
                        let char_logics = char_physics.character_logic;
                        char_logics.bodyBring = this.body;
                        this.associated_char = char_logics;
                        this.associated_char.isJumping = false;
                    }
                })
        } else {
            if (Matter.Query.collides(this.body, this.associated_char.body.parts).length == 0) {
                this.associated_char.bodyBring = null;;
                this.associated_char = null;
            }
        }
    }
    pickedUp() {
        console.log("picked Up");
    }
}