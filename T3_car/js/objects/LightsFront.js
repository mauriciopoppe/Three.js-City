/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.LightsFront = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.LightsFront.prototype.init.call(this, config);
};

T3.inheritFrom(T3.LightsFront, T3.CarPart);

T3.LightsFront.prototype.materialOptions = {
    ambient: '#ffffff',     // ambient
    color: '#abac9b',       // diffuse
    specular: '#cac4c4',    // specular
    shininess: 18,          // shininess
    transparent: true,
    opacity: 0.75
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.LightsFront.prototype.init = function (config) {
    return this;
};

T3.LightsFront.prototype.initDatGui = function (gui) {
    var me = this,
        folder = T3.LightsFront.superclass.initDatGui.call(this, gui);
    folder
        .add(me.materialOptions, 'opacity', 0.0, 1.0)
        .name('Opacity')
        .onChange(function (value) {
            me.real.material.opacity = value;
        });
};

T3.LightsFront.prototype.update = function (delta) {
};
