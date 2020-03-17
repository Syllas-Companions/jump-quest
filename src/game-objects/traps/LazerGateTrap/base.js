import Matter from 'matter-js';
import GameObject from 'game-objects/game-object';

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;
const DEFAULT_DURATION = 3000.0;
const VELOCITY_REVERSE = 10;
export default class LazerGateTrap extends GameObject {

    constructor(map, pos) {
        let bodies = [];

        for (let i = 0; i < pos.length - 1; i++) {
            let posAvg = { x: (pos[i].x + pos[i + 1].x) / 2, y: (pos[i].y + pos[i + 1].y) / 2 };
            let length = Math.sqrt(Math.pow(pos[i + 1].x - pos[i].x, 2) + Math.pow(pos[i + 1].y - pos[i].y, 2));
            let angle = Math.atan((pos[i + 1].x - pos[i].x) / (pos[i + 1].y - pos[i].y));
            let body = Bodies.rectangle(posAvg.x, posAvg.y, 10, length, { isStatic: true, isSensor: true, inertia: Infinity, objType: "lazerGateTrap" });
            Body.setAngle(body, Math.PI - angle);
            bodies.push(body);
        }
        super(Composite.create({
            bodies: bodies
        }));
        
        this.tmp = this.body.bodies;
        this.ignoreList = [];
        // this.bodyC = bodyC;
        this.map = map;
        World.add(map.engine.world, this.body);
        this.toggle_time = Date.now();
        this.toggle = true;
    }
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    simplify(){
        // override
        return this.body.bodies.map(b => {
            return {
                id: b.id,
                vertices: b.vertices.map(vertex => {
                    return { x: vertex.x, y: vertex.y }
                }),
                tile_id: b.render.tile_id, 
                opacity: b.render.opacity,
                color: b.render.fillStyle,
                position: b.position
            }
        })
    }
    update() {
        // console.log(this.toggle)
        if (Date.now() - this.toggle_time > DEFAULT_DURATION) {
            // this.body.isSensor = !this.body.isSensor;
            this.toggle_time = Date.now();
            if(this.toggle) {
                this.body.bodies = [];
                this.toggle = false;
            }else{
                this.body.bodies =this.tmp;
                this.toggle = true;
            }
        }
        let curFrameChars = [];
        this.body.bodies.forEach(body => {
            Matter.Query.collides(body, this.map.engine.world.bodies)
                .forEach((collision) => {
                    if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                        // console.log(collision);
                        let char_physics = collision.bodyA.objType == 'character-body' ? collision.bodyA : collision.bodyB;
                        let char_logics = char_physics.character_logic;
                        // console.log(char_logics);
                        if (this.ignoreList.findIndex(id => (id == char_logics.id)) == -1) {
                            this.ignoreList.push(char_logics.id);
                            char_logics.forceBack(body.position, VELOCITY_REVERSE); // push back based on relative position 
                            char_logics.gotHit();
                        }

                        // Body.applyForce(this.composite,this.composite.position,{x:0,y:-0.1});
                    }
                });
        })
        this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))

    }
}