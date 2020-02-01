import Matter from 'matter-js'
// import room_manager from 'room_manager'
var Engine = Matter.Engine,
  Render = Matter.Render,
  Constraint = Matter.Constraint,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

//class door
export default class Rope {
  constructor(map, json) {
    this.map = map;
    this.data = json;
    
    let length = json.properties.find(prop => prop.name == "length");
    length = length ? length.value: 8;
    let seg_length = json.properties.find(prop => prop.name == "seg_length");
    seg_length = seg_length ? seg_length.value: 30;
    let r_rope = json.properties.find(prop => prop.name == "r_rope");
    r_rope = r_rope ? r_rope.value: 10;
    // add bodies
    var group = Body.nextGroup(true);
        
    this.composite = Composites.stack(json.x-map.tileWidth/2-r_rope/2, json.y-map.tileHeight/2, 1, length, 0, 2, function(x, y) {
        return Bodies.rectangle(x, y, r_rope, seg_length, { collisionFilter: { group: group }});
    });
    
    Composites.chain(this.composite, 0, 0.5, 0, -0.5, { stiffness: 0.8, length: 2, render: { type: 'line' } });
    Composite.add(this.composite, Constraint.create({ 
        bodyB: this.composite.bodies[0],
        pointB: { x: 0, y: -seg_length/2 },
        pointA: { x: this.composite.bodies[0].position.x, y: this.composite.bodies[0].position.y-seg_length },
        stiffness: 0.5
    }));
    World.add(map.engine.world, this.composite);
  }

  update() {
    // NOTE: not called anywhere yet
    console.log("updating rope")
    // TODO: detect collision and implement rope holding for character
    // Matter.Query.collides(this.sensorIn, this.map.engine.world.bodies)
    //   .forEach((collision) => {

    //     if (collision.bodyA.objType == 'character' || collision.bodyB.objType == 'character') {
    //       // console.log(collision);
    //       console.log("door");
    //       let char_physics = collision.bodyA.objType == 'character' ? collision.bodyA : collision.bodyB;
    //       let char_logics = char_physics.character_logic;
    //       if (this.callback) this.callback(char_logics, this);

    //     }
    //   })
  }
}
