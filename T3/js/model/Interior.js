/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var Interior = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        Interior.prototype.init.call(this, config);
    };

    T3.inheritFrom(Interior, T3.model.Mesh);

    Interior.prototype.materialOptions = {
        ambient: '#ffffff',     // ambient
        color: '#1f2c3e',       // diffuse
        specular: '#1f2c3e',    // specular
        shininess: 0.4 * 128,   // shininess
        wireframe: false
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Interior.prototype.init = function (config) {
        return this;
    };

    T3.model.Interior = Interior;
})();