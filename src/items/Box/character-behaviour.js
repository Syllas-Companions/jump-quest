import Matter from 'matter-js'
import Character from 'character'

var World = Matter.World,
    Constraint = Matter.Constraint;
    
function holdItem(isKeyDown) {
    // try add to composite method
    if (isKeyDown) {
        if (!this.itemConstraint && this.bodyBring) {
            this.itemConstraint = Constraint.create({
                bodyA: this.composite,
                bodyB: this.bodyBring,
                length: 35,
                stiffness: 1,
                render: { type: 'line' }
            });

            World.add(this.gm.engine.world, this.itemConstraint);
            return true;
        }
    }
    else {
        if (this.itemConstraint) {
            // console.log(this.constraint);
            World.remove(this.gm.engine.world, this.itemConstraint);
            this.itemConstraint = null;
            return true;
        }

    }
    return false;
}

Character.registerAction(84, holdItem);