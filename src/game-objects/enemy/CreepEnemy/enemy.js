import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
import Enemy from './../index.js'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class enemys
const DEFAULT_SPEED = 0.01;
const VELOCITY_REVERSE = 5;
export default class CreepEnemy extends Enemy {

    constructor(map, json) {
        super(map, json);
        World.add(map.engine.world, this.body);
        let path = json.objects.find(obj => obj.name == "path");
        this.polygon = path.polygon;
        let pos = { x: path.x, y: path.y };
        this.targetPoint = this.polygon[2];
        this.prePoint = this.polygon[1];
        this.getDirection();

    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    simplify(){
        return Object.assign({angle: this.body.render.angle},super.simplify());
    }
    //function update beforce update
    update() {
        this.body.render.angle+=0.1;
        let curFrameChars = []
        Matter.Query.collides(this.body, this.map.engine.world.bodies)
            .forEach((collision) => {
                // console.log(collision.bodyA.objType);
                // console.log(collision.bodyB.objType);

                if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                    // console.log(collision);
                    let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                    let char_logics = char_physics.character_logic;
                    // console.log(char_logics);
                    if (this.ignoreList.findIndex(id => (id == char_logics.id)) == -1) {
                        this.ignoreList.push(char_logics.id);
                        char_logics.forceBack(this.body.position,VELOCITY_REVERSE); // push back based on relative position 
                        char_logics.gotHit();
                    }
                    // Body.applyForce(this.composite,this.composite.position,{x:0,y:-0.1});
                }
            })
        this.move(this.targetPoint.x, this.targetPoint.y);
        //move
        this.distance = Math.sqrt(Math.pow(this.targetPoint.x - this.body.position.x, 2)
            + Math.pow(this.targetPoint.y - this.body.position.y, 2));
        // console.log(this.distance);
        if (this.distance < 50) {
            // Body.setPosition(this.composite, this.targetPoint);
            this.prePoint = this.targetPoint;
            this.getNextPoint(this.prePoint);
        }
        this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))
    }
    //return true pos
    getDirection() {
        //input point 
        this.polygon.forEach((position) => {
            position.x += this.body.position.x;
            position.y += this.body.position.y;
        })
    }
}