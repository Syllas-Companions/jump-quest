import Matter from 'matter-js'
import Character from 'game-objects/character'
import GameMap from 'game-map'
import C from 'myConstants'
import level_manager from 'controllers/level_manager'

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
        this.hp = 100;
        this.total_hp = 100;
        this.character_map = new Map();
        this.nextMap = this.nextMap.bind(this);
        this.createCharacter = this.createCharacter.bind(this);
        this.moveCharacter = this.moveCharacter.bind(this);
    }
    decreaseHp(damage) {
        if (damage) {
            this.hp -= damage;
        } else {
            this.hp -= 1;
        }
        if (this.hp <= 0) {
            if (this.loseCallback) this.loseCallback();
            // player loses, call the callback (to room_manager/multi mode) or show popup (single mode TODO)
        }
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
    repositionCharacters(charId) {
        let spawnPoints = this.currentMap.spawnPoints;
        let index = 0;
        this.character_map.forEach((value, key) => {
            if ((charId && charId == key) || !charId) {
                // positioning
                value.character.teleport(spawnPoints[index], true);
                index += 1;
                if (index >= spawnPoints.length) {
                    index = 0;
                }
            }
        })
    }
    moveCharacter(char_logics, position) {
        // if char_logics is object then execute, else find by character id
        if (typeof char_logics == "object") {
            char_logics.teleport(position, false);
        }
        else {
            // char_logics as id
            let char_logics_obj = this.character_map.get(char_logics).character;
            if (char_logics_obj) {
                char_logics_obj.teleport(position, false);
            }
        }
    }
    createRunner() {
        this.runner = Runner.create();
    }
    getCharacterIdList() {
        return [...this.character_map.keys()]
    }
    getPlayerCount() {
        return this.character_map.size;
    }
    isInGame(id) {
        return this.character_map.has(id);
    }
    createCharacter(id, metadata) {
        // console.log(this.currentMap)
        let position = this.currentMap.spawnPoints[Math.floor(Math.random() * this.currentMap.spawnPoints.length)]
        var character = new Character(this, position, id, metadata);
        this.character_map.set(id, { input: {}, character: character })
        return character;
    }
    deleteCharacter(id) {
        if (this.character_map.has(id)) {
            let metadata = this.character_map.get(id).character.metadata;
            this.character_map.get(id).character.destroy();
            this.character_map.delete(id);
            // return player's preferences (color, shape, tile?)
            return metadata;
        }
        return null;
    }
    loadMap(mapName) {

        // create two boxes and a ground

        this.isMapReady = false;
        // load using fs/request 
        if (!isNodejs()) {
            // using fetch
            fetch("maps/" + mapName)
                .then(response => response.json())
                .then(currentMapJson => {
                    console.log("map json: " + currentMapJson)
                    if (this.currentMap)
                        this.currentMap.destroy();
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
            // (in GameManager will need action queue with Promise, 
            //  since new character can't be create if map's not ready)
            const fs = eval('require("fs")')
            const fileContents = fs.readFileSync('resources/maps/' + mapName, 'utf8')

            try {
                const currentMapJson = JSON.parse(fileContents)
                if (this.currentMap)
                    this.currentMap.destroy();
                this.currentMap = new GameMap(this, this.engine, currentMapJson);
                this.isMapReady = true;
            } catch (err) {
                console.error(err)
            }
        }
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
                objects.push(character_info.character.simplify());
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
            this.currentMap.update();
        }
    }
    // create a minimized list of object to send to client
    simplify() {
        return {
            timestamp: Date.now(),
            hp: this.hp,
            total_hp: this.total_hp,
            objects: [].concat(this.currentMap.getMovingObj(), this.getCharactersRenderObj()).filter(e => e)
        }
    }
}