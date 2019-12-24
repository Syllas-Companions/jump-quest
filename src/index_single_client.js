import Matter from 'matter-js'
import Character from './character'
import GameMap from './game-map'

var Example = Example || {}

Example.init = function () {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Events = Matter.Events,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Runner = Matter.Runner;

    // create an engine
    var engine = Engine.create();

    // create a renderer 
    var render = Render.create({
        element: document.body,
        engine: engine
    });


    /*********************************************************** GAME CODE START ************************************************************/
    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(250, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType: "ground" });
    var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType: "ground" });
    var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType: "ground" });
    var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType: "ground" });


    //create new character
    var character = new Character(engine, { x: 500, y: 500 });


    //input to move character
    var keyState = {}
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);

    Events.on(engine, 'beforeUpdate', function () {
        character.inputHandler(keyState)
        character.update()
    })

    var currentMap = null;
    fetch("/maps/demo.json")
        .then(res => {
            return res.json()
        }).then(res => {
            currentMap = new GameMap(engine, res)
            console.log(engine.world)
        })

    // add all of the bodies to the world
    World.add(engine.world, [boxA, boxB, ground, leftBar, rightBar, upBar]);

    /*********************************************************** GAME CODE END ************************************************************/
    // run the engine
    var runner = Runner.create();
    Runner.run(runner, engine);

    // run the renderer
    Render.run(render);
    
    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
}

// Expose variables for Viewer
if (window && window._EXPLORER_MODE) {
    window.Example = Example;
    window.Matter = Matter;
} else {
    Example.init();
}