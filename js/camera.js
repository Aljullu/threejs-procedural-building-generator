var cameraAngleX = 0;
var cameraAngleY = 0;

function moveCamera(delta, direction) {
  // vector where camera is looking at in camera space
  var pLocal = new THREE.Vector3(0, 0, -1);
  // convert to world space
  var dirCam = pLocal.applyMatrix4(camera.matrixWorld);
  // normalize
  dirCam.sub(camera.position).normalize();

  // MOVEMENT
  if (direction === "left") {
    var leftVector = dirCam.clone().cross(new THREE.Vector3(0, -1, 0));
    camera.position.x += leftVector.x * 50 * delta;
    camera.position.z += leftVector.z * 50 * delta;
  }
  if (direction === "right") {
    var leftVector = dirCam.clone().cross(new THREE.Vector3(0, -1, 0));
    camera.position.x -= leftVector.x * 50 * delta;
    camera.position.z -= leftVector.z * 50 * delta;
  }
  if (direction === "up") {
    camera.position.x += dirCam.x * 50 * delta;
    camera.position.z += dirCam.z * 50 * delta;
  }
  if (direction === "down") {
    camera.position.x -= dirCam.x * 50 * delta;
    camera.position.z -= dirCam.z * 50 * delta;
  }
}

function rotateCamera(deltaX, deltaY) {

  // Vector where camera is looking at in camera space
  var pLocal = new THREE.Vector3(0, 0, -1);

  // Convert to world space
  var dirCam = pLocal.applyMatrix4(camera.matrixWorld);

  // Ray
  var raycaster = new THREE.Raycaster(camera.position, dirCam.sub(camera.position).normalize());

  // Intersection with floor
  var intersects = raycaster.intersectObjects([plane]);

  // Set rotation center
  var rotationCenter = new THREE.Vector3(0, 0, 0);

  if (building) {
    rotationCenter.x = building.posX;
    rotationCenter.z = building.posZ;
  }

  // Remove Y axis
  var v1 = camera.position.clone();
  v1.y = 0;

  cameraAngleX += THREE.BuildingUtils.degreesToRadians(deltaX);
  camera.position.x = Math.cos(cameraAngleX) * v1.distanceTo(rotationCenter) + rotationCenter.x;
  camera.position.z = Math.sin(cameraAngleX) * v1.distanceTo(rotationCenter) + rotationCenter.z;

  // Y position works a little bit different, we don't want the camera to go up-side-down
  if (deltaY) {
    camera.position.y += deltaY * 2;
  }
  camera.lookAt(rotationCenter); // the origin
}

function updateCameraPosition(delta) {
  if (KEYS.LEFT) moveCamera(delta * 2, "left");
  if (KEYS.RIGHT) moveCamera(delta * 2, "right");
  if (KEYS.UP) moveCamera(delta * 2, "up");
  if (KEYS.DOWN) moveCamera(delta * 2, "down");
  if (KEYS.AVPAG) zoom(delta * 4);
  if (KEYS.REPAG) zoom(-delta * 4);
  if (KEYS.A) rotateCamera(delta * 50);
  if (KEYS.D) rotateCamera(-delta * 50);

  if (camera.position.y < 10) camera.position.y = 10; // do not allow camera under the floor
}

function zoom(delta) {
  // vector where camera is looking at in camera space
  var pLocal = new THREE.Vector3(0, 0, -1);
  // convert to world space
  var dirCam = pLocal.applyMatrix4(camera.matrixWorld);

  // normalize
  dirCam.sub(camera.position).normalize();

  camera.position.x += dirCam.x * 50 * delta;
  camera.position.y += dirCam.y * 50 * delta;
  camera.position.z += dirCam.z * 50 * delta;
}
