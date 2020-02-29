import p5 from 'p5'
import { polynomial } from 'everpolate'
import tileset_manager from 'tileset_manager'
import camera from 'camera'
import C from 'myConstants'

// TODO: uniform function to draw static/dynamic function (meaning, if position turn out to be array -> use array method, else use number method)
export default function (clientState) {
    let sketch = function (p) {
        p.drawMovingObjs = function () {
            let timestamp = new Date().getTime();
            p.push();
            clientState.dynamicData.forEach((obj, id) => {
                if (clientState.id == obj.client_id && obj.type == C.LAYER_CHARACTER) {
                    camera.towards(obj.position.x[obj.position.x.length - 1], obj.position.y[obj.position.y.length - 1]);
                    window.camera = camera;
                }
                let prediction = (obj.timestamp.length >= 3);
                let x, y;
                p.fill(255);
                if (prediction) {
                    x = polynomial(timestamp, obj.timestamp, obj.position.x)[0];
                    y = polynomial(timestamp, obj.timestamp, obj.position.y)[0];

                } else {
                    x = obj.position.x[obj.position.x.length - 1]
                    y = obj.position.y[obj.position.y.length - 1];
                }
                // TODO: render obj.opacity as hp-bar if value != 1 due to performance when changing tint value
                if (obj.tile_id) {
                    // draw tile
                    let tileset = clientState.mapData.tilesets.find(ts => {
                        return ts.firstgid < obj.tile_id + 1;
                    })
                    if (tileset) {
                        let res = tileset_manager.getTile(tileset.source, obj.tile_id - tileset.firstgid)
                        if (res) {
                            // resource ready
                            p.imageMode(p.CENTER);
                            p.image(res.tileset.image, x, y, 64, 64, res.x, res.y, res.width, res.height);

                        } else {
                            console.log("not ready yet")
                        }
                    }
                } else {
                    if (obj.metadata && obj.metadata.color) {
                        p.noStroke()
                        p.fill(obj.metadata.color.r, obj.metadata.color.g, obj.metadata.color.b);
                    } else if (obj.color) {
                        p.noStroke()
                        p.fill(obj.color);
                    }else {
                        p.stroke(155, 155, 0);
                        p.noFill();
                    }
                    p.beginShape();
                    // draw borders of moving object
                    obj.vertices.forEach(vertex => {
                        if (prediction) {
                            let x_prediction = polynomial(timestamp, obj.timestamp, vertex.x)[0];
                            let y_prediction = polynomial(timestamp, obj.timestamp, vertex.y)[0];
                            p.vertex(x_prediction, y_prediction);
                        } else {
                            p.vertex(vertex.x[vertex.x.length - 1], vertex.y[vertex.y.length - 1]);
                        }
                    })
                    p.endShape(p.CLOSE);
                }
                // draw the client name on top (for players)
                if (obj.type == C.LAYER_CHARACTER) {
                    if (obj.client_id) {
                        p.text(obj.client_id, x - 70, y - 35);
                    }
                }
            })
            p.pop();
        }
        p.drawBackground = function () {
            if (clientState.mapData && clientState.mapData.background && clientState.mapData.background != "") {
                p.push();
                let img = tileset_manager.getBackground(clientState.mapData.background);
                // calibrate base on camera
                if (img) {
                    p.scale(1.2)
                    p.imageMode(p.CENTER);
                    p.image(img, camera.position.x * 0.9, camera.position.y * 0.5);
                }
                p.pop();
            }

        }
        p.drawMap = function () {
            if (clientState.mapData) {
                p.push();
                // Render tiles using tilesheet's information (TileSet and tileset_manager)
                clientState.mapData.map.forEach(obj => {
                    let tileset = clientState.mapData.tilesets.find(ts => {
                        return ts.firstgid < obj.tile_id + 1;
                    })
                    if (tileset) {
                        let res = tileset_manager.getTile(tileset.source, obj.tile_id - tileset.firstgid)
                        if (res) {
                            // resource ready
                            p.imageMode(p.CENTER);
                            p.image(res.tileset.image, obj.position.x, obj.position.y, 64, 64, res.x, res.y, res.width, res.height);
                        } else {
                            console.log("not ready yet")
                        }
                        // TEST DATA W/O IMAGE
                        // p.fill(123)
                        // p.rect(obj.position.x, obj.position.y, 64,64);
                    } else {
                        // if resource not found
                        p.stroke(160);
                        p.rectMode(p.CENTER)
                        p.noFill();
                        p.beginShape();
                        obj.vertices.forEach(vertex => {
                            p.vertex(vertex.x, vertex.y);
                        })
                        p.endShape(p.CLOSE);
                    }
                });
                p.pop();
            }
        }
        p.setup = function () {
            tileset_manager.setP5Instance(p);
            p.createCanvas(p.windowWidth - 20, p.windowHeight - 20);
            camera.width = p.windowWidth - 20;
            camera.height = p.windowHeight - 20;
            p.frameRate(60)
        };
        p.keyPressed = function () {
            if (p.keyCode === p.ENTER) {
                console.log(clientState);
            }
        }
        p.draw = function () {
            if (clientState.isAlive) {
                camera.update();
                p.background(0);
                p.push()
                p.scale(camera.scale)
                let cam_min = camera.min()
                let cam_max = camera.max()
                p.translate(-cam_min.x, -cam_min.y)
                p.drawBackground();
                p.drawMap();
                p.drawMovingObjs();
                p.fill(255)
                p.text("Room: " + clientState.mapData.name, cam_min.x + 20, cam_min.y + 20);
                p.text(clientState.latency, cam_max.x - 20, cam_min.y + 20);
                p.pop();
            } else {
                p.push();
                p.textAlign(p.CENTER);
                p.textSize(30);
                p.text("DISCONNECTED", p.windowWidth / 2, p.windowHeight / 2)
                p.pop();
            }
        };
    };
    let p5_instance = new p5(sketch);

}