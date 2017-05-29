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
        Engine.add.text(10, 10, "Loading...", {
            font: "20px Arial",
            fill: "#ffffff"
        });
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
};

// Main menu state
Game.mainState = {
    preload: function() {
        console.info(Game.name + " main menu");
    },
    create: function() {
        // Create your main menu here
        /*User*/
        Engine.add.text(10, 10, Game.name, {
            font: "20px Arial",
            fill: "#ffffff"
        });
        Engine.add.text(10, 50, "press space to start", {
            font: "12px Arial",
            fill: "#ffffff"
        });
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(this.start, this);
    },
    start: function() {
        Engine.state.start("play");
    }
};

// Play loop state
Game.playState = {
    preload: function() {
        console.info(Game.name + " play loop");
    },
    // Create your play logic here
    /*User*/
    create: function() {
        Engine.add.text(10, 10, "playing", {
            font: "20px Arial",
            fill: "#ffffff"
        });
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
