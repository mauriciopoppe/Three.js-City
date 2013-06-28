/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Body;

    Body = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);
    
        Body.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Body, T3.model.Mesh);
    
    // ALTERNATIVE: BLUE
    Body.prototype.materialOptions = {
        ambient: '#ffffff',     // ambient
        color: '#016b93',       // diffuse
        specular: '#408de3',    // specular
        shininess: 0.4 * 128,   // shininess
        wireframe: false
    };
    
    // ALTERNATIVE: SILVER
//    Body.prototype.materialOptions = {
//        ambient: '#313131',     // ambient
//        color: '#818181',       // diffuse
//        specular: '#818181',    // specular
//        shininess: 0.4 * 128,   // shininess
//        wireframe: false
//    };

    // ALTERNATIVE: RED
    //Body.prototype.materialOptions = {
    //    ambient: '#ffffff',     // ambient
    //    color: '#4d0000',       // diffuse
    //    specular: '#be2323',    // specular
    //    shininess: 0.4 * 128,   // shininess
    //    wireframe: false
    //};

    //ALTERNATIVE: METALLIC SILVER
//    Body.prototype.materialOptions = {
//        ambient: '#ffffff',     // ambient
//        color: '#464646',       // diffuse
//        specular: '#f0f0f0',    // specular
//        shininess: 51,          // shininess
//        wireframe: false
//    };
    
    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Body.prototype.init = function (config) {
        var me = this,
            cube = T3.ObjectManager.get('camera-cube');

        T3.intersectable.push(me.real);

        me.real.geometry.dynamic = true;
        // materials (to enable dynamic material change)
        me.materials = [
            me.real.material,
            new THREE.MeshPhongMaterial({
                ambient: '#ffffff',
                color: '#464646',
                specular: '#f0f0f0',
                envMap: cube && cube.renderTarget,
                shininess: 51
            })
        ];
        me.real.receiveShadow = true;
        return this;
    };

    Body.prototype.updateMaterial = function (value) {
        var me = this;
        me.real.material = me.materials[~~value];
        me.real.material.needsUpdate = true;
    };

    T3.model.Body = Body;
})();