import Matter from 'matter-js'

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body;
//class character
export default class Character {
	constructor(engine, pos) {
		this.bodyC = Bodies.rectangle(pos.x, pos.y, 50, 50, { inertia: Infinity });
		this.sensor = Bodies.rectangle(pos.x, pos.y + 27, 4, 4, { isSensor: true });
		this.composite = Body.create({
			parts: [this.bodyC, this.sensor],
			options: { objType: "character" }
		});
		this.engine = engine;

		World.add(engine.world, this.composite);
		// this.isJumping = true;
		// this.isChanneling = true;
		//create body 
		// Body.create();
		this.maxJumpTime = 200;
	}

	// added update function that get called from main index.js every "beforeUpdate" event
	update() {
		// query the list of collisions
		Matter.Query.collides(this.sensor, this.engine.world.bodies)
			.forEach((collision) => {
				console.log(collision)
				if (collision.bodyA.id != collision.bodyB.id) {
					// if the sensor is collided (landed) set isJumping to false
					// if (collision.bodyA.objType == "ground" || collision.bodyB.objType == "ground") {
					this.isJumping = false;
					// }
				}
			})
	}
	inputHandler(keyState) {
		if (keyState[38]) {
			this.jump();
		}
		if (keyState[37]) this.move(-1);
		if (keyState[39]) this.move(1);
	}
	move(dir) {
		let coeff = this.isJumping ? 0.1 : 1;
		Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: dir * 0.005 * coeff, y: 0.00 });

		// if(!this.isJumping){
		// 	//turn left non jump
		// 	if(e === 37){
		// 		Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.02,y:0.00});
		// 	//move right not jump
		// 	}else if(e === 39){
		// 		Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.02,y:0.00});
		// 	}	
		// }else{
		// 	//turn left jumping
		// 	if(e === 37){
		// 		Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.02,y:0.00});
		// 	//move right jumping
		// 	}else if(e === 39){
		// 		Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.02,y:0.00});
		// 	}
		// }
	}

	jump() {
		// console.log(this.isJumping);
		console.log("called" + (!this.isJumping))
		if (!this.isJumping) {
			this.timeStartJump = new Date();
			Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: -0.05 });
			//set status in jump
			this.isJumping = true;
			// this.isChanneling = true;
		} else {
			if (new Date() - this.timeStartJump < this.maxJumpTime) {
				Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: -0.003 });
			}
		}
	}
	effect() {

	}
	sayHello() {
		console.log('hello');
	}

}

