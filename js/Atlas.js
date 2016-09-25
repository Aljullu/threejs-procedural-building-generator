Atlas = function(texturePathsArray) {
  canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  canvas.setAttribute("id", "atlas");
  ctx = canvas.getContext('2d');

  for (var i = 0; i < texturePathsArray.length; i++) {
    this.addTexture(i, texturePathsArray[i])
  }
}

Atlas.prototype = {

  // Attach a texture to atlas
  addTexture: function(i, texturePath) {
    var img = new Image();
    img.src = texturePath;
    img.onload = function(e) {
      ctx.drawImage(e.target, (i % 4) * 256, Math.floor(i / 4) * 256, 256, 256);
    };
  },

  // Returns start coordinates and ending coordinates given a texture index
  getCoordinatesById: function(index) {
    var startX = (index % 4) / 4;
    var startY = Math.floor(index / 4) / 4;
    var sizeX = 1 / 4;
    var sizeY = 1 / 4;

    return [startX, startY, startX + sizeX, startY + sizeY];
  },

  // Updates geometry texture coordinates according to atlas and texture index
  updateGeometryCoordinates: function(geometry, index) {
    var coord = this.getCoordinatesById(index);
    for (var i = 0; i < geometry.faceVertexUvs[0].length; i++) {
      for (var j = 0; j < geometry.faceVertexUvs[0][i].length; j++) {
        geometry.faceVertexUvs[0][i][j].x = THREE.BuildingUtils.ponderate(geometry.faceVertexUvs[0][i][j].x, coord[0], coord[2]);
        geometry.faceVertexUvs[0][i][j].y = THREE.BuildingUtils.ponderate(geometry.faceVertexUvs[0][i][j].y, 1 - coord[3], 1 - coord[1]);
      }
    }
    return geometry;
  }
}
