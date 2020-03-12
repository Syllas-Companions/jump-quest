import GameMap from 'game-map/base'
import ItemBox from './item'
import './character-behaviour'

function initItems(layerJson) {
    let itemBoxes = layerJson.layers.find(layer => layer.name == "boxs");
    if (!itemBoxes) return [];
    let createdObjects = createItemBoxes.call(this, itemBoxes);
    return createdObjects;
}
function createItemBoxes(layerJson) {
    let createdObjects = [];
    layerJson.objects.forEach(obj => {
        let itemBox = new ItemBox(this, { x: obj.x, y: obj.y });
        createdObjects.push(itemBox);
    })
    return createdObjects
}
GameMap.registerObjType('items', false, initItems);

export default ItemBox