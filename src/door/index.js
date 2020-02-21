import GameMap from 'game-map/base'
import Door from './base'

function initDoors(layerJson) {
    let createdObjects = []
    if (!layerJson) return createdObjects;
    layerJson.objects.forEach(obj => {
        let door = null;
        if (obj.type == "change_map") {
            door = new Door(this, obj, this.cbNextMap);
        } else if (obj.type == "teleport") {
            door = new Door(this, obj, this.cbMoveCharacter);
        }
        if (door) {
            createdObjects.push(door);
        }
    })
    return createdObjects;
}
GameMap.registerObjType('doors', true, initDoors);

export default Door