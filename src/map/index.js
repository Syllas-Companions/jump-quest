import Matter from 'matter-js'

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,
	World = Matter.World,
	Bodies = Matter.Bodies,
    Body = Matter.Body;
    
export default class Map{
    constructor(engine, mapJson){
        let tileWidth = mapJson.tilewidth;
        let tileHeight = mapJson.tileHeight;
        let tiles = map.layers.find(layer => layer.name == "tiles");
        for(let i = 0;i<tiles.height;i++){
            for(let j = 0;j<tiles.height;j++){
                let tile = Bodies.rectangle(
                    tiles.x+j*tileWidth, 
                    tiles.y+i*tileHeight,  
                    tileWidth, tileHeight, 
                    { isStatic: true });
                World.add(engine.world,tile);
            }
        }
    }
}