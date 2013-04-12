/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Body = function (config) {
    config = config || {};

    T3.CarPart.call(this, config);

    T3.Body.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Body, T3.CarPart);

T3.Body.prototype.materialOptions = {
    ambient: '#ffffff',     // ambient
    color: '#016b93',       // diffuse
    specular: '#016b93',    // specular
    shininess: 0.4 * 128    // shininess
};

// ALTERNATIVE: SILVER
//T3.Body.prototype.materialOptions = {
//    ambient: '#313131',     // ambient
//    color: '#818181',       // diffuse
//    specular: '#818181',    // specular
//    shininess: 0.4 * 128    // shininess
//};

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Body.prototype.init = function (config) {
    return this;
};

T3.Body.prototype.update = function (delta) {
};
