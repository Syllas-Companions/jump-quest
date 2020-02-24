import Matter from 'matter-js'
import Character from 'character'

var World = Matter.World,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint;

function hookable(isKeyDown, isChanged){
    if(isKeyDown) {
        if(!this.tileConstraint && this.hw_touch){
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

            World.add(this.gm.engine.world,this.tileConstraint);
            return true;
        }
        if(this.tileConstraint) {
            return true;
        }
    }
    else {
        if(this.tileConstraint) {
            World.remove(this.gm.engine.world, this.tileConstraint);
            this.tileConstraint = null;
        }
    }
    return false;
}



function characterTurn(isKeyDown) {
    if (isKeyDown) {
        if (this.itemConstraint && this.isTurned) {
            //TODO: use (width character + width item) /2 instead of constant
            if (this.facing == 1) Body.setPosition(this.itemConstraint.bodyB, { x: this.body.position.x + 25, y: this.body.position.y });
            if (this.facing == -1) Body.setPosition(this.itemConstraint.bodyB, { x: this.body.position.x - 28, y: this.body.position.y });
        }
    }
    return false;
}

// TODO: add wall jump by pressing space
function wallJump(isKeyDown, isChanged) {
    if (isKeyDown && isChanged) {
        if (this.tileConstraint) {
            // TODO: prevent auto latching again right after constriant broken"
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -10 });
            World.remove(this.gm.engine.world, this.tileConstraint)
            this.tileConstraint = null;
            return true;
        }
        return false;
    }
    return false;
}
Character.registerAction(32, wallJump);
// Character.registerAction(39, characterTurn);
// Character.registerAction(37, characterTurn);
Character.registerAction(38, hookable);
