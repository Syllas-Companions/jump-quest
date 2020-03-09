import GameMap from 'game-map/base'
import LazerGateTrap from './base'

function initTraps(layerJson){
    let lazerGateTraps = layerJson.layers.find(layer => layer.name == "lazerGateTraps");
    if (!lazerGateTraps) return [];
    let createObjects = createLazerGateTrap.call(this, lazerGateTraps);
    return createObjects;
}
function createLazerGateTrap(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let bt = new LazerGateTrap(this, { x: obj.x, y: obj.y });
        createdObjects.push(bt);
    })
    return createdObjects
}
GameMap.registerObjType('traps', false, initTraps);

export default LazerGateTrap;