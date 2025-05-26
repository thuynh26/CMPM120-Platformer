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

        // player dash movement
        this.canDash = true;    // dash cooled down check
        this.isDashing = false;   // 
        this.dashSpeed = 300;     // pixels/sec
        this.dashTime = 150;     // ms duration of dash
        this.dashCooldown = 500;     // ms before you can dash again

    }

// ################## CREATE ################## //
    create() {
        // parallax background
        this.add.image(0, 0, "bg-1").setOrigin(0,0).setScrollFactor(0).setScale(this.SCALE + 0.085);

        // slowest (farthest back)
        this.bg2 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-2")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085);

        // mid‑distance
        this.bg3 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-3")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085);

        // closest (fastest)
        this.bg4 = this.add.tileSprite(0, 0, this.scale.width, 1000, "bg-4")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(this.SCALE + 0.085);

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

        // now tiles from both sets will render wherever Tile indices point
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Initialize tile animations
        this.animatedTiles.init(this.map);  

        // "coin" objects -> assign coin texture from tilemap sprite sheet
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
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

        // convert coin into arcade physic sprites
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        // make the physics world as big as the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);


    // KEY INPUTS
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // player dash key
        this.shiftKey = this.input.keyboard.addKey('SHIFT');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


    // MOVEMENT PARTICLES
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: {start: 0.02, end: 0.08},
            lifespan: 350,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();   

    // GAME CAMERA
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        console.log(this.cameras.main.worldView.x);
        console.log(this.cameras.main.worldView.y);  


    // DISPLAY SCORE 
        this.coinText = this.add.text(370, 240, "Coins: " + this.coinScore, {
            fontSize: '18px'
        });
        this.coinText.setScrollFactor(0, 0);

        // coin collection vfx 
        this.coinParticle = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_05.png', 'star_06.png', 'star_07.png'],
            lifespan: 400,
            speed: { min: 50, max: 150 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: -200,
            quantity: 3
        });
        this.coinParticle.stop();

        // coin collision handler - removes coin on overlap with player character
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            this.coinParticle.emitParticleAt(coin.x, coin.y);

            coin.destroy();

            this.coinScore += 1
            this.coinText.setText("Coins: " + this.coinScore);
        });
    }


// ################## UPDATE ################## //
    update() {
        const camX = this.cameras.main.scrollX;

        this.bg2.tilePositionX = camX * 0.8;  // 80% camera speed
        this.bg3.tilePositionX = camX * 0.5;  // 50%
        this.bg4.tilePositionX = camX * 0.2; 

        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canDash) {
        this.doDash();
        }

        // 2) WHILE DASHING: skip the normal left/right/jump code
        if (this.isDashing) {
        // you might still want gravity/jumping or not;
        // remove this `return` if you want to preserve jump input
        return;
        }

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if(my.sprite.player.body.blocked.down){
                my.vfx.walking.start();
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-20, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if(my.sprite.player.body.blocked.down){
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

    }

    doDash() {
        this.isDashing = true;
        this.canDash   = false;

        const player = my.sprite.player;
            // determine direction from flipX (if you flip the sprite when facing right)
        const dir = player.flipX ? 1 : -1;

        player.setVelocityX(dir * this.dashSpeed);

            // ignore gravity during dash
        player.body.allowGravity = false;

            // end the dash after dashTime
        this.time.delayedCall(this.dashTime, () => {
        this.isDashing = false;
        player.body.allowGravity = true;

            // zero out horizontal speed to prevent sliding
            player.setVelocityX(0);

            // start cooldown timer
            this.time.delayedCall(this.dashCooldown, () => {
                this.canDash = true;
            });
        });
        }

}