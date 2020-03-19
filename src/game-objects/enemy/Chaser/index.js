import GameMap from 'game-map/base'
import ChaserEnemy from './enemy'
// import './movement'

function initEnemies(layerJson) {
    let chaserEnemies = layerJson.layers.find(layer => layer.name == "chasers");
    if (!chaserEnemies) return [];
    let createdObjects = createEnemies.call(this, chaserEnemies);
    return createdObjects;
}
function createEnemies(layerJson) {
    let createdObjects = [];
    layerJson.layers.forEach(layer => {
        let ce = new ChaserEnemy(this, layer);
        createdObjects.push(ce);
    });
    return createdObjects
}
GameMap.registerObjType('enemies', false, initEnemies);

export default ChaserEnemy