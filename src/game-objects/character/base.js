import Matter from 'matter-js'
import C from 'myConstants'
import GameObject from 'game-objects/game-object'
var Engine = Matter.Engine,
    Composite = Matter.Composite,
    Render = Matter.Render,
    Vector = Matter.Vector,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Pair = Matter.Pair,
    Constraint = Matter.Constraint,
    Body = Matter.Body;
class CharStatus {
    constructor(character, duration) {
        this.character = character;
        this.duration = duration;
        this.active_time = Date.now();
    }
    update() {
        if (Date.now() - this.active_time > this.duration) {
            this.finish();
        }
    }
    finish() {
        if (this.character && this.character.statuses) {
            let index = this.character.statuses.indexOf(this)
            this.character.statuses.splice(index, 1);
        }
    }
}
class UserMessage extends CharStatus {
    constructor(character, message) {
        super(character, 4000);
        this.name = "message";
        this.info = message;
    }
    finish() {
        super.finish();
    }
}
class HurtStatus extends CharStatus {
    constructor(character, duration) {
        super(character, duration);
        this.name = "hurt";
        this.character.faceAscii = "ಠ╭╮ಠ";
    }
    finish() {
        this.character.faceAscii = "⚆  v  ⚆";
        super.finish();
    }
}
//class character
class Character extends GameObject {

    constructor(gm, pos, id, metadata) {
        let bodyC = Bodies.rectangle(pos.x, pos.y, 50, 50, { inertia: Infinity, objType: "character-body" });
        let sensorDown = Bodies.rectangle(pos.x, pos.y + 26, 40, 0.001, { isSensor: true, objType: "character-base" });
        let sensorFace = Bodies.rectangle(pos.x + 27, pos.y, 3, 52, { isSensor: true, objType: "character-face" });
        super(Body.create({
            parts: [bodyC, sensorDown, sensorFace],
            options: { objType: "character" }
        }));

        this.bodyC = bodyC;
        this.sensorDown = sensorDown;
        this.sensorFace = sensorFace
        this.id = id;
        this.gm = gm;

        this.bodyC.character_logic = this;
        this.sensorFace.character_logic = this;

        World.add(gm.engine.world, this.body);
        // this.isJumping = true;
        // this.isChanneling = true;

        this.faceAscii = "⚆  v  ⚆";
        if (metadata) {
            this.metadata = metadata;
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
        this.velocityReverse = 5;

    }

    static registerAction(keyCode, func) {
        if (!Character.controlChain) Character.controlChain = new Map();
        if (Character.controlChain.has(keyCode)) {
            Character.controlChain.get(keyCode).unshift(func)
        } else {
            Character.controlChain.set(keyCode, [func])
        }
    }

    addUserMessage(message) {
        if (this.statuses) this.statuses = this.statuses.filter(e => !(e instanceof UserMessage))
        this.addStatus(new UserMessage(this, message));
    }
    destroy() {
        World.remove(this.gm.engine.world, this.body, true);
    }

    addStatus(status) {
        if (!this.statuses) this.statuses = [];
        this.statuses.push(status);
        // console.log(this.statuses.length)
    }
    gotHit(damage) {
        // extend hurt duration instead of adding 1 more
        if (this.statuses) this.statuses = this.statuses.filter(e => !(e instanceof HurtStatus))
        this.addStatus(new HurtStatus(this, 1000));
        this.gm.decreaseHp(damage);
    }
    // die() {
    //     // Body.setPosition(this.composite, { x: 500, y: 500 });
    //     (this.gm.repositionCharacters.bind(this.gm))(this.id)
    // }
    teleport(posTo, resetVel = false) {
        Body.setPosition(this.body, { x: posTo.x, y: posTo.y });
        if (resetVel)
            Body.setVelocity(this.body, { x: 0, y: 0 });
    }
    // added update function that get called from main index.js every "beforeUpdate" event
    update() {
        // update on statuses
        if (this.statuses) this.statuses.forEach(s => s.update());
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
                    // if (collision.bodyA.objType == "tile" || collision.bodyB.objType == "tile") {
                    this.isJumping = false;
                    // }
                }
            })
        if (this.isJumping) this.body.friction = 0;
        else this.body.friction = 0.1;

        //change face
        if (this.facing == 1) Body.setPosition(this.sensorFace, { x: this.body.position.x + 25, y: this.body.position.y });
        if (this.facing == -1) Body.setPosition(this.sensorFace, { x: this.body.position.x - 28, y: this.body.position.y });
    }

    inputHandler(keyState) {
        if (Character.controlChain) {
            Character.controlChain.forEach((fChain, key) => {
                let isChanged = this.prevFrameKeyState && (keyState[key] != this.prevFrameKeyState[key]);
                for (const func of fChain) {
                    if (func.call(this, keyState[key], isChanged)) break;
                }
            })
        } else console.log("chain empty");
        this.prevFrameKeyState = JSON.parse(JSON.stringify(keyState));
    }
    // forceOrigin = vector {x, y}
    forceBack(forceOrigin) {
        if (forceOrigin) {
            let dir = Vector.normalise(Vector.sub(this.body.position, forceOrigin));
            let vel = Vector.mult(dir, this.velocityReverse);
            Body.setVelocity(this.body, vel);
            // console.log("new formula")
        }
        else {
            if (this.facing == 1)
                Body.setVelocity(this.body, { x: -this.velocityReverse, y: -this.velocityReverse });
            if (this.facing == -1)
                Body.setVelocity(this.body, { x: this.velocityReverse, y: -this.velocityReverse });
        }
    }

    simplify() {
        return Object.assign({
            type: C.LAYER_CHARACTER,
            metadata: this.metadata,
            client_id: this.id,
            faceAscii: this.faceAscii,
            statuses: this.statuses ? this.statuses.map(s => { return { name: s.name, info: s.info } }) : undefined,
            facing: this.facing
        }, super.simplify())
    }
}


export default Character;