import Matter from 'matter-js'
import Character from 'character'

var World = Matter.World,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

function hookable(isKeyDown, isChanged){
    if(isKeyDown) {
        if(!this.tileConstraint && this.bodyBring){
            this.tileConstraint = Constraint.create({
                bodyA: this.composite,
                bodyB: this.bodyBring,
                pointA: { x: 0, y: 0 },
                length: 50,
                stiffness: 0.1,
                damping: 1,
                render: { type: 'line' }
            });
            console.log(this.bodyBring);

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
            if (this.facing == 1) Body.setPosition(this.itemConstraint.bodyB, { x: this.composite.position.x + 25, y: this.composite.position.y });
            if (this.facing == -1) Body.setPosition(this.itemConstraint.bodyB, { x: this.composite.position.x - 28, y: this.composite.position.y });
        }
    }
    return false;
}
// Character.registerAction(39, characterTurn);
// Character.registerAction(37, characterTurn);
Character.registerAction(38, hookable);
