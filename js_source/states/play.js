// Play loop state
Game.playState = {
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
        DIAMOND: 8
    },

    preload: function() {
        console.info(Game.name + " play loop");
    },

    // Create your play logic here
    /*User*/
    create: function() {
        console.info("Game params", Game);

        // SFX
        this.sfx.boulder = Engine.add.audio("boulder");
        this.sfx.diamond = Engine.add.audio("diamond");
        this.sfx.dirt = Engine.add.audio("dirt");
        for (i = 0; i < 8; ++i) this.sfx["diamond" + i] = Engine.add.audio("diamond" + i);

        // build map
        Game.map = Engine.add.tilemap("map", Game.tileSize, Game.tileSize);
        Game.map.addTilesetImage("tiles", "tiles"); //"tiles name in JSON", "tileset" defined in preload state
        Game.layer = Game.map.createLayer("map");
        Game.layer.resizeWorld();
        console.info("Entering map:", Game.map.properties.name);

        // add player
        Game.player = this._createPlayer(Game.map.properties.startX, Game.map.properties.startY);
        //Game.player.animations.play("tap");
        this.cursors = Engine.input.keyboard.createCursorKeys();

        // add HUD
        Game.HUD = Engine.add.text(10, Game.height - 15, "", {font: "15px Arial", fill: "#ffffff"});

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

    render: function() {
        //Engine.debug.body(Game.player);
    },




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
                Game.map.replace(this.terrain.DIRT, this.terrain.NULL, tile.x, tile.y, 1, 1);
                Game.map.replace(this.terrain.DIRT2, this.terrain.NULL, tile.x, tile.y, 1, 1);
                this.sfx.dirt.play();
                break;

            case this.terrain.DIAMOND:
                Game.diamonds++;
                this.sfx.diamond.play();
                Game.map.replace(this.terrain.DIAMOND, this.terrain.NULL, tile.x, tile.y, 1, 1);
                break;

            case this.terrain.STEEL:
            case this.terrain.WALL:
            case this.terrain.BOULDER:
                if (tile.index === this.terrain.BOULDER && Game.player.newY === Game.player.y && !tile.properties.falling) {
                    console.log("trying to push");
                    //Math.sign(Game.player.newX - Game.player.x) === -1 => pushing from left
                    var tileNext = Game.map.getTile(tile.x + Math.sign(Game.player.newX - Game.player.x), tile.y);

                    if (tileNext.index === this.terrain.NULL && Engine.rnd.integerInRange(0,5) === 0) {
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

                if (tile && tileBellow) {
                    // we have a falling object
                    if (tile.properties.falling) {
                        if (tileBellow.index === this.terrain.NULL) {
                            // Player crushed?
                            if (this._playerIn(tileBellow)) {
                                console.info("BANG!");
                            } else {
                                tile.properties.falling = false;
                                tileBellow.properties.falling = true;
                                Game.map.replace(this.terrain.BOULDER, this.terrain.NULL, tile.x, tile.y, 1, 1);
                                Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tileBellow.x, tileBellow.y, 1, 1);
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

                if (tile && tileBellow) {
                    // We have a potential fallable object (and is not falling)
                    if (tile.index === this.terrain.BOULDER && !tile.properties.falling) {
                        // Nothing bellow, start falling
                        if (tileBellow.index === this.terrain.NULL && !this._playerIn(tileBellow)) {
                            console.log(tile, "is fallling")
                            tile.properties.falling = true;
                        }

                        // Is hanging, start falling left-right
                        if (x > 0 && x < Game.map.width - 1) {
                            var tileLeft = Game.map.getTile(x - 1, y);
                            var tileBellowLeft = Game.map.getTile(x - 1, y + 1);
                            var tileRight = Game.map.getTile(x + 1, y);
                            var tileBellowRight = Game.map.getTile(x + 1, y + 1);

                            if (tileLeft.index === this.terrain.NULL && tileBellowLeft.index === this.terrain.NULL
                                    && !this._playerIn(tileLeft) && !this._playerIn(tileBellowLeft)) {
                                Game.map.replace(this.terrain.BOULDER, this.terrain.NULL, tile.x, tile.y, 1, 1);
                                Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tileLeft.x, tileLeft.y, 1, 1);
                                tileLeft.properties.falling = true;
                            } else if (tileRight.index === this.terrain.NULL && tileBellowRight.index === this.terrain.NULL
                                    && !this._playerIn(tileRight) && !this._playerIn(tileBellowRight)) {
                                Game.map.replace(this.terrain.BOULDER, this.terrain.NULL, tile.x, tile.y, 1, 1);
                                Game.map.replace(this.terrain.NULL, this.terrain.BOULDER, tileRight.x, tileRight.y, 1, 1);
                                tileRight.properties.falling = true;
                            }
                        }
                    }
                }
            }
        }
    },

    _createPlayer: function(x, y) {
        var player = Engine.add.sprite(Game.tileSize * x, Game.tileSize * y, "player");
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

        player.newX = player.x;
        player.newY = player.y;
        return player;
    },

    _playerIn: function(tile) {
        var playerPos = {x: Game.player.x / Game.tileSize, y: Game.player.y / Game.tileSize};
        return playerPos.x === tile.x && playerPos.y === tile.y;
    }
}
