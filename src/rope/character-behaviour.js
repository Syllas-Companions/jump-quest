import Matter from 'matter-js'
import Character from 'character/base';
// import room_manager from 'room_manager'

var Engine = Matter.Engine,
    Render = Matter.Render,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

function jumpFromRope(isKeyDown) {
    if (isKeyDown) {
        if (this.attachedTo) {
            Body.setVelocity(this.composite, { x: this.composite.velocity.x, y: -10 });
            Composite.remove(this.gm.engine.world, this.attachedTo.constraint)
            this.attachedTo = null;
            return true;
        }
        return false;
    }
    return false;
}
function upRope(isKeyDown) {
    if (isKeyDown) {
        if (this._touching_rope && !this.attachedTo) {
            this.attachedTo = this._touching_rope;
            let constraint = Constraint.create({
                bodyA: this.composite,
                bodyB: this.attachedTo.rope.getSeg(this.attachedTo.seg_no),
                length: 2,
                stiffness: 0.1,
                damping: 1
            })
            this.attachedTo.constraint = constraint;
            Composite.add(this.gm.engine.world, constraint);
            return true;
        } else {
            if (this.attachedTo) {
                // save start time
                this.attachedTo.key_hold = 38;
                if (!this.attachedTo.key_start)
                    this.attachedTo.key_start = Date.now();
                // check if hold for enough time
                if ((Date.now() - this.attachedTo.key_start) > 250) {
                    // move up 1 segment if possible
                    let destination = this.attachedTo.rope.getSeg(this.attachedTo.seg_no - 1);
                    if (destination) {
                        this.attachedTo.constraint.bodyB = destination;
                        this.attachedTo.seg_no -= 1;
                        this.attachedTo.key_start = null;
                    }
                }
                return true;
            } else {
                return false;
            }
        }
    } else {
        if (this.attachedTo && this.attachedTo.key_hold == 38)
            this.attachedTo.key_start = null;
        return false;
    }
}
function downRope(isKeyDown) {
    if (isKeyDown) {
        if (this.attachedTo) {
            // save start time
            this.attachedTo.key_hold = 40;
            if (!this.attachedTo.key_start)
                this.attachedTo.key_start = Date.now();
            // check if hold for enough time
            if (Date.now() - this.attachedTo.key_start > 250) {
                // move down 1 segment if possible
                let destination = this.attachedTo.rope.getSeg(this.attachedTo.seg_no + 1);
                if (destination) {
                    this.attachedTo.constraint.bodyB = destination;
                    this.attachedTo.seg_no += 1;
                    this.attachedTo.key_start = null;
                }
            }
            return true;
        }
    } else {
        if (this.attachedTo && this.attachedTo.key_hold == 40)
            this.attachedTo.key_start = null;
        return false;
    }
}
function leftRope(isKeyDown) {
    // LEFT
    if (isKeyDown) {
        if (this.attachedTo) {
            Body.applyForce(this.composite, this.composite.position, { x: -0.002, y: 0 });
            return true;
        }
    }
    return false;
}
function rightRope(isKeyDown) {
    // RIGHT
    if (isKeyDown) {
        if (this.attachedTo) {
            Body.applyForce(this.composite, this.composite.position, { x: 0.002, y: 0 });
            return true;
        }
    }
    return false;
}

Character.registerAction(32, jumpFromRope);
Character.registerAction(38, upRope);
Character.registerAction(40, downRope);
Character.registerAction(37, leftRope);
Character.registerAction(39, rightRope);
