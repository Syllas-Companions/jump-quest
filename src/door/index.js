import Matter from 'matter-js'

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body;

//class door
export default class Door{

  constructor(map, doorJson){
    this.sensorIn = Bodies.rectangle(doorJson.x, doorJson.y,40,40,{isStatic:true, isSensor: true});
    this.map = map;
    this.name = doorJson.name;
    this.data = doorJson;
    World.add(map.engine.world, this.sensorIn);
  }

  sayHello() {
    console.log('hello');
  }
	update() {
		Matter.Query.collides(this.sensorIn, this.map.engine.world.bodies)
		.forEach((collision) => {

			if(collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
				// console.log(collision);
				console.log("win");
				let char_physics = collision.bodyA.objType == 'character'?collision.bodyA:collision.bodyB;
				let char_logics = char_physics.character_logic;
                //char_logics.die();
                if(this.data.type == 'teleport'){
                    let target = this.data.properties.find(prop => prop.name == 'target');
                    let doorTo = this.map.getDoor(target.value);
                    char_logics.teleport(doorTo.data);
                }
			}
		})
	}
}
