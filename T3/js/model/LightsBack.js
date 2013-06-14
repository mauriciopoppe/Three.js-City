/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var LightsBack = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        LightsBack.prototype.init.call(this, config);
    };

    T3.inheritFrom(LightsBack, T3.model.Mesh);

    LightsBack.prototype.materialOptions = {
        ambient: '#e63a3a',     // ambient
        color: '#983a3a',       // diffuse
        specular: '#f20000',    // specular
        shininess: 0.156 * 128, // shininess
        wireframe: false
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    LightsBack.prototype.init = function (config) {
        return this;
    };

    LightsBack.prototype.update = function (delta) {
    };

    T3.model.LightsBack = LightsBack;

})();