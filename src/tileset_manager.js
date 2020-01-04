export default {
    setP5Instance: function (p) {
        this.p_instance = p;
    },
    tilesets: new Map(),
    getTile: function (tilesetname, gid) {
        let tileset = this.getTileset(tilesetname);
        if (!tileset) return null; // if tileset is not finished loading
        let width = tileset.tilewidth;
        let height = tileset.tileheight;
        let x_cell = gid % tileset.columns;
        let y_cell = (gid-x_cell) / tileset.columns;
        let x_image = x_cell * width;
        let y_image = y_cell * height;
        return {
            tileset: tileset,
            x: x_image,
            y: y_image,
            width: width,
            height: height
        }
    },
    getTileset: function (name) {
        if (this.tilesets.has(name)) {
            return this.tilesets.get(name)
        } else {
            this.loadTileset(name)
            return null
        }
    },
    loadTileset: function (name) {
        if (!this.tilesets.has(name)) {
            // load tileset information from json
            fetch('/tilesets/' + name)
                .then(response => {
                    return response.json()
                })
                .then(tilesetJson => {
                    this.tilesets.set(name, tilesetJson);
                    return tilesetJson.image; // return the name of the image file
                })
                .then(imageName => {
                    // load image file
                    this.tilesets.get(name).image = this.p_instance.loadImage('/tilesets/' + imageName)
                    // fetch('/tilesets/' + imageName)
                    //     .then(response => {
                    //         return response.blob();
                    //     })
                    //     .then(response => {
                    //         var img = new Image();
                    //         this.tilesets.get(name).ready = false;
                    //         let that = this; // temporary assign context to that variable to use in anonymous function
                    //         img.onload = function () {
                    //             that.tilesets.get(name).ready = true;
                    //             console.log("tileset loaded")
                    //         }

                    //         img.src = URL.createObjectURL(response);
                    //         this.tilesets.get(name).image = img;

                    //     })
                })
        }
    },

}