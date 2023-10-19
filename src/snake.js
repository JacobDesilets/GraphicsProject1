class Snake
{

  width = 0.05;
  speed = 4;
  dash_speed = 5;

  constructor(gl) {
    this.gl = gl;
    this.reset();

    this.vBuffer = this.gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.DYNAMIC_DRAW);

    var program = initShaders(gl, "snake-vertex", "snake-fragment");
    gl.useProgram(program);

    var positionLoc = this.gl.getAttribLocation( program, "aPosition");
    this.gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(positionLoc);

    this.headUniform = gl.getUniformLocation( program, "head" );
    this.dashedUniform = gl.getUniformLocation( program, "lastDashed" );
  }

  reset()
  {
    this.dx = 1;
    this.dy = 0;
    this.grow = true;
    this.dead = false;
    this.update_counter = 0.0;

    this.vertices = [
      vec2(0, 0),
      vec2(0, this.width),
      vec2(this.width, 0),
      vec2(this.width, this.width)
    ];
  }

  changeDirection(dx, dy)
  {
    if (dx == this.dx || dy == this.dy || this.dead)
    {
      return;
    }
    var old_x1 = this.vertices[this.vertices.length -1][0];
    var old_y1 = this.vertices[this.vertices.length -1][1];
    var old_x2 = this.vertices[this.vertices.length -2][0];
    var old_y2 = this.vertices[this.vertices.length -2][1];
    var older_x = this.vertices[this.vertices.length -3][0];
    var older_y = this.vertices[this.vertices.length -3][1];
    if ((older_x - old_x1) == 0 && Math.abs(older_y - old_y1) == 0)
    {
      this.move();
      this.shrink();
      this.changeDirection(dx, dy);
      return;
    }
    var new_x1 = dx == 1 ? Math.max(old_x1, old_x2) : Math.min(old_x1, old_x2);
    var new_y1 = dy == 1 ? Math.max(old_y1, old_y2) : Math.min(old_y1, old_y2);
    var new_x2 = new_x1 - this.width*this.dx;
    var new_y2 = new_y1 - this.width*this.dy;

    this.dx = dx;
    this.dy = dy;
    for (let i = 0; i < 2; ++i) {
      this.vertices.push(vec2(new_x1, new_y1));
      this.vertices.push(vec2(new_x2, new_y2));
    }
  }

  die()
  {
    console.log("DEATH");
    this.dead = true;
  }

  move()
  {
    if (this.dead) {
      return;
    }
    this.vertices[this.vertices.length - 1][1] += this.dy * this.width;
    this.vertices[this.vertices.length - 1][0] += this.dx * this.width;
    this.vertices[this.vertices.length - 2][1] += this.dy * this.width;
    this.vertices[this.vertices.length - 2][0] += this.dx * this.width;
    if (!this.grow) {
      this.shrink();
    }
    for (let i = 0; i < this.vertices.length - 4; i+= 4) {
      var rect = this.vertices.slice(i, i+4);
      var point = vec2(
        ((this.vertices[this.vertices.length -1][0] +
         this.vertices[this.vertices.length -1][0])/2.0),
        (this.vertices[this.vertices.length -2][1] +
         this.vertices[this.vertices.length -2][1])/2.0);

      if (pointInRect(point, rect)) {
        this.die();
      }
    }
    if (this.vertices[this.vertices.length -1][0] < -1 ||
        this.vertices[this.vertices.length -1][0] > 1 ||
        this.vertices[this.vertices.length -1][1] < -1 ||
        this.vertices[this.vertices.length -1][1] > 1) {
      this.die();
    }
        
  }

  dash()
  {
    for (let i = 0; i < this.dash_speed; ++i) {
      this.move();
    }
    this.last_dashed = 0;
  }

  shrink()
  {
    var sx = sign(this.vertices[0][0] - this.vertices[2][0]);
    var sy = sign(this.vertices[0][1] - this.vertices[2][1]);
    if (sx == 0 && sy == 0) {
      this.vertices.shift();
      this.vertices.shift();
      this.shrink();
    }
    else {
      this.vertices[0][1] -= sy * this.width;
      this.vertices[0][0] -= sx * this.width;
      this.vertices[1][1] -= sy * this.width;
      this.vertices[1][0] -= sx * this.width;
    }
  }

  update()
  {
    this.update_counter += 1;
    this.last_dashed += 0.1;
    if (this.update_counter % this.speed == 0)
    {
      this.move();
    }
    this.render();
  }

  render()
  {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    var head = [
      this.vertices[this.vertices.length -1][0],
      this.vertices[this.vertices.length -1][1],
      1.0,
      1.0
    ];
    this.gl.uniform4fv(this.headUniform, head);
    this.gl.uniform1f(this.dashedUniform, this.last_dashed);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.DYNAMIC_DRAW);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length);
  }
}
