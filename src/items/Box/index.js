import Matter from 'matter-js'

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
    Body = Matter.Body;
    
//class items
export default class Item{
    
    constructor(engine, pos){
        this.body = Bodies.rectangle(pos.x, pos.y, 30, 30, { inertia: Infinity ,objType: "ItemBox" });
        this.sensor = Bodies.rectangle(pos.x, pos.y, 40, 40,{ isSensor: true});
        this.composite = Body.create({
            parts: [this.body,this.sensor]
        });
        this.engine = engine;

        World.add(engine.world, this.composite);

    }
    //function update beforce update
    update(){

    }
}