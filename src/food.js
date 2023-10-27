class Food {
  constructor(w, gl) {
    this.vertices = [];
    let sides = 2 + Math.ceil(Math.random() * 4) ;
    for (let i = 0; i < sides; ++i) {
      let theta = 2 * Math.PI * i/sides;
      this.vertices.push(vec2(
        w*Math.cos(theta)/2.0,
        w*Math.sin(theta)/2.0
      ));
    }
    this.gl = gl;
    this.shaderProgram = initShaders(this.gl, "food-vertex", "food-fragment");
    this.gl.useProgram(this.shaderProgram);
    this.vBuffer = this.gl.createBuffer ();
    this.positionLoc = this.gl.getAttribLocation(this.shaderProgram, "aPosition");

    this.w = w;
    this.theta = 0.0;
    this.sX = 1.0;
    this.sY = 1.0;
    this.tX = Math.random() * (1.8) - 0.9;
    this.tY = Math.random() * (1.8) - 0.9;

    this.speed = (Math.random() * 2 - 1) * 0.01;

    this.Mr = this.getRotationMatrix(this.theta);
    this.Ms = this.getScaleMatrix(this.sX, this.sY);
    this.Mt = this.getTransMatrix(this.tX, this.tY);

    this.uMr = this.gl.getUniformLocation(this.shaderProgram, "Mr");
    this.uMs = this.gl.getUniformLocation(this.shaderProgram, "Ms");
    this.uMt = this.gl.getUniformLocation(this.shaderProgram, "Mt");
    this.uTheta = this.gl.getUniformLocation(this.shaderProgram, "theta");
    this.uOpacity = this.gl.getUniformLocation(this.shaderProgram, "opacity");

    this.die = false;
    this.opacity = 1.0;
    this.faded = false;
  }

  getRotationMatrix(theta) {
    let s = Math.sin(theta);
    let c = Math.cos(theta);

    return [
      c,   -s,  0.0,
      s,   c,   0.0,
      0.0, 0.0, 1.0
    ];
  }

  getScaleMatrix(sX, sY) {
    return [
      sX,  0.0, 0.0,
      0.0, sY,  0.0,
      0.0, 0.0, 1.0
    ];
  }

  getTransMatrix(tX, tY) {
    return [
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      tX,  tY,  1.0
    ];
  }

  render() {
    this.gl.useProgram(this.shaderProgram);
    this.gl.bindBuffer (gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
    this.gl.vertexAttribPointer (this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.positionLoc);

    this.gl.uniformMatrix3fv(this.uMr, false, this.Mr);
    this.gl.uniformMatrix3fv(this.uMs, false, this.Ms);
    this.gl.uniformMatrix3fv(this.uMt, false, this.Mt);
    this.gl.uniform1f (this.uOpacity, this.opacity);
    this.gl.uniform1f (this.uTheta, Math.sin(this.theta) + Math.cos(this.theta));
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertices.length);
  }

  update() {
    this.theta += this.speed;

    this.Mr = this.getRotationMatrix(this.theta);
    this.Ms = this.getScaleMatrix(this.sX, this.sY);
    this.Mt = this.getTransMatrix(this.tX, this.tY);

    if (this.die && !this.faded) {
      this.sX -= 0.02;
      this.sY -= 0.02;
      this.opacity -= 0.02;
      if (this.opacity <= 0.0) {
        this.faded = true;
      }
    }
    this.render();
  }

  collide(point) {
    let w = this.w + 0.05;  // To make collisions feel more fair
    if ((point[0] > this.tX - w/2 && point[0] < this.tX + w/2) && 
       (point[1] > this.tY - w/2 && point[1] < this.tY + w/2)) {
      this.die = true;
      return true;
    }
  }

}

class FoodManager {
  SCORE_LIMIT = 50;
  FOOD_WEIGHT = 3;

  constructor(gl) {
    this.won = false
    this.score = 0;
    this.food = [];
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
  }

  update() {
    this.food.forEach(f => f.update());
    this.food.forEach(f => f.render());

    if (this.food.length < 4) {
      this.food.push(new Food(0.1, gl));
    }

    if (this.score >= this.SCORE_LIMIT) {
      this.won = true;
    }
  }

  reset() {
    this.score = 0;
    this.won = 0;
    this.food = []
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
    this.food.push(new Food(0.1, gl));
  }

  collide(point) {
    for (let i = 0; i < this.food.length; i++) {
      let f = this.food[i];
      if (!f.die && f.collide(point)) {
        this.score += 1;
      }
      if (f.faded) {
        this.food.splice(i, 1);
      }
    }
  }
}
