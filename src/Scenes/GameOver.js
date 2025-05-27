class GameOver extends Phaser.Scene {
  constructor() {
    super('gameOverScene');
  }

  create() {

    this.add.image(0, 0, "fullBG").setOrigin(0,0).setScrollFactor(0).setScale(1);
    const { width, height } = this.scale;

    // "Game Over" text
    this.add.text(width / 2, height / 2 - 50, 'Game Over', {
        fontFamily: "Titan One",
        fontSize: '100px',
        fill: '#ffffff',
        stroke: '#8a00c2',
        strokeThickness: 8,
    }).setOrigin(0.5);

    // Restart prompt
    let gameOverText= this.add.text(width / 2, height / 2 + 50, 'Press R to Restart', {
        fontFamily: 'Titan One',
        fontSize: '64px',
        fill: '#eeeeee',
        stroke: '#ca5cdd',
        strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
        targets: gameOverText,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    // Go back to title on R
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start("titleScene");
    });
  }
}