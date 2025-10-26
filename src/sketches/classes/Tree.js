import { Glyph } from "./Glyph.js";
export class Tree {
  constructor({ p, gridI, gridJ, tx, ty, tw, thRatio }) {
    this.p = p;
    this.gridI = gridI;
    this.gridJ = gridJ;
    this.tx = tx;
    this.ty = ty;
    this.tw = tw;
    this.thRatio = thRatio;
    this.size = tw;
   
    this.greenColors = [
      p.color(p.random(20, 100), p.random(80, 150), p.random(20, 50)),
      p.color(p.random(30, 90), p.random(100, 180), p.random(30, 60)),
      p.color(p.random(10, 70), p.random(70, 130), p.random(20, 50))
    ];
   
    this.brownColor = p.color(p.random(60, 120), p.random(40, 80), p.random(20, 40));
   
    this.glyphs = [];
    const cellH = p.height / 1;
    const totalHeight = p.random(0.05, 0.1) * cellH;
    const avgGlyphHeight = this.tw * 0.9;
    const levels = Math.max(1, Math.floor(totalHeight / avgGlyphHeight));
   
    for (let i = 0; i < levels; i++) {
      const gy = 1.0 - ((avgGlyphHeight * (i + 1)) / cellH);
     
      if (i < 2) {
        // Bottom levels (i=0,1): trunk only - closest to ground
        this.glyphs.push(new Glyph({
          p: this.p,
          gridI: this.gridI,
          gridJ: this.gridJ,
          gx: this.tx,
          gy,
          size: this.tw,
          color: this.brownColor
        }));
      } else {
        // Upper levels (i=2+): trunk + branches - FEWER branches as we go higher
        const branchWidth = Math.max(1, Math.min(levels - i, 3));
       
        // Main trunk (keep brown for now)
        this.glyphs.push(new Glyph({
          p: this.p,
          gridI: this.gridI,
          gridJ: this.gridJ,
          gx: this.tx,
          gy,
          size: this.tw,
          color: this.brownColor
        }));
       
        // Side branches (green leaves) - fewer at higher levels
        const branchDistanceMultiplier = p.random(0.004, 0.008); 
        for (let b = 1; b <= branchWidth; b++) {
          // Left branch
          this.glyphs.push(new Glyph({
            p: this.p,
            gridI: this.gridI,
            gridJ: this.gridJ,
            gx: this.tx - b * branchDistanceMultiplier,
            gy,
            size: this.tw * 0.8,
            color: this.greenColors[(i + b) % this.greenColors.length]
          }));
         
          // Right branch
          this.glyphs.push(new Glyph({
            p: this.p,
            gridI: this.gridI,
            gridJ: this.gridJ,
            gx: this.tx + b * branchDistanceMultiplier,
            gy,
            size: this.tw * 0.8,
            color: this.greenColors[(i + b + 1) % this.greenColors.length]
          }));
        }
      }
    }
  }
 
  draw(cellX, cellY, cellW, cellH) {
    this.glyphs.forEach(glyph => {
      glyph.draw(cellX, cellY, cellW, cellH);
    });
  }
}