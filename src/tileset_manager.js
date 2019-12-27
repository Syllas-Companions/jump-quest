export class TileSet {
    constructor(tileset) {
        this.columns = tileset.columns;
        this.rows = (tileset.tilecount / this.columns) >> 0;
        let img = new Image()
        img.onload = () => {
            this.imgLoaded = true;
        }
        img.src = tileset.image;
        this.image = img;
        this.name = tileset.name;
        this.tiles = tileset.tiles
        console.log(this.tiles)
        this.tileSize = { x: tileset.tilewidth, y: tileset.tileheight }
    }

    draw(canvas, id, destX, destY) {
        let ctx = canvas.getContext("2d");
        if (this.imgLoaded) {
            let tile = this.getTileById(id);
            ctx.drawImage(
                this.image,
                tile.x, tile.y, tile.width, tile.height,
                destX, destY, CELL_SIZE, CELL_SIZE)
        } else {
            ctx.fillStyle = "#DDDDDD"
            ctx.fillRect(destX, destY, CELL_SIZE, CELL_SIZE)

        }
    }
    drawWRot(canvas, id, destX, destY, sizeX, sizeY, angle) {
        let ctx = canvas.getContext("2d");
        if (this.imgLoaded) {
            let tile = this.getTileById(id);
            ctx.translate(destX + sizeX / 2, destY + sizeY / 2);
            ctx.rotate(angle);
            ctx.drawImage(
                this.image,
                tile.x, tile.y, tile.width, tile.height,
                -sizeX / 2, -sizeY / 2, sizeX, sizeY)
            ctx.resetTransform();
        } else {
            ctx.fillStyle = "#DDDDDD"
            ctx.fillRect(destX, destY, CELL_SIZE, CELL_SIZE)

        }
    }
    getTileById(id) {
        //let type = this.tiles.find(t => t.id == id);
        let col = (id % this.columns) >> 0
        let row = (id / this.columns) >> 0;
        return {
            x: col * this.tileSize.x,
            y: row * this.tileSize.y,
            width: this.tileSize.x,
            height: this.tileSize.y
        }
    }
}
export default tileset_manager = {
    tilesets: new Map(),
    getTileset: function (id) {
        if (this.tilesets.has(id)) {
            return this.tilesets.get(id)
        } else {
            return this.loadTileset(id)
        }
    },
    loadTileset: function (id) {
        //fetch from some url and return,...
    },

}