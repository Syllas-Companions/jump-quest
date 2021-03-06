import p5 from 'p5'
import { polynomial } from 'everpolate'
import tileset_manager from 'controllers/tileset_manager'
import camera from 'camera'
import C from 'myConstants'
import gui from './gui'
export default function (socket, clientState) {
    let sketch = function (p) {
        function getCoordinate(timestamp, point) {
            let curTime = new Date().getTime();
            let x, y;
            if (Array.isArray(timestamp)) {
                // input is array => can be predict
                let prediction = (timestamp.length >= 3);
                if (prediction) { // predictable
                    // check if distance is too high then return last received value (in this case prediction is likely incorrect)
                    x = polynomial(curTime, timestamp, point.x)[0];
                    y = polynomial(curTime, timestamp, point.y)[0];
                    if (p.dist(x, y, point.x[point.x.length - 1], point.y[point.y.length - 1]) > C.CLIENT.MAX_EXTRAPOLATION_RANGE) {
                        x = point.x[point.x.length - 1]
                        y = point.y[point.y.length - 1];
                    }
                } else {
                    x = point.x[point.x.length - 1]
                    y = point.y[point.y.length - 1];
                }
            } else {
                x = point.x;
                y = point.y;
            }
            return { x, y }
        }
        function drawHpBar(x, y, w, h, percent) {
            p.push();
            p.translate(x - w / 2, y - h / 2);
            p.fill(255);
            p.rect(0, 0, w, h);
            p.fill(200, 0, 0);
            p.noStroke();
            p.rect(2, 1, (w - 4) * (percent), h - 2);
            p.pop();
        }
        function drawObject(obj) {
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
                        let { x, y } = getCoordinate(obj.timestamp, obj.position);
                        p.image(res.tileset.image, x, y, 64, 64, res.x, res.y, res.width, res.height);

                    } else {
                        console.log("tileset not ready")
                    }
                }
            } else {
                // no tile_id => draw border and color
                // setting up color
                if (obj.metadata && obj.metadata.color) {
                    p.noStroke()
                    p.fill(obj.metadata.color.r, obj.metadata.color.g, obj.metadata.color.b);
                } else if (obj.color) {
                    p.noStroke()
                    p.fill(obj.color);
                } else {
                    p.stroke(155, 155, 0);
                    p.noFill();
                }
                p.beginShape();
                // draw border
                obj.vertices.forEach(vertex => {
                    let { x, y } = getCoordinate(obj.timestamp, vertex);
                    p.vertex(x, y);
                })
                p.endShape(p.CLOSE);
            }
            if (obj.type == C.LAYER_MAP_TILES) {
                // render obj.hp (for platform with durability) as hp-bar due to performance when changing tint value
                if (obj.hp && obj.total_hp) {
                    let { x, y } = getCoordinate(obj.timestamp, obj.position);
                    let hp_bar_height = 6;
                    let hp_bar_x_offset = 10;
                    let hp_bar_length = obj.size.x - 2 * hp_bar_x_offset;
                    drawHpBar(x, y, hp_bar_length, hp_bar_height, (obj.hp / obj.total_hp))
                }
            }
            if (obj.type == C.LAYER_CHARACTER) {
                // flashing character when statuses contains "hurt"
                if (obj.statuses) {
                    // console.log(obj.statuses);
                    let message = obj.statuses.find(s => s.name == 'message');
                    if (message) {
                        p.push();
                        let { x, y } = getCoordinate(obj.timestamp, obj.position);

                        p.translate(x, y - 75);

                        // draw bubble
                        p.stroke(0);
                        p.fill(255);
                        if (obj.facing == -1) p.scale(-1, 1);
                        p.triangle(40, 25, 45, 25, 35, 30);
                        if (obj.facing == -1) p.scale(-1, 1);
                        p.rectMode(p.CENTER);
                        p.rect(0, 0, 100, 50);
                        // draw text
                        p.textSize(12);
                        p.fill(0);
                        p.noStroke()

                        p.textAlign(p.CENTER);
                        p.text(message.info, 0, 0, 90, 40);

                        p.pop();
                    }

                    if (obj.statuses.find(s => s.name == 'hurt')) {
                        p.push();
                        let alpha = p.sin(Date.now() / 25) > 0 ? 100 : 0;
                        p.fill(0, 0, 0, alpha);
                        p.beginShape();
                        // draw border
                        obj.vertices.forEach(vertex => {
                            let { x, y } = getCoordinate(obj.timestamp, vertex);
                            p.vertex(x, y);
                        })
                        p.endShape(p.CLOSE);
                        p.pop();
                    }
                }
                // draw face of character
                if (obj.faceAscii) {
                    p.push();
                    p.fill(255);
                    p.stroke(0);
                    let { x, y } = getCoordinate(obj.timestamp, obj.position);
                    p.translate(x, y);
                    p.scale(0.6, 1)
                    if (obj.facing == -1) p.scale(-1, 1);
                    // p.textAlign(p.CENTER);
                    p.textSize(16);
                    // p.textFont(p.faceFont);
                    p.strokeWeight(3);
                    p.text(obj.faceAscii, 0, 0);
                    // p.textFont(p.font);
                    if (obj.facing == -1) p.scale(-1, 1);
                    p.pop();
                }
                // draw the client name on top (for players)
                if (obj.client_id) {
                    p.push();
                    let { x, y } = getCoordinate(obj.timestamp, obj.position);
                    p.translate(x - 70, y - 35);
                    p.textSize(12);
                    p.text(obj.client_id, 0, 0);
                    p.pop();
                }
            }
        }
        p.drawMovingObjs = function () {
            p.push();
            clientState.dynamicData.forEach((obj, id) => {
                if (clientState.id == obj.client_id && obj.type == C.LAYER_CHARACTER) {
                    camera.towards(obj.position.x[obj.position.x.length - 1], obj.position.y[obj.position.y.length - 1]);
                    window.camera = camera;
                }
                drawObject(obj);
            })
            p.pop();
        }
        p.drawMap = function () {
            if (clientState.mapData) {
                p.push();
                // Render tiles using tilesheet's information (TileSet and tileset_manager)
                clientState.mapData.map.forEach(obj => {
                    drawObject(obj);
                });
                p.pop();
            }
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
        // TODO: move GUI to another file
        p.initGUI = function () {
            gui.init(socket, clientState, p);
        }

        p.updateRoomHp = function () {
            p.push()
            p.scale(camera.scale)
            let cam_min = camera.min()
            let cam_max = camera.max()
            p.translate(-cam_min.x, -cam_min.y)
            if (clientState.hp) {
                let side_offset = 150;
                let hp_bar_width = cam_max.x - cam_min.x - side_offset * 2;

                drawHpBar(camera.position.x, cam_min.y + 25, hp_bar_width, 20, (clientState.hp / 100.0))
            }
            p.pop();
        }
        p.preload = function () {
            // p.font = p.loadFont('/fonts/arial.ttf');
            // p.faceFont = p.loadFont('/fonts/seguisym.ttf');
            // console.log(p.textFont)
        }
        p.setup = function () {
            p.select('body').style('margin:0px')
            tileset_manager.setP5Instance(p);
            let canvas = p.createCanvas(p.windowWidth, p.windowHeight/*, p.WEBGL*/);
            canvas.style('display:block')
            camera.width = p.windowWidth;
            camera.height = p.windowHeight;
            p.frameRate(60);

            // let button = p.createButton('click me');
            // button.position(0, 0);
            p.initGUI();
        };
        p.keyPressed = function () {
            if (p.keyCode === p.ESCAPE) {
                if (gui.isChatOn)
                    gui.toggleChat()
                else
                    gui.toggleMenu();
            }
            if (p.keyCode === p.ENTER) {
                gui.toggleChat();
            }
        }
        p.draw = function () {
            // p.translate(-p.windowWidth/2, -p.windowHeight/2) // WEBGL MODE ONLY, DUE TO DIFFERENT IN COORDINATE"S ORIGIN
            // p.textFont(p.font);
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
                p.stroke(0)
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
            p.updateRoomHp();
        };
    };
    let p5_instance = new p5(sketch);

}