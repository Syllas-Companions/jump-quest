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
    this.ignoreList = []
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

  addIgnore(id){
    this.ignoreList.push(id);
  }
  update() {
    let curFrameChars = []
    Matter.Query.collides(this.sensorIn, this.map.engine.world.bodies)
      .forEach((collision) => {

        if (collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
          // console.log(collision);
          // console.log("door");
          let char_physics = collision.bodyA.objType == 'character' ? collision.bodyA : collision.bodyB;
          let char_logics = char_physics.character_logic;
          curFrameChars.push(char_logics.id);
          if (this.ignoreList.findIndex(id => (id==char_logics.id)) == -1) {
            this.ignoreList.push(char_logics.id);
            console.log(this.ignoreList)
            if (this.callback) this.callback(char_logics, this);
          }
          // NOTE: door's functionalities moved to creation step (in GameMap)
        }
      })
      // filter character which already left from ignorelist
      this.ignoreList = this.ignoreList.filter(id => (curFrameChars.findIndex(e => e==id)!=-1))
  }
}
