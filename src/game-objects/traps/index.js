import BearTrap from './BearTrap'
import LazerGateTrap from './LazerGateTrap'

// function initTraps(layerJson) {
//     console.log("hello");
//     let bearTraps = layerJson.layers.find(layer => layer.name == "bearTraps");
//     if (!bearTraps) return [];
//     let createdObjects = createBearTraps.call(this, bearTraps);
//     return createdObjects;
// }

// function createBearTraps(layerJson) {
//     let createdObjects = [];
//     layerJson.objects.forEach(obj => {
//         let bt = new BearTrap(this, { x: obj.x, y: obj.y });
//         createdObjects.push(bt);
//     })
//     return createdObjects
// }
// GameMap.registerObjType('traps', false, initTraps);

export {BearTrap, LazerGateTrap} 