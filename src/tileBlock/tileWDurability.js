import Tile from "./basicTile";
import './character-behaviour'
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
// TODO: implement
class TileWDurability extends Tile {
    constructor(map, x, y, width, height, tile_id) {
        super(map, x, y, width, height, tile_id);

    }
    update() { }
}