import Matter from 'matter-js'
import Character from 'character'
import C from 'myConstants'
var World = Matter.World,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint;


function hookable(isKeyDown, isChanged){
    if(isKeyDown) {
        if(this.hw_timestamp_break && ((Date.now()-this.hw_timestamp_break)<C.HW_COOLDOWN)) return true;
        if(!this.tileConstraint 
            && this.hw_touch 
            && (!this.hw_timestamp_break || ((Date.now()-this.hw_timestamp_break)>C.HW_COOLDOWN))){
            this.tileConstraint = Constraint.create({
                bodyA: this.body,
                bodyB: this.hw_touch,
                pointA: { x: 0, y: 0 },
                length: 50,
                stiffness: 0.1,
                damping: 1,
                render: { type: 'line' }
            });
            // console.log(this.hw_touch);
            this.hw_timestamp_hooked = Date.now();
            World.add(this.gm.engine.world,this.tileConstraint);
            return true;
        }
        if(this.tileConstraint) {
            return true;
        }
    }
    else {
        if(this.tileConstraint) {
            Body.setVelocity(this.body, { x: 3*-this.facing, y: 0 });
            World.remove(this.gm.engine.world, this.tileConstraint);
            this.hw_timestamp_break = Date.now();
            this.tileConstraint = null;
            this.timeStartJump = new Date();
        }
    }
    return false;
}



function characterTurn(isKeyDown, isChanged) {
    if (isKeyDown) {
        if (this.tileConstraint) {
            return true;
        }
    }
    return false;
}

// TODO: add wall jump by pressing space
function wallJump(isKeyDown, isChanged) {
    if (isKeyDown && isChanged) {
        if (this.tileConstraint) {
            // TODO: prevent auto latching again right after constriant broken"
            Body.setVelocity(this.body, { x: 3*-this.facing, y: -10 });
            World.remove(this.gm.engine.world, this.tileConstraint)
            this.hw_timestamp_break = Date.now();
            this.tileConstraint = null;
            this.timeStartJump = new Date();
            return true;
        }
        return false;
    }
    return false;
}
Character.registerAction(32, wallJump);
Character.registerAction(39, characterTurn);
Character.registerAction(37, characterTurn);
Character.registerAction(38, hookable);
