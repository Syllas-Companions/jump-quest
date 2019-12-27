export default camera = {
    viewport: {
        x: 0,
        y:0,
        ratio: 1
    },
    follow: function(target){
        this.target = target;
    },
    update: function(){
        // move camera toward target's position
    }
}