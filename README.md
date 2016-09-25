threejs-procedural-building-generator
=====================================

Procedural Building Generator using three.js

* Demo: http://www.albertjuhe.com/files/tfg/demo/index.htm
* Thesis (in Catalan): http://www.albertjuhe.com/files/tfg/tfg-albert-juhe-lluveras-122149.pdf
* Slides (in Catalan): http://www.albertjuhe.com/files/tfg/slides/index.html

# TODO
## Big features
* [ ] Make Nordic-style roofs.
* [ ] Gardens.
* [ ] Procedural decorative elements.
* [ ] Procedural textures.
* [ ] Generate polygon tree from a random shape. That would allow taking a map and generating a building for each plant.
## Current features improvements
* [ ] Roof textures rotation.
* [ ] Improve camera
* [ ] `FloorGeometry`'s `insertRoofElements` should be more intelligent and generate random positions based on the bounding box size, so collisions against the border are less usual.
* [ ] Load meshes in parallel.
* [ ] Unnecessary polygons rendered when floors are smaller than the previous one, since all roof is rendered but only a small part is visible.
* [x] `FloorGeometry`s should have strict rotations (0, 45, 90 degrees...) instead of any value.
* [x] Make demo work in all modern browsers.
## Code style
* [ ] Add tests.
* [ ] `functions.js` should be merged into `BuildingUtils.js`.
* [ ] `createBuildingGeometry` function in `Building.js` is huge. Split it in smaller functions.
* [ ] Replace id selectors with class selectors in `style.css`.
* [ ] `texturePath` -> `atlasIndex` relation should be saved in `Atlas` instead of `Building`.
* [ ] Investigate why all meshes must be rotated.
