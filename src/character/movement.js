import Character from './base'
import Matter from 'matter-js'
import C from 'constants'
var Body = Matter.Body;

function move(dir) {
    // TODO: try reimplement force-based movement to fix rope's behaviour
    let oldFacing = this.facing
    if (dir > 0) this.facing = 1;
    else if (dir < 0) this.facing = -1;
    this.isTurned = (oldFacing!=this.facing) ;

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
function moveLeft(isKeyDown) {
    if (isKeyDown) {
        move.call(this,-1)
        return true;
    }
    return false;
}
function moveRight(isKeyDown) {
    if (isKeyDown) {
        move.call(this,1)
        return true;
    }
    return false;
}
function jump(isKeyDown) {
    if (isKeyDown) {
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
        return true;
    }
    return false;
}

Character.registerAction(37, moveLeft);
Character.registerAction(39, moveRight);
Character.registerAction(32, jump);
Character.registerAction(38, jump);

