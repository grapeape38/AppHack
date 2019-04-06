class CanvasDraw {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.color = "black"
        this.pensize = 5

        const width = 800;
        const height = 500;
        canvas.width = width; 
        canvas.height = height;
        this.pts = []
        var ps = 5

        this.canvas.onmousedown = (e) => this.pen = true;
        this.canvas.onmouseup = (e) => {
            this.pen = false;
            this.pts[this.pts.length - 1].end = true;
        }
        this.canvas.onmousemove = (e) => {
            if (this.pen) this.pts.push({ x : e.offsetX, y : e.offsetY, color: this.color, pensize: this.pensize});
            this.repaint();
        }

        this.ctx.fillStyle =  'white'
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fill()

    }

    main() {
       requestAnimationFrame(() => this.main());
       //this.repaint();
    }

    setFGColor(color) {
        this.color = color
    }

    setPenSize(size) {
      this.pensize = size
    }

    clearCanvas() {
        this.ctx.fillStyle =  'white'
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fill()
        this.pts = []
    }
    
    repaint() {
      if (this.pts.length == 0)
        return;
      this.ctx.strokeStyle = this.pts[0].color
      this.ctx.lineWidth = this.pts[0].pensize
      this.ctx.beginPath()
      for (var i = 1; i < this.pts.length; i++) {
        var prev = this.pts[i-1];
        var curr = this.pts[i];
        this.ctx.strokeStyle = prev.color;
        this.ctx.lineWidth = prev.pensize;
        if (prev.end || prev.color != curr.color || prev.pensize != curr.pensize) {
          this.ctx.stroke();
          this.ctx.beginPath();
        }
        else {
          this.ctx.moveTo(prev.x, prev.y);
          this.ctx.lineTo(curr.x, curr.y);
        }
      }
      this.ctx.stroke();
    }
}

export default CanvasDraw