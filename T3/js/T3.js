/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:36 AM
 * To change this template use File | Settings | File Templates.
 */

// globals
var scene,
    T3 = {
        model: {},
        controller: {},
        view: {}
    };


/**
 * An object in this world has a dimension equal to its
 * real size times T3.scale
 * @type {number}
 */
T3.scale = 10;

/**
 * Retina displays have twice the pixel ratio
 * @type {Function}
 */
T3.devicePixelRatio = window.devicePixelRatio || 1;

/**
 * List of intersectable meshes
 * @type {Array}
 */
T3.intersectable = [];

T3.inheritFrom = function (subClass, superClass) {
    var prototype;

    if (arguments.length !== 2) {
        throw new Error("T3.inheritFrom(): method needs 2 arguments");
    }

    // function used to create an object whose [[Prototype]] link
    // points to `object`
    function clone(object) {
        var F = function () {};
        F.prototype = object;
        return new F();
    }

    prototype = clone(superClass.prototype);

    prototype.constructor = subClass;
    subClass.prototype = prototype;
    subClass.superclass = superClass.prototype;
};

/**
 * Creates a mesh given its geometry, material and afterOptions
 * @param options
 * @returns {THREE.Mesh}
 */
T3.createMesh = function (options) {
    var mesh;
    mesh = new THREE.Mesh( options.geometry, options.material );
    mesh.scale.set( options.scale || 1, options.scale || 1, options.scale || 1);
    mesh.position.set( options.x || 0, options.y || 0, options.z || 0);
    mesh.rotation.set( options.rx || 0, options.ry || 0, options.rz || 0);
    return mesh;
};

T3.traverse = function (object, callback) {
    var i,
        inner;
    if (object.children) {
        for (i = 0; i < object.children.length; i += 1) {
            inner = object.children[i];
            if (inner instanceof THREE.Mesh) {
                callback(inner);
            } else {
                T3.traverse(inner, callback);
            }
        }
    }
};

T3.assert = function (condition) {
    if (!condition) {
        throw new Error('Assertion failed');
    }
};