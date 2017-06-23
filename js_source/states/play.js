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
            }}, this);

        // Create stage
        this._create();
    },

    _create: function() {
        // Build map
        Game.map = Engine.add.tilemap("map", Game.tileSize, Game.tileSize);
        Game.map.addTilesetImage("tiles", "tiles"); //"tiles name in JSON", "tileset" defined in preload state
        Game.layer = Game.map.createLayer("map");
        Game.layer.resizeWorld();
        console.info("Entering map:", Game.map.properties.name);
        this.diamonds = Engine.add.group();
        this.diamonds.enableBody = true;
        Game.map.createFromTiles(this.terrain.DIAMOND, null, "sprites", 0, this.diamonds);

        // Calculate map dimensions

        // Add animations to all of the coin sprites
        this.diamonds.callAll('animations.add', 'animations', "still", [40, 50, 60, 70, 41, 51, 61, 71], 10, true);
        this.diamonds.callAll('animations.play', 'animations', "still");

        // Add player
        Game.player = this._createPlayer(Game.map.properties.startX, Game.map.properties.startY);
        //Game.player.animations.play("tap");
        this.cursors = Engine.input.keyboard.createCursorKeys();

        // Add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {font: "15px Arial", fill: "#ffffff"});

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

    render: function() {
        //Engine.debug.body(Game.player);
    },




    _updateHUD: function() {
        Game.HUD.text = "Map:" + Game.level + " Diamonds: " + Game.diamonds + " of " + Game.map.properties.diamonds + " Lives: " + Game.lives;
        if (!Game.player.alive) {
            if (Game.lives === 0) {
                Game.HUD.text += " GAME OVER";
            } else {
                Game.HUD.text += " PRESS ESC TO RESTART LEVEL";
            }
        }
    },

    _checkStatus: function() {
        /*Lives?
        if (Game.lives === -1) {
            console.info("Game over!");
        }

        //Diamonds?
        if (Game.map.properties.diamonds === Game.diamonds) {
            console.info("Diamonds collected...");
        } */
    },

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
        var index = tile1.index;
        Game.map.replace(index, this.terrain.NULL, tile1.x, tile1.y, 1, 1);
        Game.map.replace(this.terrain.NULL, index, tile2.x, tile2.y, 1, 1);
    },

    // Check if the new player position is allowed 
    _checkMapCollision: function() {
        // First detect if player can move
        var tile = Game.map.getTileWorldXY(Game.player.newX, Game.player.newY);
        //console.log(tile.index)

        switch (tile.index) {
            case this.terrain.DIRT:
            case this.terrain.DIRT2:
                this._mapRemove(tile);
                this.sfx.dirt.play();
                break;

            case this.terrain.DIAMOND:
                Game.diamonds++;
                this._mapRemove(tile);
                this.diamonds.getClosestTo(Game.player).kill();

                // Hatch?
                if (Game.map.properties.diamonds === Game.diamonds) {
                    this.sfx.hatch.play();
                    Engine.stage.backgroundColor = Phaser.Color.getColor(255, 255, 200);
                    var timer = Engine.time.create(false);
                    timer.loop(100, function() {
                        Engine.stage.backgroundColor = Phaser.Color.getColor(0,0,0);
                    }, this);
                    timer.start();
                } else {
                    this.sfx.diamond.play();
                }
                break;

            case this.terrain.STEEL:
            case this.terrain.WALL:
            case this.terrain.BOULDER:
                var isPushable = tile.index === this.terrain.BOULDER && Game.player.newY === Game.player.y && !tile.properties.falling;
                if (isPushable) {
                    //Math.sign(Game.player.newX - Game.player.x) === -1 => pushing from left
                    var tileNext = Game.map.getTile(tile.x + Math.sign(Game.player.newX - Game.player.x), tile.y);

                    if (tileNext.index === this.terrain.NULL && Engine.rnd.integerInRange(0, 2) === 0) { // Chance of pushing
                        this._mapMove(tile, tileNext);
                        tileNext.properties.moving = true; //Moving boulders can't hang
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
                        this.sfx.boulder.play();
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
                if (tile.index === this.terrain.BOULDER && !tile.properties.falling) {
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
            var dia = this.diamonds.getClosestTo({x: tile.x * Game.tileSize, y: tile.y * Game.tileSize});
            console.log(dia)
            dia.kill();
        }

        this._mapRemove(tile, this.terrain.EXPLOSION);

        var _this = this;
        var explosion = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "sprites");
        explosion.animations.add("still", [78, 68, 58, 48, 38], 8, false).onComplete.add(function() {
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

        player.newX = player.x;
        player.newY = player.y;
        return player;
    },

    // Check if the player is in a certain tile
    _playerIn: function(tile) {
        var playerPos = {x: Game.player.x / Game.tileSize, y: Game.player.y / Game.tileSize};
        return playerPos.x === tile.x && playerPos.y === tile.y;
    }
}
