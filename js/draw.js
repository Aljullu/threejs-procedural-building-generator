var activeObject = null;

// get the DOM element of the container
var $container = document.getElementById('container');

var viewportwidth = window.innerWidth,
  viewportheight = window.innerHeight;

// Set size
function setContainerSize() {
  viewportwidth = window.innerWidth;
  viewportheight = window.innerHeight;
  $container.setAttribute('width', viewportwidth);
  $container.setAttribute('height', viewportheight);
}
setContainerSize();

// set the scene size
var WIDTH = viewportwidth,
  HEIGHT = viewportheight;

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
$container.appendChild(renderer.domElement);

// Scene
var scene = new THREE.Scene();

// Ground
var plane = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 1, 1), new THREE.MeshLambertMaterial({
  color: 0xffffff
}));
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Camera
var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, .1, 10000);
camera.position.set(0, 150, 250);
rotateCamera(65);
camera.lookAt(scene.position);
scene.add(camera);

// Lights
var ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

var spotLight = new THREE.SpotLight();
spotLight.position.set(300, 330, 150);
scene.add(spotLight);

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

var lastTime = Date.now();

function update() {
  var delta = (Date.now() - lastTime) / 1000;

  if (delta > 0) {
    updateCameraPosition(delta);
  }

  lastTime = Date.now();
  timeOut = setTimeout(update, 40);
}

function step() {
  renderer.render(scene, camera);
  requestAnimationFrame(step);
}

step();
update();

// Building
/*start = new Date().getTime();
for (var i = 0; i < 5; i++) {
	for (var j = 0; j < 5; j++) {
		var building = new Building({
			'posX': -400 + i * 200,
			'posZ': -400 + j * 200
		});
	}
}*/
/*var shape = new THREE.FloorShape();
var rule = new THREE.FloorShape.Rule("square", true, false, 100, 100, 0, 0, Math.PI/8);
shape.createFromRules(rule);*/
var building = new Building();
