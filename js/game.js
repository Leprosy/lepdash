/**
 * Super fun gamez engine
 */
// Engine namespaces and definitions
var Engine = Engine || {};

var Game = Game || {};

Game.name = "_lepdash";

Game.version = "0.1";

Game.width = 800;

Game.height = 600;

Game.speed = 150;

// Game specific vars
Game.tileSize = 32;

// Load assets state
Game.loadState = {
    preload: function() {
        console.info(Game.name + " loading assets");
        Engine.add.text(10, 10, "Loading...", {
            font: "20px Arial",
            fill: "#ffffff"
        });
        //Engine.load.image('bg', 'img/bg0.png');
        Engine.load.spritesheet("sprites", "img/sprites.png", Game.tileSize, Game.tileSize);
        Engine.load.spritesheet("tiles", "img/tiles.png", Game.tileSize, Game.tileSize);
        Engine.load.tilemap("map", "maps/map.json", null, Phaser.Tilemap.TILED_JSON);
        Engine.load.audio("theme", "snd/theme.ogg");
        Engine.load.audio("boulder", "snd/boulder.ogg");
        Engine.load.audio("diamond", "snd/diamond.ogg");
        Engine.load.audio("dirt", "snd/dirt.ogg");
        Engine.load.audio("explosion", "snd/explosion.ogg");
        Engine.load.audio("hatch", "snd/hatch.ogg");
        for (i = 0; i < 8; ++i) Engine.load.audio("diamond" + i, "snd/diamond_" + i + ".ogg");
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
        // Draw main menu
        Engine.add.text(10, 10, Game.name, {
            font: "20px Arial",
            fill: "#ffffff"
        });
        Engine.add.text(10, 50, "press space to start", {
            font: "12px Arial",
            fill: "#ffffff"
        });
        var music = Engine.add.audio("theme");
        music.loop = true;
        music.play();
        // Set game parameters
        Game.level = 1;
        Game.diamonds = 0;
        Game.lives = 3;
        // Wait for user input
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(function() {
            music.stop();
            Engine.state.start("play");
        }, this);
    }
};

// Play loop state
Game.playState = {
    diamonds: false,
    sfx: {},
    cursors: null,
    terrain: {
        NULL: 1,
        STEEL: 2,
        WTF: 3,
        WALL: 4,
        DIRT: 5,
        DIRT2: 6,
        BOULDER: 7,
        DIAMOND: 8,
        EXPLOSION: 9
    },
    preload: function() {
        console.info(Game.name + " play loop");
    },
    create: function() {
        console.info("Game params", Game);
        // SFX
        this.sfx.boulder = Engine.add.audio("boulder");
        this.sfx.diamond = Engine.add.audio("diamond");
        this.sfx.dirt = Engine.add.audio("dirt");
        this.sfx.explosion = Engine.add.audio("explosion");
        this.sfx.hatch = Engine.add.audio("hatch");
        for (i = 0; i < 8; ++i) this.sfx["diamond" + i] = Engine.add.audio("diamond" + i);
        // On esc, restart current map, lose a life. If game over, go back to menu
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.ESC);
        key.onDown.addOnce(function() {
            Game.lives--;
            Game.diamonds = 0;
            if (Game.lives === -1) {
                Engine.state.start("main");
            } else {
                Engine.state.start("play");
            }
        }, this);
        // Create stage
        this._create();
    },
    _create: function() {
        // Build map
        Game.map = Engine.add.tilemap("map", Game.tileSize, Game.tileSize);
        Game.map.addTilesetImage("tiles", "tiles");
        //"tiles name in JSON", "tileset" defined in preload state
        Game.map.setLayer("map" + Game.level);
        Game.layer = Game.map.createLayer("map" + Game.level);
        Game.layer.resizeWorld();
        this.mapProps = Game.map.layers[Game.level - 1].properties;
        // Add diamonds
        this.diamonds = Engine.add.group();
        this.diamonds.enableBody = true;
        Game.map.createFromTiles(this.terrain.DIAMOND, null, "sprites", Game.level - 1, this.diamonds);
        this.diamonds.callAll("animations.add", "animations", "still", [ 40, 50, 60, 70, 41, 51, 61, 71 ], 10, true);
        this.diamonds.callAll("animations.play", "animations", "still");
        // Add player
        Game.player = this._createPlayer(this.mapProps.startX, this.mapProps.startY);
        //Game.player.animations.play("tap");
        this.cursors = Engine.input.keyboard.createCursorKeys();
        // Add goal
        Game.finish = this._createFinish(this.mapProps.finishX, this.mapProps.finishY);
        // Add HUD
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
            if (Game.player.alive) {
                this._checkInput();
                this._checkMapCollision();
            }
            this._updateFallings();
            this._setFallings();
            this._checkStatus();
            this._updateHUD();
            this.updateTime = this.time.now + Game.speed;
        }
    },
    render: function() {},
    _updateHUD: function() {
        Game.HUD.text = "Map " + Game.level + ":" + this.mapProps.name + " | Diamonds: " + Game.diamonds + " of " + this.mapProps.diamonds + " | Lives: " + Game.lives;
        if (!Game.player.alive) {
            if (Game.lives === 0) {
                Game.HUD.text += " GAME OVER";
            } else {
                Game.HUD.text += " PRESS ESC TO RESTART LEVEL";
            }
        }
    },
    _checkStatus: function() {},
    // Check the user key input and calculates new position
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
    // Removes a tile(or replaces with another)
    _mapRemove: function(tile, type) {
        var terrain = type || this.terrain.NULL;
        Game.map.replace(tile.index, terrain, tile.x, tile.y, 1, 1);
    },
    // Moves a tile
    _mapMove: function(tile1, tile2) {
        // Diamond. move group sprite
        if (tile1.index === this.terrain.DIAMOND) {
            var dia = this.diamonds.getClosestTo({
                x: tile1.x * Game.tileSize,
                y: tile1.y * Game.tileSize
            });
            dia.x = tile2.x * Game.tileSize;
            dia.y = tile2.y * Game.tileSize;
        }
        var index = tile1.index;
        Game.map.replace(index, this.terrain.NULL, tile1.x, tile1.y, 1, 1);
        Game.map.replace(this.terrain.NULL, index, tile2.x, tile2.y, 1, 1);
    },
    // Check if the new player position is allowed 
    _checkMapCollision: function() {
        // First detect if player can move
        var tile = Game.map.getTileWorldXY(Game.player.newX, Game.player.newY);
        switch (tile.index) {
          case this.terrain.DIRT:
          case this.terrain.DIRT2:
            this._mapRemove(tile);
            this.sfx.dirt.play();
            break;

          case this.terrain.DIAMOND:
            if (!tile.properties.falling) {
                Game.diamonds++;
                this._mapRemove(tile);
                this.diamonds.getClosestTo(Game.player).kill();
                // Hatch?
                if (this.mapProps.diamonds === Game.diamonds) {
                    this.sfx.hatch.play();
                    Engine.stage.backgroundColor = Phaser.Color.getColor(255, 255, 200);
                    var timer = Engine.time.create(false);
                    timer.loop(100, function() {
                        Engine.stage.backgroundColor = Phaser.Color.getColor(0, 0, 0);
                    }, this);
                    timer.start();
                    Game.finish.animations.play("ready");
                    this._mapRemove(Game.map.getTile(this.mapProps.finishX, this.mapProps.finishY));
                } else {
                    this.sfx.diamond.play();
                }
            }
            break;

          case this.terrain.STEEL:
          case this.terrain.WALL:
          case this.terrain.BOULDER:
            var isPushable = tile.index === this.terrain.BOULDER && Game.player.newY === Game.player.y && !tile.properties.falling;
            if (isPushable) {
                //Math.sign(Game.player.newX - Game.player.x) === -1 => pushing from left
                var tileNext = Game.map.getTile(tile.x + Math.sign(Game.player.newX - Game.player.x), tile.y);
                if (tileNext.index === this.terrain.NULL && Engine.rnd.integerInRange(0, 2) === 0) {
                    // Chance of pushing
                    this._mapMove(tile, tileNext);
                    tileNext.properties.moving = true;
                    //Moving boulders can't hang
                    this.sfx.boulder.play();
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
        // YOU WON?
        if (Game.player.x / Game.tileSize === this.mapProps.finishX && Game.player.y / Game.tileSize === this.mapProps.finishY) {
            Game.player.kill();
            setTimeout(function() {
                Game.level++;
                Game.diamonds = 0;
                Engine.state.start("play");
            }, 5e3);
        }
    },
    // Update position of objects that are already falling
    _updateFallings: function() {
        // Check falling objects, kill player if in the way
        for (x = 0; x < Game.map.width; ++x) {
            for (y = Game.map.height - 2; y >= 0; --y) {
                var tile = Game.map.getTile(x, y);
                var tileBellow = Game.map.getTile(x, y + 1);
                // we have a falling object
                if (tile.properties.falling) {
                    if (tileBellow.index === this.terrain.NULL) {
                        // Player crushed?
                        if (this._playerIn(tileBellow) && Game.player.alive) {
                            //Spawn explosion
                            this._explode(tile);
                        } else {
                            tile.properties.falling = false;
                            tileBellow.properties.falling = true;
                            this._mapMove(tile, tileBellow);
                        }
                    } else {
                        tile.properties.falling = false;
                        // Diamond or boulder sound
                        if (tile.index === this.terrain.BOULDER) {
                            this.sfx.boulder.play();
                        } else if (tile.index === this.terrain.DIAMOND) {
                            this.sfx["diamond" + Engine.rnd.integerInRange(0, 7)].play();
                        }
                    }
                }
            }
        }
    },
    // Set the "falling" condition on gravity affected objects
    _setFallings: function() {
        // Last, mark objects that will start falling next turn
        for (x = 0; x < Game.map.width; ++x) {
            for (y = Game.map.height - 2; y >= 0; --y) {
                var tile = Game.map.getTile(x, y);
                var tileBellow = Game.map.getTile(x, y + 1);
                // We have a potential fallable object (and is not falling)
                if (this._isFallable(tile)) {
                    // Nothing bellow, start falling
                    if (tileBellow.index === this.terrain.NULL && !this._playerIn(tileBellow)) {
                        tile.properties.falling = true;
                    } else if (x > 0 && x < Game.map.width - 1 && !this._playerIn(tileBellow)) {
                        // Is hanging, player is not bellow, start falling left-right
                        var tileLeft = Game.map.getTile(x - 1, y);
                        var tileBellowLeft = Game.map.getTile(x - 1, y + 1);
                        var tileRight = Game.map.getTile(x + 1, y);
                        var tileBellowRight = Game.map.getTile(x + 1, y + 1);
                        // Conditions of hanging
                        var notHangDirt = tileBellow.index !== this.terrain.DIRT && tileBellow.index !== this.terrain.DIRT2;
                        var hangLeft = tileLeft.index === this.terrain.NULL && tileBellowLeft.index === this.terrain.NULL && !this._playerIn(tileLeft) && !this._playerIn(tileBellowLeft);
                        var hangRight = tileRight.index === this.terrain.NULL && tileBellowRight.index === this.terrain.NULL && !this._playerIn(tileRight) && !this._playerIn(tileBellowRight);
                        // The objects can't be hanging on dirt
                        if (notHangDirt && hangLeft) {
                            if (tile.properties.moving) {
                                tile.properties.moving = false;
                            } else {
                                this._mapMove(tile, tileLeft);
                                tileLeft.properties.falling = true;
                            }
                        }
                        if (notHangDirt && hangRight) {
                            if (tile.properties.moving) {
                                tile.properties.moving = false;
                            } else {
                                this._mapMove(tile, tileRight);
                                tileRight.properties.falling = true;
                            }
                        }
                    }
                }
            }
        }
    },
    // Check if a tile is fallable
    _isFallable: function(tile) {
        return [ this.terrain.DIAMOND, this.terrain.BOULDER ].indexOf(tile.index) >= 0 && !tile.properties.falling;
    },
    // Spawn a explosion centered on tile. If the player is inside, it's gonna get killed...
    _explode: function(tile, killPlayer) {
        this.sfx.explosion.play();
        for (i = -1; i < 2; ++i) {
            for (j = 0; j < 3; ++j) {
                var xtile = Game.map.getTile(tile.x + i, tile.y + j);
                if (xtile.index !== this.terrain.STEEL) {
                    this._createExplosion(xtile.x, xtile.y);
                    if (this._playerIn(xtile)) {
                        Game.player.kill();
                    }
                }
            }
        }
    },
    // Spawn explosion sprite, animates and clean it. Neat.
    _createExplosion: function(x, y) {
        // Do some cleanup(no falling, remove diamonds)
        var tile = Game.map.getTile(x, y);
        tile.properties.falling = false;
        if (tile.index === this.terrain.DIAMOND) {
            var dia = this.diamonds.getClosestTo({
                x: tile.x * Game.tileSize,
                y: tile.y * Game.tileSize
            });
            dia.kill();
        }
        this._mapRemove(tile, this.terrain.EXPLOSION);
        var _this = this;
        var explosion = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "sprites");
        explosion.animations.add("still", [ 78, 68, 58, 48, 38 ], 8, false).onComplete.add(function() {
            var x = explosion.x / Game.tileSize;
            var y = explosion.y / Game.tileSize;
            _this._mapRemove(Game.map.getTile(x, y));
            explosion.kill();
        });
        explosion.animations.play("still");
        return explosion;
    },
    // Creates the player sprite and define it's animations
    _createPlayer: function(x, y) {
        var player = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "sprites");
        player.animations.add("left", [ 10, 11, 12, 13, 14, 15, 16 ], 20, false);
        player.animations.add("right", [ 20, 21, 22, 23, 24, 25, 26 ], 20, false);
        player.animations.add("up", [ 10, 11, 12, 13, 14, 15, 16 ], 20, false);
        player.animations.add("down", [ 20, 21, 22, 23, 24, 25, 26 ], 20, false);
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
    // Create finish level object
    _createFinish: function(x, y) {
        this._mapRemove(Game.map.getTile(x, y), this.terrain.STEEL);
        var finish = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "sprites");
        finish.animations.add("still", [ 30 ], 1, false);
        finish.animations.add("ready", [ 30, 31 ], 5, true);
        finish.animations.play("still");
        return finish;
    },
    // Check if the player is in a certain tile
    _playerIn: function(tile) {
        var playerPos = {
            x: Game.player.x / Game.tileSize,
            y: Game.player.y / Game.tileSize
        };
        return playerPos.x === tile.x && playerPos.y === tile.y;
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

// Use Engine.state.getCurrentState() to get current state object
Engine.state.add("load", Game.loadState);

Engine.state.add("main", Game.mainState);

Engine.state.add("play", Game.playState);

// Let's roll
window.onload = function() {
    console.info(Game.name + " init");
    Engine.state.start("load");
};
