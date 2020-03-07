import Matter from 'matter-js'
import Tile from "../basicTile";
import './character-behaviour'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
class MovablePlatform extends Tile {
    
    constructor(map, x, y, width, height, tile_id,polygon) {
        super(map, x, y, width, height, tile_id);
        this.polygon = polygon;
        
        this.getDirection();
        console.log(this.body.position)
        Body.setInertia(this.body,Infinity);

        this.targetPoint = this.polygon[2];
        this.prePoint = this.polygon[1];
        this.distance = 0;
        this.findPoint = 0;
        this.speed = 0.01;
    }
    update() { 
        Body.setAngle(this.body, 0);
        this.move(this.targetPoint.x, this.targetPoint.y);
        //move
        this.distance = Math.sqrt(Math.pow(this.targetPoint.x - this.body.position.x, 2)
            + Math.pow(this.targetPoint.y - this.body.position.y, 2));
        // console.log(this.distance);
        if (this.distance < 30) {
            // Body.setPosition(this.composite, this.targetPoint);
            this.prePoint = this.targetPoint;
            this.getNextPoint(this.prePoint);
        }
        // console.log(this.body.position);

        
    }
    getNextPoint(pre) {
        this.findPoint = this.polygon.indexOf(pre);
        if (this.findPoint == 2) this.findPoint = -1;
        this.targetPoint = this.polygon[this.findPoint + 1];
        console.log(this.findPoint);
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
        Body.setVelocity(this.body, { x: xTo * this.speed, y: yTo * this.speed });
    }
    //return true pos
    getDirection() {
        //input point 
        this.polygon.forEach((position) => {
            console.log(position)
            position.x += this.body.position.x;
            position.y += this.body.position.y;
        })
    }
}

export default MovablePlatform;