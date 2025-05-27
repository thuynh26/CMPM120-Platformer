
class Title extends Phaser.Scene {
  constructor() {
    super('titleScene');
  }

  create() {
  this.add.image(0, 0, "fullBG").setOrigin(0,0).setScrollFactor(0).setScale(1);
    const { width, height } = this.scale;

    // Game title
    this.add.text(width / 2, height / 2 - 50, 'Planet Yum', {
        fontFamily: "Titan One",
        fontSize: "100px",
        color: "#ffffff",
        stroke: "#8a00c2",
        strokeThickness: 8
    }).setOrigin(0.5);

    // Prompt
    let startText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE to Start', {
        fontFamily: "Titan One",
        fontSize: "64px",
        color: "#eeeeee",
        stroke: "#ca5cdd",
        strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
        targets: startText,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    // Start game on SPACE
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('level1Scene');
    });
  }
}