//var activeShapeAssistant = new ShapeAssistant();

/******************
**MOUSE************
******************/
/*// This function sets the active object
function selectObject (id) {
	// Remove visual identity of previous selected building
	if (activeObject) activeObject.mesh.material.opacity = 1;
	
	if (id === 0) activeObject = world;
	else activeObject = objectByIdLogic(id);
	
	switch (activeObject.type) {
		case 0:
		case 1:
			break;
		case 2:
			$("#active-object-idLogic").val(id);
			$("#active-object-name").val(activeObject.displayName);
			$("#active-object-rotation").val(activeObject.rotation);
			$("#active-object-posX").val(Math.round(activeObject.posX));
			$("#active-object-posZ").val(Math.round(activeObject.posZ));
			$("#active-object-sizeX").val(Math.round(activeObject.sizeX));
			$("#active-object-sizeY").val(Math.round(activeObject.sizeY));
			$("#active-object-height").val(parseInt(activeObject.sizeY).toFixed(2));
			$("#active-object-color").val("#"+Math.round(activeObject.color).toString(16));
			$("#active-object-floors").val(activeObject.numberOfFloors);
			$("#mesh-manager-list").jstree("select_node", $("#mesh-manager-list li[data-id="+activeObject.id+"]"));
			activeObject.mesh.material.opacity = 0.5;
			break;
		case 3:
			$("#active-floor-height").val(activeObject.height);
			break;
	}
	
	showInterfaceForType(activeObject.type);
}
// This function clears the active object
// removing the reference from the variable
// and clearing all its info from the interface
function unselectObject () {
	// Remove visual identity of previous selected building
	if (activeObject) activeObject.mesh.material.opacity = 1;
	
	activeObject = null;
	$("#active-object-idLogic").val("");
	$("#active-object-name").val("");
	$("#active-object-rotation").val("");
	$("#active-object-manipulation-pos input").val("");
	$("#active-object-manipulation-size input").val("");
	$("#active-object-height").val("");
	$("#active-object-color").val("");
	$("#mesh-manager-list").jstree("deselect_all");
}
function moveCursor (x, y, z) {
    cursor.position.set(x, y + 0.1, z);
}
$container.mousedown(function(e) {
	e.preventDefault();
	
    // Create vector in click position
    var vector = new THREE.Vector3((e.clientX/window.innerWidth) * 2 - 1, - (e.clientY/window.innerHeight) * 2 + 1, .5);
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    
    switch (e.which) {
        case 1: // primary button
            var intersects = raycaster.intersectObject(plane);;
			console.log(intersects);
            switch (action) {
                case "drawing":
                    if (intersects[0]) {
                        var point = new THREE.Vector2(intersects[0].point.x, intersects[0].point.z);
                        activeShapeAssistant.userShapePoints.push(point);
                        saveLine = true;
                    }
                    break;
                default:
                    if (intersects[0])
                        moveCursor(intersects[0].point.x, 0, intersects[0].point.z); // move cursor
                    break;
            }
            break;
            
        case 2: // wheel button
            break;
            
        case 3: // secondary button
            // Check objects that collide with the vector
            var intersects = raycaster.intersectObjects(objects);
	
	        // We click somewhere on the map
	        unselectObject();
	
            if (intersects.length > 0) { // if we clicked on a object/building
		        selectObject(intersects[0].object.idLogic);
            }
            else {
				selectObject(0);
			}
            break;
    }
});*/
// Avoid context menu in container
$container.bind("contextmenu",function(e) {
    return false;
});

var mouseXpos = 0;
var mouseYpos = 0;
$(function() {
    var leftButtonDown = false;
    var middleButtonDown = false;
    $container.mousedown(function(e){
        // Left mouse button was pressed, set flag
        if (e.which === 1) leftButtonDown = true;
        // Middle mouse button was pressed, set flag
        else if (e.which === 2) middleButtonDown = true;
    });
    $container.mouseup(function(e){
        // Left mouse button was released, clear flag
        if (e.which === 1) leftButtonDown = false;
        // Middle mouse button was released, clear flag
        else if (e.which === 2) middleButtonDown = false;
    });

    function tweakMouseMoveEvent(e){
        // If left button is not set, set which to 0
        // This indicates no buttons pressed
        if (e.which === 1 && !leftButtonDown) e.which = 0;
    }

    $container.mousemove(function(e) {
        var newmouseXpos = e.pageX;
        var newmouseYpos = e.pageY;
        
        // Call the tweak function to check for LMB and set correct e.which
        tweakMouseMoveEvent(e);
        
        /*if (action === "drawing") {
            if (activeShapeAssistant.userShapePoints.length > 0) {
                // Create vector in click position
                var vector = new THREE.Vector3((e.clientX/window.innerWidth) * 2 - 1, - (e.clientY/window.innerHeight) * 2 + 1, .5);
                projector.unprojectVector(vector, camera);
                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
                var intersects = raycaster.intersectObject(plane);
                if (intersects[0]) {
                    if (typeof newLine !== "undefined") {
                        if (!saveLine) {
                            scene.remove(newLine);
                        }
                        else {
                            scene.remove(newLine);
                            activeShapeAssistant.lineAssistant.push(newLine);
                            scene.add(activeShapeAssistant.lineAssistant[activeShapeAssistant.lineAssistant.length-1]);
                            saveLine = false;
                        }
                    }
                    var lastPoint = new THREE.Vector3(activeShapeAssistant.userShapePoints[activeShapeAssistant.userShapePoints.length-1].x, 1, activeShapeAssistant.userShapePoints[activeShapeAssistant.userShapePoints.length-1].y);
                    var mousePoint = new THREE.Vector3(intersects[0].point.x, 1, intersects[0].point.z);
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(lastPoint);
                    geometry.vertices.push(mousePoint);
                    newLine = new THREE.Line(geometry, activeShapeAssistant.material);
                    scene.add(newLine);
                }
            }
        }*/
        
        if (middleButtonDown) {
            if (newmouseXpos !== mouseXpos) {
                rotateCamera((mouseXpos - newmouseXpos)/8);
                console.log((mouseXpos - newmouseXpos)/8);
            }
            
            if (newmouseYpos > mouseYpos) {
                //rotateCamera("up");
            }
            else if (newmouseYpos < mouseYpos) {
                //rotateCamera("down");
            }
        }
        mouseXpos = newmouseXpos;
        mouseYpos = newmouseYpos;
    });
});

// Zoom
$container.mousewheel(function(e, delta) {
	zoom(delta);
});
