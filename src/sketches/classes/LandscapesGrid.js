export class LandscapesGrid {
  constructor(p) {
    this.p = p;
    this.cols = 3;
    this.rows = 3;

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
    const palette = p.colorPalette;
    let skyArray = [];

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
            darkness: 0.3 + (h * 0.1),
            points: [
              { x: 0.1, y: p.random(0, 0.2) },
              { x: 0.25, y: p.random(0, 0.4) },
              { x: 0.4, y: p.random(0, 0.5) },
              { x: 0.6, y: p.random(0, 0.4) },
              { x: 0.8, y: p.random(0, 0.2) }
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
        
        skyArray.push({
          elementType: 'sky',
          gridI: i,
          gridJ: j,
          color: cellColor,
          blueShade: blueShade,
          blackShade: blackShade,
          hills: hills
        });
      }
    }

    skyArray = p.shuffle(skyArray);

    this.elements = skyArray;
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
        this.drawBackground(x, y, cellWidth, cellHeight, element);
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
    
    // Choose top color based on night mode
    const topColor = p.nightMode ? element.blackShade : element.blueShade;
    const color = element.color;
    
    // Draw sky gradient using Canvas API for better performance
    const ctx = p.drawingContext;
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, `rgb(${p.red(topColor)}, ${p.green(topColor)}, ${p.blue(topColor)})`);
    gradient.addColorStop(1, `rgb(${p.red(color)}, ${p.green(color)}, ${p.blue(color)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Draw hills using pre-generated data
    for (let i = 0; i < element.hills.length; i++) {
      const hill = element.hills[i];
      
      // Hill color using pre-calculated darkness
      const hillColor = p.color(
        p.red(color) * hill.darkness,
        p.green(color) * hill.darkness,
        p.blue(color) * hill.darkness
      );
      
      p.stroke(0, 0, 0);
      p.strokeWeight(6);
      p.fill(hillColor);
      p.beginShape();
      
      const startY = y + h;
      
      // curveVertex needs duplicate first and last points
      p.curveVertex(x, startY);
      p.curveVertex(x, startY);
      
      // Use pre-generated control points
      for (let pt of hill.points) {
        p.curveVertex(x + w * pt.x, startY - h * pt.y);
      }
      
      p.curveVertex(x + w, startY);
      p.curveVertex(x + w, startY);
      
      p.endShape();
    }
  }
}