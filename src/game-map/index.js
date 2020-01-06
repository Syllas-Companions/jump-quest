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
        this.engine = engine;
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
                        { isStatic: true, objLayer: C.LAYER_MAP_TILES, tile_id: tilesLayer.data[i * tilesLayer.width + j] });
                    this.tiles.push(tile);
                }
            }
        }
        this.tilesets = mapJson.tilesets.reverse();
        this.tilesets.forEach(s => {
            let matched = s.source.match(/([^/]*)$/);
            s.source = matched ? matched[0] : str
        })
        World.add(engine.world, this.tiles);
    }

    // get a list of static object (platforms)
    getStaticObj() {
        let result = []
        this.tiles.forEach((tile) => {
            let obj = {
                id: tile.id,
                vertices: tile.vertices.map(vertex => {
                    return { x: vertex.x, y: vertex.y }
                }),
                tile_id: tile.tile_id,
                position: tile.position
            }
            result.push(obj);
        })
        return result
    }

    addObject(obj) {
        if (!this.objects) this.objects = [];
        this.objects.push(obj);
        World.add(this.engine.world, obj);
    }
    // get a list of movable objects in the map (traps, enemies,...)
    getMovingObj() {
        // MTODO: return traps', enemies' position, etc
        if (!this.objects) return [];
        let result = []
        this.objects.forEach((obj) => {
            result.push({
                id: obj.id,
                vertices: obj.vertices.map(vertex => {
                    return { x: vertex.x, y: vertex.y }
                }),
                tile_id: obj.tile_id,
                position: obj.position
            })
        })
        return result
    }
}