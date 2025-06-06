class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // load game audio
        this.load.audio('bgm', 'bgm.mp3');

        // load player movement + game audio;
        this.load.audio('signSound', 'Sign.wav');
        this.load.audio('dashSound', 'Dash.wav');
        this.load.audio('jumpSound', 'Jump.wav');
        this.load.audio('coinSound', 'CoinCollect.wav');
        this.load.audio('finishSound', 'Finish.wav');
        this.load.audio('walkSound', 'Walk.mp3');
        this.load.audio('deathSound', 'Death.wav');

        // Load parallax backgound
        this.load.image("bg-1", "bg1.png");
        this.load.image("bg-2", "bg2.png");
        this.load.image("bg-3", "bg3.png");
        this.load.image("bg-4", "bg4.png");
        this.load.image("fullBG", "fullBG.jpg");

        // load player heart + input art
        this.load.image("heart", "heart.png");
        this.load.image("emptyHeart", "emptyHeart.png"); 
        this.load.image("eKey" ,"eKey.png");
        
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("food_tilemap_tiles", "food_tilemap_packed.png");                         // Packed tilemap
        this.load.image("tilemap_tiles", "tilemap_packed.png"); // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        // Load the tilemap as a spritesheet
        this.load.spritesheet("food_tilemap_sheet", "food_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

      this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // The multiatlas using TexturePacker and Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.scene.start("titleScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}