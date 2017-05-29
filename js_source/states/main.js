// Main menu state
Game.mainState = {
    preload: function() {
        console.info(Game.name + " main menu");
    },

    create: function() {
        // Create your main menu logic here...

        /*User*/
        // Draw main menu
        Engine.add.text(10, 10, Game.name, {font: "20px Arial", fill: "#ffffff"});
        Engine.add.text(10, 50, "press space to start", {font: "12px Arial", fill: "#ffffff"});

        // Set game parameters
        Game.level = 1;
        Game.score = 0;
        Game.lives = 3;

        // Wait for user input
        var key = Engine.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.addOnce(function() { Engine.state.start("play") }, this);
    }
}
