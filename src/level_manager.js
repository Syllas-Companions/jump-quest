export default {
    levels: new Map([
        ['lobby', "demo.json"],
        ['0', "demo.json"]
    ]),
    loadLevel(name) {
        if (this.levels.has(name)){
            let url = 'maps/' + levels.get(name);
            // TODO: open with fs then return promise
        }
    }
}