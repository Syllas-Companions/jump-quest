import GameMap from 'game-map/base'
import Tile from './basicTile'
import TileWDurability from './tileWDurability'
import MovablePlatform from './movablePlatform'
import HookableWall from './hookableWall'
function initPlatforms(layerJson) {

    function initPlatformsLayer(layerJson, type, createdObjects) {
        if (layerJson.type == 'tilelayer') {
            for (let i = 0; i < layerJson.height; i++) {
                for (let j = 0; j < layerJson.width; j++) {
                    if (layerJson.data[i * layerJson.width + j] != 0) {
                        let tile = new type(this,
                            layerJson.x + j * this.tileWidth,
                            layerJson.y + i * this.tileHeight,
                            this.tileWidth, this.tileHeight,
                            layerJson.data[i * layerJson.width + j]
                        )
                        createdObjects.push(tile);
                    }
                }
            }
        } else if (layerJson.type == 'objectgroup' && layerJson.name == 'movable') {

        }
    }

    let createdObjects = []
    layerJson.layers.forEach(layer => {
        let type = Tile;
        switch (layer.name) {
            case 'basic': type = Tile; break;
            case 'destructible': type = TileWDurability; break;
            case 'hookable': type = HookableWall; break;
        }
        initPlatformsLayer.call(this, layer, type, createdObjects);
    })
    return createdObjects
}
GameMap.registerObjType('platforms', true, initPlatforms);

export {Tile, TileWDurability, MovablePlatform, HookableWall}

