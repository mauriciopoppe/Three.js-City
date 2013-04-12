/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Car = function (config) {
    config = config || {};

    T3.Object3D.call(this, config);

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

    T3.Car.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Car, T3.Object3D);

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Car.prototype.init = function (config) {
    var me = this;

    var body = new T3.Body({
        name: 'car-body',
        folder: 'Car body',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.body.js'
        },
        meshOptions: { materialOptions: me.bodyOptions }
    });

    var exhaust = new T3.Exhaust({
        name: 'car-exhaust',
        folder: 'Car exhaust and front',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.exhaust.js'
        },
        meshOptions: { materialOptions: me.exhaustOptions }
    });

    var windows = new T3.Window({
        name: 'car-windows',
        folder: 'Car Windows',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.windows.js'
        },
        meshOptions: { materialOptions: me.windowOptions }
    });

    var lightsBack = new T3.LightsBack({
        name: 'car-lights-back',
        folder: 'Car lights - Back',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.lightsBack.js'
        },
        meshOptions: { materialOptions: me.lightsBackOptions }
    });

    var lightsFront = new T3.LightsFront({
        name: 'car-lights-front',
        folder: 'Car lights - Front',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.lightsFront.js'
        },
        meshOptions: { materialOptions: me.lightsFrontOptions }
    });

    var interior = new T3.Interior({
        name: 'car-interior',
        folder: 'Car interior',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.interior.js'
        },
        meshOptions: { materialOptions: me.interiorOptions }
    });

    return this;
};

T3.Car.prototype.initDatGui = function (gui) {
    var me = this,
        folder = gui.addFolder('Car Mesh');
    folder
        .add(me, 'visible')
        .name('Show mesh')
        .onFinishChange(function (value) {
            T3.Utils.traverse(me, function (object) {
                object.visible = value;
            });
        });
};

T3.Car.prototype.update = function (delta) {
    this.rotation.y += 0.01;
};
