import Matter from 'matter-js'

var Engine = Matter.Engine,
    Render = Matter.Render,  
    World = Matter.World,  
    Bodies = Matter.Bodies,
    Body = Matter.Body;
//class character
export default class Character{
	constructor(world,pos){
			this.bodyC = Bodies.rectangle(pos.x,pos.y,50,50);
			this.sensor = Bodies.rectangle(pos.x,pos.y+27,4,4, {isSensor: true});
			this.composite = Body.create({
				parts: [this.bodyC,this.sensor]
			});
			World.add(world,this.composite);
			this.isJumping = true;
			this.isChanneling = true; 
			//create body
			// Body.create();
	}
	move(e){
		if(!this.isJumping){
			//turn left non jump
			if(e === 37){
				Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.02,y:0.00});
			//move right not jump
			}else if(e === 39){
				Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.02,y:0.00});
			}	
		}else{
			//turn left jumping
			if(e === 37){
				Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.02,y:0.00});
			//move right jumping
			}else if(e === 39){
				Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.02,y:0.00});
			}
		}
	}

	jump(forceJump){
		// console.log(this.isJumping);
		if(!this.isJumping && !this.Channeling){
		console.log(this.isJumping);
		console.log("jumping");
		Body.applyForce(this.composite,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.00,y:-forceJump});
		//set status in jump
		this.isJumping = true;
		this.isChanneling = true;
		}
	}
	effect(){

	}
	sayHello(){
		console.log('hello');
	}

}

