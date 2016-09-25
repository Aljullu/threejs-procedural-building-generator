THREE.BuildingUtils = {
    // ARRAYS
    // Given an array of THREE.Vector2 remove consecutive
    // duplicate points
    removeConsecutiveDuplicates: function(points, precisionPoints) {

        // Return empty arrays
        if (points.length === 0) return points;

        // Flag to know if in the last iteration there were duplicates
        var thereWereDuplicates = true;
        var lastPoint = new THREE.Vector2(0, 0);

        while (thereWereDuplicates) { // check it multiple times to prevent more than one duplicate
            thereWereDuplicates = false;

            // Check all points
            for (var i = 0; i < points.length; i++) {
                if (THREE.BuildingUtils.compare(lastPoint.x, points[i].x, precisionPoints) &&
                    THREE.BuildingUtils.compare(lastPoint.y, points[i].y, precisionPoints)) {
                    points.splice(i, 1);
                    i--;
                    thereWereDuplicates = true;
                } else {
                    lastPoint = points[i];
                }
            }
            // Check last point with the first one
            if (points[points.length - 1].x === points[0].x &&
                points[points.length - 1].y === points[0].y) {
                points.splice(points.length - 1, 1);
            }
        }

        return points;
    },


    // MATH
    // Compare two number with some precision
    compare: function(a, b, precisionPoints) {

        // Set precision
        if (precisionPoints === undefined) {
            precisionPoints = 3;
        }
        var precision = Math.pow(10, precisionPoints);

        return Math.round(a * precision) / precision === Math.round(b * precision) / precision;
    },
    // Given X between 0 and 1, ponderate it between a and b
    ponderate: function(x, a, b) {
        return x * (b - a) + a;
    },
    // Returns a random number between a and b
    randomBetween: function(a, b) {
        return this.ponderate(Math.random(), a, b);
    },
    // Returns a random value from the array
    randomOn: function(values) {
        return values[Math.floor(Math.random() * values.length)];
    },
    // Returns true if a < x < b or b < x < a
    isBetween: function(x, a, b, precisionPoints) {

        // Set precision
        if (precisionPoints === undefined) {
            precisionPoints = 3;
        }
        var precision = Math.pow(10, precisionPoints);

        x = Math.round(x * precision) / precision;
        a = Math.round(a * precision) / precision;
        b = Math.round(b * precision) / precision;
        if (a <= x && x <= b) return true;
        if (b <= x && x <= a) return true;
        return false;
    },
    // Cramer's rule to solve equations systems
    // Input must be in this format:
    // aX + bY = e;
    // cX + dY = f;
    // More info: http://en.wikipedia.org/wiki/Cramer%27s_rule#Explicit_formulas_for_small_systems
    eqSolver: function(a, b, e, c, d, f) {
        var ans = [];

        ans[0] = (e * d - b * f) / (a * d - b * c);
        ans[1] = (a * f - e * c) / (a * d - b * c);

        return ans;
    },

    // GEOMETRY
    // Returns max and min of the given array of Vector2/3
    getBoundingBox: function(points) {
        // Flag that says if we are working in 2D space or 3D
        var thirdDimension = false;

        if (points[0].z !== undefined) {
            thirdDimension = true;
        }

        var min, max;
        if (!thirdDimension) {
            min = new THREE.Vector2();
            max = new THREE.Vector2();
        } else {
            min = new THREE.Vector3();
            max = new THREE.Vector3();
        }

        min.x = Number.MAX_VALUE;
        max.x = Number.MIN_VALUE;
        min.y = Number.MAX_VALUE;
        max.y = Number.MIN_VALUE;
        if (thirdDimension) {
            min.z = Number.MAX_VALUE;
            max.z = Number.MIN_VALUE;
        }
        for (var i = 0; i < points.length; i++) {
            // Read
            var pointX = points[i].x;
            var pointY = points[i].y;
            var pointZ = 0;
            if (thirdDimension) pointZ = points[i].z;

            // Compare and save
            if (pointX < min.x) min.x = pointX;
            if (pointX > max.x) max.x = pointX;
            if (pointY < min.y) min.y = pointY;
            if (pointY > max.y) max.y = pointY;
            if (thirdDimension) {
                if (pointZ < min.z) min.z = pointZ;
                if (pointZ > max.z) max.z = pointZ;
            }
        }

        return [min, max];
    },
    // Given two points, returns a line in the format aX - bY = e
    lineFromVectors: function(v1, v2) {
        // Line formula aX + g = hY + k
        // Equation formula
        // So:
        // a = a
        // b = -h
        // e = -g + k
        var ans = [];
        if ((v2.x - v1.x) !== 0) {
            var m = (v2.y - v1.y) / (v2.x - v1.x); // slope
            ans[0] = -m;
            ans[1] = 1;
            ans[2] = -m * v1.x + v1.y;
        } else {
            ans[0] = 1;
            ans[1] = 0;
            ans[2] = v1.x;
        }
        return ans;
    },

    // It checks all lines between vertices in polygon1 with
    // all lines between vertices in polygon2 and if some
    // of them collide, returns true
    polygonsIntersect: function(polygon1, polygon2) {
        // Compute all polygon1 lines
        for (var i = 0; i < polygon1.length; i++) {
            var nextI = i + 1;
            if (nextI >= polygon1.length) nextI = 0;

            var line1 = THREE.BuildingUtils.lineFromVectors(polygon1[i], polygon1[nextI]);

            // Compute all polygon2 lines
            for (var j = 0; j < polygon2.length; j++) {
                nextJ = j + 1;
                if (nextJ >= polygon2.length) nextJ = 0;

                var line2 = THREE.BuildingUtils.lineFromVectors(polygon2[j], polygon2[nextJ]);

                // Ignore equivalent lines
                if (line1[0] === line2[0] &&
                    line1[1] === line2[1] &&
                    line1[2] === line2[2]) {
                    continue;
                }

                // Compute equation
                var ans = THREE.BuildingUtils.eqSolver(line1[0], line1[1], line1[2], line2[0], line2[1], line2[2]);

                // Check if ans is inside the boundaries
                if (THREE.BuildingUtils.isBetween(ans[0], polygon1[i].x, polygon1[nextI].x) &&
                    THREE.BuildingUtils.isBetween(ans[0], polygon2[j].x, polygon2[nextJ].x) &&
                    THREE.BuildingUtils.isBetween(ans[1], polygon1[i].y, polygon1[nextI].y) &&
                    THREE.BuildingUtils.isBetween(ans[1], polygon2[j].y, polygon2[nextJ].y)) {
                    return true;
                }

            }
        }
        return false;
    },

    // Angles
    degreesToRadians: function(degrees) {
        return degrees * Math.PI / 180;
    },
    radiansToDegrees: function(radians) {
        return radians * 180 / Math.PI;
    },
    // Returns angle between two vectors
    angleFromVectors: function(v1, v2) {
        return Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))));
    },
    // Returns angle between vector and X
    angleToX: function(v1) {
        return Math.atan(v1.y / v1.x);
    },
    // Returns a vector between two points
    vector3FromPoints: function(p1, p2) {
        return new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    }
}
