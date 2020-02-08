import Matter from 'matter-js'

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class items
export default class Item {

    constructor(engine, pos) {
        this.body = Bodies.rectangle(pos.x, pos.y, 30, 30, { inertia: Infinity, objType: "ItemBox" });
        this.sensor = Bodies.rectangle(pos.x, pos.y, 40, 40, { isSensor: true });
        this.composite = Body.create({
            parts: [this.body, this.sensor]
        });
        this.engine = engine;

        this.body.item_logic = this;
        World.add(engine.world, this.composite);
        this.isPickedUp = false;

    }
    //function update beforce update
    update() {
        if (!this.associated_char) {
            Matter.Query.collides(this.body, this.engine.world.bodies)
                .forEach((collision) => {
                    if (collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
                        let char_physics = collision.bodyA.objType == 'character' ? collision.bodyA : collision.bodyB;
                        let char_logics = char_physics.character_logic;
                        // console.log(item_logics.composite);
                        char_logics.bodyBring = this.composite;
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
    pickedUp() {
        // if(!this.isPickedUp) this.isPickedUp = true ;
        console.log("picked Up");
    }
}