/**
 * @author Albert Juhé Lluveras
 * based on http://peterwonka.net/Publications/mueller.procedural%20modeling%20of%20buildings.SG2006.final-web.pdf
 * and other THREE.JS code
 */

THREE.FloorGeometry = function(parameters) {

  THREE.Geometry.call(this);

  // Allow accessing this inside functions
  var scope = this;

  // TODO: els valors de "this" no es podrien moure en una variable en lloc de ser atributs?
  // Parse parameters
  this.baseHeight = parameters.baseHeight || 0;
  this.drawRoof = parameters.drawRoof || false;
  this.roofPolygons = parameters.roofPolygons;
  this.shape = parameters.shape;

  // Parse height
  this.height = parameters.height || 5;
  if (parameters.roofWallProportion) this.height *= parameters.roofWallProportion;

  drawWalls();
  drawRoof();

  function drawWalls() {
    // Walls
    // Try to print the texture's full height because it is tileable
    var numRows = Math.round(scope.height / parameters.defaultHeight);
    if (numRows === 0) { // Avoid it being 0
      numRows = scope.height / parameters.defaultHeight;
    }

    // Calculate texture width according to new texture height. This value will be used when setting the horizontal repetition
    var textureWidth = scope.height / numRows;

    var numPoints = scope.shape.points.length;

    var repetitions = numPoints + 1;

    if (parameters.doNotDrawLastEdge) repetitions = numPoints;
    // For each plan point + 1 another iteration to create the last edge
    for (var i = 0; i < repetitions; i++) {
      // Add two vertices for each plan point, one in the base and another in the top part of the floor
      // (heights are negative)
      if (i < numPoints) {
        scope.vertices.push(new THREE.Vector3(scope.shape.points[i].x, scope.shape.points[i].y, -scope.baseHeight));
        scope.vertices.push(new THREE.Vector3(scope.shape.points[i].x, scope.shape.points[i].y, -scope.baseHeight - scope.height));
      }

      // Create face with the last 4 points
      if (i >= 1) {

        // Create face
        var face;
        if (i !== numPoints) {
          // L/R: left/right, TD: top/down
          // face = new THREE.Face3(LR, TR, TL);
          // face2 = new THREE.Face3(DR, TL, DL);
          face = new THREE.Face3((i + 1) * 2 - 2, (i + 1) * 2 - 1, (i + 1) * 2 - 3);
          face2 = new THREE.Face3((i + 1) * 2 - 2, (i + 1) * 2 - 3, (i + 1) * 2 - 4);
        } else { // diferent values for the last edge
          face = new THREE.Face3(0, 1, (numPoints) * 2 - 1);
          face2 = new THREE.Face3(0, (numPoints) * 2 - 1, (numPoints) * 2 - 2);
        }

        // Update normals
        updateFaceNormals(face);
        updateFaceNormals(face2);

        // Assign wall material
        face.materialIndex = 0;
        face2.materialIndex = 0;

        // Add face to geometry
        scope.faces.push(face);
        scope.faces.push(face2);

        // Try to print the texture's full width because it is tileable
        // Avoid it being 0. Min value is 1
        var numColumns;
        if (i !== numPoints) {
          numColumns = Math.round(scope.shape.points[i].distanceTo(scope.shape.points[i - 1]) / textureWidth);
          if (numColumns === 0) { // Avoid it being 0
            numColumns = scope.shape.points[i].distanceTo(scope.shape.points[i - 1]) / textureWidth;
          }
        } else {
          numColumns = Math.round(scope.shape.points[0].distanceTo(scope.shape.points[numPoints - 1]) / textureWidth);
          if (numColumns === 0) { // Avoid it being 0
            numColumns = scope.shape.points[0].distanceTo(scope.shape.points[numPoints - 1]) / textureWidth;
          }
        }

        // Add face vertexs Uvs
        // face 1
        scope.faceVertexUvs[0].push([
          new THREE.Vector2(numColumns, 0),
          new THREE.Vector2(numColumns, numRows),
          new THREE.Vector2(0, numRows)
        ]);
        // face 2
        scope.faceVertexUvs[0].push([
          new THREE.Vector2(numColumns, 0),
          new THREE.Vector2(0, numRows),
          new THREE.Vector2(0, 0)
        ]);
      }
    }
  }

  function drawRoof() {
    // Roof
    if (scope.drawRoof) {
      // Get array of triangles from shape
      roofFaces = THREE.ShapeUtils.triangulateShape(scope.shape.points, []);
      for (var i = 0; i < roofFaces.length; i++) {
        // Create face
        var face = new THREE.Face3(roofFaces[i][2] * 2 + 1, roofFaces[i][1] * 2 + 1, roofFaces[i][0] * 2 + 1); // *2 + 1 to avoid floor vertices, we only want the roof vertices

        // Update normals
        updateFaceNormals(face);

        // Assign roof material
        face.materialIndex = 1;

        // Add face to geometry
        scope.faces.push(face);

        // Add fave vertexs Uvs
        scope.faceVertexUvs[0].push([
          new THREE.Vector2(scope.vertices[roofFaces[i][2] * 2 + 1].x / 20, scope.vertices[roofFaces[i][2] * 2 + 1].y / 20),
          new THREE.Vector2(scope.vertices[roofFaces[i][1] * 2 + 1].x / 20, scope.vertices[roofFaces[i][1] * 2 + 1].y / 20),
          new THREE.Vector2(scope.vertices[roofFaces[i][0] * 2 + 1].x / 20, scope.vertices[roofFaces[i][0] * 2 + 1].y / 20)
        ]);
      }
    }
  }

  // Modification of computeFaceNormals from THREE.Geometry
  function updateFaceNormals(face) {
    var cb = new THREE.Vector3(),
      ab = new THREE.Vector3();

    // Calculate normal
    var vA = scope.vertices[face.a],
      vB = scope.vertices[face.b],
      vC = scope.vertices[face.c];

    // Create vector C->B and A->B
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);

    // Now CB will be the ortogonal normalized vector
    cb.cross(ab);
    cb.normalize();

    // Set normals
    face.normal.copy(cb);
    face.vertexNormals.push(cb.clone(), cb.clone(), cb.clone(), cb.clone());
  }
};

THREE.FloorGeometry.prototype = Object.create(THREE.Geometry.prototype);

THREE.FloorGeometry.prototype.move = function(dir) {
  this.applyMatrix(new THREE.Matrix4().makeTranslation(-dir.x, -dir.y, 0));
}

// Insert windows
THREE.FloorGeometry.prototype.insertWindows = function(windowsToInsert, windowsSeparation, windowsGroup, windowRepetition) {

  // Get maximum window size
  var maxWindowSize = 0;
  for (var i = 0; i < windowsToInsert.length; i++) {
    var boundingBox = THREE.BuildingUtils.getBoundingBox(windowsToInsert[i].vertices);
    var sizeX = boundingBox[1].x - boundingBox[0].x;
    if (sizeX > maxWindowSize) {
      maxWindowSize = sizeX;
    }
  }

  // Geometry containing all windows
  var mergedWindowsGeometries = new THREE.Geometry();

  // For each face
  for (var i = 0, length = this.vertices.length; i < length; i += 2) {

    // Get next points
    var nextI = i + 1; // vertical direction
    if (nextI > length - 1) nextI = 0; // avoid overflow
    var nextI2 = i + 2; // x-y direction
    if (nextI2 > length - 1) nextI2 = 0; // avoid overflow

    var point = this.vertices[i];
    var nextPoint = this.vertices[nextI];
    var nextPoint2 = this.vertices[nextI2];

    // Calculate wall angle
    var angleHor = THREE.BuildingUtils.angleFromVectors(
      new THREE.Vector2(nextPoint2.x - point.x, nextPoint2.y - point.y),
      new THREE.Vector2(1, 0));
    var angleVer = THREE.BuildingUtils.angleFromVectors(
      new THREE.Vector2(nextPoint2.x - point.x, nextPoint2.y - point.y),
      new THREE.Vector2(0, 1));

    // First & second quadrant: x = x - 180
    if (angleVer > Math.PI / 2) {
      angleHor -= Math.PI;
    }
    // Third & fourth quadrant: x = 180 - x
    else {
      angleHor = Math.PI - angleHor;
    }

    // Calculate some variables
    var wallLength = point.distanceTo(nextPoint2);
    var numberOfWindows = Math.floor(wallLength / (windowsSeparation + maxWindowSize));
    var windowPos = 0;

    // Add elements
    for (var j = 0; j < numberOfWindows; j++) {

      // Load geometry
      var windowIndex = (windowRepetition === "random") ? Math.floor(Math.random() * windowsToInsert.length) : windowPos % windowsToInsert.length;
      var windowGeometry = windowsToInsert[windowIndex].clone();

      // Get window size
      var boundingBox = THREE.BuildingUtils.getBoundingBox(windowGeometry.vertices);
      var sizeX = boundingBox[1].x - boundingBox[0].x;

      // Calculate weight
      var weight = .5;
      if (windowsGroup === "pairs") { // groups of two
        if (j % 2 === 0) {
          if (j < numberOfWindows - 1) {
            var spaceForThisWindows = wallLength / numberOfWindows;
            weight = 1 - sizeX * .5 / spaceForThisWindows - 0.01; // - 0.01 to make them no collid
          } else { // if it is the last window, center because it will not have a pair
            weight = .5;
          }
        } else {
          weight = sizeX / (2 * wallLength / numberOfWindows) + 0.01;
        }
      } else { // uniform
        weight = .5;
        weight = .5;
      }

      // Calculate pos
      var pos = new THREE.Vector3(point.x + (nextPoint2.x - point.x) * ((j + weight) / numberOfWindows), // add displacement
        point.y + (nextPoint2.y - point.y) * ((j + weight) / numberOfWindows),
        point.z);

      // Rotate
      windowGeometry.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, angleHor, 0, 'XYZ')));

      // Move
      windowGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z));

      // Add element
      mergedWindowsGeometries.merge(windowGeometry);

      windowPos++;
    }
  }

  this.merge(mergedWindowsGeometries);
}

// Insert roof elements in this shape
// If shape2 is specified, roof elements will be inserted in shape2 area excluding this shape area
THREE.FloorGeometry.prototype.insertRoofElements = function(elementsToInsert, shape2) {

  // Define variables depending on parameters
  var approvedZone = this.shape;
  var forbidenZone = [];
  var height = -(this.baseHeight + this.height);

  if (shape2 !== undefined) {
    approvedZone = shape2;
    forbidenZone[0] = this.shape;
    height = -this.baseHeight;
  }

  // Bounding box
  var minMaxValues = approvedZone.getBoundingBox();
  var min = minMaxValues[0];
  var max = minMaxValues[1];

  nextElement:
    for (var i = 0; i < elementsToInsert.length; i++) {

      // Bounding box vertices, we are going to calculate them later
      var vertices = [];

      // Where will we set the roof element
      var pos = new THREE.Vector2();

      // Calculate random position until reaching a good one
      var isPositionOk = false;

      // Prevent to wait a lot of time in small building with counter
      var counter = 0;
      while (!isPositionOk) {

        // Clone the geometry here, so the rotations and movements of previous loop steps are not saved
        var geometry = elementsToInsert[i].clone();

        // Rotate
        var possibleRotations = [-Math.PI*3/4, -Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2, Math.PI*3/4];
        geometry.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, THREE.BuildingUtils.randomOn(possibleRotations))));

        // Calculate bounding box
        var boundingBox = THREE.BuildingUtils.getBoundingBox(geometry.vertices);

        // Generate random position
        pos.x = THREE.BuildingUtils.randomBetween(min.x, max.x);
        pos.y = THREE.BuildingUtils.randomBetween(min.y, max.y);

        // Define vertices
        vertices = [new THREE.Vector2(pos.x + boundingBox[0].x, pos.y + boundingBox[0].y),
          new THREE.Vector2(pos.x + boundingBox[0].x, pos.y + boundingBox[1].y),
          new THREE.Vector2(pos.x + boundingBox[1].x, pos.y + boundingBox[0].y),
          new THREE.Vector2(pos.x + boundingBox[1].x, pos.y + boundingBox[1].y)
        ];

        // Check if all points are inside approvedZone
        isPositionOk = approvedZone.pointInsidePolygon(vertices[0]) &&
          approvedZone.pointInsidePolygon(vertices[1]) &&
          approvedZone.pointInsidePolygon(vertices[2]) &&
          approvedZone.pointInsidePolygon(vertices[3]) &&
          !THREE.BuildingUtils.polygonsIntersect(approvedZone.points, vertices);

        // Check if all points are outside forbidenZone
        if (isPositionOk) {
          for (var j = 0; j < forbidenZone.length && isPositionOk; j++) {
            isPositionOk = !forbidenZone[j].pointInsidePolygon(vertices[0]) &&
              !forbidenZone[j].pointInsidePolygon(vertices[1]) &&
              !forbidenZone[j].pointInsidePolygon(vertices[2]) &&
              !forbidenZone[j].pointInsidePolygon(vertices[3]) &&
              !THREE.BuildingUtils.polygonsIntersect(forbidenZone[j].points, vertices);
          }
        }

        // Do not waste a lot of time if it is difficult to place the element
        if (counter++ > 100) break nextElement;
      }

      // Move and merge
      geometry.applyMatrix(new THREE.Matrix4().makeTranslation(pos.x, pos.y, height));
      this.merge(geometry);

      // Add new forbiden zone
      var occupiedZone = new THREE.FloorShape;
      occupiedZone.points = vertices;
      forbidenZone.push(occupiedZone);
    }
}
