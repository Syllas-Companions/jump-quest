import Matter from 'matter-js'
import GameObject from 'game-objects/game-object';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class base enemy
export default class Enemy extends GameObject {

    constructor(map, json){
        // super(map,json);
        let tile = json.objects.find(obj => obj.name == "tile");
        super(Bodies.circle(tile.x, tile.y, 30, { inertia: Infinity, isStatic: true, objType: "enemy" , isSensor: true}));
        
        this.ignoreList = []
        if (tile) {
            this.tile_id = tile.gid;
        }
        this.map = map;
        
        this.body.enemy_logic = this;
        
        // this.getDirection();
        
        this.distance = 0;
        this.findPoint = 0;
        this.speed = json.properties.find(prop => prop.name == 'speed');
        if (this.speed) this.speed = parseFloat(this.speed.value);
        else this.speed = 0.1;
    }
    getNextPoint(pre) {
        this.findPoint = this.polygon.indexOf(pre);
        if (this.findPoint == 2) this.findPoint = -1;
        this.targetPoint = this.polygon[this.findPoint + 1];
        // console.log(this.findPoint);
    }
    //x,y vi tri den
    move(x, y) {
        let xTo = x - this.body.position.x;
        let yTo = y - this.body.position.y;
        // console.log(xTo);
        // di chuyen enemy 
        Body.setStatic(this.body, false);
        //cần chuyển sang xTo yTo
        // console.log(this.speed);
        let caculVector = Matter.Vector.normalise({ x: xTo * this.speed, y: yTo * this.speed });
        Body.setVelocity(this.body, caculVector);
        // Body.setVelocity(this.body, { x: xTo * this.speed, y: yTo * this.speed });
    }
    
}
