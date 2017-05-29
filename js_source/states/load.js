// Load assets state
Game.loadState = {
    preload: function() {
        Engine.add.text(10, 10, "Loading...", {font: "20px Arial", fill: "#ffffff"});
        console.info(Game.name + " loading assets");

        // Put your assets loaders here
    },

    create: function() {
        Engine.state.start("main");
    }
}
