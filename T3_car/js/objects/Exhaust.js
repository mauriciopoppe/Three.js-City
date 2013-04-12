/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Exhaust = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.Exhaust.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Exhaust, T3.CarPart);

T3.Exhaust.prototype.materialOptions = {
    ambient: '#000000',     // ambient
    color: '#111111',       // diffuse
    specular: '#0f0f0f',    // specular
    shininess: 0.4 * 128    // shininess
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Exhaust.prototype.init = function (config) {
    return this;
};

T3.Exhaust.prototype.update = function (delta) {
};
