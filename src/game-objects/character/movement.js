import Character from './base'
import Matter from 'matter-js'
import C from 'myConstants'
var Body = Matter.Body;

function move(dir) {
    let oldFacing = this.facing
    if (dir > 0) this.facing = 1;
    else if (dir < 0) this.facing = -1;
    this.isTurned = (oldFacing!=this.facing) ;

    let coeff = this.isJumping ? 0.05 : 1;
    let curVelX = this.body.velocity.x;
    curVelX += (2 * dir * coeff);
    if (curVelX > this.maxMoveSpeed) curVelX = this.maxMoveSpeed;
    if (curVelX < -this.maxMoveSpeed) curVelX = -this.maxMoveSpeed;
    Body.setVelocity(this.body, { x: curVelX, y: this.body.velocity.y });
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

            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -this.baseJump });

            this.isJumping = true;
        } else {
            if (new Date() - this.timeStartJump < this.maxJumpTime) {
                Body.setVelocity(this.body, { x: this.body.velocity.x, y: -this.baseJump });
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

