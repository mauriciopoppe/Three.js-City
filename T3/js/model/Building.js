/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Building;

    Building = function (config) {
        config = config || {};

        config = this.fixConfig(config);

        T3.model.Mesh.call(this, config);

        Building.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Building, T3.model.Mesh);

    Building.prototype.fixConfig = function (config) {
        return config;
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Building.prototype.init = function (config) {
        return this;
    };

    Building.prototype.initDatGui = function () {
    };

    T3.model.Building = Building;
})();