export default class GameObject{
    constructor(body){
        this.body = body;
    }
    simplify(){
        return {
            id: this.body.id,
            vertices: this.body.vertices.map(vertex => {
                return { x: vertex.x, y: vertex.y }
            }),
            tile_id: this.body.render.tile_id,
            opacity: this.body.render.opacity,
            color: this.body.render.fillStyle,
            position: this.body.position
        }
    }
}