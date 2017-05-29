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

// Load assets state
Game.loadState = {
    preload: function() {
        Engine.add.text(10, 10, "Loading...", {
            font: "20px Arial",
            fill: "#ffffff"
        });
        console.info(Game.name + " loading assets");
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
        Engine.add.text(10, 10, Game.name + " Main menu", {
            font: "20px Arial",
            fill: "#ffffff"
        });
    }
};

// Setting up main states
Engine = new Phaser.Game(Game.width, Game.height, Phaser.AUTO, "game");

Engine.state.add("load", Game.loadState);

Engine.state.add("main", Game.mainState);

// Let's roll
window.onload = function() {
    console.info(Game.name + " init");
    Engine.state.start("load");
};
