/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/12/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
T3.Utils = {
    traverse: function (object, callback) {
        var i,
            inner;
        if (object.children) {
            for (i = 0; i < object.children.length; i += 1) {
                inner = object.children[i];
                if (inner instanceof THREE.Mesh) {
                    callback(inner);
                } else {
                    T3.Utils.traverse(inner, callback);
                }
            }
        }
    }
};