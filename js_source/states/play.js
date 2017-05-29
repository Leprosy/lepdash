// Play loop state
Game.playState = {
    preload: function() {
        console.info(Game.name + " play loop");
    },

    // Create your play logic here
    /*User*/
    create: function() {
        Engine.add.text(10, 10, "playing", {font: "20px Arial", fill: "#ffffff"});
    }
}
