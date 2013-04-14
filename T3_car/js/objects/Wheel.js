/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Wheel = function (config) {
    config = config || {};

    T3.Object3D.call(this, config);

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

    T3.Wheel.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Wheel, T3.Object3D);

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Wheel.prototype.init = function (config) {
    var me = this;

    var body = new T3.Tire({
        name: 'car-tire',
        folder: 'Wheel body',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.body.js'
        },
        meshOptions: { materialOptions: me.tireOptions }
    });

    var exhaust = new T3.Exhaust({
        name: 'car-exhaust',
        folder: 'Wheel exhaust and front',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.exhaust.js'
        },
        meshOptions: { materialOptions: me.exhaustOptions }
    });

    var windows = new T3.Window({
        name: 'car-windows',
        folder: 'Wheel Windows',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.windows.js'
        },
        meshOptions: { materialOptions: me.windowOptions }
    });

    var lightsBack = new T3.LightsBack({
        name: 'car-lights-back',
        folder: 'Wheel lights - Back',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.lightsBack.js'
        },
        meshOptions: { materialOptions: me.lightsBackOptions }
    });

    var lightsFront = new T3.LightsFront({
        name: 'car-lights-front',
        folder: 'Wheel lights - Front',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.lightsFront.js'
        },
        meshOptions: { materialOptions: me.lightsFrontOptions }
    });

    var interior = new T3.Interior({
        name: 'car-interior',
        folder: 'Wheel interior',
        originalParent: me,
        loader: {
            enabled: true,
            url: 'obj/Skyline.interior.js'
        },
        meshOptions: { materialOptions: me.interiorOptions }
    });

    // wheel
    var wheel = new T3.Wheel({

    });

    return this;
};

T3.Wheel.prototype.initDatGui = function (gui) {
};

T3.Wheel.prototype.update = function (delta) {
};
