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

        /**
         * Instance of point light simulating the left light
         * @type {Object}
         */
        this.lightLeft = null;

        /**
         * Instance of point light simulating the left right
         * @type {Object}
         */
        this.lightRight = null;

        /**
         * Light intensity in idle mode
         * @type {number}
         */
        this.intensity = 3;

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
        var me = this,
            lightLeft,
            lightRight;
        me.lightLeft = lightLeft = new THREE.PointLight(0xff0000, me.intensity, 5);
        T3.ObjectManager.add('car-light-left', lightLeft);
        lightLeft.position.set(6, 9, -25);
        me.add(lightLeft);

        me.lightRight = lightRight= new THREE.PointLight(0xff0000, me.intensity, 5);
        T3.ObjectManager.add('car-light-right', lightRight);
        lightRight.position.set(-6, 9, -25);
        me.add(lightRight);

        return this;
    };

    LightsBack.prototype.update = function (delta, brakes) {
        var me = this;
        if (brakes) {
            me.lightLeft.intensity = 5;
            me.lightRight.intensity = 5;
        } else {
            me.lightLeft.intensity = me.intensity;
            me.lightRight.intensity = me.intensity;
        }
    };

    T3.model.LightsBack = LightsBack;

})();