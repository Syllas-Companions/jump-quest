

import GameMap from 'game-map/base'
import SpringTrap from './base'

function initTraps(layerJson) {
    let springTraps = layerJson.layers.find(layer => layer.name == "springTraps");
    if (!springTraps) return [];
    let createdObjects = createSpringTraps.call(this, springTraps);
    return createdObjects;
}

function createSpringTraps(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let bt = new SpringTrap(this, { x: obj.x - this.tileWidth/2, y: obj.y - this.tileHeight/2});
        createdObjects.push(bt);
    })
    return createdObjects
}
GameMap.registerObjType('traps', false, initTraps);

export default SpringTrap
