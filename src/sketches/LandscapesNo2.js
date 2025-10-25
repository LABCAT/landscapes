import p5 from "p5";

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
  };

  p.draw = () => {
    p.background(0);
    p.fill(255);
    p.ellipse(p.width / 2, p.height / 2, 100, 100);
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

  /**
   * Utility: Check if the canvas is in portrait orientation
   * @returns {Boolean} true if portrait, false otherwise
   */
  p.isPortraitCanvas = () => {
    return p.height > p.width;
  };

  /** 
   * Convert a string to a deterministic seed for p5.js random functions
   * Used with highlight.xyz for consistent generative art
   * @param {String} str - The string to convert to a seed
   * @returns {Number} - A deterministic seed value
   */
  p.hashToSeed = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
  };
};

new p5(sketch);