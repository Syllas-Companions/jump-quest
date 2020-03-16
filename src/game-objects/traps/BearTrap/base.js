import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
const VELOCITY_REVERSE = 5;
export default class BearTrap extends GameObject {

    constructor(map, pos) {
        let bodyC = Bodies.rectangle(pos.x, pos.y, 50, 10, { inertia: Infinity, objType: "bearTrap" });
        let sensorUp = Bodies.rectangle(pos.x, pos.y, 51, 11, { isSensor: true });
        super(Body.create({
            parts: [bodyC, sensorUp],
            options: { objType: "bearTrap" },
            isStatic: true
        }));
        this.bodyC = bodyC;
        this.sensorUp = sensorUp;
        this.map = map;
        World.add(map.engine.world, this.body);
    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    update() {
        Matter.Query.collides(this.sensorUp, this.map.engine.world.bodies)
            .forEach((collision) => {
                // console.log(collision.bodyA.objType);
                // console.log(collision.bodyB.objType);

                if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                    // console.log(collision);
                    // console.log("u dead");
                    let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                    let char_logics = char_physics.character_logic;
                    char_logics.gotHit();
                    char_logics.forceBack(this.body.position,VELOCITY_REVERSE);
                    // console.log(char_logics);
                    // char_logics.die();
                }
            })
    }
}