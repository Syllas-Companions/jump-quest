import Matter from 'matter-js'
import GameManager from 'game_manager'
import camera from 'camera'
// import BearTrap from './traps/BearTrap'

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
    // var engine = Engine.create();
    var game_manager = new GameManager();
    game_manager.createRunner();
    // create a renderer
    var render = Render.create({
        element: document.body,
        engine: game_manager.engine,
        options: {
            width: window.innerWidth - 20,
            height: window.innerHeight - 20,
            wireframes: true,
            showSleeping: true,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showSeparations: false,
            showAxes: false,
            showPositions: false,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false,
            showVertexNumbers: false,
            showConvexHulls: false,
            showInternalEdges: false,
            showMousePosition: false
        }
    });


    /*********************************************************** GAME CODE START ************************************************************/
    // create two boxes and a ground
    // var boxA = Bodies.rectangle(400, 200, 80, 80);
    // var boxB = Bodies.rectangle(250, 50, 80, 80);
    // var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType: "ground" });
    // var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType: "ground" });
    // var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType: "ground" });
    // var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType: "ground" });


    //create new character
    // var character = new Character(engine, { x: 500, y: 500 });
    // console.log(character);

    setTimeout(function () {
        if(!game_manager.isMapReady){
            console.log("waiting")
            setTimeout(this,500);
            return;
        }
        var character = game_manager.createCharacter(1)

        //create new traps
        // var bearTrap1 = new BearTrap(engine, { x: 600, y: 600} );
        // var bearTrap2 = new BearTrap(engine, { x: 700, y: 600} );
        // console.log(bearTrap1);
        //input to move character
        var keyState = {}
        window.addEventListener('keydown', function (e) {
            keyState[e.keyCode || e.which] = true;
            game_manager.updateInput(1, keyState);
        }, true);
        window.addEventListener('keyup', function (e) {
            keyState[e.keyCode || e.which] = false;
            game_manager.updateInput(1, keyState);
        }, true);
        // Events.on(engine, 'beforeUpdate', function () {
        //     character.inputHandler(keyState);
        //     character.update();
        // bearTrap1.update();
        // bearTrap2.update();
        // })

        // var currentMap = null;
        // fetch("/maps/demo.json")
        //     .then(res => {
        //         return res.json()
        //     }).then(res => {
        //         currentMap = new GameMap(engine, res)
        //         console.log(engine.world)
        //     })

        // add all of the bodies to the world
        // World.add(engine.world, [boxA, boxB, ground, leftBar, rightBar, upBar]);

        /*********************************************************** GAME CODE END ************************************************************/
        // run the engine
        // var runner = Runner.create();
        // Runner.run(runner, engine);

        // run the renderer
        // Render.lookAt(render,character.composite)
        Render.run(render);
        game_manager.start();

        /* SINGLE MODE CAMERA UPDATE */
        camera.width = render.canvas.width;
        camera.height = render.canvas.height;
        setInterval(function () {
            camera.towards(character.composite.position.x, character.composite.position.y);
            camera.update();
            Render.lookAt(render, [{
                min: camera.min(),
                max: camera.max()
            }])
        }, 15)

    },500);
    // context for MatterTools.Demo
    return {
        engine: game_manager.engine,
        runner: game_manager.runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(game_manager.runner);
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
