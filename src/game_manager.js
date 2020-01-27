import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'
import level_manager from 'level_manager'

var Engine = Matter.Engine,
    Events = Matter.Events,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

function isNodejs() { return typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node !== 'undefined'; }

export default class GameManager {
    constructor(gmId, level = level_manager.getDefaultLevel()) {
        this.id = gmId;
        // create an engine
        this.engine = Engine.create();

        this.currentLevel = level;
        let mapName = level_manager.getMapFilename(this.currentLevel);
        this.loadMap(mapName);

        // init character array
        this.character_map = new Map();
        this.nextMap = this.nextMap.bind(this);
        this.createCharacter = this.createCharacter.bind(this);
        this.moveCharacter = this.moveCharacter.bind(this);
    }
    nextMap() {
        // load next map
        // next level's name stored in level_manager
        let nextLevel = level_manager.getNextLevel(this.currentLevel);
        if (nextLevel) {
            this.currentLevel = nextLevel;
            let mapName = level_manager.getMapFilename(this.currentLevel);
            this.loadMap(mapName);
            console.log("next map!")
            
            this.repositionCharacters();
        } else {
            console.log("player won!");
        }
    }
    repositionCharacters(){
        let spawnPoints = this.currentMap.spawnPoints;
        let index = 0;
        this.character_map.forEach((value,key)=>{
            // positioning
            value.character.teleport(spawnPoints[index]);
            index+=1;
            if(index>=spawnPoints.length){
                index = 0;
            }

        })
    }
    moveCharacter(char_logics, position) {
        // MTODO: if char_logics is object then execute, else find by character id
        char_logics.teleport(position);
    }
    createRunner() {
        this.runner = Runner.create();
    }
    getCharacterIdList() {
        return [...this.character_map.keys()]
    }
    isInGame(id) {
        return this.character_map.has(id);
    }
    createCharacter(id) {
        console.log(this.currentMap)
        let position = this.currentMap.spawnPoints[Math.floor(Math.random()*this.currentMap.spawnPoints.length)]
        var character = new Character(this.engine, position, id);
        this.character_map.set(id, { input: {}, character: character })
        return character;
    }
    deleteCharacter(id) {
        if (this.character_map.has(id)) {
            this.character_map.get(id).character.destroy();
            this.character_map.delete(id);
            // MTODO: return player's preferences (color, shape, tile?)
        }
    }
    loadMap(mapName) {

        // create two boxes and a ground
        var boxA = Bodies.rectangle(400, 200, 80, 80, { objType: "box" });
        var boxB = Bodies.rectangle(250, 50, 80, 80, { objType: "box" });

        this.isMapReady = false;
        // load using fs/request 
        if (!isNodejs()) {
            // using fetch
            fetch("maps/" + mapName)
                .then(response => response.json())
                .then(currentMapJson => {
                    this.currentMap = new GameMap(this, this.engine, currentMapJson);
                    this.isMapReady = true;
                    //DEBUG:
                    window.currentLevel = this.currentLevel;
                });
            console.log("browser")
        }
        else {
            // using fs
            // TODO: change to async version
            const fs = eval('require("fs")')
            const fileContents = fs.readFileSync('maps/' + mapName, 'utf8')

            try {
                const currentMapJson = JSON.parse(fileContents)
                this.currentMap = new GameMap(this, this.engine, currentMapJson);
                this.isMapReady = true;
            } catch (err) {
                console.error(err)
            }
        }
        // var currentMapJson = require("../maps/demo.json");

        // this.currentMap = new GameMap(this, this.engine, currentMapJson);

        // add some objects to the map
        // this.currentMap.addObject(boxA);
        // this.currentMap.addObject(boxB);
        // World.add(this.engine.world, boxA);
        // World.add(this.engine.world, boxB);

    }

    start() {
        // this.registerInputHandler();
        let context = this;
        Events.on(this.engine, 'beforeUpdate', function () {
            context.beforeUpdate()
        })
        if (this.runner)
            Runner.run(this.runner, this.engine);
        else {
            // run the engine w/o runner
            this.gameLoopInterval = setInterval(function () {
                Engine.update(context.engine, 1000 / 60);
            }, 1000 / 60);
        }
    }

    stop() {
        let context = this;
        Events.off(this.engine, 'beforeUpdate')
        if (this.runner)
            Runner.stop(this.runner, this.engine);
        else {
            // run the engine w/o runner
            clearInterval(this.gameLoopInterval)
        }
    }

    getCharactersRenderObj() {
        let objects = []
        this.character_map.forEach((character_info, key, map) => {
            if (character_info.character) {
                let c = character_info.character.bodyC;
                let obj = {
                    id: c.id,
                    client_id: key,
                    vertices: c.vertices.map((vertex) => {
                        return { x: vertex.x, y: vertex.y };
                    }),
                    tile_id: c.tile_id,
                    position: c.position
                }
                objects.push(obj);
            }
        })
        return objects
    }

    updateInput(id, input) {
        if (this.character_map.has(id))
            this.character_map.get(id).input = input;
    }

    beforeUpdate() {
        this.character_map.forEach((character_info, key, map) => {
            if (character_info.character && character_info.input) {
                character_info.character.inputHandler(character_info.input);
                character_info.character.update();
            }

        })

        if (this.currentMap) {
            this.currentMap.traps.forEach(trap => trap.update());
            this.currentMap.doors.forEach(door => door.update());
            // this.currentMap.items.forEach(item => item.update());
        }
    }
}