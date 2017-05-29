// Play loop state
Game.playState = {
    preload: function() {
        console.info(Game.name + " play loop");
    },

    // Create your play logic here
    /*User*/
    create: function() {
        console.info("Game params", Game);

        // build map
        Game.map = Engine.add.tilemap("map");
        Game.map.addTilesetImage("tiles", "terrain"); //"tiles name in JSON", "tileset" defined in preload state 
        Game.layer = Game.map.createLayer("map" + Game.level);

        // add player
        Game.player = this._createPlayer();
        Game.player.animations.play("tap");

        // add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {font: "15px Arial", fill: "#ffffff"});
    },

    update: function() {
        this._updateHUD();
    },

    _updateHUD: function() {
        Game.HUD.text = "Map:" + Game.level + " Score: " + Game.score + " Lives: " + Game.lives;
    },

    _createPlayer: function() {
        var player = player = Engine.add.sprite(0, 0, "player");
        player.animations.add("left", [10, 11, 12, 13, 14, 15, 16], 20, false);
        player.animations.add("right", [20, 21, 22, 23, 24, 25, 26], 20, false);
        player.animations.add("up", [10, 11, 12, 13, 14, 15, 16], 20, false);
        player.animations.add("down", [20, 21, 22, 23, 24, 25, 26], 20, false);
        player.animations.add("still", [0], 10, false);
        player.animations.add("blink", [0, 1, 2, 1], 10, false).onComplete.add(function() {
            player.animations.play("still");
        });
        player.animations.add("tap", [3, 4, 3, 4, 5, 6, 5, 4, 3, 4, 3, 4, 5, 6, 5, 4], 10, false).onComplete.add(function() {
            player.animations.play("still");
        });

        return player;
    }
}
