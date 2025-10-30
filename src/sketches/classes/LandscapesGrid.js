import { OrganicTree } from "./OrganicTree.js";

export class LandscapesGrid {
  constructor(p) {
    this.p = p;
    this.cols = 1;
    this.rows = 2;

    this.fullDisplay = false;

    this.colorsGrid = [];
    this.elements = [];


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
        // Get all colors that haven't been used yet
        const usedColors = [];
        for (let x = 0; x < this.cols; x++) {
          for (let y = 0; y < this.rows; y++) {
            if (this.colorsGrid[x] && this.colorsGrid[x][y]) {
              usedColors.push(this.colorsGrid[x][y]);
            }
          }
        }

        // Filter out used colors
        const availableColors = palette.filter(c => !usedColors.includes(c));

        // If we run out of colors, start over with the full palette
        const colorsToChooseFrom = availableColors.length > 0 ? availableColors : palette;
        let chosenColor = colorsToChooseFrom[p.floor(p.random(colorsToChooseFrom.length))];

        this.colorsGrid[i][j] = chosenColor;
      }
    }


    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        // Generate hill data for this cell
        const numHills = p.floor(p.random(2, 6));
        const hills = [];

        for (let h = 0; h < numHills; h++) {
          // Store hill control points
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

        // Calculate brightness of cell color
        const brightness = (p.red(cellColor) + p.green(cellColor) + p.blue(cellColor)) / 3;

        // Generate both blue and black shades
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


        // Always generate both stars and clouds for each cell
        let stars = [];
        let clouds = [];
        // Stars
        const starCount = p.int(p.random(48, 96));
        for (let s = 0; s < starCount; s++) {
          stars.push({
            x: p.random(0, 1),
            y: p.random(0, 0.6),
            size: p.random(1, 4),
            brightness: p.random(150, 255)
          });
        }
        // Clouds: each cloud is made of several overlapping circle sets (lobes)
        const cloudCount = p.int(p.random(4, 8));
        for (let c = 0; c < cloudCount; c++) {
          const cx = p.random(0.1, 0.9);
          const cy = p.random(0.05, 0.25);
          const baseSize = p.random(28, 48);

          // Pre-calculate white color variants with alpha for better performance
          const baseCol = p.color(255, 255, 255);
          const colOuter = p.color(255, 255, 255, 64);
          const colInner = p.color(255, 255, 255, 96);
          const colCenter = p.color(255, 255, 255, 128);

          const lobeCount = p.int(p.random(6, 10));
          const lobes = [];
          for (let l = 0; l < lobeCount; l++) {
            const angle = p.random(-Math.PI/1.8, Math.PI/1.8);
            const dist = p.random(baseSize * 0.3, baseSize * 0.75);
            const xoff = Math.cos(angle) * dist;
            const yoff = Math.sin(angle) * dist * 0.22;
            const lobeSize = p.random(baseSize * 0.65, baseSize * 1.05);
            lobes.push({ xoff, yoff, size: lobeSize });
          }
          lobes.push({ xoff: 0, yoff: 0, size: baseSize });
          clouds.push({ x: cx, y: cy, colOuter, colInner, colCenter, lobes });
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
          clouds: clouds
        });

        const treeCount = p.int(p.random(4, 8));
        const treesInCell = [];

        for (let t = 0; t < treeCount; t++) {
          const tx = p.random(0.1, 0.9);

          // Pick a random hill and find Y position at this X
          const randomHill = hills[p.floor(p.random(hills.length))];
          let ty = 1.0; // default to bottom

          // Find the closest point on the hill curve to this X position
          let closestPoint = randomHill.points[0];
          let minDist = Math.abs(closestPoint.x - tx);
          for (let pt of randomHill.points) {
            const dist = Math.abs(pt.x - tx);
            if (dist < minDist) {
              minDist = dist;
              closestPoint = pt;
            }
          }

          // Only place tree if it's not too high on the hill (avoid peaks)
          if (closestPoint.y < 0.3) { // only place on lower 70% of hill
            ty = 1.0 - closestPoint.y + 0.05; // convert from height to Y position, offset down slightly

            const cellW = p.width / this.cols;
            const cellH = p.height / this.rows;
            const cellSize = Math.min(cellW, cellH); // use smaller dimension
            const tree = new OrganicTree({
              p,
              gridI: i,
              gridJ: j,
              tx: tx,
              ty: ty,
              treeSize: p.random(cellSize * 0.08, cellSize * 0.15), // 8-15% of cell size
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

    p.push();

    const elementsToShow = this.fullDisplay ?
      this.elements.length :
      Math.floor(this.elements.length * this.progress);

    for (let i = 0; i < elementsToShow; i++) {
        const element = this.elements[i];
        const x = element.gridI * cellWidth;
        const y = element.gridJ * cellHeight;

        if (element.elementType === 'sky') {
          this.drawBackground(x, y, cellWidth, cellHeight, element);
        } else {
          element.draw(x, y, cellWidth, cellHeight);
        }
    }

    // Draw grid borders
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

  drawBackground(x, y, w, h, element) {
    const p = this.p;

    // Create off-screen graphics buffer for this cell
    const pg = p.createGraphics(w, h);

    // Choose top color based on night mode
    const topColor = p.nightMode ? element.blackShade : element.blueShade;
    const color = element.color;

    // Draw sky gradient using Canvas API for better performance
    const ctx = pg.drawingContext;
    const gradient = ctx.createLinearGradient(0, 0, 0, h / 4 * 3);
    gradient.addColorStop(this.p.nightMode ? 0 : 1, `rgb(${p.red(topColor)}, ${p.green(topColor)}, ${p.blue(topColor)})`);
    gradient.addColorStop(this.p.nightMode ? 1 : 0, `rgb(${p.red(color)}, ${p.green(color)}, ${p.blue(color)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);


    // Draw stars or clouds
    if (this.p.nightMode) {
      pg.noStroke();
      for (let star of element.stars) {
        pg.fill(star.brightness);
        pg.ellipse(star.x * w, star.y * h, star.size, star.size);
      }
    } else {
      for (let cloud of element.clouds) {
        pg.push();
        pg.translate(cloud.x * w, cloud.y * h);
        pg.noStroke();
        for (let lobe of cloud.lobes) {
          pg.push();
          pg.translate(lobe.xoff, lobe.yoff);
          // Outer layer - softest
          pg.fill(cloud.colOuter);
          pg.ellipse(0, 0, lobe.size, lobe.size);
          // Middle layer - main body
          pg.fill(cloud.colInner);
          pg.ellipse(0, 0, lobe.size * 0.5, lobe.size * 0.5);
          // Inner layer - highlight
          pg.fill(cloud.colCenter);
          pg.ellipse(0, 0, lobe.size * 0.25, lobe.size * 0.25);
          pg.pop();
        }
        pg.pop();
      }
    }

    // Draw hills using pre-generated data
    for (let i = 0; i < element.hills.length; i++) {
      const hill = element.hills[i];

      // Hill color using pre-calculated darkness
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

      // curveVertex needs duplicate first and last points
      pg.curveVertex(0, startY);
      pg.curveVertex(0, startY);

      // Use pre-generated control points
      for (let pt of hill.points) {
        pg.curveVertex(w * pt.x, startY - h * pt.y);
      }

      pg.curveVertex(w, startY);
      pg.curveVertex(w, startY);

      pg.endShape();
    }

    // Draw the buffer to the main canvas
    p.image(pg, x, y);
  }
}
