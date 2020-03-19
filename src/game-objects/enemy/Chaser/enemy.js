import Matter from 'matter-js';
import GameObject from 'game-objects/game-object';
import Enemy from './../index.js';

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class enemys
const DEFAULT_SPEED = 0.01;
const VELOCITY_REVERSE = 5;
export default class ChaserEnemy extends Enemy {
    constructor(map, json){
        super(map,json);
        let tile = json.objects.find(obj => obj.name == "tile");
        this.pointCenter = {x: tile.x,y: tile.y};
        this.sensorChase = Bodies.circle(tile.x,tile.y,300,{ inertia: Infinity, isStatic: true, objType: "enemyChase" , isSensor: true});
        console.log(this.body);
        this.togger = false;
        this.targetPoint = this.pointCenter;
        World.add(map.engine.world, this.body);
        World.add(map.engine.world, this.sensorChase)
    }
    destroy(who) {
        World.remove(this.map.engine.world, who, true);
    }
    //function update beforce update
    update(){
        let curFrameChars = []
        if(this.togger){
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
                }
            });
        }
        this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e == id) != -1))
        Matter.Query.collides(this.sensorChase, this.map.engine.world.bodies)
        .forEach((collision) => {
            // console.log(collision.bodyA.objType);
            // console.log(collision.bodyB.objType);

            if (collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
                this.togger = true;
                this.destroy(this.sensorChase);     
                if(this.togger){
                    if(collision.bodyA.objType == 'character-body') {
                        this.targetPoint = {x: collision.bodyA.position.x,y: collision.bodyA.position.y}
                    }
                    this.targetPoint = {x: collision.bodyB.position.x,y: collision.bodyB.position.y}
                }
            }
                
        })  
        if(this.togger) this.move(this.targetPoint.x, this.targetPoint.y);      
    }
    findTarget(){

    }
}