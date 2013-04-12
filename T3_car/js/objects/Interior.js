/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Interior = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.Interior.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Interior, T3.CarPart);

T3.Interior.prototype.materialOptions = {
    ambient: '#ffffff',     // ambient
    color: '#1f2c3e',       // diffuse
    specular: '#1f2c3e',    // specular
    shininess: 0.4 * 128    // shininess
};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Interior.prototype.init = function (config) {
    return this;
};

T3.Interior.prototype.update = function (delta) {
};
