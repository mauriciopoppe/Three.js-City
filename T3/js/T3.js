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