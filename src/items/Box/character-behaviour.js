import Matter from 'matter-js'
import Character from 'character'

var World = Matter.World,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

function holdItem(isKeyDown) {
    // try add to composite method
    if (isKeyDown) {
        if (!this.itemConstraint && this.bodyBring) {
            this.itemConstraint = Constraint.create({
                bodyA: this.composite,
                bodyB: this.bodyBring,
                pointA: { x: 0, y: 20 },
                length: 45,
                stiffness: 1,
                render: { type: 'line' }
            });

            World.add(this.gm.engine.world, this.itemConstraint);

            this.itemConstraint2 = Constraint.create({
                bodyA: this.composite,
                bodyB: this.bodyBring,
                pointA: { x: 0, y: -20 },
                length: 45,
                stiffness: 1,
                render: { type: 'line' }
            });

            World.add(this.gm.engine.world, this.itemConstraint2);

            return true;
        }
    }
    else {
        if (this.itemConstraint) {
            // console.log(this.constraint);
            World.remove(this.gm.engine.world, this.itemConstraint);
            this.itemConstraint = null;
            World.remove(this.gm.engine.world, this.itemConstraint2);
            this.itemConstraint2 = null;
            return true;
        }

    }
    return false;
}
function characterTurn(isKeyDown) {
    if (isKeyDown) {
        if (this.itemConstraint && this.isTurned) {
            if (this.facing == 1) Body.setPosition(this.itemConstraint.bodyB, { x: this.composite.position.x + 27, y: this.composite.position.y });
            if (this.facing == -1) Body.setPosition(this.itemConstraint.bodyB, { x: this.composite.position.x - 27, y: this.composite.position.y });
        }
    }
    return false;
}

Character.registerAction(37, characterTurn);
Character.registerAction(39, characterTurn);

Character.registerAction(84, holdItem);