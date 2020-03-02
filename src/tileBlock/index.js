import GameMap from 'game-map/base'
import Tile from './basicTile'
import TileWDurability from './tileWDurability'
import MovablePlatform from './movablePlatform'
import HookableWall from './hookableWall'

function initTileLayer(layerJson, type, createdObjects) {
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
    }
    if(layerJson.type == 'objectgroup'){
        if(layerJson.name == 'movable') {
            var polygon = [];

            layerJson.objects.forEach(layer => {
                if(layer.name == 'path'){
                    polygon = layer.polygon;
                }
            })
            layerJson.objects.forEach(layer => {
                if(layer.name == 'tile') { 
                    let tileObjG = new type(this,
                        layer.x,
                        layer.y,
                        this.tileWidth,
                        this.tileHeight,
                        layer.data,
                        polygon
                        );
                        createdObjects.push(tileObjG);
                        
                }
            })
        }
    }
}

function initStaticPlatforms(layerJson) {
    let createdObjects = []
    layerJson.layers.forEach(layer => {
        let type = null;
        switch (layer.name) {
            case 'basic': type = Tile; break;
            case 'hookable': type = HookableWall; break;
        }
        if (type) {
            initTileLayer.call(this, layer, type, createdObjects);
        }
    })
    return createdObjects
}
GameMap.registerObjType('platforms', true, initStaticPlatforms);

function initDynamicPlatforms(layerJson) {
    let createdObjects = []
    layerJson.layers.forEach(layer => {
        let type = null;
        switch (layer.name) {
            case 'destructible': type = TileWDurability; break;
            case 'movable': type = MovablePlatform; break;
        }
        if (type) {
            initTileLayer.call(this, layer, type, createdObjects);
            console.log(createdObjects);
        }
    })
    return createdObjects
}
GameMap.registerObjType('platforms', false, initDynamicPlatforms, 'platformsDynamic');

export { Tile, TileWDurability, MovablePlatform, HookableWall }

