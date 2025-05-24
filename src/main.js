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
                y:0
            }
        }
    },

    width: 1440,
    height: 900,
    scene: [Load, Platformer], // CHANGE 
    
    plugins: {
        scene: [
            {
                key: 'AnimatedTiles',
                plugin: AnimationTiles,
                mapping: 'animatedTiles'      
            }
        ]
    }
}

var cursor;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);