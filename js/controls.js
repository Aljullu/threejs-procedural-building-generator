// Manage interface, keyboard, mouse and window inputs
/******************
 **INTERFACE********
 ******************/
$(document).ready(function() {
  $("input[type='range']").change(function() {
    var array = $(this).attr("id").split("-");
    $("#" + array[0]).val($(this).val());
  });
  $("input[type='number']").change(function() {
    $("#" + $(this).attr("id") + "-range").val($(this).val());
  });
  $("input[name=display]").change(function() {
    var display = $("input[name=display]:checked").attr("data-layer");
    $("canvas").hide();
    console.log("#" + display);
    $("#" + display).show();
  });
  $("input[name=mode]").change(function() {
    var mode = $("input[name=mode]:checked").attr("id");

    if (mode === "parameters") {
      $("fieldset.parameters").each(function() {
        $(this).slideDown();
      });
    } else {
      $("fieldset.parameters").each(function() {
        $(this).slideUp();
      });
    }
  });
  $("#create-building").click(function() {
    scene.remove(building.mesh);
    $("#atlas").remove();
    var mode = $("input[name=mode]:checked").attr("id");
    if (mode === "random") {
      newBuilding = new Building({
        'mode': "random"
      });
    } else if (mode === "parameters") {
      newBuilding = new Building({
        'mode': "random",
        'height': $("#height").val(),
        'posX': $("#posx").val(),
        'posZ': $("#posz").val(),
        'sizeX': $("#sizex").val(),
        'sizeZ': $("#sizez").val(),
        'floorHeight': $("#floorHeight").val(),
        'windowsGroup': $("input[name=windowsGroup]:checked").attr("id"),
        'windowsSeparation': parseFloat($("#windowsSeparation").val()),
        'probabilityNextFloorDifferentShape': $("#probabilityNextFloorDifferentShape").val(),
        'minSolidWidth': parseInt($("#minSolidWidth").val()),
        'maxSolidWidth': parseInt($("#maxSolidWidth").val()),
        'windowRepetition': $("input[name=windowRepetition]:checked").attr("id"),
        'textureWall': $("#wallTexture").val(),
        'textureRoof': $("#roofTexture").val()
      });
    } else {
      newBuilding = new Building({
        'mode': "default"
      });
    }
    building = newBuilding;
    $("#display-atlas").append(canvas);
  });

  $("#reset-camera").click(function() {
    cameraAngleX = 0;
    cameraAngleY = 0;
    camera.position.set(0, 150, 250);
    rotateCamera(65);
    camera.lookAt(scene.position);
  });
  $("#display-atlas").append(canvas);
});

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
$(document).keydown(function(e) {
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
});
$(document).keyup(function(e) {
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
});

/******************
 **WINDOW***********
 ******************/
// Resize canvas and update view on window resize
$(window).resize(function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setContainerSize();
});

// Avoid context menu in container
$(document).ready(function() {
  $container.bind("contextmenu", function(e) {
    return false;
  });
});


/******************
 **MOUSE************
 ******************/
var mouseXpos = 0;
var mouseYpos = 0;
$(document).ready(function() {
  var leftButtonDown = false;
  var middleButtonDown = false;
  $container.mousedown(function(e) {
    // Left mouse button was pressed, set flag
    if (e.which === 1) leftButtonDown = true;
    // Middle mouse button was pressed, set flag
    else if (e.which === 2) middleButtonDown = true;
  });
  $container.mouseup(function(e) {
    // Left mouse button was released, clear flag
    if (e.which === 1) leftButtonDown = false;
    // Middle mouse button was released, clear flag
    else if (e.which === 2) middleButtonDown = false;
  });

  function tweakMouseMoveEvent(e) {
    // If left button is not set, set which to 0
    // This indicates no buttons pressed
    if (e.which === 1 && !leftButtonDown) e.which = 0;
  }

  $container.mousemove(function(e) {
    var newmouseXpos = e.pageX;
    var newmouseYpos = e.pageY;

    // Call the tweak function to check for LMB and set correct e.which
    tweakMouseMoveEvent(e);

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
  });

  // Zoom
  $container.mousewheel(function(e, delta) {
    zoom(delta);
  });
});
