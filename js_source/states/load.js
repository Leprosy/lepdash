// Load assets state
Game.loadState = {
    preload: function() {
        console.info(Game.name + " loading assets");

        // Put your assets loader logic here...

        /*User*/
        Engine.add.text(10, 10, "Loading...", {font: "20px Arial", fill: "#ffffff"});
        //Engine.load.image('bg', 'img/bg0.png');
        Engine.load.spritesheet("player", "img/player.png", Game.tileSize, Game.tileSize);
        Engine.load.spritesheet("tiles", "img/tiles.png", Game.tileSize, Game.tileSize);
        Engine.load.tilemap("map", "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);
        Engine.load.audio("theme", "snd/theme.mp3");
    },

    create: function() {
        Engine.state.start("main");
    }
}
