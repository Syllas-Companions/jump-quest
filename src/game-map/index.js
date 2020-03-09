import GameMap from './base.js'

// import other modules/ object types to the map; to disable an object type from the game, just commend out its module
import BearTrap from 'game-objects/traps/BearTrap'
import LazerGateTrap from 'game-objects/traps/LazerGateTrap'
import Door from 'game-objects/door'
import Rope from 'game-objects/rope'
import ItemBox from 'game-objects/items/Box'
import CreepEnemy from 'game-objects/enemy/CreepEnemy'
import {Tile, TileWDurability, MovablePlatform, HookableWall} from 'game-objects/tileBlock'

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