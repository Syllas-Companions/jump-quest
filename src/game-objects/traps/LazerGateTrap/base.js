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
        this.timeInvisible = Date.now();
        this.timeAppear = Date.now();
    }
    destroy(){
        World.remove(this.map.engine.world, this.body, true);
    }
    invisible(){
        this.bodyC.isSensor = true; 
        this.timeInvisible = Date.now();
    }
    appear(){    
        this.bodyC.isSensor = false; 
        this.timeAppear = Date.now();
    }
    update(){
        this.current_time = Date.now();
        if(this.bodyC.isSensor && this.current_time - this.timeInvisible - DEFAULT_DURABILITY< 0){
            this.appear();
        }
        if(!this.bodyC.isSensor && this.current_time*2 - this.timeAppear*2 - DEFAULT_DURABILITY< 0){
            this.invisible();
        }
        console.log(this.current_time - this.timeInvisible - DEFAULT_DURABILITY);
    }
}