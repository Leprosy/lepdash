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

        Engine.load.audio("theme", "snd/theme.ogg");

        Engine.load.audio("boulder", "snd/boulder.ogg");
        Engine.load.audio("diamond", "snd/diamond.ogg");
        Engine.load.audio("dirt", "snd/dirt.ogg");
        Engine.load.audio("explosion", "snd/explosion.ogg");
        for (i = 0; i < 8; ++i) Engine.load.audio("diamond" + i, "snd/diamond_" + i + ".ogg");
    },

    create: function() {
        Engine.state.start("main");
    }
}
