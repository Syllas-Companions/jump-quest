import Matter from 'matter-js'
import C from 'constants'
var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Pair = Matter.Pair,
	Constraint = Matter.Constraint,
	Body = Matter.Body;
//class character
export default class Character {

	constructor(engine, pos, id, metadata) {
		this.id = id;
		this.bodyC = Bodies.rectangle(pos.x, pos.y, 50, 50, { inertia: Infinity, objType: "character" });
		this.sensorDown = Bodies.rectangle(pos.x, pos.y + 26, 46, 0.001, { isSensor: true });
		this.sensorFace = Bodies.rectangle(pos.x + 27, pos.y, 0.01, 48, { isSensor: true });
		this.composite = Body.create({
			parts: [this.bodyC, this.sensorDown, this.sensorFace],
			options: { objType: "character" }
		});
		this.engine = engine;

		this.bodyC.character_logic = this;
		World.add(engine.world, this.composite);
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

		//field for use velocity (setVelocity)
		this.moveVelocity = 1;
		this.jumpVelocity = 1;

		//constraint
		this.bodyBring ={};
		this.isBringItem = false;
		
	}

	destroy() {
		World.remove(this.engine.world, this.composite, true);
	}
	die() {
		Body.setPosition(this.composite, { x: 500, y: 500 });
	}
	teleport(posTo) {
		Body.setPosition(this.composite, { x: posTo.x + 60, y: posTo.y });
		Body.setVelocity(this.composite, { x: 0, y: 0 });
	}

	// added update function that get called from main index.js every "beforeUpdate" event
	update() {
		// query the list of collisions
		let collisions = Matter.Query.collides(this.sensorDown, this.engine.world.bodies);
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
					
					//fix for item
					if(collision.bodyA.objType !=="ItemBox"||collision.bodyB.objType !== "ItemBox"){
						this.isJumping = false;
					}
					// }
				}
			})
		if (this.isJumping) this.composite.friction = 0;
		else this.composite.friction = 0.1;

		//take item
		let collisionsTakeItems = Matter.Query.collides(this.sensorFace, this.engine.world.bodies);
		//change face
		if (this.facing == 1) Body.setPosition(this.sensorFace, { x: this.composite.position.x + 27, y: this.composite.position.y });
		if (this.facing == -1) Body.setPosition(this.sensorFace, { x: this.composite.position.x - 27, y: this.composite.position.y });

		// query the list of collistions for take items
		collisionsTakeItems.forEach((collisionItem) => {
			// console.log(collisionItem);
			if (collisionItem.bodyA.objType == "ItemBox") {
				console.log("touched box");
				let item_physics = collisionItem.bodyA.objType == 'ItemBox'?collisionItem.bodyA:collisionItem.bodyB;
				let item_logics = item_physics.item_logic;
				console.log(item_logics.composite);
				this.bodyBring = item_logics.composite;
			}
		})

	}
	inputHandler(keyState) {
		//take item
		if (keyState[84]){
			this.takeItem(this.bodyBring);
		}
		//drop item
		if (keyState[89]){
			this.dropItem(this.bodyBring);
		}
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

	takeItem(bodyBring) {
		if(!this.isBringItem){
			var optionsConstraint = {
				bodyA: this.composite,
				bodyB: bodyBring,
				length: 60,
				stiffness: 0.4,
				render: {type: 'line'}
				
			}
			if(!this.constraint)
			this.constraint = Constraint.create(optionsConstraint);
			
			World.add(this.engine.world, this.constraint);
			console.log(this.constraint);
			this.isBringItem = true;
		}
		//phai bam nhanh
		else{
			console.log(this.constraint);
			World.remove(this.engine.world, this.constraint, true);
			this.constraint = null;
			this.isBringItem = false;
		}
	}
	dropItem(bodyBring){
		if(this.isBringItem){
			console.log(this.constraint);
			World.remove(this.engine.world, this.constraint, true);
			this.constraint = null;
			this.isBringItem = false;
		}
	}
	sayHello() {
		console.log('hello');
	}

}
