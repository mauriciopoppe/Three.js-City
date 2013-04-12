/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Window = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.Window.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Window, T3.CarPart);

T3.Window.prototype.materialOptions = {
    ambient: '#000000',     // ambient
    color: '#111111',       // diffuse
    specular: '#0f0f0f',    // specular
    shininess: 0.4 * 128,    // shininess
    transparent: true,
    opacity: 0.75
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Window.prototype.init = function (config) {
    return this;
};

T3.Window.prototype.initDatGui = function (gui) {
    var me = this,
        folder = T3.Window.superclass.initDatGui.call(this, gui);
    folder
        .add(me.materialOptions, 'opacity', 0.0, 1.0)
        .name('Opacity')
        .onChange(function (value) {
            me.real.material.opacity = value;
        });
};

T3.Window.prototype.update = function (delta) {
};
