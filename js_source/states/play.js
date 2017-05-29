// Play loop state
Game.playState = {
    cursors: null,
    //player: null,

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

        this.cursors = Engine.input.keyboard.createCursorKeys();

        // add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {font: "15px Arial", fill: "#ffffff"});
    },

    update: function() {
        this._checkInput();
        this._updateHUD();
    },

    _updateHUD: function() {
        Game.HUD.text = "Map:" + Game.level + " Score: " + Game.score + " Lives: " + Game.lives;
    },

    _checkInput: function() {
        if (this.cursors.left.isDown) {
            Game.player.x -= 2;
            Game.player.play("left");
        } else if (this.cursors.right.isDown) {
            Game.player.x += 2;
            Game.player.play("right");
        } else if (this.cursors.up.isDown) {
            Game.player.y -= 2;
            Game.player.play("up");
        } else if (this.cursors.down.isDown) {
            Game.player.y += 2;
            Game.player.play("down");
        } else {
            Game.player.play("still");
        }
    },

    _createPlayer: function() {
        var player = player = Engine.add.sprite(Game.tileSize, Game.tileSize, "player");
        player.animations.add("left", [7, 8, 9, 10, 11, 12, 13], 20, false);
        player.animations.add("right", [14, 15, 16, 17, 18, 19, 20], 20, false);
        player.animations.add("up", [7, 8, 9, 10, 11, 12, 13], 20, false);
        player.animations.add("down", [14, 15, 16, 17, 18, 19, 20], 20, false);
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
