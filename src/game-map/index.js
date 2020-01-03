import Matter from 'matter-js'
import C from 'constants'

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

export default class GameMap {
    constructor(engine, mapJson) {
        this.tileWidth = mapJson.tilewidth;
        this.tileHeight = mapJson.tileheight;
        let tilesLayer = mapJson.layers.find(layer => layer.name == "tiles");
        this.tiles = []
        for (let i = 0; i < tilesLayer.height; i++) {
            for (let j = 0; j < tilesLayer.width; j++) {
                if (tilesLayer.data[i * tilesLayer.width + j] != 0) {
                    let tile = Bodies.rectangle(
                        tilesLayer.x + j * this.tileWidth,
                        tilesLayer.y + i * this.tileHeight,
                        this.tileWidth, this.tileHeight,
                        { isStatic: true, objLayer: C.LAYER_MAP_TILES });
                    this.tiles.push(tile);
                }
            }
        }
        World.add(engine.world, this.tiles);
    }

    getRenderInfo(){
        // TODO: return an array consist of information for rendering the map
    }
}