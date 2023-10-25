class Food {
    constructor(w, gl) {
        this.vertices = [vec2(0-w/2, 0+w/2), vec2(0-w/2, 0-w/2), vec2(0+w/2, 0+w/2), vec2(0+w/2, 0-w/2)];
        this.gl = gl;
        this.shaderProgram = initShaders(this.gl,"food-vertex", "food-fragment");
        gl.useProgram(this.shaderProgram);

        
        
        this.vBuffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        this.positionLoc = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLoc);

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
        this.uOpacity = this.gl.getUniformLocation(this.shaderProgram, "opacity");

        this.gl.uniformMatrix3fv(this.uMr, false, this.Mr);
        this.gl.uniformMatrix3fv(this.uMs, false, this.Ms);
        this.gl.uniformMatrix3fv(this.uMt, false, this.Mt);

        this.die = false;

        this.fadeLength = 700.0;
        this.fadeTimer = 0.0;
        this.then = 0.0;
        this.opacity = 1.0;

        this.faded = false;
    }

    getRotationMatrix(theta) {
        let s = Math.sin(theta);
        let c = Math.cos(theta);
        
        return [
            c,
            -s,
            0.0,
            s,
            c,
            0.0,
            0.0,
            0.0,
            1.0
        ];
    }

    getScaleMatrix(sX, sY) {
        return [
            sX,
            0.0,
            0.0,
            0.0,
            sY,
            0.0,
            0.0,
            0.0,
            1.0
        ];
    }

    getTransMatrix(tX, tY) {
        return [
            1.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            tX,
            tY,
            1.0
        ];
    }

    render() {
        gl.useProgram(this.shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLoc);

        this.gl.uniformMatrix3fv(this.uMr, false, this.Mr);
        this.gl.uniformMatrix3fv(this.uMs, false, this.Ms);
        this.gl.uniformMatrix3fv(this.uMt, false, this.Mt);
        this.gl.uniform1f(this.uOpacity, false, this.opacity);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length);
    }

    update() {
        this.theta += this.speed;

        this.Mr = this.getRotationMatrix(this.theta);
        this.Ms = this.getScaleMatrix(this.sX, this.sY);
        this.Mt = this.getTransMatrix(this.tX, this.tY);

        if(this.die && !this.faded) {
            this.fadeTimer = Date.now() - this.then;
            this.sX -= 0.02;
            this.sY -= 0.02;
            this.opacity -= 0.01;

            if(this.fadeTimer > this.fadeLength) {
                this.faded = true;
            }
        }

        this.render();
    }



    collide(x, y) {
        let w = this.w + 0.05;  // To make collisions feel more fair
        if((x > this.tX - w/2 && x < this.tX + w/2) && 
           (y > this.tY - w/2 && y < this.tY + w/2)) {
            this.die = true;
            this.then = Date.now();
            return true;
        }
    }

}

class FoodManager {
    constructor(gl) {
        this.food = [];
        this.score = 0;
        
        this.food.push(new Food(0.1, gl));
        this.food.push(new Food(0.1, gl));
        this.food.push(new Food(0.1, gl));
        this.food.push(new Food(0.1, gl));
        
        this.won = false
        this.SCORE_LIMIT = 50;
    }

    update() {
        this.food.forEach(f => f.update());
        this.food.forEach(f => f.render());

        if(this.food.length < 4) {
            this.food.push(new Food(0.1, gl));
        }

        if(this.score >= this.SCORE_LIMIT) {
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

    collide(x, y, func) {
        for(let i = 0; i < this.food.length; i++) {
            let f = this.food[i];
            if(!f.die && f.collide(x, y)) {
                this.score += 1;
                console.log("Food collision!");
                func();
            }

            if(f.faded) {
                this.food.splice(i, 1);
            }
        }
    }
}