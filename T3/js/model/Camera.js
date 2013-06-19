/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Camera;
    Camera = function (config) {
        config = config || {};

        T3.model.Object3D.call(this, config);

        /**
         * Pan controls if any
         * @type {Object}
         */
        this.cameraControls = null;

        Camera.prototype.init.call(this, config);
    };

    Camera.near = 1;
    Camera.far = 10000;

    T3.inheritFrom(Camera, T3.model.Object3D);

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Camera.prototype.init = function (config) {
        var defaults = {
            renderer: null,
            type: 'PerspectiveCamera',
            fov: 38,
            ratio: window.innerWidth / window.innerHeight,
            near: Camera.near,
            far: Camera.far,
            position: new THREE.Vector3(100, 100, 100)
        }, camera;

        $.extend(defaults, config);

        if (defaults.renderer == null) {
            console.log('[WARN]: The renderer is null');
        }

        camera = this.real = new THREE[defaults.type](
            defaults.fov,
            defaults.ratio,
            defaults.near,
            defaults.far
        );
        camera.position = defaults.position;
        // transparently support window resize
        THREEx.WindowResize.bind(defaults.renderer, camera);

        if (config.cameraPan) {
            this.cameraControls = new THREE.OrbitAndPanControls(camera, defaults.renderer.domElement);
            // avoid panning to see the bottom face
            this.cameraControls.maxPolarAngle = Math.PI / 2 * 0.99;
            this.cameraControls.target.set(0, 10, 10);
        }
        return this;
    };

    Camera.prototype.update = function (delta) {
        this.cameraControls && this.cameraControls.update(delta);
    };

    Camera.prototype.lookAt = function (vector) {
        var me = this;
        if (me.cameraControls) {
            // instance of OrbitAndPanControls
            me.cameraControls.target.set(vector.x, vector.y, vector.z);
        } else {
            scene.add(me.real);
            me.real.lookAt(vector);
            me.add(me.real);
        }
    };

    T3.model.Camera = Camera;
})();