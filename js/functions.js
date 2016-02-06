/* Constants */
// Change "var" to "const" when browser support is acceptable
// Camera
var debug = true;
var ZOOM_TIME_TRANSITION = 100,
  MOVE_TIME_TRANSITION = 100,
  DISTANCE_CAMERA_MOVEMENT = 25;
// Building parameters
var BUILDING_DEFAULT_SIZE_X = 100,
  BUILDING_DEFAULT_SIZE_Y = 50,
  BUILDING_DEFAULT_POS_X = 0,
  BUILDING_DEFAULT_POS_Y = 0,
  BUILDING_DEFAULT_HEIGHT = 50,
  BUILDING_DEFAULT_FLOOR_HEIGHT = 7,
  BUILDING_DEFAULT_ROOF_WALL_PROPORTION = .4,
  BUILDING_DEFAULT_WINDOWS_SEPARATION = 5,
  BUILDING_DEFAULT_WINDOW_REPETITION = "random",
  BUILDING_DEFAULT_PROBABILITY_NEXT_FLOOR_DIFFERENT_SHAPE = .25,
  FLOOR_DEFAULT_HEIGHT = 5,
  BUILDING_DEFAULT_MIN_SOLID_WIDTH = 20,
  BUILDING_DEFAULT_MAX_SOLID_WIDTH = 100,
  DEFAULT_BUILDING_WALL_TEXTURE_PATH = './textures/wall/brick-wall.jpg',
  DEFAULT_BUILDING_ROOF_TEXTURE_PATH = './textures/roof/concrete-bare.jpg',
  BUILDING_DEFAULT_WINDOWS = new Array({
    'mesh': './models/balcons/balco-toldo01.dae',
    'texture': './textures/balcons/balco-toldo01.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae?2',
    'texture': './textures/balcons/balco-toldo02.jpg'
  }),
  BUILDING_DEFAULT_FIRST_FLOOR_WINDOWS = new Array({
    'mesh': './models/elements/shop01.dae',
    'texture': './textures/elements/BuildingsDerelict0078_S.jpg'
  }),
  BUILDING_DEFAULT_ROOF_ELEMENTS = new Array({
    'mesh': './models/elements/antena.dae',
    'texture': './textures/elements/antena.jpg'
  }, {
    'mesh': './models/elements/ad.dae',
    'texture': './textures/elements/ad.jpg'
  });
var SHAPE_SQUARE_PROBABILITY = .9,
  SHAPE_TRIANGLE_PROBABILITY = .1;
var SHAPE_CHILDREN_CENTER_PROBABILITY = .15,
  SHAPE_CHILDREN_SIMETRIC_PROBABILITY = .10,
  SHAPE_CHILDREN_ROW_PROBABILITY = .05,
  SHAPE_CHILDREN_LEFT_PROBABILITY = .35,
  SHAPE_CHILDREN_RIGHT_PROBABILITY = .35,
  SHAPE_CHILDREN_RANDOM_PROBABILITY = .00;

function getRandomBuildingWallTexture() {
  var wallSuitableTextures = [
    "./textures/wall/BrickFacade0037_1_S.jpg",
    "./textures/wall/BrickLargeBrown0016_2_S.jpg",
    "./textures/wall/BrickLargeBrown0017_2_S.jpg",
    "./textures/wall/BrickLargeBrown0021_2_S.jpg",
    "./textures/wall/BrickLargeBrown0022_7_S.jpg",
    "./textures/wall/BrickLargeDirty0016_5_S.jpg",
    "./textures/wall/BrickLargeDirty0029_19_S.jpg",
    "./textures/wall/BrickLargeDirty0039_5_S.jpg",
    "./textures/wall/BrickLargePainted0026_9_S.jpg",
    "./textures/wall/BrickLargePainted0046_7_S.jpg",
    "./textures/wall/BrickLargePainted0051_5_S.jpg",
    "./textures/wall/BrickRound0109_9_S.jpg",
    "./textures/wall/BrickSmallDark0003_2_S.jpg",
    "./textures/wall/BrickSmallPatterns0031_2_S.jpg",
    "./textures/wall/BrickSmallPatterns0041_11_S.jpg",
    "./textures/wall/brick-wall.jpg",
    "./textures/walls-and-roof/ConcreteBunker0077_1_S.jpg",
    "./textures/walls-and-roof/ConcreteBunker0213_1_S.jpg"
  ];
  return wallSuitableTextures[Math.floor(THREE.BuildingUtils.randomBetween(0, wallSuitableTextures.length))];
}

function getRandomBuildingRoofTexture() {
  var roofSuitableTextures = [
    "./textures/roof/bunker-leaking.jpg",
    "./textures/roof/concrete-bare.jpg",
    "./textures/roof/ConcreteBunkerDirty0008_5_S.jpg",
    "./textures/roof/ConcreteFloorsDamaged0002_16_S.jpg",
    "./textures/roof/ConcreteFloorsDamaged0010_5_S.jpg",
    "./textures/roof/ConcreteFloorsDamaged0010_6_S.jpg",
    "./textures/roof/floor-herringbone.jpg",
    "./textures/roof/FloorHerringbone0097_1_S.jpg",
    "./textures/walls-and-roof/ConcreteBunker0077_1_S.jpg",
    "./textures/walls-and-roof/ConcreteBunker0213_1_S.jpg"
  ];
  return roofSuitableTextures[Math.floor(THREE.BuildingUtils.randomBetween(0, roofSuitableTextures.length))];
}

// Create a random array with at least X elements as minimum
function createRandomArray(allElementsArray, minNumberOfElements) {

  if (minNumberOfElements === undefined) {
    minNumberOfElements = 1;
  }

  var elementsToReturn = [];

  for (var i = 0; i < allElementsArray.length; i++) {
    if (Math.random() < .5) {
      elementsToReturn.push(allElementsArray[i]);
    }
  }

  if (elementsToReturn.length >= minNumberOfElements) {
    return elementsToReturn;
  }
  return createRandomArray(allElementsArray, minNumberOfElements);
}

function getRandomWindows() {
  var suitableWindows = new Array({
    'mesh': './models/balcons/balcon-box1.dae',
    'texture': './textures/roof/concrete-bare.jpg'
  }, {
    'mesh': './models/balcons/balcon-roof-seamed.dae',
    'texture': './textures/wall/BrickLargePainted0026_9_S.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae',
    'texture': './textures/balcons/balco-toldo01.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae?2',
    'texture': './textures/balcons/balco-toldo02.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae?3',
    'texture': './textures/balcons/balco-toldo03.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae?4',
    'texture': './textures/balcons/balco-toldo04.jpg'
  }, {
    'mesh': './models/balcons/balco-toldo01.dae?5',
    'texture': './textures/balcons/balco-toldo05.jpg'
  });
  return createRandomArray(suitableWindows);
}

function getRandomFirstFloorWindows() {
  var suitableFirstFloorWindows = new Array({
    'mesh': './models/elements/shop01.dae',
    'texture': './textures/elements/BuildingsDerelict0078_S.jpg'
  }, {
    'mesh': './models/balcons/balcon-seamed.dae',
    'texture': './textures/walls-and-roof/ConcreteBunker0213_1_S.jpg'
  });
  return createRandomArray(suitableFirstFloorWindows);
}

function getRandomRoofObjects() {
  var suitableRoofElements = new Array({
    'mesh': './models/elements/tennis.dae',
    'texture': './textures/elements/tennis.jpg'
  }, {
    'mesh': './models/elements/antena.dae',
    'texture': './textures/elements/antena.jpg'
  }, {
    'mesh': './models/elements/ad.dae',
    'texture': './textures/elements/ad.jpg'
  }, {
    'mesh': './models/elements/ad.dae?2',
    'texture': './textures/elements/ad-desigual.jpg'
  });
  return createRandomArray(suitableRoofElements);
}
