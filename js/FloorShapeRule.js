// Used to create the sequence of rules for childpolygons
THREE.FloorShape.Rule = function(shape, createChildren, sizeX, sizeY, centerX, centerY, angle, iteration) {
  this.shape = shape;

  if (createChildren === undefined) this.createChildren = false;
  else this.createChildren = createChildren;

  if (sizeX === undefined) this.sizeX = BUILDING_DEFAULT_SIZE_X;
  else this.sizeX = sizeX;

  if (sizeY === undefined) this.sizeY = BUILDING_DEFAULT_SIZE_Y;
  else this.sizeY = sizeY;

  if (centerX === undefined) this.centerX = 0;
  else this.centerX = centerX;

  if (centerY === undefined) this.centerY = 0;
  else this.centerY = centerY;

  if (angle === undefined) this.angle = 0;
  else this.angle = angle;

  if (iteration === undefined) this.iteration = 0;
  else this.iteration = iteration;
  this.iteration = parseInt(this.iteration); // make sure iteration is an int

  this.children = new Array();
};

THREE.FloorShape.Rule.prototype = {

  // Sets this.childrenCalculated to true for this and its children
  // It is useful to be sure that polygons are stable and
  // no new children will be created when invoking createShape()
  setChildrenToCalculated: function() {
    this.createChildren = false;
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setChildrenToCalculated();
    }
  },

  // Compare two rules
  // Compare only visible attributes,
  // so createChildren and iteration are not compared
  compare: function(rule2) {

    return this.shape === rule2.shape &&
      THREE.BuildingUtils.compare(this.sizeX, rule2.sizeX) &&
      THREE.BuildingUtils.compare(this.sizeY, rule2.sizeY) &&
      THREE.BuildingUtils.compare(this.centerX, rule2.centerX) &&
      THREE.BuildingUtils.compare(this.centerY, rule2.centerY) &&
      THREE.BuildingUtils.compare(this.angle, rule2.angle);
  },

  clone: function(object) {

    if (object === undefined) object = new THREE.FloorShape.Rule();

    object.shape = this.shape;
    object.createChildren = this.createChildren;
    object.sizeX = this.sizeX;
    object.sizeY = this.sizeY;
    object.centerX = this.centerX;
    object.centerY = this.centerY;
    object.angle = this.angle;
    object.iteration = this.iteration;
    object.angle = this.angle;
    object.children = [];

    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      object.children.push(child.clone());
    }

    return object;
  }
}
