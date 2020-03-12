import GameMap from 'game-map/base'
import Rope from './base'
import './character-behaviour' // add rope's interactions to character

function initRopes(layerJson) {
    let createdObjects = []
    if (!layerJson) return createdObjects;
    layerJson.objects.forEach(obj => {
        let rope = new Rope(this, obj)
        createdObjects.push(rope);
    })
    return createdObjects
}
GameMap.registerObjType('ropes', false, initRopes);

export default Rope