/**
 * @author Albert Juhé Lluveras
 */
function Building(parameters) {
  if (debug) {
    start = new Date().getTime();
    document.getElementById("create-building-wrapper").setAttribute('hidden', true);
    document.getElementById("progress-wrapper").removeAttribute('hidden');
    document.getElementById("progress").setAttribute('value', 0);
  }

  // Allow accessing this inside functions
  var scope = this;

  // Set empty array as default
  if (!parameters) parameters = [];
  // Get data from parameters array
  parseParameters(parameters);
  var texturesIndex = []; // save texture index for each mesh
  var materials = createMaterials(parameters);

  var buildingGeometry = new THREE.Geometry();

  // Load meshes
  var numberOfMeshesToLoad = 0;
  if (parameters.windows.length !== 0 || parameters.roof.objects.length !== 0) {
    numberOfMeshesToLoad = parameters.windows.length;
    for (var i = 0; i < parameters.floors.length; i++) {
      numberOfMeshesToLoad += parameters.floors[i].windows.length;
    }
    numberOfMeshesToLoad += parameters.roof.objects.length;
    loadMeshes([], 0, numberOfMeshesToLoad);
  } else {
    createBuildingGeometry();
  }

  // Save data from parameters to building properties
  function parseParameters(parameters) {

    // Numeric & boolean values
    if (parameters.mode === "default") {
      scope.sizeX = parameters.sizeX || BUILDING_DEFAULT_SIZE_X;
      scope.sizeZ = parameters.sizeZ || BUILDING_DEFAULT_SIZE_Y;
      scope.windowRepetition = parameters.windowRepetition || BUILDING_DEFAULT_WINDOW_REPETITION;
      scope.probabilityNextFloorDifferentShape = parameters.probabilityNextFloorDifferentShape || BUILDING_DEFAULT_PROBABILITY_NEXT_FLOOR_DIFFERENT_SHAPE;
      scope.posX = parameters.posX || BUILDING_DEFAULT_POS_X;
      scope.posZ = parameters.posZ || BUILDING_DEFAULT_POS_Y;
      scope.height = parameters.height || BUILDING_DEFAULT_HEIGHT;
      scope.floorHeight = parameters.floorHeight || BUILDING_DEFAULT_FLOOR_HEIGHT;
      scope.windowsSeparation = parameters.windowsSeparation || BUILDING_DEFAULT_WINDOWS_SEPARATION;
      minSolidWidth = parameters.minSolidWidth || BUILDING_DEFAULT_MIN_SOLID_WIDTH;
      maxSolidWidth = parameters.maxSolidWidth || BUILDING_DEFAULT_MAX_SOLID_WIDTH;
      scope.textureWall = parameters.textureWall || DEFAULT_BUILDING_WALL_TEXTURE_PATH;
      scope.textureRoof = parameters.textureRoof || DEFAULT_BUILDING_ROOF_TEXTURE_PATH;
    } else {
      scope.sizeX = parameters.sizeX || THREE.BuildingUtils.randomBetween(25, 250);
      scope.sizeZ = parameters.sizeZ || THREE.BuildingUtils.randomBetween(25, 250);
      // Even in random mode we want the default value for Window Repetition. This is because the default value is "random"
      scope.windowRepetition = parameters.windowRepetition || BUILDING_DEFAULT_WINDOW_REPETITION;
      scope.probabilityNextFloorDifferentShape = parameters.probabilityNextFloorDifferentShape || THREE.BuildingUtils.randomBetween(.05, .25);
      scope.posX = parameters.posX || BUILDING_DEFAULT_POS_X;
      scope.posZ = parameters.posZ || BUILDING_DEFAULT_POS_Y;
      scope.floorHeight = parameters.floorHeight || THREE.BuildingUtils.randomBetween(7, 13);
      scope.height = parameters.height || scope.floorHeight * THREE.BuildingUtils.randomBetween(1, 15);
      scope.windowsSeparation = parameters.windowsSeparation || THREE.BuildingUtils.randomBetween(4, 8);
      minSolidWidth = parameters.minSolidWidth || BUILDING_DEFAULT_MIN_SOLID_WIDTH;
      maxSolidWidth = parameters.maxSolidWidth || BUILDING_DEFAULT_MAX_SOLID_WIDTH;
      scope.textureWall = parameters.textureWall || getRandomBuildingWallTexture();
      scope.textureRoof = parameters.textureRoof || getRandomBuildingRoofTexture();

      if (parameters.windowsGroup !== undefined) {
        scope.windowsGroup = parameters.windowsGroup;
      } else {
        scope.windowsGroup = (Math.random() < .5) ? "pairs" : "normal";
      }
    }

    // Roof
    // Set and empty array to make the following code more simple
    if (parameters.roof === undefined) {
      parameters.roof = [];
    }

    if (parameters.roof.wallHeightProportion !== undefined)
      scope.roofWallProportion = parameters.roof.wallHeightProportion;
    else {
      if (parameters.mode === "default") {
        scope.roofWallProportion = BUILDING_DEFAULT_ROOF_WALL_PROPORTION;
      } else {
        scope.roofWallProportion = THREE.BuildingUtils.randomBetween(.2, .6);
      }
    }

    if (parameters.roof.objects === undefined) {
      if (parameters.mode === "default") parameters.roof.objects = BUILDING_DEFAULT_ROOF_ELEMENTS;
      else parameters.roof.objects = getRandomRoofObjects();
    }


    // Windows
    if (parameters.windows === undefined) {
      parameters.windows = [];
    }

    if (parameters.windows.length === 0) {
      if (parameters.mode === "default") parameters.windows = BUILDING_DEFAULT_WINDOWS;
      else parameters.windows = getRandomWindows();
    }


    // Floors
    if (parameters.floors === undefined) {
      if (parameters.mode === "default") {
        parameters.floors = new Array({
          "windows": BUILDING_DEFAULT_FIRST_FLOOR_WINDOWS
        });
      } else {
        parameters.floors = new Array({
          "windows": getRandomFirstFloorWindows()
        });
      }
    }
    if (parameters.floors[0].floorHeight === undefined) {
      if (parameters.mode === "default") parameters.floors[0].floorHeight = BUILDING_DEFAULT_FLOOR_HEIGHT;
      else parameters.floors[0].floorHeight = THREE.BuildingUtils.randomBetween(scope.floorHeight, scope.floorHeight * 1.5);
    }
    if (parameters.floors[0].windowsSeparation === undefined) {
      if (parameters.mode === "default") parameters.floors[0].windowsSeparation = BUILDING_DEFAULT_WINDOWS_SEPARATION;
      else parameters.floors[0].windowsSeparation = THREE.BuildingUtils.randomBetween(scope.windowsSeparation, scope.windowsSeparation * 2);
    }
    parameters.floors[0].windowsGroup = "normal";
  }

  // Create materials
  function createMaterials(parameters) {
    var textureLoader = new THREE.TextureLoader();

    // Wall and roof materials
    var textureWall = textureLoader.load(scope.textureWall, function(texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });
    var wallMaterial = new THREE.MeshPhongMaterial({
      map: textureWall /*, transparent: true, opacity: 0.5*/
    });

    // Make it double sided to make roof wall visible in both sides
    if (scope.roofWallProportion) {
      wallMaterial.side = THREE.DoubleSide;
    }
    var textureRoof = textureLoader.load(scope.textureRoof, function(texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });
    var roofMaterial = new THREE.MeshPhongMaterial({
      map: textureRoof /*, transparent: true, opacity: 0.1*/
    });

    // Create array of textures
    var texturesPath = []; // array of texture's paths

    // Add windows textures
    for (var i = 0; i < parameters.windows.length; i++) {
      setRelationMeshTexture(parameters.windows[i].mesh, parameters.windows[i].texture);
    }
    // Repeat for each floor
    for (var i = 0; i < parameters.floors.length; i++) {
      for (var j = 0; j < parameters.floors[i].windows.length; j++) {
        setRelationMeshTexture(parameters.floors[i].windows[j].mesh, parameters.floors[i].windows[j].texture);
      }
    }
    // Roof elements
    for (var i = 0; i < parameters.roof.objects.length; i++) {
      setRelationMeshTexture(parameters.roof.objects[i].mesh, parameters.roof.objects[i].texture);
    }

    // Create texture atlas
    atlas = new Atlas(texturesPath);

    // Get canvas and create texture
    var textureAtlas = new THREE.Texture(canvas);
    textureAtlas.needsUpdate = true;

    // Create material
    var materialAtlas = new THREE.MeshPhongMaterial({
      map: textureAtlas /*, transparent: true, opacity: 0.1*/
    });

    // Make it double sided to make roof wall visible in both sides
    if (scope.roofWallProportion) {
      materialAtlas.side = THREE.DoubleSide;
    }

    return [wallMaterial, roofMaterial, materialAtlas];

    // Saves relations between mesh and texture
    function setRelationMeshTexture(mesh, texture) {

      // Check if texture is already in our list
      for (var i = 0; i < texturesPath.length; i++) {
        if (texturesPath[i] === texture) {
          texturesIndex[mesh] = i; // set index
          return;
        }
      }
      // If texture was not in the list, add it
      texturesPath.push(texture);
      texturesIndex[mesh] = texturesPath.length - 1; // set index
    }
  }

  // Create floorGeometryParameters
  function createFloorGeometryParameters(parameters) {
    // Shape
    var shape;
    if (parameters.shape !== undefined) {
      if (parameters.shape === "square" || parameters.shape === "triangle") {
        var createdShape = new THREE.FloorShape();
        createdShape.createFromParameters(parameters.shape, false, parameters.sizeX, parameters.sizeZ);
        shape = createdShape;
      } else if (parameters.shape === "random") {
        var createdShape = new THREE.FloorShape();
        createdShape.createFromParameters(parameters.shape, true, parameters.sizeX, parameters.sizeZ);
        shape = createdShape;
      } else {
        shape = parameters.shape
      }
    } else {
      if (parameters.mode !== "default") {
        var createdShape = new THREE.FloorShape();
        createdShape.createFromParameters("random", true, parameters.sizeX, parameters.sizeZ);
        shape = createdShape;
      } else {
        var createdShape = new THREE.FloorShape();
        createdShape.createFromParameters("square", false, parameters.sizeX, parameters.sizeZ);
        shape = createdShape;
      }
    }
    var floorGeometryParameters = {
      "height": scope.floorHeight,
      "defaultHeight": scope.floorHeight,
      "shape": shape,
      "sizeX": scope.sizeX,
      "sizeZ": scope.sizeZ,
      "textureId": 0
    };

    return floorGeometryParameters;
  }

  // Create floors
  function createBuildingGeometry(listOfGeometries) {
    // Create parameters array for FloorGeometry
    var commonFloorGeometryParameters = createFloorGeometryParameters(parameters);

    var numberOfFloors = Math.floor(scope.height / scope.floorHeight);
    scope.height = scope.floorHeight * numberOfFloors; // modify building height according to floor height
    var center = new THREE.Vector2();
    var nextFloorWithDifferentShape = false;
    var acomulatedHeight = 0;

    // Create floors' geometry
    for (var i = 0; i < numberOfFloors; i++) {

      if (debug) document.getElementById("progress").setAttribute("value", 20 + i / numberOfFloors * 60);

      // Clone common parameters
      var floorGeometryParameters = [];
      for (var key in commonFloorGeometryParameters) {
        floorGeometryParameters[key] = commonFloorGeometryParameters[key];
      }

      // Avoid oldFloorGeometryParametersShape being null
      if (i === 0) {
        oldFloorGeometryParametersShape = floorGeometryParameters.shape.clone();
      }

      // Update floor with different shape info
      var thisFloorWithDifferentShape = nextFloorWithDifferentShape;
      nextFloorWithDifferentShape = (Math.random() < scope.probabilityNextFloorDifferentShape && i < numberOfFloors - 1) ? true : false;

      // Get specific floor data
      var thisFloorWindowsSeparation = scope.windowsSeparation;
      if (parameters.floors) {
        if (parameters.floors[i]) {
          if (parameters.floors[i].floorHeight) {
            floorGeometryParameters.height = parseFloat(parameters.floors[i].floorHeight);
          }
          if (parameters.floors[i].windowsSeparation) {
            thisFloorWindowsSeparation = parseFloat(parameters.floors[i].windowsSeparation);
          }
        }
      }

      // Base height
      floorGeometryParameters.baseHeight = acomulatedHeight;

      // Draw roof?
      if (i === numberOfFloors - 1 || nextFloorWithDifferentShape) {
        floorGeometryParameters.drawRoof = true;
      } else floorGeometryParameters.drawRoof = false;

      // Create geometry
      var floorGeometry = new THREE.FloorGeometry(floorGeometryParameters);

      // Get center of the building's plant.
      // Only in the first floor, all others floors will be centered
      // to this point
      if (i === 0) {
        center = floorGeometry.shape.getCenter();
      }

      // Insert windows
      if (numberOfMeshesToLoad > 0) {
        var windowsToInsertInThisFloor = [];
        if (parameters.floors[i]) {
          if (parameters.floors[i].windows.length > 0) {
            var startingMesh = parameters.windows.length;

            // Count windows of the previous floors
            for (var j = 0; j < i; j++) {
              startingMesh += parameters.floors[j].windows.length;
            }
            var endingMesh = startingMesh + parameters.floors[i].windows.length - 1;
            for (var j = startingMesh; j <= endingMesh; j++) {
              windowsToInsertInThisFloor.push(listOfGeometries[j].clone());
            }
          }
        } else {
          for (var j = 0; j < parameters.windows.length; j++) {
            windowsToInsertInThisFloor.push(listOfGeometries[j].clone());
          }
        }

        floorGeometry.insertWindows(windowsToInsertInThisFloor, thisFloorWindowsSeparation, scope.windowsGroup, scope.windowRepetition);
      }
      // Insert roof objects
      if (parameters.roof.objects.length > 0) {
        var objectsToInsert = [];
        var startingMesh = parameters.windows.length;
        if (parameters.floors) {
          for (var j = 0; j < numberOfFloors - 1; j++) {
            if (parameters.floors[j]) {
              if (parameters.floors[j].windows) {
                startingMesh += parameters.floors[j].windows.length;
              }
            }
          }
        }
        for (var j = startingMesh; j <= listOfGeometries.length - 1; j++) {
          objectsToInsert.push(listOfGeometries[j].clone());
        }
        if (i === numberOfFloors - 1) {
          floorGeometry.insertRoofElements(objectsToInsert);
        } else if (thisFloorWithDifferentShape) {
          floorGeometry.insertRoofElements(objectsToInsert, oldFloorGeometryParametersShape);
        }
      }

      // Merge
      floorGeometry.move(center);

      buildingGeometry.merge(floorGeometry);

      // Roof wall
      if ((i === numberOfFloors - 1 || thisFloorWithDifferentShape) && parameters.roof) {
        if (scope.roofWallProportion) {
          // Clone parameters
          var roofParameters = [];
          for (var key in floorGeometryParameters) {
            roofParameters[key] = floorGeometryParameters[key];
          }

          roofParameters.roofWallProportion = scope.roofWallProportion;
          roofParameters.drawRoof = false;
          roofParameters.textureId = 1;

          if (i === numberOfFloors - 1) {
            roofParameters.baseHeight = acomulatedHeight + parseFloat(scope.floorHeight);
            var roofWallGeometry = new THREE.FloorGeometry(roofParameters);
            roofWallGeometry.move(center);
            buildingGeometry.merge(roofWallGeometry);
          }
          if (thisFloorWithDifferentShape) {
            roofParameters.baseHeight = acomulatedHeight;

            var arrayOfShapes = floorGeometryParameters.shape.getExclusionWalls(oldFloorGeometryParametersShape);

            if (arrayOfShapes.length > 0) {
              for (var j = 0; j < arrayOfShapes.length; j++) {
                roofParameters.doNotDrawLastEdge = true;
                roofParameters.shape = new THREE.FloorShape();
                roofParameters.shape.points = arrayOfShapes[j];
                var roofWallGeometry = new THREE.FloorGeometry(roofParameters);
                roofWallGeometry.move(center);
                buildingGeometry.merge(roofWallGeometry);
              }
            }
          }
        }
      }

      // Clone shape
      oldFloorGeometryParametersShape = floorGeometryParameters.shape.clone();
      if (nextFloorWithDifferentShape) {
        floorGeometryParameters.shape.pruneRules(0, 1 / numberOfFloors * 2); // TODO: 1/numberOfFloors*2 should be a parameter
      }
      acomulatedHeight += parseFloat(floorGeometryParameters.height);
    }
    addBuildingMeshToScene();
  }

  // Load windows meshes
  function loadMeshes(listOfGeometries, typeLoading, numberOfMeshesToLoad) { // TODO where are parameters taken from?

    // Create loader
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;

    if (debug) document.getElementById("progress").setAttribute("value", typeLoading / numberOfMeshesToLoad * 20);

    // Get mesh and texture paths
    var meshPath = ''; // default value
    var meshesChecked = 0;

    // If mesh is in the default settings
    if (typeLoading < parameters.windows.length) {
      meshPath = parameters.windows[typeLoading].mesh;
    } else { // If it is inside the floors' settings
      meshesChecked += parameters.windows.length;
      for (var i = 0; i < parameters.floors.length; i++) {
        if (typeLoading <= meshesChecked + parameters.floors[i].windows.length) {
          for (var j = 0; j < parameters.floors[i].windows.length; j++) {
            if (typeLoading - meshesChecked === j) {
              meshPath = parameters.floors[i].windows[j].mesh;
            }
          }
        }
        meshesChecked += parameters.floors[i].windows.length;
      }
    }

    var meshesCheckedBeforeRoofObjects = meshesChecked;
    if (meshPath === "") { // we hadn't found the mesh path yet, probably it is a roof object
      meshPath = parameters.roof.objects[typeLoading - meshesChecked].mesh;
    }

    // Load mesh
    loader.load(meshPath, function(collada) {

      // Get geometry
      var geometry = collada.scene.children[0].children[0].geometry.clone();

      // Set material index to point to the map
      for (var i = 0; i < geometry.faces.length; i++) {
        geometry.faces[i].materialIndex = 2;
      }

      // Add geometry to array
      atlas.updateGeometryCoordinates(geometry, texturesIndex[meshPath]);
      listOfGeometries.push(geometry);

      // Load the next type if it exists
      if (typeLoading + 1 < numberOfMeshesToLoad) {
        loadMeshes(listOfGeometries, typeLoading + 1, numberOfMeshesToLoad);
      } else createBuildingGeometry(listOfGeometries);
    });
  }

  // Add building to scene
  function addBuildingMeshToScene() {

    // Create mesh
    scope.mesh = new THREE.Mesh(buildingGeometry, new THREE.MeshFaceMaterial(materials));

    // Some other configs
    scope.mesh.rotation.x = Math.PI / 2;
    scope.mesh.position.set(scope.posX, 0, scope.posZ);

    scene.add(scope.mesh);

    if (debug) {
      var time = new Date().getTime() - start;
      document.getElementById("progress").setAttribute("value", 100);
      document.getElementById("progress-wrapper").setAttribute('hidden', true);
      document.getElementById("create-building-wrapper").removeAttribute('hidden');
      console.log('Building built in: ' + time + 'ms');
      console.log("Number of vertices: " + scope.mesh.geometry.vertices.length);
    }
  }
}
