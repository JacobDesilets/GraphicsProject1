class Snake {

  width = 0.05;
  speed = 4; // snake moves once every [speed] frames
  dash_speed = 5;

  constructor(gl, fm) {
    this.gl = gl;
    this.fm = fm;
    this.reset();

    this.program = initShaders(gl, "snake-vertex", "snake-fragment");
    this.gl.useProgram(this.program);

    this.vBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.DYNAMIC_DRAW);

    this.positionLoc = this.gl.getAttribLocation( this.program, "aPosition");
    this.gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.positionLoc);

    this.headUniform = gl.getUniformLocation( this.program, "head" );
    this.dashedUniform = gl.getUniformLocation( this.program, "lastDashed" );
    this.thetaUniform = gl.getUniformLocation( this.program, "uTheta" );
  }

  reset() {
    this.dx = 1;
    this.dy = 0;
    this.grow = 3;
    this.dead = false;
    this.update_counter = 0.0;
    this.theta = 0.0;

    this.vertices = [
      vec2(-0.5, 0),
      vec2(-0.5, this.width),
      vec2(-0.5 + this.width, 0),
      vec2(-0.5 + this.width, this.width)
    ];
  }

  changeDirection(dx, dy) {
    if (dx == this.dx || dy == this.dy || this.dead) {
      return;
    }
    var old1 = this.getVertex(-1);
    var old2 = this.getVertex(-2);
    var older = this.getVertex(-3);
    // prevent quick X->Y or Y->X input from resulting in death
    if (older[0] == old1[0] && older[1] == old1[1]) {
      this.move();
      this.changeDirection(dx, dy);
      return;
    }
    var new1 = vec2(
      dx == 1 ? Math.max(old1[0], old2[0]) : Math.min(old1[0], old2[0]),
      dy == 1 ? Math.max(old1[1], old2[1]) : Math.min(old1[1], old2[1])
    );
    var new2 = vec2(
      new1[0] - this.width*this.dx,
      new1[1] - this.width*this.dy
    );
    this.dx = dx;
    this.dy = dy;
    for (let i = 0; i < 2; ++i) {
      this.vertices.push(vec2(new1[0], new1[1]));
      this.vertices.push(vec2(new2[0], new2[1]));
    }
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
    if (this.dead) return;
    this.moveVertex(-1, vec2(this.dx, this.dy));
    this.moveVertex(-2, vec2(this.dx, this.dy));
    if (this.grow == 0) {
      this.shrink();
    }
    this.collide();
  }

  collide() {
    // calculate point in the center of the snakes head for collisions
    let head = this.getHeadPos();
    // collide with self
    for (let i = 0; i < this.vertices.length - 4; i+= 4) {
      var rect = this.vertices.slice(i, i+4);
      if (pointInRect(head, rect)) {
        this.die();
      }
    }
    // collide with walls
    if (head[0] < -1 || head[0] > 1 || head[1] < -1 || head[1] > 1) {
      this.die();
    }
    // collide with food
    let before_eat = this.fm.score;
    this.fm.collide(head);
    this.grow += (this.fm.score - before_eat)*this.fm.FOOD_WEIGHT;
  }

  getHeadPos() {
    let head = vec2(
      (this.getVertex(-1)[0] + this.getVertex(-2)[0] - this.dx*this.width)/2.0,
      (this.getVertex(-1)[1] + this.getVertex(-2)[1] - this.dy*this.width)/2.0
    );
    return head;
  }

  dash() {
    if (this.dead) return;
    for (let i = 0; i < this.dash_speed; ++i) {
      this.move();
    }
    this.last_dashed = 0;
  }

  shrink() {
    var sx = sign(this.vertices[0][0] - this.vertices[2][0]);
    var sy = sign(this.vertices[0][1] - this.vertices[2][1]);
    if (sx == 0 && sy == 0) {
      this.vertices.shift();
      this.vertices.shift();
      this.vertices.shift();
      this.vertices.shift();
      this.shrink();
    }
    else {
      this.moveVertex(0, vec2(-sx, -sy));
      this.moveVertex(1, vec2(-sx, -sy));
    }
  }

  update() {
    this.update_counter += 1;
    this.last_dashed += 1;
    if (this.dead && !this.fm.won) this.theta += 0.03;
    if (this.update_counter % this.speed == 0) {
      this.move();
      if(this.grow > 0) {
        this.grow--;
      }
    }
    this.render();
  }

  render() {
    gl.useProgram(this.program);
    let head = this.getHeadPos();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.positionLoc);
    this.gl.uniform1f(this.thetaUniform, this.theta);
    this.gl.uniform2fv(this.headUniform, head);
    this.gl.uniform1f(this.dashedUniform, this.last_dashed);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.DYNAMIC_DRAW);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length);
  }
}
