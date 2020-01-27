import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'

var Engine = Matter.Engine,
    Events = Matter.Events,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

export default class GameManager {
    constructor(gmId) {
        this.id = gmId;
        // create an engine
        this.engine = Engine.create();

        this.loadDemoMap() // MTODO: Load map based on gmId (more information in room_manager). mapJson taken from level_manager

        // init character array
        this.character_map = new Map();

    }
    // MTODO: implement function for loading map
    // load other map if room_manager not exist/uninitialized, call change room on room_manager if exist/initialized
    changeMap(mapName){
        
    }
    createRunner() {
        this.runner = Runner.create();
    }
    getCharacterIdList() {
        return [...this.character_map.keys()]
    }
    isInGame(id){
        return this.character_map.has(id);
    }
    createCharacter(id) {
        var character = new Character(this.engine, { x: 500, y: 500 }, id);
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
    loadDemoMap() {

        // create two boxes and a ground
        var boxA = Bodies.rectangle(400, 200, 80, 80 ,{objType: "box"});
        var boxB = Bodies.rectangle(250, 50, 80, 80 ,{objType: "box"});

        var currentMapJson = require("../maps/demo.json");
        
        this.currentMap = new GameMap(this, this.engine, currentMapJson);

        // add some objects to the map
        this.currentMap.addObject(boxA);
        this.currentMap.addObject(boxB);
        World.add(this.engine.world, boxA);
        World.add(this.engine.world, boxB);
        
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

        this.currentMap.traps.forEach(trap => trap.update());
        this.currentMap.doors.forEach(door => door.update());
        // this.currentMap.items.forEach(item => item.update());
    }
}