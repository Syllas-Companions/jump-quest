import Matter from 'matter-js'
import C from 'constants'
import BearTrap from 'traps/BearTrap'
import Door from 'door'
import Rope from 'rope'
import ItemBox from 'items/Box'
import CreepEnemy from 'enemy/CreepEnemy'
import { Tile, TileWDurability, MovablePlatform, HookableWall } from 'tileBlock'


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

        this.tilesets = mapJson.tilesets.reverse();
        this.tilesets.forEach(s => {
            let matched = s.source.match(/([^/]*)$/);
            s.source = matched ? matched[0] : str
        })


        // bind callback functions 
        this.cbMoveCharacter = this.cbMoveCharacter.bind(this);
        this.cbNextMap = this.cbNextMap.bind(this);

        this.init(mapJson)
    }

    init(mapJson) {
        this.objects = {};
        if (GameMap.objTypes) {
            mapJson.layers.forEach(layer => {
                if (GameMap.objTypes.has(layer.name)) {
                    let { initFunc, isStatic } = GameMap.objTypes.get(layer.name);

                    // create the new objects base on layer's json using initFunc
                    let createdObjects = initFunc.call(this, layer);

                    if (createdObjects && createdObjects.length > 0)
                        // push the created objects to objects array of this GameMap
                        if (this.objects.hasOwnProperty(layer.name)) {
                            let originalList = this.objects[layer.name].list;
                            this.objects[layer.name].list = [...originalList, ...createdObjects]
                        } else {
                            this.objects[layer.name] = { isStatic, list: createdObjects };
                        }
                }
            })
        } else console.log("no objType registered");
    }
    static registerObjType(name, isStatic, initFunc) {
        if (!GameMap.objTypes) GameMap.objTypes = new Map();
        GameMap.objTypes.set(name, { isStatic, initFunc });
    }
    destroy() {
        Object.values(this.objects).forEach(val => {
            val.list.forEach(obj => {
                if (obj.destroy) {
                    obj.destroy();
                }
            })
        })
    }

    update() {
        Object.values(this.objects).forEach(val => {
            val.list.forEach(obj => {
                if (obj.update) {
                    obj.update();
                }
            })
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

    getRandSpawnPoint() {
        return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)]
    }


    getDoor(name) {
        if ('doors' in this.objects)
            return this.objects.doors.list.find(door => door.name == name);
        else
            return null;
    }
    // get a list of static object (platforms)

    getObj(isStatic) {
        return [].concat.apply(
            [],
            Object.values(this.objects)
                .filter(layer => layer.isStatic == isStatic)
                .map(layer => layer.list)
        );
    }
    getStaticObj() {
        let result = []
        this.getObj(true).map(e => e.body).reduce(simplifyObj, result);
        return result;
    }

    getMovingObj() {
        let result = []
        this.getObj(false).map(e => e.body).reduce(simplifyObj, result);
        return result;
    }
}

// TODO: move each function to its appropriate module

function initBackground(layerJson) {
    let matched = layerJson.image.match(/([^/]*)$/);
    this.background = matched ? matched[0] : bgLayer.image
    return [];
}

GameMap.registerObjType('background', true, initBackground);

function initPlatforms(layerJson) {

    function initPlatformsLayer(layerJson, type, createdObjects) {
        if (layerJson.type == 'tilelayer') {
            for (let i = 0; i < layerJson.height; i++) {
                for (let j = 0; j < layerJson.width; j++) {
                    if (layerJson.data[i * layerJson.width + j] != 0) {
                        let tile = new type(this,
                            layerJson.x + j * this.tileWidth,
                            layerJson.y + i * this.tileHeight,
                            this.tileWidth, this.tileHeight,
                            layerJson.data[i * layerJson.width + j]
                        )
                        createdObjects.push(tile);
                    }
                }
            }
        } else if (layerJson.type == 'objectgroup' && layerJson.name == 'movable') {

        }
    }

    let createdObjects = []
    layerJson.layers.forEach(layer => {
        let type = Tile;
        switch (layer.name) {
            case 'basic': type = Tile; break;
            case 'destructible': type = TileWDurability; break;
            case 'hookable': type = HookableWall; break;
        }
        initPlatformsLayer.call(this, layer, type, createdObjects);
    })
}

GameMap.registerObjType('platforms', true, initPlatforms);
// //items
function initItems(layerJson) {
    let itemBoxes = layerJson.layers.find(layer => layer.name == "boxs");
    if (!itemBoxes) return [];
    let createdObjects = createItemBoxes.call(this, itemBoxes);
    return createdObjects;
}
function createItemBoxes(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let itemBox = new ItemBox(this, { x: obj.x, y: obj.y });
        createdObjects.push(itemBox);
    })
    return createdObjects
}
GameMap.registerObjType('items', false, initItems);

// //traps
function initTraps(layerJson) {
    let bearTraps = layerJson.layers.find(layer => layer.name == "bearTraps");
    if (!bearTraps) return [];
    let createdObjects = createBearTraps.call(this, bearTraps);
    return createdObjects;
}

function createBearTraps(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let bt = new BearTrap(this, { x: obj.x, y: obj.y });
        createdObjects.push(bt);
    })
    return createdObjects
}
GameMap.registerObjType('traps', false, initTraps);

//enemy
function initEnemies(layerJson) {
    let creepEnemys = layerJson.layers.find(layer => layer.name == "creeps");
    if (!creepEnemys) return [];
    let createdObjects = createCreepEnemies.call(this, creepEnemys);
    return createdObjects;
}
function createCreepEnemies(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let ce = new CreepEnemy(this, { x: obj.x, y: obj.y }, obj.polygon);
        createdObjects.push(ce);
    });
    return createdObjects
}
GameMap.registerObjType('enemys', false, initEnemies);

function initRopes(layerJson) {
    let createdObjects = []
    if (!layerJson) return createdObjects;
    layerJson.objects.forEach(obj => {
        let rope = new Rope(this, obj)
        createdObjects.push(rope);
    })
    return createdObjects
}
GameMap.registerObjType('ropes', false, initRopes);

function initDoors(layerJson) {
    let createdObjects = []
    if (!layerJson) return createdObjects;
    layerJson.objects.forEach(obj => {
        let door = null;
        if (obj.type == "change_map") {
            door = new Door(this, obj, this.cbNextMap);
        } else if (obj.type == "teleport") {
            door = new Door(this, obj, this.cbMoveCharacter);
        }
        if (door) {
            createdObjects.push(door);
        }
    })
    return createdObjects;
}
GameMap.registerObjType('doors', true, initDoors);

function initSpawnPoints(layerJson) {
    if (!this.spawnPoints)
        this.spawnPoints = [];
    if (!layerJson) {
        this.spawnPoints.push({ x: 0, y: 0 });
    }
    else {
        layerJson.objects.forEach(obj => {
            this.spawnPoints.push({ x: obj.x, y: obj.y });
        })
    }
    return [];
}
GameMap.registerObjType('spawn_points', true, initSpawnPoints);

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