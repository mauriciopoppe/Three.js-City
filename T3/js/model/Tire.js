/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Tire = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        Tire.prototype.init.call(this, config);
    };

    T3.inheritFrom(Tire, T3.model.Mesh);

    Tire.prototype.materialOptions = {
        ambient: '#000000',     // ambient
        color: '#111111',       // diffuse
        specular: '#0f0f0f',    // specular
        shininess: 16,          // shininess
        wireframe: false
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Tire.prototype.init = function (config) {
//        this.real.castShadow = true;
        return this;
    };

    Tire.prototype.initDatGui = function () {
    };

    T3.model.Tire = Tire;
})();