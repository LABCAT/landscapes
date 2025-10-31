import { OrganicTree } from "./OrganicTree.js";

export class LandscapesGrid {
  constructor(p) {
    this.p = p;
    this.cols = 1;
    this.rows = 2;

    this.fullDisplay = false;

    this.colorsGrid = [];
    this.elements = [];
    this.cellGraphics = {}; // Store graphics buffers for each cell


    this.generateElements();
  }

  init(duration) {
    this.duration = duration * 1000 * 0.95;
    this.birthTime = this.p.song.currentTime() * 1000;
    this.progress = 0;
  }

  setFullDisplayMode() {
    this.fullDisplay = true;
  }

  generateElements() {
    const p = this.p;
    const palette = p.colorPalette[p.nightMode ? 'dark' : 'light'];
    let skyArray = [];
    let treeArray = [];

    for (let i = 0; i < this.cols; i++) {
      this.colorsGrid[i] = [];
      for (let j = 0; j < this.rows; j++) {
        const usedColors = [];
        for (let x = 0; x < this.cols; x++) {
          for (let y = 0; y < this.rows; y++) {
            if (this.colorsGrid[x] && this.colorsGrid[x][y]) {
              usedColors.push(this.colorsGrid[x][y]);
            }
          }
        }

        const availableColors = palette.filter(c => !usedColors.includes(c));
        const colorsToChooseFrom = availableColors.length > 0 ? availableColors : palette;
        let chosenColor = colorsToChooseFrom[p.floor(p.random(colorsToChooseFrom.length))];

        this.colorsGrid[i][j] = chosenColor;
      }
    }


    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const numHills = p.floor(p.random(2, 6));
        const hills = [];

        for (let h = 0; h < numHills; h++) {
          const hillData = {
            darkness: 0.5 + (h * 0.1),
            points: [
              { x: 0, y: p.random(0.1, 0.4) },
              { x: 0.2, y: p.random(0.1, 0.4) },
              { x: 0.4, y: p.random(0.1, 0.4) },
              { x: 0.6, y: p.random(0.1, 0.4) },
              { x: 0.8, y: p.random(0.1, 0.4) },
              { x: 1, y: p.random(0.1, 0.4) }
            ]
          };
          hills.push(hillData);
        }

        const cellColor = this.colorsGrid[i][j];
        const brightness = (p.red(cellColor) + p.green(cellColor) + p.blue(cellColor)) / 3;
        let blueShade, blackShade;

        if (brightness > 127) {
          // Light color - use darker shades
          blueShade = p.color(p.random(60, 100), p.random(120, 160), p.random(180, 220));
          blackShade = p.color(p.random(10, 30), p.random(10, 30), p.random(10, 30));
        } else {
          // Dark color - use lighter shades
          blueShade = p.color(p.random(150, 200), p.random(200, 230), p.random(230, 255));
          blackShade = p.color(p.random(40, 70), p.random(40, 70), p.random(40, 70));
        }


        let stars = [];
        let clouds = [];
        
        const starCount = p.int(p.random(48, 96));
        for (let s = 0; s < starCount; s++) {
          stars.push({
            x: p.random(0, 1),
            y: p.random(0, 0.6),
            size: p.random(1, 4),
            brightness: p.random(150, 255)
          });
        }
        
        const cloudCount = p.int(p.random(3, 5));
        for (let c = 0; c < cloudCount; c++) {
          const cx = p.random(0.1, 0.9);
          const cy = p.random(0.05, 0.25);
          const baseSize = p.random(35, 65);
          const width = p.random(1.5, 2.5);
          const lobeCount = p.int(p.random(6, 9));
          const lobes = [];
          
          for (let l = 0; l < lobeCount; l++) {
            const angle = p.random(-Math.PI/2.5, Math.PI/2.5);
            const distMult = p.random(0.2, 1.0);
            const dist = baseSize * distMult * width;
            const xoff = Math.cos(angle) * dist;
            const yoff = Math.sin(angle) * dist * 0.3;
            const lobeSize = p.random(baseSize * 0.4, baseSize * 1.2) * (1.2 - distMult * 0.4);
            const opacity = p.int(p.random(50, 100));
            lobes.push({ xoff, yoff, size: lobeSize, opacity });
          }
          
          clouds.push({ x: cx, y: cy, lobes });
        }


        skyArray.push({
          elementType: 'sky',
          gridI: i,
          gridJ: j,
          color: cellColor,
          blueShade: blueShade,
          blackShade: blackShade,
          hills: hills,
          stars: stars,
          clouds: clouds,
          prerenderedSky: null
        });

        const treeCount = p.int(p.random(4, 8));
        const treesInCell = [];

        for (let t = 0; t < treeCount; t++) {
          const tx = p.random(0.1, 0.9);
          const randomHill = hills[p.floor(p.random(hills.length))];
          let ty = 1.0;

          let closestPoint = randomHill.points[0];
          let minDist = Math.abs(closestPoint.x - tx);
          for (let pt of randomHill.points) {
            const dist = Math.abs(pt.x - tx);
            if (dist < minDist) {
              minDist = dist;
              closestPoint = pt;
            }
          }

          if (closestPoint.y < 0.3) {
            ty = 1.0 - closestPoint.y + 0.05;
            const cellW = p.width / this.cols;
            const cellH = p.height / this.rows;
            const cellSize = Math.min(cellW, cellH);
            const tree = new OrganicTree({
              p,
              gridI: i,
              gridJ: j,
              tx: tx,
              ty: ty,
              treeSize: p.random(cellSize * 0.08, cellSize * 0.15),
            });
            treesInCell.push({ tx, ty });
            treeArray.push(tree);
          }
        }
      }
    }

    skyArray = p.shuffle(skyArray);
    treeArray = p.shuffle(treeArray);

    this.elements = skyArray.concat(treeArray);
  }

  update() {
    const currentTime = this.p.song.currentTime() * 1000;
    const elapsed = currentTime - this.birthTime;
    const rawProgress = elapsed / this.duration;
    this.progress = this.p.constrain(rawProgress, 0, 1);
  }


  draw() {
    const p = this.p;
    const cellWidth = p.width / this.cols;
    const cellHeight = p.height / this.rows;

    const sizeKey = `${Math.floor(cellWidth)}_${Math.floor(cellHeight)}`;
    if (!this.cellGraphics[sizeKey]) {
      this.cellGraphics[sizeKey] = p.createGraphics(cellWidth, cellHeight);
    }

    p.push();

    for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        if (element.elementType === 'sky') {
          const x = element.gridI * cellWidth;
          const y = element.gridJ * cellHeight;
          this.drawBackground(x, y, cellWidth, cellHeight, element, this.cellGraphics[sizeKey]);
        }
    }

    const elementsToShow = this.fullDisplay ?
      this.elements.length :
      Math.floor(this.elements.length * this.progress);

    for (let i = 0; i < elementsToShow; i++) {
        const element = this.elements[i];
        if (element.elementType === 'tree') {
          const x = element.gridI * cellWidth;
          const y = element.gridJ * cellHeight;
          element.draw(x, y, cellWidth, cellHeight);
        }
    }

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const x = i * cellWidth;
        const y = j * cellHeight;
        p.noFill();
        p.stroke(0);
        p.strokeWeight(4);
        p.rect(x + cellWidth / 2, y + cellHeight / 2, cellWidth, cellHeight);
      }
    }

    p.pop();
  }

  drawBackground(x, y, w, h, element, pg) {
    const p = this.p;
    pg.clear();

    if (!element.prerenderedSky) {
      element.prerenderedSky = p.createGraphics(w, h);
      const sky = element.prerenderedSky;
      
      const topColor = p.nightMode ? element.blackShade : element.blueShade;
      const color = element.color;

      const ctx = sky.drawingContext;
      const gradient = ctx.createLinearGradient(0, 0, 0, h / 4 * 3);
      gradient.addColorStop(this.p.nightMode ? 0 : 1, `rgb(${p.red(topColor)}, ${p.green(topColor)}, ${p.blue(topColor)})`);
      gradient.addColorStop(this.p.nightMode ? 1 : 0, `rgb(${p.red(color)}, ${p.green(color)}, ${p.blue(color)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      if (this.p.nightMode) {
        sky.noStroke();
        for (let star of element.stars) {
          sky.fill(star.brightness);
          sky.ellipse(star.x * w, star.y * h, star.size, star.size);
        }
      } else {
        sky.noStroke();
        sky.drawingContext.filter = 'blur(2px)';
        
        for (let cloud of element.clouds) {
          sky.push();
          sky.translate(cloud.x * w, cloud.y * h);
          
          const sortedLobes = [...cloud.lobes].sort((a, b) => b.size - a.size);
          
          for (let lobe of sortedLobes) {
            sky.push();
            sky.translate(lobe.xoff, lobe.yoff);
            
            sky.fill(255, 255, 255, lobe.opacity * 0.5);
            sky.ellipse(0, 0, lobe.size, lobe.size * 0.8);
            
            sky.fill(255, 255, 255, lobe.opacity * 0.8);
            sky.ellipse(0, 0, lobe.size * 0.6, lobe.size * 0.5);
            
            sky.pop();
          }
          sky.pop();
        }
        
        sky.drawingContext.filter = 'none';
      }
    }

    pg.image(element.prerenderedSky, 0, 0);
    
    const color = element.color;

    for (let i = 0; i < element.hills.length; i++) {
      const hill = element.hills[i];
      const hillColor = pg.color(
        pg.red(color) * hill.darkness,
        pg.green(color) * hill.darkness,
        pg.blue(color) * hill.darkness
      );

      pg.stroke(0, 0, 0);
      pg.strokeWeight(6);
      pg.fill(hillColor);
      pg.beginShape();

      const startY = h;

      pg.curveVertex(0, startY);
      pg.curveVertex(0, startY);

      for (let pt of hill.points) {
        pg.curveVertex(w * pt.x, startY - h * pt.y);
      }

      pg.curveVertex(w, startY);
      pg.curveVertex(w, startY);

      pg.endShape();
    }

    p.image(pg, x, y);
  }
}
