"use strict"

let config = {
    parent: "phaser-game",
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },

    width: 1440,
    height: 900,
    scene: [Load, Title, PF_L1, GameOver],
    
    plugins: {
        scene: [
            {
                key: 'AnimatedTiles',
                plugin: AnimatedTiles,
                mapping: 'animatedTiles'    
            }
        ]
    }
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);