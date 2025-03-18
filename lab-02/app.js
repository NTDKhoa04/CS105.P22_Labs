const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL không được hỗ trợ trong trình duyệt của bạn!");
  throw new Error("WebGL không được hỗ trợ");
}

function compileShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Lỗi khi biên dịch shader: " + gl.getShaderInfoLog(shader));
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      "Lỗi khi liên kết chương trình: " + gl.getProgramInfoLog(program)
    );
  }

  return program;
}

const vertexShaderSource = document.getElementById("vertex-shader").text;
const fragmentShaderSource = document.getElementById("fragment-shader").text;

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(
  gl,
  fragmentShaderSource,
  gl.FRAGMENT_SHADER
);

const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

function createStar(cx, cy, outerRadius, innerRadius, points) {
  const vertices = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.sin(angle);
    const y = cy + radius * Math.cos(angle);
    vertices.push(x, y);
  }
  return vertices;
}

const starVertices = createStar(0, 0, 100, 50, 5);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starVertices), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const resolutionUniformLocation = gl.getUniformLocation(
  program,
  "u_resolution"
);
const translationUniformLocation = gl.getUniformLocation(
  program,
  "u_translation"
);
const rotationUniformLocation = gl.getUniformLocation(program, "u_rotation");
const scaleUniformLocation = gl.getUniformLocation(program, "u_scale");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

gl.uniform4f(colorUniformLocation, 0.3, 0.5, 0.7, 1.0);

const ui = webglLessonsUI;

const settings = {
  translationX: canvas.width / 2,
  translationY: canvas.height / 2,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

ui.setupSlider("#x-translation", {
  name: "Tịnh tiến X",
  min: 0,
  max: canvas.width,
  value: settings.translationX,
  slide: (event, ui) => {
    settings.translationX = ui.value;
    drawScene();
  },
});

ui.setupSlider("#y-translation", {
  name: "Tịnh tiến Y",
  min: 0,
  max: canvas.height,
  value: settings.translationY,
  slide: (event, ui) => {
    settings.translationY = ui.value;
    drawScene();
  },
});

ui.setupSlider("#angle", {
  name: "Góc xoay",
  min: 0,
  max: 360,
  value: settings.rotation,
  slide: (event, ui) => {
    settings.rotation = (ui.value * Math.PI) / 180;
    drawScene();
  },
});

ui.setupSlider("#x-scale", {
  name: "Tỉ lệ X",
  min: -2,
  max: 2,
  step: 0.1,
  precision: 1,
  value: settings.scaleX,
  slide: (event, ui) => {
    settings.scaleX = ui.value;
    drawScene();
  },
});

ui.setupSlider("#y-scale", {
  name: "Tỉ lệ Y",
  min: -2,
  max: 2,
  step: 0.1,
  precision: 1,
  value: settings.scaleY,
  slide: (event, ui) => {
    settings.scaleY = ui.value;
    drawScene();
  },
});

function drawScene() {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(
    translationUniformLocation,
    settings.translationX,
    settings.translationY
  );
  gl.uniform1f(rotationUniformLocation, settings.rotation);
  gl.uniform2f(scaleUniformLocation, settings.scaleX, settings.scaleY);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, starVertices.length / 2);
}

drawScene();
