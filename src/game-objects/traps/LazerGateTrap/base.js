import Matter from 'matter-js';
import GameObject from 'game-objects/game-object';

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
    const DEFAULT_DURABILITY = 3000.0
export default class LazerGateTrap extends GameObject {
    
    constructor(map, pos){
        let bodyC = Bodies.rectangle(pos.x, pos.y, 10, 50, { inertia: Infinity, objType: "lazerGateTrap"});
        let sensor = Bodies.rectangle(pos.x, pos.y, 11, 50, { isSensor: true});
        super(Body.create({
            parts: [bodyC, sensor],
            options: { objType: "lazerGateTrap"},
            restitution: 0,
            sleepThreshold: Infinity,
            isStatic : true
        }));
        this.bodyC = bodyC;
        this.sensor = sensor;
        this.map = map;
        World.add(map.engine.world, this.body);
        this.start_time = Date.now();
        this.change = true;
        this.time_start_invi = this.start_time;
        this.time_start_appear = this.start_time;
        this.counterTime = 0;
    }
    destroy(){
        World.remove(this.map.engine.world, this.body, true);
    }
    // invisible(){
    //     this.bodyC.isSensor = false; 
    // }
    // appear(){    
    //     this.bodyC.isSensor = true; 
    // }
    counter(time){
        this.counterTime = this.current_time - time;
    }
    update(){
        this.current_time = Date.now();
        console.log(this.counterTime);
        if(this.counterTime > DEFAULT_DURABILITY) this.change = true;

        if(this.bodyC.isSensor) this.counter(this.time_start_invi);
        else this.counter(this.time_start_appear);
        if(this.bodyC.isSensor && this.change) {
            this.change = false;
            this.bodyC.isSensor = false; 
            this.time_start_invi = Date.now();
        }
        if(!this.bodyC.isSensor && this.change){
            this.change = false;
            this.bodyC.isSensor = true;
            this.time_start_appear = Date.now();
        }
    }
}