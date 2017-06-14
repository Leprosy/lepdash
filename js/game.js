/**
 * Super fun gamez
 */
// Main namespaces and definitions
var Engine = Engine || {};

var Game = Game || {};

Game.name = "_lepdash";

Game.version = "0.1";

Game.width = 800;

Game.height = 600;

Game.speed = 200;

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
        Engine.load.spritesheet("tiles", "img/tiles.png", Game.tileSize, Game.tileSize);
        Engine.load.tilemap("map", "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);
        Engine.load.audio("theme", "snd/theme.mp3");
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
        Engine.music = Engine.add.audio("theme");
        Engine.music.loop = true;
        Engine.music.play();
        // Set game parameters
        Game.level = 1;
        Game.diamonds = 0;
        Game.lives = 3;
        // Wait for user input
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(function() {
            Engine.music.stop();
            Engine.state.start("play");
        }, this);
    }
};

// Play loop state
Game.playState = {
    cursors: null,
    terrain: {
        NULL: 1,
        STEEL: 2,
        WTF: 3,
        WALL: 4,
        DIRT: 5,
        DIRT2: 6,
        BOULDER: 7,
        DIAMOND: 8
    },
    preload: function() {
        console.info(Game.name + " play loop");
    },
    // Create your play logic here
    /*User*/
    create: function() {
        console.info("Game params", Game);
        // build map
        Game.map = Engine.add.tilemap("map", Game.tileSize, Game.tileSize);
        Game.map.addTilesetImage("tiles", "tiles");
        //"tiles name in JSON", "tileset" defined in preload state
        Game.layer = Game.map.createLayer("map");
        Game.layer.resizeWorld();
        console.info("Entering map:", Game.map.properties.name);
        // add player
        Game.player = this._createPlayer(Game.map.properties.startX, Game.map.properties.startY);
        //Game.player.animations.play("tap");
        this.cursors = Engine.input.keyboard.createCursorKeys();
        // add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {
            font: "15px Arial",
            fill: "#ffffff"
        });
        // Timer
        this.updateTime = this.time.now + Game.speed;
        this.tapTime = this.time.now + Game.speed * 50;
    },
    update: function() {
        if (this.updateTime < this.time.now) {
            this._checkInput();
            this._checkMapCollision();
            this._checkFallings();
            this._setFallings();
            this._checkStatus();
            this._updateHUD();
            this.updateTime = this.time.now + Game.speed;
        }
    },
    render: function() {},
    _updateHUD: function() {
        Game.HUD.text = "Map:" + Game.level + " Diamonds: " + Game.diamonds + " of " + Game.map.properties.diamonds + " Lives: " + Game.lives;
    },
    _checkStatus: function() {
        //Lives?
        if (Game.lives === -1) {
            console.info("Game over!");
        }
        //Diamonds?
        if (Game.map.properties.diamonds === Game.diamonds) {
            console.info("Diamonds collected...");
        }
    },
    _checkInput: function() {
        if (this.cursors.left.isDown) {
            Game.player.newX -= Game.tileSize;
            Game.player.play("left");
        } else if (this.cursors.right.isDown) {
            Game.player.newX += Game.tileSize;
            Game.player.play("right");
        } else if (this.cursors.up.isDown) {
            Game.player.newY -= Game.tileSize;
            Game.player.play("up");
        } else if (this.cursors.down.isDown) {
            Game.player.newY += Game.tileSize;
            Game.player.play("down");
        } else {
            Game.player.play("still");
        }
    },
    _checkMapCollision: function() {
        // First detect if player can move
        var tile = Game.map.getTileWorldXY(Game.player.newX, Game.player.newY);
        //console.log(tile.index)
        switch (tile.index) {
          case this.terrain.DIRT:
          case this.terrain.DIRT2:
            this._remove(tile.x, tile.y, this.terrain.DIRT);
            this._remove(tile.x, tile.y, this.terrain.DIRT2);
            break;

          case this.terrain.DIAMOND:
            Game.diamonds++;
            Game.map.replace(this.terrain.DIAMOND, this.terrain.NULL, tile.x, tile.y, 1, 1);
            break;

          case this.terrain.STEEL:
          case this.terrain.WALL:
          case this.terrain.BOULDER:
            if (tile.index === this.terrain.BOULDER && Game.player.newY === Game.player.y && !tile.properties.falling) {
                console.log("trying to push");
                //Math.sign(Game.player.newX - Game.player.x) === -1 => pushing from left
                var tileNext = Game.map.getTile(tile.x + Math.sign(Game.player.newX - Game.player.x), tile.y);
                if (tileNext.index === this.terrain.NULL && Engine.rnd.integerInRange(0, 5) === 0) {
                    Game.map.replace(this.terrain.BOULDER, this.terrain.NULL, tile.x, tile.y, 1, 1);
                    Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tileNext.x, tileNext.y, 1, 1);
                } else {
                    Game.player.newX = Game.player.x;
                    Game.player.newY = Game.player.y;
                }
            } else {
                Game.player.newX = Game.player.x;
                Game.player.newY = Game.player.y;
            }
            break;

          default:
            break;
        }
        // Set new position(if the player can move)
        Game.player.x = Game.player.newX;
        Game.player.y = Game.player.newY;
    },
    // TODO: need a way to calculate effective size of map to make this more efficient in the next couple of methods
    _checkFallings: function() {
        // Check falling objects, kill player if in the way
        for (x = 0; x < Game.map.width; ++x) {
            for (y = Game.map.height - 2; y >= 0; --y) {
                var tile = Game.map.getTile(x, y);
                var tileBellow = Game.map.getTile(x, y + 1);
                if (tile) {
                    // we have a falling object
                    if (tile.properties.falling) {
                        if (tileBellow.index === this.terrain.NULL) {
                            console.log("fall", "P1", Game.player.x / Game.tileSize, Game.player.y / Game.tileSize, "TB " + tileBellow.x + "," + tileBellow.y, this._playerIn(tileBellow.x, tileBellow.x));
                            // Player crushed?
                            if (this._playerIn(tileBellow.x, tileBellow.x)) {
                                console.info("BANG!");
                            } else {
                                tile.properties.falling = false;
                                tileBellow.properties.falling = true;
                                this._remove(tile.x, tile.y, this.terrain.BOULDER);
                                Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tile.x, tileBellow.y, 1, 1);
                            }
                        } else {
                            tile.properties.falling = false;
                        }
                    }
                }
            }
        }
    },
    _setFallings: function() {
        // Last, mark objects that will start falling next turn
        for (x = 0; x < Game.map.width; ++x) {
            for (y = Game.map.height - 2; y >= 0; --y) {
                var tile = Game.map.getTile(x, y);
                var tileBellow = Game.map.getTile(x, y + 1);
                if (tile) {
                    // We have a potential fallable object (and is not falling)
                    if (tile.index === this.terrain.BOULDER && !tile.properties.falling) {
                        // Nothing bellow, start falling
                        if (tileBellow.index === this.terrain.NULL && !this._playerIn(tileBellow.x, tileBellow.y)) {
                            tile.properties.falling = true;
                        }
                        // Is hanging, start falling left-right
                        if (x > 0 && x < Game.map.width - 1) {
                            var tileLeft = Game.map.getTile(x - 1, y);
                            var tileBellowLeft = Game.map.getTile(x - 1, y + 1);
                            var tileRight = Game.map.getTile(x + 1, y);
                            var tileBellowRight = Game.map.getTile(x + 1, y + 1);
                            if (tileLeft.index === this.terrain.NULL && tileBellowLeft.index === this.terrain.NULL && !this._playerIn(tileLeft.x, tileLeft.y) && !this._playerIn(tileBellowLeft.x, tileBellowLeft.y)) {
                                Game.map.replace(this.terrain.BOULDER, this.terrain.NULL, tile.x, tile.y, 1, 1);
                                Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tileLeft.x, tileLeft.y, 1, 1);
                                tileLeft.properties.falling = true;
                            }
                        }
                    }
                }
            }
        }
    },
    _createPlayer: function(x, y) {
        var player = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "player");
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
        player.newX = player.x;
        player.newY = player.y;
        return player;
    },
    _remove: function(x, y, index) {
        Game.map.replace(index, this.terrain.NULL, x, y, 1, 1);
    },
    _playerIn: function(x, y) {
        var playerPos = {
            x: Game.player.x / Game.tileSize,
            y: Game.player.y / Game.tileSize
        };
        return playerPos.x === x && playerPos.y === y;
    }
};

// Setting up main states
Engine = new Phaser.Game({
    //enableDebug: false,
    width: Game.width,
    height: Game.height,
    renderer: Phaser.AUTO,
    antialias: false,
    //transparent: true,
    parent: "game"
});

//Engine = new Phaser.Game(Game.width, Game.height, Phaser.AUTO, "game");
Engine.state.add("load", Game.loadState);

Engine.state.add("main", Game.mainState);

Engine.state.add("play", Game.playState);

// Let's roll
window.onload = function() {
    console.info(Game.name + " init");
    Engine.state.start("load");
};
