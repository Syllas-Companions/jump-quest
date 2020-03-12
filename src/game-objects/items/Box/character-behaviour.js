import Matter from 'matter-js'
import Character from 'game-objects/character'

var World = Matter.World,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

function holdItem(isKeyDown, isChanged) {
    // console.log(isChanged)
    // try add to composite method
    if (isKeyDown) {
        if (!this.itemConstraint && this.bodyBring) {
            this.itemConstraint = Constraint.create({
                bodyA: this.body,
                bodyB: this.bodyBring,
                pointA: { x: 0, y: 0 },
                length: 50,
                stiffness: 0.1,
                damping:1,
                render: { type: 'line' }
            });

            World.add(this.gm.engine.world, this.itemConstraint);

            this.itemConstraint2 = Constraint.create({
                bodyA: this.body,
                bodyB: this.bodyBring,
                pointA: { x: 0, y: -20 },
                length: 50,
                stiffness: 0.1,
                damping:1,
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
            //TODO: use (width character + width item) /2 instead of constant
            if (this.facing == 1) Body.setPosition(this.itemConstraint.bodyB, { x: this.body.position.x + 25, y: this.body.position.y });
            if (this.facing == -1) Body.setPosition(this.itemConstraint.bodyB, { x: this.body.position.x - 28, y: this.body.position.y });
        }
    }
    return false;
}

Character.registerAction(37, characterTurn);
Character.registerAction(39, characterTurn);

Character.registerAction(84, holdItem);