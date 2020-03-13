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
    let pairs = new Map();

    // console.log(layerJson.objects);
    layerJson.objects.forEach(obj => {
        if(pairs.has(obj.name)){
            pairs.get(obj.name).push(obj);
        }else{
            pairs.set(obj.name, [obj]);
        }
    });
    pairs.forEach((val,key)=>{
        let t = new LazerGateTrap(this, val.map(e => {return { x: e.x - this.tileWidth/2, y: e.y - this.tileHeight/2 }}));
        createdObjects.push(t);
    })
    return createdObjects
}
GameMap.registerObjType('traps', false, initTraps);

export default LazerGateTrap;