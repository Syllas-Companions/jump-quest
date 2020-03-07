import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class enemys
const DEFAULT_SPEED = 0.01;
export default class Enemy extends GameObject {


    constructor(map, json) {//pos, polygon,speed) {
        let path = json.objects.find(obj => obj.name == "path");
        let tile = json.objects.find(obj => obj.name == "tile");
        let pos = { x: path.x, y: path.y };
        super(Bodies.circle(pos.x, pos.y, 40, { inertia: Infinity, isStatic: true, objType: "enemy" }));

        this.ignoreList = []
        if (tile) {
            this.tile_id = tile.gid;
        }
        this.map = map;
        this.polygon = path.polygon;
        this.body.enemy_logic = this;
        World.add(map.engine.world, this.body);
        this.getDirection();
        this.targetPoint = this.polygon[2];
        this.prePoint = this.polygon[1];
        this.distance = 0;
        this.findPoint = 0;
        this.speed = json.properties.find(prop => prop.name == 'speed');
        if (this.speed) this.speed = parseFloat(this.speed.value);
        else this.speed = 0.1
    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    //function update beforce update
    update() {
        let curFrameChars = []
        Matter.Query.collides(this.body, this.map.engine.world.bodies)
            .forEach((collision) => {
                // console.log(collision.bodyA.objType);
                // console.log(collision.bodyB.objType);

                if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                    // console.log(collision);
                    // console.log("u dead");
                    let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                    let char_logics = char_physics.character_logic;
                    // console.log(char_logics);
                    if (this.ignoreList.findIndex(id => (id == char_logics.id)) == -1) {
                        this.ignoreList.push(char_logics.id);
                        char_logics.forceReverse();
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
        if (this.distance < 30) {
            // Body.setPosition(this.composite, this.targetPoint);
            this.prePoint = this.targetPoint;
            this.getNextPoint(this.prePoint);
        }
        this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))

    }
    getNextPoint(pre) {
        this.findPoint = this.polygon.indexOf(pre);
        if (this.findPoint == 2) this.findPoint = -1;
        this.targetPoint = this.polygon[this.findPoint + 1];
        // console.log(this.findPoint);
    }
    //x,y vi tri den
    move(x, y) {
        let xTo = x - this.body.position.x;
        let yTo = y - this.body.position.y;
        // console.log(xTo);
        // di chuyen enemy 
        Body.setStatic(this.body, false);
        //cần chuyển sang xTo yTo
        // console.log(this.speed);
        Body.setVelocity(this.body, { x: xTo * this.speed, y: yTo * this.speed });
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