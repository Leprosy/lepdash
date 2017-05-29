// Main menu state
Game.mainState = {
    preload: function() {
        console.info(Game.name + " main menu");
    },

    create: function() {
        // Create your main menu here
        /*User*/
        Engine.add.text(10, 10, Game.name, {font: "20px Arial", fill: "#ffffff"});
        Engine.add.text(10, 50, "press space to start", {font: "12px Arial", fill: "#ffffff"});

        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(this.start, this);
    },

    start: function() {
        Engine.state.start("play");
    }
}
