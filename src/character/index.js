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
		this.sensorD = Bodies.rectangle(pos.x, pos.y + 27, 48, 0.01, { isSensor: true });
		this.sensorR = Bodies.rectangle(pos.x + 27, pos.y, 0.01, 48, { isSensor: true});
		this.composite = Body.create({
			parts: [this.bodyC, this.sensorD],
			options: { objType: "character" }
		});
		this.engine = engine;

		World.add(engine.world, this.composite);
		// this.isJumping = true;
		// this.isChanneling = true;
		//create body
		// Body.create();

		//field
		this.forceMoveX = 0.005;
		this.forceJumpLandingX = 0;
		this.forceJumpLandingY = -0.05;
		this.forceJumpFlyX = 0;
		this.forceJumpFlyY = -0.005;
		this.maxJumpTime = 200;
		this.maxJumpLandingV = 6.0;
		this.maxJumpFlyV = 5.0;

	}

	// added update function that get called from main index.js every "beforeUpdate" event
	update() {
		// query the list of collisions
		Matter.Query.collides(this.sensorD, this.engine.world.bodies)
			.forEach((collision) => {
				// console.log(collision)
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
		Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: dir * this.forceMoveX * coeff, y: 0.00 });
	}

	jump() {
		// console.log(this.isJumping);
		console.log(this.composite.speed);
		// console.log("called" + (!this.isJumping));
		if (!this.isJumping) {
			this.timeStartJump = new Date();
			if(this.composite.speed <= this.maxJumpLandingV){
				Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: this.forceJumpLandingY });
			}
			//set status in jump
			this.isJumping = true;
			// this.isChanneling = true;
		} else {
			if (new Date() - this.timeStartJump < this.maxJumpTime) {
				if(this.composite.speed <= this.maxJumpFlyV){
					Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: this.forceJumpFlyY });
				}
			}
		}
	}

	effect() {

	}
	sayHello() {
		console.log('hello');
	}

}
