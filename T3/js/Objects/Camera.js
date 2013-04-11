/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Camera = function (config) {
    config = config || {};

    T3.Object3D.call(this, config);

    /**
     * Pan controls if any
     * @type {Object}
     */
    this.cameraControls = null;

    T3.Camera.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Camera, T3.Object3D);

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Camera.prototype.init = function (config) {
    var defaults = {
        type: config.type || 'PerspectiveCamera',
        fov: config.fov || 38,
        ratio: config.ratio || window.innerWidth / window.innerHeight,
        near: config.near || 1,
        far: config.far || 10000,
        position: config.position || new THREE.Vector3(0, 0, 0)
    }, camera;
    camera = this.real = new THREE[defaults.type](
        defaults.fov,
        defaults.ratio,
        defaults.near,
        defaults.far
    );
    camera.position = config.position;
    // transparently support window resize
    THREEx.WindowResize.bind(config.renderer, camera);

    if (config.cameraPan) {
        this.cameraControls = new THREE.OrbitAndPanControls(camera, config.renderer.domElement);
        this.cameraControls.target.set(0, 0, 0);
    }
    return this;
};

T3.Camera.prototype.update = function (delta) {
    this.cameraControls && this.cameraControls.update(delta);
};