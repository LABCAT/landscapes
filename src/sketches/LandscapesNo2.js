import p5 from "p5";
import { LandscapesGrid } from './classes/LandscapesGrid.js';

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.rectMode(p.CENTER);
    p.colorPalette = p.generatePalette();
    p.currentLandscapes = new LandscapesGrid(p);
    p.currentLandscapes.setFullDisplayMode(true);
  };

  p.draw = () => {
    p.currentLandscapes.draw();
    p.noLoop();
  };

  p.generatePalette = () => {
    p.colorMode(p.HSB, 360, 100, 100);
    const palette = [];
    
    // Base colors: pink/red, blue, yellow, green, purple, orange
    const baseColors = [
        { h: p.random(340, 360), s: p.random(20, 50), b: p.random(85, 95) },  // soft pink
        { h: p.random(0, 20), s: p.random(50, 80), b: p.random(80, 90) },     // warm red
        { h: p.random(190, 210), s: p.random(50, 80), b: p.random(75, 85) },  // blue
        { h: p.random(50, 70), s: p.random(60, 90), b: p.random(80, 90) },    // yellow
        { h: p.random(100, 140), s: p.random(40, 70), b: p.random(70, 85) },  // green
        { h: p.random(270, 290), s: p.random(40, 70), b: p.random(70, 85) },  // purple
        { h: p.random(20, 40), s: p.random(60, 90), b: p.random(80, 90) },    // orange
        { h: p.random(160, 180), s: p.random(30, 60), b: p.random(75, 85) },  // teal
    ];
    
    // Push base colors
    baseColors.forEach(c => palette.push(p.color(c.h, c.s, c.b)));
    
    // Add 4 more varied colors
    for(let i=0; i<4; i++){
        const h = p.random(360);
        const s = p.random(30, 80);
        const b = p.random(60, 90);
        palette.push(p.color(h, s, b));
    }
    
    // Shuffle the palette to randomize order
    p.shuffle(palette);
    
    p.colorMode(p.RGB, 255);
    return palette;
  };

  /** 
   * Handle mouse/touch interaction
   */
  p.mousePressed = () => {

  }

  /** 
   * Resize the canvas when the window is resized
   * and redraw
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.redraw();
  };

};

new p5(sketch);