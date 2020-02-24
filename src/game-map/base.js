import Matter from 'matter-js'
import C from 'constants'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

class GameMap {
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
                    GameMap.objTypes.get(layer.name).forEach(typeInfo => {
                        let { initFunc, isStatic, collectionName } = typeInfo;

                        // create the new objects base on layer's json using initFunc
                        let createdObjects = initFunc.call(this, layer);

                        if (createdObjects && createdObjects.length > 0) {
                            // push the created objects to objects array of this GameMap
                            let propName = collectionName ? collectionName : layer.name;
                            if (this.objects.hasOwnProperty(propName)) {
                                let originalList = this.objects[propName].list;
                                this.objects[propName].list = [...originalList, ...createdObjects]
                            } else {
                                this.objects[propName] = { isStatic, list: createdObjects };
                            }
                        }
                    })
                }
            })
            // console.log(this.objects)
        } else console.log("no objType registered");
    }
    static registerObjType(name, isStatic, initFunc, collectionName) {
        if (!GameMap.objTypes) GameMap.objTypes = new Map();
        if (GameMap.objTypes.has(name)) {
            GameMap.objTypes.get(name).unshift({ isStatic, initFunc, collectionName })
        } else {
            GameMap.objTypes.set(name, [{ isStatic, initFunc, collectionName }])
        }
        // GameMap.objTypes.set(name, { isStatic, initFunc, collectionName });
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
function simplifyObj(arr, obj) {
    if (obj) {
        if (obj.type == 'body') {
            let res = {
                id: obj.id,
                vertices: obj.vertices.map(vertex => {
                    return { x: vertex.x, y: vertex.y }
                }),
                tile_id: obj.render.tile_id, // TODO: put in movable platform
                opacity: obj.render.opacity,
                color: obj.render.fillStyle,
                position: obj.position
            }
            // console.log(obj.render.opacity)
            arr.push(res);
        }
        else if (obj.type == 'composite') {
            obj.bodies.reduce(simplifyObj, arr);
        }
    }
    return arr;
}
export default GameMap;