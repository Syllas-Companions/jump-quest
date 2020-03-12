import GameMap from 'game-map/base'
import CreepEnemy from './enemy'
import './movement'

function initEnemies(layerJson) {
    let creepEnemies = layerJson.layers.find(layer => layer.name == "creeps");
    if (!creepEnemies) return [];
    let createdObjects = createCreepEnemies.call(this, creepEnemies);
    return createdObjects;
}
function createCreepEnemies(layerJson) {
    let createdObjects = [];
    layerJson.layers.forEach(layer => {
        let ce = new CreepEnemy(this, layer);
        createdObjects.push(ce);
    });
    return createdObjects
}
GameMap.registerObjType('enemies', false, initEnemies);

export default CreepEnemy