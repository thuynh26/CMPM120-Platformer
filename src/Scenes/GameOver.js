class GameOver extends Phaser.Scene {
  constructor() {
    super('gameOverScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    const { width, height } = this.scale;

    // "Game Over" text
    this.add.text(width / 2, height / 2 - 50, 'Game Over', {
        fontFamily: "Titan One",
        fontSize: '48px',
        fill: '#ff0000',
        stroke: 'ff3126',
        strokeThickness: 8,
    }).setOrigin(0.5);

    // Restart prompt
    let gameOverText= this.add.text(width / 2, height / 2 + 20, 'Press R to Restart', {
        fontFamily: 'Titan One',
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#ff3126',
        strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
        targets: gameOverText,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    // Go back to title on SPACE
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start("level1Scene");
         // CHANGE BACK TO titleScene AFTER FINISH
    });
  }
}