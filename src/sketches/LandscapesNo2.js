import p5 from "p5";
import '@/lib/p5.randomColor.js';
import { LandscapesGrid } from './classes/LandscapesGrid.js';

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.rectMode(p.CENTER);
    p.nightMode = p.random() < 0.5;
    p.colorPalette = p.generatePalette();
    p.currentLandscapes = new LandscapesGrid(p);
    p.currentLandscapes.setFullDisplayMode(true);
  };

  p.draw = () => {
    p.currentLandscapes.draw();
    p.noLoop();
  };

  p.generatePalette = () => {
    const darkPalette = p.randomColor({ count: 12, luminosity: 'dark' });
    p.shuffle(darkPalette);

    const lightPalette = p.randomColor({ count: 12, luminosity: 'light' });
    p.shuffle(lightPalette);

    return { dark: darkPalette, light: lightPalette };
  };

  /**
   * Handle mouse/touch interaction - toggle night mode
   */
  p.mousePressed = () => {
    p.nightMode = !p.nightMode;
    p.redraw();
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
