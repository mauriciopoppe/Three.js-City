/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Box;

    Box = function (config) {
        config = config || {};

        /**
         * Width of this Box
         * @type {number}
         */
        this.width = config.width || 10;

        /**
         * Height of the Box
         * @type {number}
         */
        this.height = config.height || 10 + (Math.random() * 30);

        /**
         * Depth of the Box
         * @type {number}
         */
        this.depth = config.depth || 10;

        T3.model.Building.call(this, config);

        Box.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Box, T3.model.Building);

    Box.prototype.materialOptions = {
        ambient: '#ffffff',     // ambient
        color: '#aaa',       // diffuse
        specular: '#aaa',    // specular
        shininess: 0.4 * 128,   // shininess
        wireframe: false
    };

    Box.prototype.fixConfig = function (config) {
        $.extend(config, {
            geometryConfig: {
                initialized: new THREE.CubeGeometry(this.width, this.height, this.depth)
            }
        });

        $.extend(this.materialOptions, {
        });

        return config;
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Box.prototype.init = function (config) {
        return this;
    };
    
    T3.model.Box = Box;
})();