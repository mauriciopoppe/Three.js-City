/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Exhaust = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        Exhaust.prototype.init.call(this, config);
    };

    T3.inheritFrom(Exhaust, T3.model.Mesh);

    Exhaust.prototype.materialOptions = {
        ambient: '#000000',     // ambient
        color: '#111111',       // diffuse
        specular: '#0f0f0f',    // specular
        shininess: 0.4 * 128,   // shininess
        wireframe: false
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Exhaust.prototype.init = function (config) {
        return this;
    };

    T3.model.Exhaust = Exhaust;
})();