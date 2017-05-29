// Main menu state
Game.mainState = {
    preload: function() {
        console.info(Game.name + " main menu");
    },

    create: function() {
        Engine.add.text(10, 10, Game.name + " Main menu", {font: "20px Arial", fill: "#ffffff"});
    }
}
