import Matter from 'matter-js'

var Engine = Matter.Engine,
  	Render = Matter.Render,
  	Events = Matter.Events,
  	World = Matter.World,
  	Bodies = Matter.Bodies,
  	Body = Matter.Body,
    Composite = Matter.Composite;

export default class itemsBox {
    constructor(engine, pos){
      this.bodyItem = Bodies.rectangle(pos.x, pos.y, 50, 50, { inertia: Infinity ,objType: "item"});
      this.sensor   = Bodies.rectangle(pos.x, pos.y, 70, 70, { isSensor: true });
      this.composite= Body.create({
        parts: [this.bodyItem, this.sensor],
        option: {objType: "item"}
      });
      this.engine = engine;
      World.add(engine.world, this.composite);

      //field
      this.isPicked = false;
    }


    update(){
      //query the list of collisions
      let collisions = Matter.Query.collides(this.sensor, this.engine.world.bodies);
      //check character near
      if(!this.isPicked){
        // console.log("another character picked me");
      }else
      collisions.forEach((collision) => {
        if(collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
          console.log("find character");
        }
      })

    }
    sayHello(){
      console.log("hello");
    }

    droped(){
      this.isPicked = false;
    }
    picked(){
      this.isPicked = true;
    }
}
