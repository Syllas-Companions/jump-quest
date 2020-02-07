import Matter from 'matter-js'
import C from 'constants'
import BearTrap from 'traps/BearTrap'
import Door from 'door'
import Rope from 'rope'
import ItemBox from 'items/Box'


var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

export default class GameMap {
    constructor(gm, engine, mapJson) {
        this.gameManager = gm;
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
                        {
                            isStatic: true,
                            objLayer: C.LAYER_MAP_TILES,
                            objType: "tile",
                            tile_id: tilesLayer.data[i * tilesLayer.width + j]
                        });
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

        // bind callback functions 
        this.cbMoveCharacter = this.cbMoveCharacter.bind(this);
        this.cbNextMap = this.cbNextMap.bind(this);

        this.initBackground(mapJson)
        this.initTraps(mapJson);
        this.initDoors(mapJson);
        this.initRopes(mapJson);
        this.initSpawnPoints(mapJson);
        this.initItems(mapJson);
    }
    initItems(mapJson) {
        this.items = [];
        this.createItemBoxs(mapJson);
    }
    createItemBoxs(mapJson) {
        let itemsLayer = mapJson.layers.find(layer => layer.name == "items");
        if (!itemsLayer) return;
        //itemsbox
        let itemBoxs = itemsLayer.layers.find(layer => layer.name == "boxs");
        if (!itemBoxs) return;
        itemBoxs.objects.forEach(obj => {
            let itemBox = new ItemBox(this.engine, { x: obj.x, y: obj.y });
            this.items.push(itemBox);
            this.addObject(itemBox.body);
        })
    }
    initTraps(mapJson) {
        this.traps = [];
        this.createBearTraps(mapJson);
    }
    createBearTraps(mapJson) {
        let trapsLayer = mapJson.layers.find(layer => layer.name == "traps");
        if (!trapsLayer) return;
        let bearTraps = trapsLayer.layers.find(layer => layer.name == "bearTraps");
        if (!bearTraps) return;
        bearTraps.objects.forEach(obj => {
            let bt = new BearTrap(this, { x: obj.x, y: obj.y });
            this.traps.push(bt);
            this.addObject(bt.bodyC) // NOTE: adding to this array will render collider on client view
        })
    }

    cbNextMap(character, door) {
        this.gameManager.nextMap(character, door);
    }
    cbMoveCharacter(character, door) {
        if (door.target) {
            let doorTo = this.getDoor(door.target);
            doorTo.addIgnore(character.id);
            this.gameManager.moveCharacter(character, { x: doorTo.data.x, y: doorTo.data.y })
        }
    }
    initBackground(mapJson) {
        let bgLayer = mapJson.layers.find(layer => layer.name == "background");
        if (!bgLayer) return;
        let matched = bgLayer.image.match(/([^/]*)$/);
        this.background = matched ? matched[0] : bgLayer.image
    }
    initRopes(mapJson) {

        this.ropes = [];
        let ropesLayer = mapJson.layers.find(layer => layer.name == "ropes");
        if (!ropesLayer) return;
        ropesLayer.objects.forEach(obj => {
            let rope = new Rope(this, obj)
            this.ropes.push(rope);
            // console.log(rope.composite.bodies)
            this.addObject(rope.composite) // TODO: render rope/composite in general on client view 
        })
    }
    initDoors(mapJson) {
        this.doors = [];
        let doorsLayer = mapJson.layers.find(layer => layer.name == "doors");
        if (!doorsLayer) return;
        doorsLayer.objects.forEach(obj => {
            let door = null;
            if (obj.type == "change_map") {
                door = new Door(this, obj, this.cbNextMap);
            } else if (obj.type == "teleport") {
                door = new Door(this, obj, this.cbMoveCharacter);
            }
            if (door) {
                this.doors.push(door);
                // console.log(door.sensorIn)
                this.addObject(door.sensorIn) // NOTE: adding to this array will render collider on client view 
            }
        })
    }
    initSpawnPoints(mapJson) {
        this.spawnPoints = [];
        let spawnPointsLayer = mapJson.layers.find(layer => layer.name == "spawn_points");
        if (!spawnPointsLayer) {
            this.spawnPoints.push({ x: 0, y: 0 });
            return;
        }
        spawnPointsLayer.objects.forEach(obj => {
            this.spawnPoints.push({ x: obj.x, y: obj.y });
        })
    }
    getDoor(name) {
        return this.doors.find(door => door.name == name);
    }
    // get a list of static object (platforms)

    getStaticObj() {
        let result = []
        this.tiles.reduce(simplifyObj, result);
        this.doors.map(door => door.sensorIn).reduce(simplifyObj, result);
        // result = result.concat(this.tiles.map(this.simplifyObj))
        // result = result.concat(this.doors.map(door => door.sensorIn).map(this.simplifyObj))
        return result;
    }

    addObject(obj) {
        if (!this.objects) this.objects = [];
        this.objects.push(obj);
        // World.add(this.engine.world, obj);
    }
    // get a list of movable objects in the map (traps, enemies,...)
    getMovingObj() {
        // return non static object (object which can change position overtime)
        if (!this.objects) return [];
        // console.log(this.objects)
        let result = this.objects.reduce(simplifyObj, []);
        // result = result.concat(this.objects.map(this.simplifyObj));
        return result
    }
}

function simplifyObj(arr, obj) {
    if (obj) {
        if (obj.type == 'body') {
            let res = {
                id: obj.id,
                vertices: obj.vertices.map(vertex => {
                    return { x: vertex.x, y: vertex.y }
                }),
                tile_id: obj.tile_id,
                position: obj.position
            }
            arr.push(res);
        }
        else if (obj.type == 'composite') {
            obj.bodies.reduce(simplifyObj, arr);
        }
    }
    return arr;
}