// Setting up main states
Engine = new Phaser.Game(Game.width, Game.height, Phaser.AUTO, "game");
Engine.state.add("load", Game.loadState);
Engine.state.add("main", Game.mainState);

// Let's roll
window.onload = function() {
    console.info(Game.name + " init");
    Engine.state.start("load");
}
