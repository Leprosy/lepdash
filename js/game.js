/**
 * Super fun gamez
 */
// Main namespaces and definitions
var Engine;

var Game = Game || {};

Game.name = "_lepdash";

Game.version = "0.1";

Game.width = 800;

Game.height = 600;

/*User*/
Game.tileSize = 32;

// Load assets state
Game.loadState = {
    preload: function() {
        console.info(Game.name + " loading assets");
        // Put your assets loader logic here...
        /*User*/
        Engine.add.text(10, 10, "Loading...", {
            font: "20px Arial",
            fill: "#ffffff"
        });
        //Engine.load.image('bg', 'img/bg0.png');
        Engine.load.spritesheet("player", "img/player.png", Game.tileSize, Game.tileSize);
        Engine.load.spritesheet("terrain", "img/terrain.png", Game.tileSize, Game.tileSize);
        Engine.load.tilemap("map", "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);
    },
    create: function() {
        Engine.state.start("main");
    }
};

// Main menu state
Game.mainState = {
    preload: function() {
        console.info(Game.name + " main menu");
    },
    create: function() {
        // Create your main menu logic here...
        /*User*/
        // Draw main menu
        Engine.add.text(10, 10, Game.name, {
            font: "20px Arial",
            fill: "#ffffff"
        });
        Engine.add.text(10, 50, "press space to start", {
            font: "12px Arial",
            fill: "#ffffff"
        });
        // Set game parameters
        Game.level = 1;
        Game.score = 0;
        Game.lives = 3;
        // Wait for user input
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(function() {
            Engine.state.start("play");
        }, this);
    }
};

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
        Game.map.addTilesetImage("tiles", "terrain");
        //"tiles name in JSON", "tileset" defined in preload state 
        Game.layer = Game.map.createLayer("map" + Game.level);
        // add player
        Game.player = this._createPlayer();
        Game.player.animations.play("tap");
        this.cursors = Engine.input.keyboard.createCursorKeys();
        // add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {
            font: "15px Arial",
            fill: "#ffffff"
        });
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
        player.animations.add("left", [ 7, 8, 9, 10, 11, 12, 13 ], 20, false);
        player.animations.add("right", [ 14, 15, 16, 17, 18, 19, 20 ], 20, false);
        player.animations.add("up", [ 7, 8, 9, 10, 11, 12, 13 ], 20, false);
        player.animations.add("down", [ 14, 15, 16, 17, 18, 19, 20 ], 20, false);
        player.animations.add("still", [ 0 ], 10, false);
        player.animations.add("blink", [ 0, 1, 2, 1 ], 10, false).onComplete.add(function() {
            player.animations.play("still");
        });
        player.animations.add("tap", [ 3, 4, 3, 4, 5, 6, 5, 4, 3, 4, 3, 4, 5, 6, 5, 4 ], 10, false).onComplete.add(function() {
            player.animations.play("still");
        });
        return player;
    }
};

// Setting up main states
Engine = new Phaser.Game(Game.width, Game.height, Phaser.AUTO, "game");

Engine.state.add("load", Game.loadState);

Engine.state.add("main", Game.mainState);

Engine.state.add("play", Game.playState);

// Let's roll
window.onload = function() {
    console.info(Game.name + " init");
    Engine.state.start("load");
};
