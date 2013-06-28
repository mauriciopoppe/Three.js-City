/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Cylinder;

    Cylinder = function (config) {
        config = config || {};

        /**
         * Height of this cylinder building
         * @type {number}
         */
        this.height = config.height || 10 + (Math.random() * 30);

        /**
         * The cylinder building is built with a radius equal to the minimum
         * between the width and the depth of this building
         * @type {number}
         */
        this.radius = config.radius || 100;

        /**
         * Radius segments of this cylinder building
         * @type {number}
         */
        this.radiusSegments = config.radiusSegments || 64;

        T3.model.Building.call(this, config);

        Cylinder.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Cylinder, T3.model.Building);

    Cylinder.prototype.fixConfig = function (config) {
        var defaults = {
            geometryConfig: {
                initialized: new THREE.CylinderGeometry(
                    this.radius, this.radius, this.height, this.radiusSegments, 1)
            },
            materialConfig: {
                type: 'MeshPhongMaterial',
                options: {}
            }
        };
        $.extend(defaults, config);

        return defaults;
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Cylinder.prototype.init = function (config) {
        var me = this;
        me.real.matrixAutoUpdate = false;
        me.real.updateMatrix();
        return this;
    };
    
    T3.model.Cylinder = Cylinder;
})();