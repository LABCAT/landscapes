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
        skyArray.push({
          elementType: 'sky',
          gridI: i,
          gridJ: j,
          color: this.colorsGrid[i][j]
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
        this.drawSky(x, y, cellWidth, cellHeight, element.color);
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

  drawSky(x, y, w, h, color) {
    const p = this.p;
    p.noStroke();
    p.fill(color);
    p.rect(x + w / 2, y + h / 2, w, h);
  }
}