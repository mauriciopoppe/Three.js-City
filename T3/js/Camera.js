/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
T3.Camera = {
    id: 0,
    activeCamera: '0',

    // private
    registeredCameras: {},

    createCamera: function (config) {
        config = config || {};
        if (!config.renderer) {
            throw new Error('T3.Camera.createCamera(): renderer required');
        }
        var defaults = {
            name: config.name || this.id++,
            type: config.type || 'PerspectiveCamera',
            fov: config.fov || 38,
            ratio: config.ratio || window.innerWidth / window.innerHeight,
            near: config.near || 1,
            far: config.far || 1000
        };

        var camera = THREE[defaults.name](
            defaults.fov,
            defaults.ratio,
            defaults.near,
            defaults.far
        );

        // transparently support window resize
        THREEx.WindowResize.bind(config.renderer, camera);

        if (config.cameraPan) {
            camera.panControls = new THREE.OrbitAndPanControls(camera, config.renderer.domElement);
            camera.panControls.cameraControls.target.set(0, 120, 0);
        }

        // update object
        camera.update = config.update || function () {};

        // register the camera
        this.registeredCameras[defaults.name] = camera;

        return camera;
    },

    getCamera: function (name) {
        return this.registeredCameras[name];
    },

    getActiveCamera: function () {
        return this.registeredCameras[this.activeCamera];
    },

    setActiveCamera: function (name) {
        if (this.registeredCameras[name]) {
            this.activeCamera = name;
        } else {
            console.log('[WARN] T3.Camera.setActiveCamera(): can\'t find a camera with that name');
        }
    }
};