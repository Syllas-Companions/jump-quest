import Matter from 'matter-js'
import C from 'constants'
var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Pair = Matter.Pair,
	Body = Matter.Body;
//class character
export default class Character {

	constructor(gm, pos, id, metadata) {
		this.id = id;
		this.bodyC = Bodies.rectangle(pos.x, pos.y, 50, 50, { inertia: Infinity, objType: "character" });
		this.sensorDown = Bodies.rectangle(pos.x, pos.y + 26, 46, 0.001, { isSensor: true });
		this.sensorFace = Bodies.rectangle(pos.x + 27, pos.y, 0.01, 48, { isSensor: true });
		this.composite = Body.create({
			parts: [this.bodyC, this.sensorDown, this.sensorFace],
			options: { objType: "character" }
		});
		this.gm = gm;

		this.bodyC.character_logic = this;
		World.add(gm.engine.world, this.composite);
		// this.isJumping = true;
		// this.isChanneling = true;

		if (metadata) {
			this.metadata = metadata
		} else {
			this.metadata = {
				color: {
					r: Math.random() * 255,
					g: Math.random() * 255,
					b: Math.random() * 255
				}
			}
		}
		//field for use force (applyForce)
		this.forceMoveX = 0.01;
		this.forceJumpLandingX = 0;
		this.forceJumpLandingY = -0.05;
		this.forceJumpFlyX = 0;
		this.forceJumpFlyY = -0.002;
		this.maxJumpTime = 200;
		this.maxJumpLandingV = 7.0;
		this.maxJumpFlyV = 5.0;
		this.maxMoveSpeed = 5.0;

		//filed for use velocity (setVelocity)
		this.moveVelocity = 1;
		this.jumpVelocity = 1;
	}

	destroy() {
		World.remove(this.gm.engine.world, this.composite, true);
	}
	die() {
		// Body.setPosition(this.composite, { x: 500, y: 500 });
		(this.gm.repositionCharacters.bind(this.gm))(this.id)
	}
	teleport(posTo, resetVel = false) {
		Body.setPosition(this.composite, { x: posTo.x, y: posTo.y });
		if (resetVel)
			Body.setVelocity(this.composite, { x: 0, y: 0 });
	}
	// added update function that get called from main index.js every "beforeUpdate" event
	update() {
		// query the list of collisions
		let collisions = Matter.Query.collides(this.sensorDown, this.gm.engine.world.bodies);
		// not jumping but collided with no object (incl platform)
		// => falling from the edge of the platform
		if (collisions.length == 1 && this.isJumping == false) {
			this.isJumping = true;
		} else
			collisions.forEach((collision) => {
				// console.log(collision);
				if (collision.bodyA.id != collision.bodyB.id) {
					// if the sensor is collided (landed) set isJumping to false
					// if (collision.bodyA.objType == "ground" || collision.bodyB.objType == "ground") {
					this.isJumping = false;
					// }
				}
			})
		if (this.isJumping) this.composite.friction = 0;
		else this.composite.friction = 0.1;

		//take item
		let collisionsTakeItems = Matter.Query.collides(this.sensorFace, this.gm.engine.world.bodies);
		//change face
		if (this.facing == 1) Body.setPosition(this.sensorFace, { x: this.composite.position.x + 27, y: this.composite.position.y });
		if (this.facing == -1) Body.setPosition(this.sensorFace, { x: this.composite.position.x - 27, y: this.composite.position.y });

		// query the list of collistions for take items
		collisionsTakeItems.forEach((collisionItem) => {
			// console.log(collisionItem);
			if (collisionItem.bodyA.objType == "box") console.log("touched box");

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
		if (dir > 0) this.facing = 1;
		else if (dir < 0) this.facing = -1;

		let coeff = this.isJumping ? 0.05 : 1;
		// if(Math.abs(this.composite.velocity.x) <=this.maxMoveSpeed){
		// Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: dir * this.forceMoveX * coeff, y: 0.00 });
		let curVelX = this.composite.velocity.x;
		curVelX += (2 * dir * coeff);
		if (curVelX > this.maxMoveSpeed) curVelX = this.maxMoveSpeed;
		if (curVelX < -this.maxMoveSpeed) curVelX = -this.maxMoveSpeed;
		Body.setVelocity(this.composite, { x: curVelX, y: this.composite.velocity.y });
		// }
	}


	jump() {
		// console.log(this.isJumping);
		// console.log(this.composite.speed);
		// console.log("called" + (!this.isJumping));
		if (!this.isJumping) {
			this.timeStartJump = new Date();
			// if(this.composite.speed <= this.maxJumpLandingV){
			// Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: this.forceJumpLandingY });

			Body.setVelocity(this.composite, { x: this.composite.velocity.x, y: -10 });
			// }
			//set status in jump
			this.isJumping = true;
			// this.isChanneling = true;
		} else {
			if (new Date() - this.timeStartJump < this.maxJumpTime) {
				// if(this.composite.speed <= this.maxJumpFlyV){
				// Body.applyForce(this.composite, { x: this.bodyC.position.x, y: this.bodyC.position.y }, { x: 0.00, y: this.forceJumpFlyY });
				Body.setVelocity(this.composite, { x: this.composite.velocity.x, y: -10 });
				// }
			}
		}
	}

	takeItem() {


	}
	sayHello() {
		console.log('hello');
	}

}
