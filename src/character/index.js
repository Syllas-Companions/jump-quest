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
			console.log(this.bodyC);
			World.add(world,this.bodyC);
			console.log("imported");
			//create body
			// Body.create();
	}
	move(e){
		//turn up
		if(e === 38){
			Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.00,y:-0.05});
		//move left	
		}else if(e === 37){
			Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:-0.05,y:0.00});
		//move right
		}else if(e === 39){
			Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.05,y:0.00});
		//move down
		}else if(e === 40){
			Body.applyForce(this.bodyC,{x: this.bodyC.position.x,y:this.bodyC.position.y},{x:0.00,y:0.2});
		}
	}

	jump(){

	}
	sayHello(){
		console.log('hello');
	}

}

