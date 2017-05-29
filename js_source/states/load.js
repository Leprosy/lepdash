// Load assets state
Game.loadState = {
    preload: function() {
        Engine.add.text(10, 10, "Loading...", {font: "20px Arial", fill: "#ffffff"});
        console.info(Game.name + " loading assets");

        // Put your assets loaders here
        /*User*/
        //Engine.load.image('bg', 'img/bg0.png');
        Engine.load.spritesheet("player", "img/player.png", Game.tileSize, Game.tileSize);
        Engine.load.spritesheet("terrain", "img/terrain.png", Game.tileSize, Game.tileSize);

    },

    create: function() {
        Engine.state.start("main");
    }
}
