export default {
    levels: new Map([
        ['lobby', "demo.json"],
        ['0', "demo.json"],
        ['1', "demo.json"],
        ['2', "demo.json"]
    ]),
    level_order: ['0','1','2'],
    getDefaultLevel: function(){
        return this.level_order[0];
    },
    getNextLevel: function(level_name){
        let i = this.level_order.findIndex(lv => lv==level_name);
        i=i+1;
        if(i<=0 || i>=this.level_order.length){
            return null;
        }else{
            return this.level_order[i];
        }
    },
    getMapFilename: function(level_name){
        return this.levels.get(level_name);
    }
}