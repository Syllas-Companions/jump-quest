import GameMap from './base.js'

// import other modules/ object types to the map; to disable an object type from the game, just commend out its module
import BearTrap from 'traps/BearTrap'
import Door from 'door'
import Rope from 'rope'
// import ItemBox from 'items/Box'
import CreepEnemy from 'enemy/CreepEnemy'
import {Tile, TileWDurability, MovablePlatform, HookableWall} from 'tileBlock'

function initBackground(layerJson) {
    let matched = layerJson.image.match(/([^/]*)$/);
    this.background = matched ? matched[0] : bgLayer.image
    return [];
}

GameMap.registerObjType('background', true, initBackground);

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

export default GameMap