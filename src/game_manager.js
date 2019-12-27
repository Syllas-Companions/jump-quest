import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'
import Serializer from 'utilities/serializer'

var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

export default class GameManager {
    constructor() {
        this.serializer = Serializer.create();

        // create an engine
        this.engine = Engine.create();

        this.currentMap = loadDemoMap()

        // init character array
        this.characters = [];
    }
    createCharacter(){
        var character = new Character(engine, { x: 500, y: 500 });
        this.characters.push(character);
        return character;
    }
    loadDemoMap() {

        // create two boxes and a ground
        var boxA = Bodies.rectangle(400, 200, 80, 80);
        var boxB = Bodies.rectangle(250, 50, 80, 80);
        var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType: "ground" });
        var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType: "ground" });
        var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType: "ground" });
        var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType: "ground" });

        var currentMapJson = require("../../../maps/demo.json");
        // add all of the bodies to the world
        World.add(engine.world, [boxA, boxB, ground, leftBar, rightBar, upBar]);

        return new GameMap(engine, currentMapJson)
    }
}