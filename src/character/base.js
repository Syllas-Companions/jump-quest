import Matter from 'matter-js'
import C from 'constants'
var Engine = Matter.Engine,
    Composite = Matter.Composite,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Pair = Matter.Pair,
    Constraint = Matter.Constraint,
    Body = Matter.Body;
//class character
class Character {

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

        //field for use velocity (setVelocity)
        this.moveVelocity = 1;
        this.jumpVelocity = 1;

        //constraint
		this.bodyBring = {};
		this.isBringItem = false;
		this.optionsConstraint = {
			bodyA: this.composite,
			bodyB: this.bodyBring,
			length: 40,
			stiffness: 0.4,
			render: {type: 'line'}	
		};

    }

    static registerAction(keyCode, func) {
        if (!Character.controlChain) Character.controlChain = new Map();
        if (Character.controlChain.has(keyCode)) {
            Character.controlChain.get(keyCode).unshift(func)
        } else {
            Character.controlChain.set(keyCode, [func])
        }
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

                    //fix for item
                    if (collision.bodyA.objType !== "ItemBox" || collision.bodyB.objType !== "ItemBox") {
                        this.isJumping = false;
                    }
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
            if (collisionItem.bodyA.objType == "ItemBox") {
                console.log("touched box");
                let item_physics = collisionItem.bodyA.objType == 'ItemBox' ? collisionItem.bodyA : collisionItem.bodyB;
                let item_logics = item_physics.item_logic;
                console.log(item_logics.composite);
                this.bodyBring = item_logics.composite;
            }
        })

    }

    inputHandler(keyState) {
        if (Character.controlChain) {
            Character.controlChain.forEach((fChain, key) => {
                // console.log(this)
                for (const func of fChain) {
                    if (func.call(this, keyState[key])) break;
                }
            })
        } else console.log("chain empty");
        // TODO: separate item to its module
		//take item
		if (keyState[84]){
			if(this.bodyBring)
            this.takeItem(this.bodyBring);
        }else
		//drop item
		{
			this.dropItem(this.bodyBring);
		}
    }
	takeItem(bodyBring) {
		if(!this.isBringItem){
			this.optionsConstraint.bodyB = bodyBring;
			if(!this.constraint)
			this.constraint = Constraint.create(this.optionsConstraint);
			
			World.add(this.gm.engine.world, this.constraint);
			console.log(this.constraint);
			this.isBringItem = true;
		}
		

	}
	dropItem(bodyBring){
		this.bodyBring = null;
		this.optionsConstraint.bodyB = null;
		if(this.isBringItem){
			console.log(this.constraint);
			World.remove(this.gm.engine.world, this.constraint, true);
			this.constraint = null;
			this.isBringItem = false;
		}
		
	}

}


export default Character;