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
    constructor() {
        // create an engine
        this.engine = Engine.create();

        this.loadDemoMap()

        // init character array
        this.character_map = new Map();

    }

    createRunner() {
        this.runner = Runner.create();
    }
    createCharacter(id) {
        var character = new Character(this.engine, { x: 500, y: 500 });
        this.character_map.set(id, { input: {}, character: character })
        return character;
    }
    deleteCharacter(id) {
        if (this.character_map.has(id)) {
            this.character_map.get(id).character.destroy();
            this.character_map.delete(id);
        }
    }
    loadDemoMap() {

        // create two boxes and a ground
        var boxA = Bodies.rectangle(400, 200, 80, 80);
        var boxB = Bodies.rectangle(250, 50, 80, 80);
        var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType: "ground" });
        var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType: "ground" });
        var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType: "ground" });
        var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType: "ground" });

        var currentMapJson = require("../maps/demo.json");
        // add all of the bodies to the world
        //World.add(this.engine.world, [/*boxA, boxB,*/ ground, leftBar, rightBar, upBar]);

        this.currentMap = new GameMap(this.engine, currentMapJson);

        // add some objects to the map
        this.currentMap.addObject(boxA);
        this.currentMap.addObject(boxB);
        this.currentMap.addObject(ground);
        this.currentMap.addObject(upBar);
        this.currentMap.addObject(rightBar);
        this.currentMap.addObject(leftBar);

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
        // if(this.character_map)
        this.character_map.forEach((character_info, key, map) => {
            if (character_info.character && character_info.input) {
                character_info.character.inputHandler(character_info.input);
                character_info.character.update();
            }

        })
        // bearTrap1.update();
        // bearTrap2.update();
    }
}