/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Car;
    
    Car = function (config) {
        config = config || {};

        T3.model.Object3D.call(this, config);

        /**
         * Body options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.bodyOptions = config.bodyOptions;

        /**
         * Body options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.exhaustOptions = config.exhaustOptions;

        /**
         * lightsBack options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.lightsBackOptions = config.lightsBackOptions;

        /**
         * lightsFront options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.lightsFrontOptions = config.lightsFrontOptions;

        /**
         * window options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.windowOptions = config.windowOptions;

        /**
         * interior options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.interiorOptions = config.interiorOptions;

        /**
         * tire options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.tireOptions = config.tireOptions;

        /**
         * rim options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.rimOptions = config.rimOptions;

        Car.prototype.init.call(this, config);
    };

    T3.inheritFrom(Car, T3.model.Object3D);

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Car.prototype.init = function (config) {
        var me = this;

        var body = new T3.model.Body({
            name: 'car-body',
            folder: 'Car body',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-body-geometry') }
        });

        var exhaust = new T3.model.Exhaust({
            name: 'car-exhaust',
            folder: 'Car exhaust and dummy front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-exhaust-geometry') }
        });

        var windows = new T3.model.Window({
            name: 'car-windows',
            folder: 'Car windows',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-windows-geometry') }
        });

        var interior = new T3.model.Interior({
            name: 'car-interior',
            folder: 'Car interior',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-interior-geometry') }
        });

        var lfront = new T3.model.LightsFront({
            name: 'car-lights-front',
            folder: 'Car lights - front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-front-geometry') }
        });

        var lback = new T3.model.LightsBack({
            name: 'car-lights-back',
            folder: 'Car lights - back',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-back-geometry') }
        });

        return this;
    };

    Car.prototype.initDatGui = function (gui) {
        var me = this,
            folder = gui.addFolder('Car Mesh');
        folder
            .add(me, 'visible')
            .name('Show mesh')
            .onFinishChange(function (value) {
                T3.traverse(me, function (object) {
                    object.visible = value;
                });
            });
    };

    Car.prototype.update = function (delta) {
        this.rotation.y += 0.01;
    };

    T3.model.Car = Car;

})();