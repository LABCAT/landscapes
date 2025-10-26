export class Glyph {
  constructor({ p, color, size, gx, gy, gridI, gridJ }) {
    this.p = p;
    this.col = color;
    this.size = size;
    this.gx = gx;
    this.gy = gy;
    this.gridI = gridI;
    this.gridJ = gridJ;
  }

  draw(cellX, cellY, cellW, cellH) {
    const p = this.p;
    p.push();
    
    const absX = cellX + this.gx * cellW;
    const absY = cellY + this.gy * cellH;
    
    p.translate(absX, absY);
    
    p.strokeWeight(1);
    
    p.stroke(this.col);
    p.fill(p.red(this.col) * 1.2, p.green(this.col) * 1.2, p.blue(this.col) * 1.2, 64);
    p.ellipse(0, 0, this.size, this.size);
    
    p.stroke(this.col);
    p.fill(this.col, 96);
    p.ellipse(0, 0, this.size * 0.5, this.size * 0.5);
    
    p.stroke(this.col);
    p.fill(p.red(this.col) * 0.8, p.green(this.col) * 0.8, p.blue(this.col) * 0.8, 128);
    p.ellipse(0, 0, this.size * 0.25, this.size * 0.25);
    
    p.stroke(this.col);
    p.fill(p.red(this.col) * 0.6, p.green(this.col) * 0.6, p.blue(this.col) * 0.6, 192);
    p.ellipse(0, 0, this.size * 0.125, this.size * 0.125);
    
    p.pop();
  }
}