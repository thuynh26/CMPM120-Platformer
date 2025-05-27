class PF_L1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1800;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        // track how many coins have been collected
        this.coinScore = 0;
        this.coinText = null;

        // playe spawn point + lives
        this.spawnPoint = { x: 30, y: 250 };
        this.playerLives = 5;
        this.livesText = null;

        // player dash movement
        this.canDash = true;    // dash cooled down check
        this.isDashing = false;   // 
        this.dashSpeed = 320;     // pixels/sec
        this.dashTime = 150;     // ms duration of dash
        this.dashCooldown = 500;     // ms before you can dash again

        this.uiX = 490;
        this.uiY = 310;
    }

// ################## CREATE ################## //
    create() {

        // game audio
        this.bgMusic = this.sound.add('bgm', {
            loop: false,
            volume: 0.1
        });

        this.signSound = this.sound.add('signSound', {
            loop: false,
            volume: 0.5
        })

        this.walkSound = this.sound.add('walkSound', {
            loop: false,
            volume: .5
        });

        this.jumpSound = this.sound.add('jumpSound', {
            loop: false,
            volume: .08  
        });

        this.coinSound = this.sound.add('coinSound', {
            loop: false,
            volume: .2
        });

        this.dashSound = this.sound.add('dashSound', {
            loop: false,
            volume: .3  
        });

        this.deathSound = this.sound.add('deathSound', {
            loop: false,
            volume: 0.2
        });

        this.finishSound = this.sound.add('finishSound', {
            loop: false,
            volume: .01  
        });

        if (!this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }

        // parallax background
        this.add.image(0, 0, "bg-1").setOrigin(0,0).setScrollFactor(0).setScale(this.SCALE + 0.085).setDepth(1);

        // slowest (farthest back)
        this.bg2 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-2")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085).setDepth(2);

        // mid‑distance
        this.bg3 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-3")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085)
        .setDepth(3);

        // closest (fastest)
        this.bg4 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-4")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085)
        .setDepth(4);

        // tilemap game w: 135 tiles, h: 25 tiles, 18x18 pixel tiles
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 135, 25);

        const ts1 = this.map.addTilesetImage(
            "food_tilemap_packed", 
            "food_tilemap_tiles"    
        );
        const ts2 = this.map.addTilesetImage(
            "tilemap_packed",       
            "tilemap_tiles"        
        );

        // Give Phaser _both_ tilesets:
        this.groundLayer = this.map.createLayer(
            "Ground-n-Platforms",
            [ ts1, ts2 ],  
            0, 0
        );
        this.detailsLayer = this.map.createLayer(
            "Details-n-Decor",
            [ ts1, ts2 ],
            0, 0
        );

        this.groundLayer.setDepth(10);
        this.detailsLayer.setDepth(15);

        // now tiles from both sets will render wherever Tile indices point
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Initialize tile animations
        this.animatedTiles.init(this.map);  

            // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setDepth(12);

        // "coin" objects -> assign coin texture from tilemap sprite sheet
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.coins.forEach(coin => coin.setDepth(12));

        // "sign" object
        this.signObj = this.map.createFromObjects("Objects", {
            name: "sign",
            key: "tilemap_sheet",
            frame: 88
        });

        this.sign = this.signObj[0];
        this.sign.setDepth(15);

        // "finishLine" object
        this.finishLineObj = this.map.createFromObjects("Objects", {
            name: "finishLine",
            key: "food_tilemap_sheet",
            frame: 24
        });

        this.finishLineObj.forEach(finish => {
            finish.setVisible(false);
            this.physics.world.enable(finish, Phaser.Physics.Arcade.STATIC_BODY);
        });

        // detect when player reaches finish line
        this.physics.add.overlap(
            my.sprite.player,
            this.finishLineObj,
            () => this.onLevelComplete(),
            null,
            this
        );

        const iconY = this.sign.y - 10;
        this.eKeyIcon = this.add.image(this.sign.x, iconY, 'eKey')
            .setOrigin(0.5, 1)
            .setDepth(15);

        this.tweens.add({
            targets: this.eKeyIcon,
            y: iconY - 5,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            duration: 800
        });
        // Create animations for coins from object layer
        this.anims.create({
                key: 'coinAnim', // Animation key
                frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                        {start: 151, end: 152}
                ),
                frameRate: 5,  // Higher is faster
                repeat: -1      // Loop the animation indefinitely
         });
 
        // Object coins array + animation
        this.anims.play('coinAnim', this.coins);

        // convert coin and sign into arcade physic sprites
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.physics.world.enable(this.sign, Phaser.Physics.Arcade.STATIC_BODY);

        // make the physics world as big as the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);


    // KEY INPUTS
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.eKey = this.input.keyboard.addKey('E');

        // player dash key
        this.shiftKey = this.input.keyboard.addKey('SHIFT');

        // debug key listener (assigned to D key)
        // start level with debugger off
        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


    // MOVEMENT PARTICLES
        // walking
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_04.png'],
            scale: {start: 0.01, end: 0.05},
            lifespan: 350,
            gravityY: -100,
            alpha: {start: 0.4, end: 0.05},
        });

        my.vfx.walking.stop().setDepth(15);   

        // jumping 
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['flare_01.png', 'light_01.png', 'light_02.png', 'light_03.png'],
            scale: {start: 0.04, end: 0.002},
            lifespan: 350,
            alpha: {start: 0.5, end: 0.05},
        });
        my.vfx.jumping.stop().setDepth(15);   

        // dashing
        my.vfx.dashing = this.add.particles(0, 0, "kenny-particles", {
            frame: ['flare_01.png', 'light_01.png', 'light_02.png', 'light_03.png'],
            scale: {start: 0.02, end: 0.002},
            lifespan: 350,
            alpha: {start: 0.5, end: 0.05},
        });
        my.vfx.dashing.stop().setDepth(15);   

    // GAME CAMERA
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.08,0.03);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE + 1);


    // DISPLAY SCORE + LIVES
        this.coinText = this.add.text(this.uiX, this.uiY + 20, "Coins: " + this.coinScore, {
            fontFamily: "Titan One",
            fontSize: '18px',
            stroke: '#ffa700',
            strokeThickness: 5
        });
        this.coinText.setScrollFactor(0, 0).setDepth(100);

        this.hearts = [];
        const startX = this.uiX;
        const startY = this.uiY;
        const spacing = 20;
        for (let i = 0; i < this.playerLives; i++) {
            const h = this.add
                .image(startX + i * spacing, startY, 'heart')
                .setScrollFactor(0)
                .setOrigin(0, 0)
                .setDepth(110)
                .setScale(1.2); 

            this.hearts.push(h);
        }

        // coin collection vfx 
        this.coinParticle = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_06.png'],
            lifespan: 500,
            speed: { min: 50, max: 150 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 100,
            quantity: 3
        });
        this.coinParticle.stop();

        // coin collision handler - removes coin on overlap with player character
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            this.coinParticle.emitParticleAt(coin.x, coin.y);
            this.coinSound.play();
            coin.destroy();

            this.coinScore += 1
            this.coinText.setText("Coins: " + this.coinScore);
        });

        // controls popup menu (hidden by default)
        const { width, height } = this.scale;
        this.controlsPopup = this.add.container(width/2, height/2).setDepth(120).setScrollFactor(0);
        const signBG = this.add.rectangle(0, 0, 300, 200, 0xa79ac9 , 0.6).setOrigin(0.5);
        const lines = [
            "CONTROLS\n",
            "←  → : Move",
            "↑ : Jump",
            "SHIFT : Dash",
            "E : Interact\n",
            "Reach the Candle at the End!"
        ];
        const signTXT  = this.add.text(0, -15, lines.join("\n"), {
            fontFamily: 'Titan One', fontSize: '18px', fill: '#fff', align: 'center'
        }).setOrigin(0.5);
        this.controlsPopup.add([signBG, signTXT]).setVisible(false);
        
    }


// ################## UPDATE ################## //
    update() {
        const camX = this.cameras.main.scrollX;

        this.bg2.tilePositionX = camX * 0.8;  // 80% camera speed
        this.bg3.tilePositionX = camX * 0.5;  // 50%
        this.bg4.tilePositionX = camX * 0.2; 

        // sign interactibility
        const isTouchingSign = this.physics.overlap(my.sprite.player, this.sign);
        if (!isTouchingSign && this.controlsPopup.visible) {
            this.controlsPopup.setVisible(false);
        }

        this.input.keyboard.on('keydown-E', () => {
        if (this.physics.overlap(my.sprite.player, this.sign)) {
            this.signSound.play();
            this.controlsPopup.setVisible(!this.controlsPopup.visible);
        }
        });

        // player movement
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canDash) {
            this.dashSound.play();
            this.doDash();        }

        if (this.isDashing) {
            return;
        }

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // particle code 
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if(my.sprite.player.body.blocked.down){
                my.vfx.walking.start();
                if(!this.walkSound.isPlaying){
                    this.walkSound.play();
                }
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            // particle code 
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-20, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if(my.sprite.player.body.blocked.down){
                my.vfx.walking.start();
                if(!this.walkSound.isPlaying){
                    this.walkSound.play();
                }
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            // vfx stop playing
            my.vfx.walking.stop();
            this.walkSound.pause();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.explode(6, my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2);
            
            if (!(this.jumpSound.isPlaying)) {
                    this.jumpSound.play();
            }
        }

        // detect player death
        if (my.sprite.player.y > this.map.heightInPixels + 50) {
            if (!(this.deathSound.isPlaying)) {
                this.deathSound.play();
            }
            this.playerDeath();
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
            this.bgMusic.stop();
        }

    }

    doDash() {
        this.isDashing = true;
        this.canDash   = false;

        const player = my.sprite.player;
        const dir = player.flipX ? 1 : -1;

        player.setVelocityX(dir * this.dashSpeed);

            // ignore gravity during dash
        player.body.allowGravity = false;

        my.vfx.dashing.start();

            // end the dash after dashTime
        this.time.delayedCall(this.dashTime, () => {
        this.isDashing = false;
        player.body.allowGravity = true;

            // zero out horizontal speed to prevent sliding
            player.setVelocityX(0);
            my.vfx.dashing.pause();
            // start cooldown timer
            this.time.delayedCall(this.dashCooldown, () => {
                this.canDash = true;
            });
        });
        }


    playerDeath() {
        
        this.playerLives--;
        if (this.playerLives >= 0 && this.hearts[this.playerLives]) {
            this.hearts[this.playerLives].setTexture('emptyHeart');
        }

        // game over if player runs out of lives
        if (this.playerLives <= 0) {
            this.scene.start('gameOverScene');
        } else { // else respawn player at start

            my.sprite.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);

            my.sprite.player.setVelocity(0, 0);
            my.sprite.player.body.allowGravity = true;

            this.isDashing = false;
            this.canDash   = true;
            my.vfx.dashing?.pause();

            my.vfx.walking?.stop();
            my.vfx.jumping?.stop();

            // reset camera 
            this.cameras.main.centerOn(this.spawnPoint.x, this.spawnPoint.y);
        }
    }

    onLevelComplete() {
        // win screen
        const { width, height } = this.scale;
        this.add.text(width/2, height/2, 'You Win!\nPress R to Play Again!', {
        fontFamily: 'Titan One',
        fontSize: '32px',
        color: '#fffeff',
        stroke: '#ffa700',
        strokeThickness: 6,
        align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000);

        this.sound.play('finishSound');
        // pause player movement
        my.sprite.player.setVelocity(0, 0);
        this.physics.world.pause();
    }
}