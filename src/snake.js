class Snake {

  width = 0.05;
  speed = 4; // snake moves once every [speed] frames
  dash_speed = 5;

  constructor(gl) {
    this.gl = gl;
    this.reset();

    this.vBuffer = this.gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    var program = initShaders(gl, "snake-vertex", "snake-fragment");
    gl.useProgram(program);

    var positionLoc = this.gl.getAttribLocation( program, "aPosition");
    this.gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(positionLoc);

    this.headUniform = gl.getUniformLocation( program, "head" );
    this.dashedUniform = gl.getUniformLocation( program, "lastDashed" );

  }

  reset() {
    this.dx = 1;
    this.dy = 0;
    this.grow = false;
    this.dead = false;
    this.update_counter = 0.0;

    this.segments = [];
    this.segments.push(vec2(0, 0));
    this.currentPos = vec2(0, 0);

    this.vertices = [];
  }

  changeDirection(dx, dy) {
    if (dx == this.dx || dy == this.dy || this.dead) {
      return;
    }
    this.dx = dx;
    this.dy = dy;
  }

  die() {
    this.dead = true;
  }

  moveVertex(index, d) {
    index += index < 0 ? this.vertices.length : 0;
    for (let i = 0; i < 2; ++i) {
      this.vertices[index][i] =
        this.vertices[index][i] + d[i] * this.width;
    }
  }

  getVertex(index) {
    index += index < 0 ? this.vertices.length : 0;
    return this.vertices[index];
  }

  move() {
    if(this.dead) return;

    let newX = this.currentPos[0] + (this.dx * this.width);
    let newY = this.currentPos[1] + (this.dy * this.width)
    this.segments.push(vec2(newX, newY));
    
    this.currentPos = vec2(newX, newY);
  }

  collide() {
    // check if out of bounds
    if(this.currentPos[0] < -1 || this.currentPos[0] > 1 || this.currentPos[1] < -1 || this.currentPos[1] > 1) {
      console.log("Out of bounds!");
      this.die();
      return;
    }

    // check if currentPos overlaps any positions in segments
    for(let i = 0; i < this.segments.length - 1; i++) {
      if(Math.abs(this.segments[i][0] - this.currentPos[0]) < 0.01 && Math.abs(this.segments[i][1] - this.currentPos[1]) < 0.01) {
        this.die();
      }
    }
  }

  dash() {
    if (this.dead) return;
    for (let i = 0; i < this.dash_speed; ++i) {
      this.move();
    }
    this.last_dashed = 0;
  }

  shrink() {
    if(this.dead) return;
    this.segments.splice(0, 1);
  }

  calculateVertices() {
    for(let i = 0; i < this.segments.length; i++) {
      let segment = this.segments[i];
      this.vertices.push(vec2(segment[0], segment[1]));
      this.vertices.push(vec2(segment[0], segment[1] - this.width));
      this.vertices.push(vec2(segment[0] + this.width, segment[1] - this.width));

      this.vertices.push(vec2(segment[0], segment[1]));
      this.vertices.push(vec2(segment[0] + this.width, segment[1] - this.width));
      this.vertices.push(vec2(segment[0] + this.width, segment[1]));
    }
  }

  update() {
    this.update_counter += 1;
    this.last_dashed += 1;
    if (this.update_counter % this.speed == 0) {
      
      this.move();
      if(!this.grow) {
        this.shrink();
      }
      this.collide();
    }
    this.calculateVertices();
    this.render();
    this.vertices = [];
  }

  render() {
    var head = [
      this.getVertex(-1)[0], this.getVertex(-1)[1], 1.0, 1.0
    ];
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.uniform4fv(this.headUniform, head);
    this.gl.uniform1f(this.dashedUniform, this.last_dashed);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.DYNAMIC_DRAW);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length);
  }
}
