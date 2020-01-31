import Matter from 'matter-js'
// import room_manager from 'room_manager'
var Engine = Matter.Engine,
  Render = Matter.Render,
  Events = Matter.Events,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

//class door
export default class Door {
// TODO: add exception list (trigger door only once for each player, until that player leave the door's trigger)
  constructor(map, doorJson, callback) {
    doorJson.y = doorJson.y - doorJson.height;
    let width = doorJson.width == 0 ? 40 : doorJson.width;
    let height = doorJson.height == 0 ? 40 : doorJson.height;

    this.callback = callback
    this.sensorIn = Bodies.rectangle(doorJson.x, doorJson.y, width, height, { isStatic: true, isSensor: true, tile_id: doorJson.gid });
    this.map = map;
    this.name = doorJson.name;
    let t = doorJson.properties.find(prop => prop.name == 'target');
    this.target = t ? t.value : null;

    this.data = doorJson;
    World.add(map.engine.world, this.sensorIn);
  }

  sayHello() {
    console.log('hello');
  }
  update() {
    Matter.Query.collides(this.sensorIn, this.map.engine.world.bodies)
      .forEach((collision) => {

        if (collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
          // console.log(collision);
          console.log("door");
          let char_physics = collision.bodyA.objType == 'character' ? collision.bodyA : collision.bodyB;
          let char_logics = char_physics.character_logic;
          if (this.callback) this.callback(char_logics, this);

          // NOTE: door's functionalities moved to creation step (in GameMap)
          // else {
          //   if (this.data.type == 'teleport') {
          //     let doorTo = this.map.getDoor(target.value);
          //     char_logics.teleport(doorTo.data);
          //     // room_manager.hello();
          //   }
          //   if (this.data.type == 'change_map') {
          //     // target might be map name
          //     this.map.gameManager.changeMap(char_logics.id, target.value)
          //   }
          // }
        }
      })
  }
}
