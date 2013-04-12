/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:36 AM
 * To change this template use File | Settings | File Templates.
 */

// globals
var scene,
    T3 = {};

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

T3.JSONChainLoader = function () {

    var queue = [],
        loader = new THREE.JSONLoader();

    var executeNextInQueue = function (index) {
        if (index < queue.length) {
            var element = queue[index];
            loader.load(element.url, function (geometry) {
                element.callback.call(element.scope, geometry);
                executeNextInQueue(index + 1);
            });
        }
    };

    return {
        register: function (url, callback, scope) {
            queue.push({
                url: url,
                callback: callback,
                scope: scope
            });
        },
        execute: function () {
            executeNextInQueue(0);
        }
    };
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