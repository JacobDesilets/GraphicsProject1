class Food {
    constructor(w, gl) {
        this.vertices = [vec2(0, 0), vec2(0, 0-w), vec2(0+w, 0-w), vec2(0+w, 0)];

        this.gl = gl;
        this.vBuffer = this.gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        let positionLoc = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);

        this.theta = 0.0;
        this.sX = 0.0;
        this.sY = 0.0;
        this.tX = 0.0;
        this.tY = 0.0;

        this.Mr = this.getRotationMatrix(this.theta);
        this.Ms = this.getScaleMatrix(this.sX, this.sY);
        this.Mt = this.getTransMatrix(this.tX, this.tY);

        this.shaderProgram = initShaders(this.gl,"food-vertex", "food-fragment");
        gl.useProgram(this.shaderProgram);

        this.uMr = this.gl.getUniformLocation(this.shaderProgram, "Mr");
        this.uMs = this.gl.getUniformLocation(this.shaderProgram, "Ms");
        this.uMt = this.gl.getUniformLocation(this.shaderProgram, "Mt");

        this.gl.uniformMatrix3fv(this.uMr, false, this.Mr);
        this.gl.uniformMatrix3fv(this.uMs, false, this.Ms);
        this.gl.uniformMatrix3fv(this.uMt, false, this.Mt);
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
            Sy,
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
        

        this.gl.uniformMatrix3fv(this.uMr, false, this.Mr);
        this.gl.uniformMatrix3fv(this.uMs, false, this.Ms);
        this.gl.uniformMatrix3fv(this.uMt, false, this.Mt);
    }

    update() {
        this.theta += 0.001

        this.Mr = this.getRotationMatrix(this.theta);
        this.Ms = this.getScaleMatrix(this.sX, this.sY);
        this.Mt = this.getTransMatrix(this.tX, this.tY);

        this.render();
    }

}

class FoodManager {
    
}