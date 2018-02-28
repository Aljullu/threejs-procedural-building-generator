// Manage interface, keyboard, mouse and window inputs
/******************
 **INTERFACE********
 ******************/
window.onload = function() {
  document.querySelectorAll("input[type='range']").forEach(function(el) {
    el.onchange = function(e) {
      var array = this.getAttribute("id").split("-");
      document.getElementById(array[0]).value = e.target.value;
    };
  });

  document.querySelectorAll("input[type='number']").forEach(function(el) {
    el.onchange = function(e) {
      document.getElementById(this.getAttribute("id") + "-range").value = e.target.value;
    };
  });

  document.querySelectorAll("input[name=mode]").forEach(function(el) {
    el.onchange = function() {
      var mode = document.querySelector("input[name=mode]:checked").getAttribute("id");

      if (mode === "parameters") {
        document.querySelectorAll("fieldset.parameters").forEach(function(el) {
          el.removeAttribute('hidden');
        });
      } else {
        document.querySelectorAll("fieldset.parameters").forEach(function(el) {
          el.setAttribute('hidden', 'true');
        });
      }
    }
  });

  document.getElementById("create-building").onclick = function() {
    scene.remove(building.mesh);
    document.getElementById("atlas").remove();
    var mode = document.querySelector("input[name=mode]:checked").getAttribute("id");
    if (mode === "random") {
      newBuilding = new Building({
        'mode': "random"
      });
    } else if (mode === "parameters") {
      newBuilding = new Building({
        'mode': "random",
        'height': document.getElementById("height").value,
        'posX': document.getElementById("posx").value,
        'posZ': document.getElementById("posz").value,
        'sizeX': document.getElementById("sizex").value,
        'sizeZ': document.getElementById("sizez").value,
        'floorHeight': document.getElementById("floorHeight").value,
        'windowsGroup': document.querySelector("input[name=windowsGroup]:checked").getAttribute("id"),
        'windowsSeparation': parseFloat(document.getElementById("windowsSeparation").value),
        'probabilityNextFloorDifferentShape': document.getElementById("probabilityNextFloorDifferentShape").value,
        'minSolidWidth': parseInt(document.getElementById("minSolidWidth").value),
        'maxSolidWidth': parseInt(document.getElementById("maxSolidWidth").value),
        'windowRepetition': document.querySelector("input[name=windowRepetition]:checked").getAttribute("id"),
        'textureWall': document.getElementById("wallTexture").value,
        'textureRoof': document.getElementById("roofTexture").value
      });
    } else {
      newBuilding = new Building({
        'mode': "default"
      });
    }
    building = newBuilding;
    document.getElementById("display-atlas").appendChild(canvas);
  };

  document.getElementById("reset-camera").onclick = function() {
    cameraAngleX = 0;
    cameraAngleY = 0;
    camera.position.set(0, 150, 250);
    rotateCamera(65);
    camera.lookAt(scene.position);
  };
  document.getElementById("display-atlas").appendChild(canvas);

  var mouseXpos = 0;
  var mouseYpos = 0;
  var middleButtonDown = false;

  $container.oncontextmenu = function(e) {
    e.preventDefault();
  };

  $container.onmousedown = function(e) {
    if (e.which === 2) middleButtonDown = true;
  };

  $container.onmouseup = function(e) {
    if (e.which === 2) middleButtonDown = false;
  };

  $container.onmousemove = function(e) {
    var newmouseXpos = e.pageX;
    var newmouseYpos = e.pageY;

    if (middleButtonDown) {
      if (newmouseXpos !== mouseXpos ||
        newmouseYpos !== mouseYpos) {
        var anglesToRotateX = parseInt((mouseXpos - newmouseXpos) / 4) * -1;
        var anglesToRotateY = parseInt((mouseYpos - newmouseYpos) / 4) * -1;
        if (anglesToRotateX !== 0 ||
          anglesToRotateY !== 0) {
          rotateCamera(anglesToRotateX, anglesToRotateY);
        }
      }
    }

    mouseXpos = newmouseXpos;
    mouseYpos = newmouseYpos;
  };

  // Zoom
  $container.onwheel = function(e) {
    zoom(- e.deltaY / 4);
  };
};

/******************
 **KEYBOARD*********
 ******************/
var KEYS = {
  SHIFT: false,
  AVPAG: false,
  REPAG: false,
  UP: false,
  DOWN: false,
  LEFT: false,
  RIGHT: false,
  A: false,
  S: false,
  D: false,
  W: false
};

window.onkeydown = function(e) {
  switch (e.which) {
    case 33: //AvPág
      KEYS.AVPAG = true;
      break;
    case 16: // Shift
      KEYS.SHIFT = true;
      break;
    case 34: // RePág
      KEYS.REPAG = true;
      break;
    case 37: // Left
      KEYS.LEFT = true;
      break;
    case 39: // Right
      KEYS.RIGHT = true;
      break;
    case 38: // Up
      KEYS.UP = true;
      break;
    case 40: // Down
      KEYS.DOWN = true;
      break;
    case 65: // A
      KEYS.A = true;
      break;
    case 83: // S
      KEYS.S = true;
      break;
    case 68: // D
      KEYS.D = true;
      break;
    case 87: // W
      KEYS.W = true;
      break;
  }
};
window.onkeyup = function(e) {
  switch (e.which) {
    case 33: //AvPág
      KEYS.AVPAG = false;
      break;
    case 16: // Shift
      KEYS.SHIFT = false;
      break;
    case 34: // RePág
      KEYS.REPAG = false;
      break;
    case 37: // Left
      KEYS.LEFT = false;
      break;
    case 39: // Right
      KEYS.RIGHT = false;
      break;
    case 38: // Up
      KEYS.UP = false;
      break;
    case 40: // Down
      KEYS.DOWN = false;
      break;
    case 65: // A
      KEYS.A = false;
      break;
    case 83: // S
      KEYS.S = false;
      break;
    case 68: // D
      KEYS.D = false;
      break;
    case 87: // W
      KEYS.W = false;
      break;
  }
};

// Resize canvas and update view on window resize
window.onresize = function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setContainerSize();
};
