import Matter from 'matter-js'

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body;

//class enemys
export default class Enemys {

    constructor(map, pos, polygon) {
        this.body = Bodies.circle(pos.x, pos.y, 40 , {inertia: Infinity, objType: "enemy"});
        this.sensorShield = Bodies.circle(pos.x, pos.y, 41, {isSensor: true, objType: "enemy-shield"});
        //sensor vision for enemys when catch character
        // this.sensorVision 
        this.map = map;
        this.polygon = polygon;
        this.composite = Body.create({
            parts: [this.body, this.sensorShield]
        });
        this.body.enemy_logic = this;
        World.add(map.engine.world, this.composite);
        this.getDirection();
        Body.setStatic(this.composite, true);
        console.log(this.composite.position);
        console.log(this.polygon);
        this.targetPoint = this.polygon[2];
        this.prePoint = this.polygon[1];
        this.distance = 0;
        this.findPoint = 0;
    }
    destroy(){
        World.remove(this.map.engine.world, this.body, true);
    }
    //function update beforce update
    update(){
        Matter.Query.collides(this.sensorShield, this.map.engine.world.bodies)
		.forEach((collision) => {
			// console.log(collision.bodyA.objType);
			// console.log(collision.bodyB.objType);

			if(collision.bodyA.objType == 'character-body' || collision.bodyB.objType == 'character-body') {
				// console.log(collision);
				// console.log("u dead");
				let char_physics = collision.bodyA.objType == 'character-body'?collision.bodyA:collision.bodyB;
				let char_logics = char_physics.character_logic;
				// console.log(char_logics);
                char_logics.forceReverse();
                // Body.applyForce(this.composite,this.composite.position,{x:0,y:-0.1});
			}
        })
        this.move(this.targetPoint.x,this.targetPoint.y);
        //move
        this.distance =  Math.sqrt(Math.pow(this.targetPoint.x -this.composite.position.x,2) 
                    +Math.pow(this.targetPoint.y -this.composite.position.y,2));
                    console.log(this.distance);
        if(this.distance < 30) {
            // Body.setPosition(this.composite, this.targetPoint);
            this.prePoint = this.targetPoint;
            this.getNextPoint(this.prePoint);
        }

    }
    getNextPoint(pre){
        this.findPoint = this.polygon.indexOf(pre);
        if(this.findPoint == 2) this.findPoint = -1;
        this.targetPoint = this.polygon[this.findPoint+1];
        console.log(this.findPoint);
    }
    //x,y vi tri den
    move(x,y){
        let xTo = x-this.composite.position.x;
        let yTo = y-this.composite.position.y;
        // console.log(xTo);
        // di chuyen enemy 
        Body.setStatic(this.composite,false);
        //cần chuyển sang xTo yTo
        Body.setVelocity(this.composite,{x: xTo*0.01, y: yTo*0.01});
    }
    //return true pos
    getDirection(){
        //input point 
        this.polygon.forEach((position) =>{
            position.x += this.composite.position.x;
            position.y += this.composite.position.y;
        })
    }

    solve(){
    //     var loading = 0;
    //     for(var i = 0 ; i< this.polygon.length -1; i++){
    //         if(loading < 98){
    //             console.log(this.polygon[i+1]);
    //             if(!this.polygon[i+1]) this.move(this.polygon[0]);
    //             else{
    //                 this.move(this.polygon[i+1].x,this.polygon.[i+1].y);
    //                 this.distance = Math.sqrt(Math.pow(this.polygon[i+1].x -this.polygon[i].x,2) 
    //                             +Math.pow(this.polygon[i+1].y -this.polygon[i].y,2)); //khoang cach
    //                 this.distanceAway = Math.sqrt(Math.pow(this.composite.position.x -this.polygon[i].x,2) 
    //                 +Math.pow(this.composite.position.y -this.polygon[i].y,2)); //khoang cach da di
    //                 loading = this.distanceAway / this.distance;
    //             }
    //         }
    //         else{
    //             if(!this.polygon[i+1]) Body.setPosition(this.composite,this.polygon[0]);
    //             Body.setPosition(this.composite,this.polygon[i+1]);
    //         }
    //     }
    }

}