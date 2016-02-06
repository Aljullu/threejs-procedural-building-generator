THREE.FloorShape = function() {

  this.rules = null;
  this.points = null;

};

THREE.FloorShape.prototype = {

  createFromParameters: function(shape, proceduralShape, sizeX, sizeY, centerX, centerY, angle, iteration) {
    this.rules = new THREE.FloorShape.Rule(shape, proceduralShape, sizeX, sizeY, centerX, centerY, angle, iteration);
    this.points = this.createShape(this.rules);
    this.rules.setChildrenToCalculated();
  },

  createFromRules: function(rules) {
    rules.setChildrenToCalculated();
    this.rules = rules.clone();
    this.points = this.createShape(rules.clone());
  },

  // Given two shapes, it returns the walls that exist in shape2
  // and do not exist in the current FloorShape.
  // It is used to create walls in floors with partial roofs
  getExclusionWalls: function(shape2) {

    // Array containing all rules in shape2 that do not exist
    // in the current FloorShape
    var removedRules = [];

    // Fill removedRules array
    checkIfTheyHaveSameChildren(this.rules, shape2.rules);

    // Convert removedRules (array of rules) to
    // arrayOfArrays (array of arrays of points)
    var arrayOfArrays = [];
    var shape = new THREE.FloorShape();

    if (removedRules.length > 0) {
      for (var i = 0; i < removedRules.length; i++) {
        // Create shape from rule and get the points
        shape.createFromRules(removedRules[i]);
        arrayOfArrays.push(shape.points);
      }
    }

    return arrayOfArrays;

    // Check if the have the same children, if yes,
    // it checks children's children, if no, this polygon
    // is added to removedRules
    function checkIfTheyHaveSameChildren(polygon1, polygon2) {

      for (var i = 0; i < polygon2.children.length; i++) {

        // Flag sayin that we hadn't found the polygon yet
        childrenMissing = true;
        for (var j = 0; j < polygon1.children.length && childrenMissing; j++) {
          // Both polygons are the same
          if (polygon2.children[i].compare(polygon1.children[j])) {
            // Check it's children
            checkIfTheyHaveSameChildren(polygon2.children[i], polygon1.children[j]);

            // Update flag
            childrenMissing = false;
          }
        }
        removedRules.push(polygon2.children[i]);
      }
    }
  },

  getBoundingBox: function() {
    return THREE.BuildingUtils.getBoundingBox(this.points);
  },

  getCenter: function() {
    // Get bounding box
    var minMaxValues = this.getBoundingBox();
    var min = minMaxValues[0];
    var max = minMaxValues[1];

    // Return center
    return new THREE.Vector2((max.x + min.x) / 2, (max.y + min.y) / 2);
  },

  pruneRules: function(minDepthToKeep, probability) {

    // Prune some children of the given rule according to
    // probability and depth
    function pruneChildren(rule, probability, minDepthToKeep, depth) {

      for (var i = 0; i < rule.children.length; i++) {
        if (Math.random() < probability && depth >= minDepthToKeep) {
          rule.children.splice(i, 1);
        } else {
          pruneChildren(rule.children[i], probability, minDepthToKeep, depth + 1);
        }
      }

      return rule;
    }

    this.rules = pruneChildren(this.rules, probability, minDepthToKeep, 0);

    this.createFromRules(this.rules.clone());
  },

  createShape: function(drawingPolygon) {

    // Set shape
    if (drawingPolygon.shape === undefined || drawingPolygon.shape === "random") drawingPolygon.shape = getRandomShape();

    // Temporary arrays of points
    var pointsToReturn = []; // this will include the polygon we are drawing and its children
    var drawingPolygonPoints = []; // this will only include the polygon we are drawing
    var pointsToRotate = []; // the same as drawingPolygonPoints but before applying rotation

    // Sine and cosine
    var s = Math.sin(drawingPolygon.angle);
    var c = Math.cos(drawingPolygon.angle);

    // Set vertices
    if (drawingPolygon.shape === "square") {
      // square
      pointsToRotate.push(new THREE.Vector2(-drawingPolygon.sizeX / 2, 0));
      pointsToRotate.push(new THREE.Vector2(-drawingPolygon.sizeX / 2, drawingPolygon.sizeY));
      pointsToRotate.push(new THREE.Vector2(drawingPolygon.sizeX / 2, drawingPolygon.sizeY));
      pointsToRotate.push(new THREE.Vector2(drawingPolygon.sizeX / 2, 0));
    } else {
      // triangle
      pointsToRotate.push(new THREE.Vector2(-drawingPolygon.sizeX / 2, 0));
      pointsToRotate.push(new THREE.Vector2(0, drawingPolygon.sizeY));
      pointsToRotate.push(new THREE.Vector2(drawingPolygon.sizeX / 2, 0));
    }

    // Rotate points and move to center
    for (var i = 0; i < pointsToRotate.length; i++) {
      drawingPolygonPoints.push(new THREE.Vector2(pointsToRotate[i].x * c - pointsToRotate[i].y * s + drawingPolygon.centerX,
        pointsToRotate[i].x * s + pointsToRotate[i].y * c + drawingPolygon.centerY));
    }

    // Should this polygon have children?
    if (
      (
        drawingPolygon.createChildren === false ||
        drawingPolygon.sizeX <= minSolidWidth || // prevent working on small walls
        Math.random() > (.60 - drawingPolygon.iteration * .10) // random factor
      ) &&
      drawingPolygon.children.length === 0) // check that there is no children calculated
      return drawingPolygonPoints; // if not, return this polygon's points

    // Compute children
    var numEdges = drawingPolygonPoints.length;
    for (var i = 0; i < numEdges; i++) { // for each edge
      // Add the first points of the edge to the array of points to return
      pointsToReturn.push(drawingPolygonPoints[i]);

      // Do not calculate children in the last edge because it will go inside its parent
      // Exception: the iteration
      if (i !== numEdges - 1 || drawingPolygon.iteration === 0) {

        // Get next point index
        var nextI = i + 1;
        if (nextI > drawingPolygonPoints.length - 1) nextI = 0; // avoid overflow

        // Calculate angles with X axis and Y axis
        var angleHor = THREE.BuildingUtils.angleFromVectors(
          new THREE.Vector2(drawingPolygonPoints[nextI].x - drawingPolygonPoints[i].x, drawingPolygonPoints[nextI].y - drawingPolygonPoints[i].y),
          new THREE.Vector2(1, 0));
        var angleVer = THREE.BuildingUtils.angleFromVectors(
          new THREE.Vector2(drawingPolygonPoints[nextI].x - drawingPolygonPoints[i].x, drawingPolygonPoints[nextI].y - drawingPolygonPoints[i].y),
          new THREE.Vector2(0, 1));

        if (angleVer > Math.PI / 2) angleHor = -angleHor; // if we are in the right side, change the sign of the angle

        // Variable to set the number of children
        var numChildren;

        // If the children is already calculated
        if (!drawingPolygon.createChildren) {

          // Calculate #children with the same angle than the wall
          numChildren = 0;
          for (var j = 0; j < drawingPolygon.children.length; j++) {
            if (drawingPolygon.children[j].angle === angleHor) {
              numChildren++;
            }
          }
        } else { // We must create random children

          // Calculate center
          var typeOfCenter = Math.random();

          // Array of children values
          var prevWeight = []; // used to compute the center

          // Center
          if (typeOfCenter < SHAPE_CHILDREN_CENTER_PROBABILITY) {
            prevWeight.push(.50);
          }
          // Simetric
          else if (typeOfCenter < SHAPE_CHILDREN_SIMETRIC_PROBABILITY + SHAPE_CHILDREN_CENTER_PROBABILITY) {
            prevWeight.push(1);
            prevWeight.push(0);
          }
          // Row
          else if (typeOfCenter < SHAPE_CHILDREN_ROW_PROBABILITY + SHAPE_CHILDREN_SIMETRIC_PROBABILITY + SHAPE_CHILDREN_CENTER_PROBABILITY) {
            prevWeight.push(.80);
            prevWeight.push(.60);
            prevWeight.push(.40);
            prevWeight.push(.20);
          }
          // Left
          else if (typeOfCenter < SHAPE_CHILDREN_LEFT_PROBABILITY + SHAPE_CHILDREN_ROW_PROBABILITY + SHAPE_CHILDREN_SIMETRIC_PROBABILITY + SHAPE_CHILDREN_CENTER_PROBABILITY) {
            prevWeight.push(0);
          }
          // Right
          else if (typeOfCenter < SHAPE_CHILDREN_RIGHT_PROBABILITY + SHAPE_CHILDREN_LEFT_PROBABILITY + SHAPE_CHILDREN_ROW_PROBABILITY + SHAPE_CHILDREN_SIMETRIC_PROBABILITY + SHAPE_CHILDREN_CENTER_PROBABILITY) {
            prevWeight.push(1);
          }
          // Random
          else {
            prevWeight.push(Math.random());
          }

          var allChildrenSameSize = Math.random() > .0 ? true : false;

          // How many children are in this edge
          numChildren = prevWeight.length;

          // Calculate space per child
          var edgeSize = drawingPolygonPoints[i].distanceTo(drawingPolygonPoints[nextI]);
          var availableSpace = edgeSize / numChildren;
        }

        // Set children settings
        var childSizeX,
          childSizeY,
          childShape;

        // Inside this for we are going to create each children
        for (var j = 0; j < numChildren; j++) {

          var childPolygon;

          // If children is already calculated we only have to assign this children
          // We must take care because in drawingPolygon all children are in the same array
          // and in this for, j depends on the edge
          if (!drawingPolygon.createChildren) {
            var countingJ = 0;
            for (var k = 0; k < drawingPolygon.children.length; k++) {
              if (drawingPolygon.children[k].angle === angleHor) {
                if (j === countingJ) {
                  childPolygon = drawingPolygon.children[k];
                }
                countingJ++;
              }
            }
          }
          // if children is not calculated, we must create it randomly
          else {
            if (!(allChildrenSameSize && j > 0)) {
              // Size
              childSizeX = availableSpace * (Math.random() / 10 * 8 + .1); // availableSpace * random number between 0.10 and 0.90
              /*var regular = Math.random() > .5 ? true : false;
              if (regular) childSizeZ[j] = childSizeX[j];
              else childSizeZ[j] = availableSpace * (Math.random()/10 * 4 + .1);*/
              childSizeY = availableSpace * (Math.random() / 10 * 8 + .1);

              // Avoid really big blocks
              if (childSizeX > maxSolidWidth &&
                childSizeY > maxSolidWidth) {
                if (childSizeX < childSizeY) {
                  childSizeX = maxSolidWidth;
                } else {
                  childSizeY = maxSolidWidth;
                }
              }
              // Avoid relly small blocks but also avoid blocks really similar to it's parent in size
              // If the parents is less than the double of minSolidWidth, the children will be minSolidWidth/2
              if (childSizeX < minSolidWidth) {
                childSizeX = minSolidWidth;
              }
              if (childSizeY < minSolidWidth) {
                childSizeY = minSolidWidth;
              }

              // Get randomly a shape
              childShape = getRandomShape();
            }

            // For children with prevWeight of 0 and 1, replace it discounting the
            // proportion of half of its side divided by the total of the edgeSize
            // Doing this we get buildings with L form where parent and children fit
            // perfectyle in the borders
            prevWeight[j] = Math.max(childSizeX * 0.5 / edgeSize, Math.min(prevWeight[j], 1 - childSizeX * 0.5 / edgeSize));

            // Calculate X and Y of the center
            var childCenterX = (drawingPolygonPoints[i].x - drawingPolygonPoints[nextI].x) * prevWeight[j] + drawingPolygonPoints[nextI].x;
            var childCenterY = (drawingPolygonPoints[i].y - drawingPolygonPoints[nextI].y) * prevWeight[j] + drawingPolygonPoints[nextI].y;

            // Create rule
            childPolygon = new THREE.FloorShape.Rule(childShape, true, childSizeX, childSizeY, childCenterX, childCenterY, angleHor, parseInt(drawingPolygon.iteration + 1));
          }
          // Create child polygon
          // See that this is recursive, this children can have more descendant
          var newChildPoints = this.createShape(childPolygon);

          // Flag to check if children polygon's points are not in conflict with previous generated points
          var drawingPolygonPointsAreOk = true;
          // If children was already calculated, do waste time checking it again
          if (drawingPolygon.createChildren) {

            // Check if new child intersects with other children or parent
            if (THREE.BuildingUtils.polygonsIntersect(newChildPoints, pointsToReturn)) {
              drawingPolygonPointsAreOk = false;
            }

            // Check if new child intersects with parent
            // k = 1 to avoid testing the first vertex
            // newChildPoints.length-1 to avoid testing the last vertex
            // we already know both of them will be on the previous shape line
            for (var k = 1; k < newChildPoints.length - 1; k++) {
              if (this.pointInsidePolygon(newChildPoints[k], drawingPolygonPoints)) { // If one of them is inside the shape
                // We must not add this points to our shape because they overlap with the previous step shape
                drawingPolygonPointsAreOk = false;
              }
            }
          }

          // If this children's points are ok, add them to the shape points.
          if (drawingPolygonPointsAreOk) {
            pointsToReturn = pointsToReturn.concat(newChildPoints);
            drawingPolygon.children.push(childPolygon);
          }
        }
      }
    }

    // Check for duplicated points
    if (drawingPolygon.iteration === 0) {
      THREE.BuildingUtils.removeConsecutiveDuplicates(pointsToReturn);
    }

    return pointsToReturn;

    // It only returns a string "square" or "triangle" depending on certain probability
    function getRandomShape() {
      return (Math.random() < SHAPE_SQUARE_PROBABILITY) ? "square" : "triangle";
    }
  },

  // We are aplying ray casting algorithm
  pointInsidePolygon: function(point, polygon) {

    if (polygon === undefined) {
      polygon = this.points;
    }

    var crossingTimes = 0;

    // Generate line from point to outside polygon
    // First: get maximum right-top position
    var outsidePoint = new THREE.Vector2(Number.MIN_VALUE, Number.MIN_VALUE);
    for (var i = 0; i < polygon.length; i++) {
      if (polygon[i].x > outsidePoint.x) outsidePoint.x = polygon[i].x;
      if (polygon[i].y > outsidePoint.y) outsidePoint.y = polygon[i].y;
    }
    // Add 1 to be sure we are outside
    outsidePoint.y += 1;

    // Line formula aX + g = hY + k
    // Equation formula aX - bY = e
    // So:
    // a = a
    // b = -h
    // e = -g + k
    var pointLine = THREE.BuildingUtils.lineFromVectors(point, outsidePoint);

    // Compute all lines
    for (var i = 0; i < polygon.length; i++) {
      nextI = i + 1;
      if (nextI >= polygon.length) nextI = 0;

      var polygonEdgeLine = THREE.BuildingUtils.lineFromVectors(polygon[i], polygon[nextI]);

      // Replace point to line equation to test
      // either point is on the line and check if
      // the point is inside the vector
      if (polygonEdgeLine[0] * point.x + polygonEdgeLine[1] * point.y === polygonEdgeLine[2] &&
        THREE.BuildingUtils.isBetween(point.x, polygon[i].x, polygon[nextI].x) &&
        THREE.BuildingUtils.isBetween(point.y, polygon[i].y, polygon[nextI].y)) {
        return true; // the point is on a line, so we consider it is inside
      }

      // Compute equation
      var ans = THREE.BuildingUtils.eqSolver(pointLine[0], pointLine[1], pointLine[2], polygonEdgeLine[0], polygonEdgeLine[1], polygonEdgeLine[2]);

      // Check if ans is inside the polygon
      /*if (ans[0] === polygon[nextI].x &&
      	ans[1] === polygon[nextI].y) {
      		// We are in the last point of the edge,
      		// this point is also in the next edge
      		// so, here we will check if it is crossing
      		// or not
      }
      else*/
      if (THREE.BuildingUtils.isBetween(ans[0], point.x, outsidePoint.x) &&
        THREE.BuildingUtils.isBetween(ans[0], polygon[i].x, polygon[nextI].x) &&
        THREE.BuildingUtils.isBetween(ans[1], point.y, outsidePoint.y) &&
        THREE.BuildingUtils.isBetween(ans[1], polygon[i].y, polygon[nextI].y)) {
        crossingTimes++;
      }
    }
    if (crossingTimes % 2 !== 0) return true; // inside

    return false; // outside
  },

  clone: function(object) {
    //console.log("clone");

    if (object === undefined) object = new THREE.FloorShape();

    object.rules = this.rules.clone();
    object.points = this.points.slice(0);

    return object;
  }
}
