/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.LightsBack = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.LightsBack.prototype.init.call(this, config);
};

T3.inheritFrom(T3.LightsBack, T3.CarPart);

T3.LightsBack.prototype.materialOptions = {
    ambient: '#e63a3a',     // ambient
    color: '#983a3a',       // diffuse
    specular: '#f20000',    // specular
    shininess: 0.156 * 128    // shininess
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.LightsBack.prototype.init = function (config) {
    return this;
};

T3.LightsBack.prototype.update = function (delta) {
};
