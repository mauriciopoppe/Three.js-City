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

    // compatibility with objects that have a real property
    // that's different than itself
    var loader = T3.JSONChainLoader(),
        scale = 10,
        me = this;

    scene.remove(me);

    loader.register('obj/Skyline.body.js', function (geometry) {
        var me = this,
            body = new T3.Body({
                name: 'car-body',
                addToScene: false,
                folder: 'Car body',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.Body.prototype.materialOptions, me.bodyOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
    }, me);

    loader.register('obj/Skyline.windows.js', function (geometry) {
        var me = this,
            body = new T3.Window({
                name: 'car-windows',
                addToScene: false,
                folder: 'Car windows',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.Window.prototype.materialOptions, me.windowOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
    }, me);

    loader.register('obj/Skyline.exhaust.js', function (geometry) {
        var me = this,
            body = new T3.Exhaust({
                name: 'car-exhaust',
                addToScene: false,
                folder: 'Car exhaust and front',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.Exhaust.prototype.materialOptions, me.exhaustOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
    }, me);

    loader.register('obj/Skyline.lightsBack.js', function (geometry) {
        var me = this,
            body = new T3.LightsBack({
                name: 'car-lights-back',
                addToScene: false,
                folder: 'Car lights - Back',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.LightsBack.prototype.materialOptions, me.lightsBackOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
    }, me);

    loader.register('obj/Skyline.lightsFront.js', function (geometry) {
        var me = this,
            body = new T3.LightsFront({
                name: 'car-lights-front',
                addToScene: false,
                folder: 'Car lights - Front',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.LightsFront.prototype.materialOptions, me.lightsFrontOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
    }, me);

    loader.register('obj/Skyline.interior.js', function (geometry) {
        var me = this,
            body = new T3.Interior({
                name: 'car-interior',
                addToScene: false,
                folder: 'Car interior',
                real: T3.createMesh({
                    geometry: geometry,
                    material: new THREE.MeshPhongMaterial(
                        $.extend(T3.Interior.prototype.materialOptions, me.interiorOptions)
                    ),
                    scale: scale
                })
            });
        me.add(body.real);
        scene.add(me);
    }, me);

    loader.execute();

    return this;
};

T3.Car.prototype.update = function (delta) {
//    this.rotation.y += 0.01;
};
