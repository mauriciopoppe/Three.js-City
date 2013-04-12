/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.CarPart = function (config) {
    config = config || {};

    T3.Object3D.call(this, config);

    this.loader = null;

    this.meshOptions = null;

    T3.CarPart.prototype.init.call(this, config);
};

T3.inheritFrom(T3.CarPart, T3.Object3D);

T3.CarPart.prototype.materialOptions = {
    ambient: '#313131',     // ambient
    color: '#818181',       // diffuse
    specular: '#818181',    // specular
    shininess: 0.4 * 128    // shininess
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.CarPart.prototype.init = function (config) {
    var me = this,
        loader,
        defaults = {
            loader: {
                enabled: false,
                url: undefined,
                type: 'JSONLoader',
                callback: function(arguments) {
                    me.createRealObject(arguments);
                    me.parent.add(me.real);
                },
                scope: me
            },
            meshOptions: {
                type: 'MeshPhongMaterial',
                geometryOptions: null,
                materialOptions: null,
                afterOptions: null
            }
        };

    $.extend(true, defaults, config);

    // set
    me.loader = defaults.loader;
    me.meshOptions = defaults.meshOptions;

    if (me.loader.enabled) {
        loader = new THREE[me.loader.type]();
        loader.load(me.loader.url, function (geometry) {
            me.loader.callback.call(me.loader.scope, geometry);
        });
    }

    return this;
};

/**
 * @template
 * Creates the real object (function executed when the method is ready to be called),
 * be sure to set me.real in this method for the callback to work
 * @param geometry
 */
T3.CarPart.prototype.createRealObject = function (geometry) {
    var me = this;
    me.real = T3.createMesh({
        geometry: geometry,
        material: new THREE[me.meshOptions.type](
            $.extend(
                me.materialOptions,
                me.meshOptions.materialOptions
            )
        ),
        scale: 10
    });
};

T3.CarPart.prototype.initDatGui = function (gui) {
    var me = this,
        folder = gui.addFolder(me.folder);
    folder
        .add(me, 'visible')
        .name('Show mesh')
        .onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.real);
        });

    folder
        .addColor(me.materialOptions, 'ambient')
        .name('Ambient')
        .onChange(function (value) {
            me.real.material.ambient.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .addColor(me.materialOptions, 'color')
        .name('Color')
        .onChange(function (value) {
            me.real.material.color.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .addColor(me.materialOptions, 'specular')
        .name('Specular')
        .onChange(function (value) {
            me.real.material.specular.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .add(me.materialOptions, 'shininess', 0, 128)
        .name('Shininess')
        .onChange(function (value) {
            me.real.material.shininess = value;
        });
    return folder;
};
