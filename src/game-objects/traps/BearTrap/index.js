import GameMap from 'game-map/base'
import BearTrap from './base'

function initTraps(layerJson) {
    let bearTraps = layerJson.layers.find(layer => layer.name == "bearTraps");
    if (!bearTraps) return [];
    let createdObjects = createBearTraps.call(this, bearTraps);
    return createdObjects;
}

function createBearTraps(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let bt = new BearTrap(this, { x: obj.x - this.tileWidth/2, y: obj.y - this.tileHeight/2});
        createdObjects.push(bt);
    })
    return createdObjects
}
GameMap.registerObjType('traps', false, initTraps);

export default BearTrap