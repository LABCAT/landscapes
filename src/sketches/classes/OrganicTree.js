export class OrganicTree {
  constructor({ p, gridI, gridJ, tx, ty, treeSize }) {
    this.p = p;
    this.gridI = gridI;
    this.gridJ = gridJ;
    this.tx = tx;
    this.ty = ty;
    this.treeSize = treeSize;
    this.elementType = 'tree';
    
    // Magical leaf colors
    const rdn0 = p.random(255);
    const rdn1 = p.random(255);
    this.minHue = p.min(rdn0, rdn1);
    this.maxHue = p.max(rdn0, rdn1);
    
    // Generate tree structure
    this.noiseOffset = p.random(1000);
    this.branches = [];
    this.leafs = [];
    this.generateTree();
    this.precalculateLeaves();
  }
  
  generateTree() {
    const p = this.p;
    const startAngle = -p.HALF_PI;
    const branchLength = this.treeSize * 1.5;
    this.branch(0, 0, this.treeSize * 0.4, startAngle, branchLength, 0);
  }
  
  branch(x, y, bSize, theta, bLength, pos) {
    const p = this.p;
    this.noiseOffset += 0.01;
    
    const diam = p.lerp(bSize, 0.7 * bSize, pos / bLength);
    const noisyDiam = diam * p.map(p.noise(this.noiseOffset), 0, 1, 0.4, 1.6);
    
    this.branches.push({ x, y, diam: noisyDiam, theta });
    
    if (bSize > 0.6) {
      if (pos < bLength) {
        x += p.cos(theta + p.random(-p.PI / 10, p.PI / 10));
        y += p.sin(theta + p.random(-p.PI / 10, p.PI / 10));
        this.branch(x, y, bSize, theta, bLength, pos + 1);
      } else {
        this.leafs.push({ x, y });
        
        const drawLeftBranch = p.random(1) > 0.1;
        const drawRightBranch = p.random(1) > 0.1;
        
        if (drawLeftBranch) {
          this.branch(
            x, y,
            p.random(0.5, 0.7) * bSize,
            theta - p.random(p.PI / 15, p.PI / 5),
            p.random(0.6, 0.8) * bLength,
            0
          );
        }
        
        if (drawRightBranch) {
          this.branch(
            x, y,
            p.random(0.5, 0.7) * bSize,
            theta + p.random(p.PI / 15, p.PI / 5),
            p.random(0.6, 0.8) * bLength,
            0
          );
        }
        
        // Draw tips when no branches spawn
        if (!drawLeftBranch && !drawRightBranch) {
          this.branches.push({ x, y, diam: noisyDiam, theta, isTip: true });
        }
      }
    }
  }

  precalculateLeaves() {
    const p = this.p;
    
    for (let i = 0; i < this.leafs.length; i++) {
      const h = p.map(i, 0, this.leafs.length, this.minHue, this.maxHue);
      
      this.leafs[i].bigLeaf = {
        hue: h,
        alpha: p.random(0, 1),
        diam: p.random(10, 250),
        jitterX: p.random(-30, 30),
        jitterY: p.random(-30, 30)
      };
      
      this.leafs[i].smallLeaf = {
        hue: h,
        alpha: p.random(20, 60),
        diam: p.random(0, 20),
        jitterX: p.random(-30, 30),
        jitterY: p.random(-30, 30)
      };
    }
  }

  draw(cellX, cellY, cellW, cellH) {
    const p = this.p;
    const x = cellX + this.tx * cellW;
    const y = cellY + this.ty * cellH;
    
    p.push();
    p.translate(x, y);
    p.noStroke();
    
    // Draw branches 3 times with different brightness (like example)
    for (let pass = 0; pass < 3; pass++) {
      const brightness = p.map(pass, 0, 2, 60, 20);
      p.fill(brightness);
      
      for (let i = 0; i < this.branches.length; i++) {
        const b = this.branches[i];
        
        if (b.isTip) {
          // Draw tip as quad
          p.push();
          p.translate(b.x, b.y);
          p.rotate(b.theta);
          p.quad(0, -b.diam/2, 2*b.diam, -b.diam/6, 2*b.diam, b.diam/6, 0, b.diam/2);
          p.pop();
        } else {
          p.ellipse(b.x, b.y, b.diam, b.diam);
        }
      }
    }
    
    p.pop();
    
    // Draw big smooth leafs
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.colorMode(p.HSB, 255);
    for (let i = 0; i < this.leafs.length; i++) {
      const leaf = this.leafs[i];
      const big = leaf.bigLeaf;
      p.fill(big.hue, 255, 255, big.alpha);
      p.ellipse(leaf.x + big.jitterX, leaf.y + big.jitterY, big.diam, big.diam);
    }
    
    // Draw small rigid leafs
    for (let i = 0; i < this.leafs.length; i++) {
      const leaf = this.leafs[i];
      const small = leaf.smallLeaf;
      p.fill(small.hue, 255, 255, small.alpha);
      p.ellipse(leaf.x + small.jitterX, leaf.y + small.jitterY, small.diam, small.diam);
    }
    
    p.colorMode(p.RGB, 255);
    p.pop();
  }
}

