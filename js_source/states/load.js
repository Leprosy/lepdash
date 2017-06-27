// Load assets state
Game.loadState = {
    preload: function() {
        console.info(Game.name + " loading assets");

        Engine.add.text(10, 10, "Loading...", {font: "20px Arial", fill: "#ffffff"});
        //Engine.load.image('bg', 'img/bg0.png');
        Engine.load.spritesheet("sprites", "img/sprites.png", Game.tileSize, Game.tileSize);
        Engine.load.spritesheet("tiles", "img/tiles.png", Game.tileSize, Game.tileSize);
        Engine.load.tilemap("map", "maps/map.json", null, Phaser.Tilemap.TILED_JSON);

        // SFX
        Game.sfx = ["theme", "boulder", "diamond", "finished", "dirt", "explosion", "hatch"];
        for (i = 0; i < 8; ++i) Engine.load.audio("diamond" + i, "snd/diamond_" + i + ".ogg");
        for (i in Game.sfx) Engine.load.audio(Game.sfx[i], "snd/" + Game.sfx[i] + ".ogg");
    },

    create: function() {
        Engine.state.start("main");
    }
}
