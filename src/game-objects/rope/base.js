import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
export default class Rope extends GameObject {
    constructor(map, json) {
        let length = json.properties.find(prop => prop.name == "length");
        length = length ? length.value : 8;
        let seg_length = json.properties.find(prop => prop.name == "seg_length");
        seg_length = seg_length ? seg_length.value : 30;
        let r_rope = json.properties.find(prop => prop.name == "r_rope");
        r_rope = r_rope ? r_rope.value : 10;
        // add bodies
        // var group = Body.nextGroup(true);
        let seg_no = -1;
        super(Composites.stack(json.x - map.tileWidth / 2 - r_rope / 2, json.y - map.tileHeight / 2, 1, length, 0, 2, function (x, y) {
            seg_no += 1;
            return Bodies.rectangle(x, y, r_rope, seg_length, { objType: 'rope_seg', render: { fillStyle: '#669999' }, seg_no: seg_no, isSensor: true, /*collisionFilter: { group: group } */ });
        }));
        // let last = this.composite.bodies[this.composite.bodies.length - 1]
        Composites.chain(this.body, 0, 0.5, 0, -0.5, { stiffness: 1, length: 2, render: { type: 'line' } });
        Composite.add(this.body, Constraint.create({
            bodyB: this.body.bodies[0],
            pointB: { x: 0, y: -seg_length / 2 },
            pointA: { x: this.body.bodies[0].position.x, y: this.body.bodies[0].position.y - seg_length },
            stiffness: 1
        }));

        // NOTE: weight for testing
        // var weight = Bodies.rectangle(json.x, json.y - map.tileHeight / 2, 60, 20, { collisionFilter: { group: group } });
        // Composite.add(this.composite, weight);
        // Composite.add(this.composite, Constraint.create({
        //     bodyB: last,
        //     bodyA: weight,
        //     length: 2,
        //     stiffness: 0.5
        // }));

        World.add(map.engine.world, this.body);

        this.map = map;
        this.data = json;

        this.collidingList = []



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
    destroy() {
        World.remove(this.map.engine.world, this.body, true);
    }
    getSeg(seg_no) {
        return this.body.bodies.find(ele => ele.seg_no == seg_no)
    }
    update() {
        // detect collision, assign self to touching characters 
        let curFrameChars = []
        this.map.gameManager.character_map.forEach((val, key) => {
            let char_logic = val.character;
            let char_physics = char_logic.body;
            let collisions = Matter.Query.collides(char_physics, this.body.bodies);
            // console.log(collisions.length)
            if (collisions.length > 0) {
                let seg = collisions[0].bodyA.objType == 'rope_seg' ? collisions[0].bodyA : collisions[0].bodyB
                let seg_no = seg.seg_no;
                // console.log(collisions)
                if (!this.collidingList.find(e => e.id == char_logic.id)) {
                    // add self-reference to the touching character
                    char_logic._touching_rope = {
                        rope: this,
                        seg_no: seg_no
                    }
                    this.collidingList.push(char_logic);
                }
                curFrameChars.push(char_logic);
            }
        })
        // remove objects which left the rope's area from the controlling list
        // and clear self reference from those
        let leftObjs = this.collidingList.filter(e1 => curFrameChars.findIndex(e2 => e2.id == e1.id) == -1);
        leftObjs.forEach(e => {
            e._touching_rope = null;
        })
        this.collidingList = curFrameChars;
    }
}
