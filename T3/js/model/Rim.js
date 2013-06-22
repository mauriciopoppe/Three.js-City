/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Rim = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        Rim.prototype.init.call(this, config);
    };

    T3.inheritFrom(Rim, T3.model.Mesh);

    Rim.prototype.materialOptions = {
        ambient: '#ffffff',     // ambient
        color: '#464646',       // diffuse
        specular: '#f0f0f0',    // specular
        shininess: 128,         // shininess
        wireframe: false
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Rim.prototype.init = function (config) {
//        this.real.castShadow = true;
        return this;
    };

    Rim.prototype.initDatGui = function () {
    };

    T3.model.Rim = Rim;
})();