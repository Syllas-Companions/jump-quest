export default {
    levels: new Map([
        ['lobby', "lobby.json"],
        ['0', "maplevel1.json"],
        ['1', "maplevel2.json"],
        ['2', "maplevel3.json"]
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