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
			World.add(world,this.bodyC);
			this.isJumping = true;
			this.isChanneling = true; 
			//create body
			// Body.create();
	}
	move(e){
		if(!this.isJumping){
			//turn left non jump
			if(e === 37){
				Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.05,y:0.00});
			//move right not jump
			}else if(e === 39){
				Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.05,y:0.00});
			}	
		}else{
			//turn left jumping
			if(e === 37){
				Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.02,y:0.00});
			//move right jumping
			}else if(e === 39){
				Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.02,y:0.00});
			}
		}
	}

	jump(){
		console.log("jumping");
		console.log(this.isJumping);
		if(!this.isJumping && !this.Channeling){
		Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.00,y:-0.05});
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

