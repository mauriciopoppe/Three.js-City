/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var RoundBlock;

    RoundBlock = function (config) {
        config = config || {};

        /**
         * Width of this Box
         * @type {number}
         */
        this.width = config.width || 10;

        /**
         * Height of the Box
         * @type {number}
         */
        this.height = config.height || 20 + (Math.random() * 10);

        /**
         * Depth of the Box
         * @type {number}
         */
        this.depth = config.depth || 10;

        T3.model.Object3D.call(this, config);

        RoundBlock.prototype.init.call(this, config);
    };

    T3.inheritFrom(RoundBlock, T3.model.Object3D);

    /**
     * Init this building RoundBlock (it's made out of little boxes)
     * @chainable
     */
    RoundBlock.prototype.init = function () {
        var me = this,
            height = [0.6, 0.8, 1],
            proportion = [0.4, 0.3, 0.2],
            total = proportion.length,
            i, k,
            box,
            cylinder,
            group = [], groupSize = 2;


        // create boxes that make the RoundBlock
        var RoundBlockMaterialArray = me.generateRoundBlockMaterials('texture-glass-3');
        for (k = 0; k < groupSize; k += 1) {
            var wrap = new THREE.Object3D();
            for (i = 0; i < total; i += 1) {
                cylinder = new T3.model.Cylinder({
                    originalParent: wrap,
                    radius: Math.min(me.width * proportion[i], me.depth * proportion[i]) / 2,
                    height: me.height * height[i],
                    materialConfig: {
                        initialized: new THREE.MeshFaceMaterial(
                            RoundBlockMaterialArray
                        )
                    }
                });
                cylinder.position.y = cylinder.height * T3.scale / 2;
                cylinder.real.castShadow = true;
                cylinder.real.receiveShadow = true;
            }
            group.push(wrap);
        }

        // add buildings
        for (i = 0; i < groupSize; i += 1) {
            me.add(group[i]);
            group[i].position.x = me.width * (i ? 1 : -1) * 1.5;
            group[i].position.z = me.depth * (i ? 1 : -1) * 1.5;
        }

        // bridge
        box = new T3.model.Box({
            originalParent: me,
            width: T3.scale,
            height: T3.scale / 2,
            depth: Math.abs(group[0].position.z - group[1].position.z) / T3.scale,
            materialConfig: {
                initialized: new THREE.MeshFaceMaterial(me.generateRoundBlockMaterials('texture-glass-3-door'))
            }
        });
        box.real.castShadow = true;
        box.real.receiveShadow = true;
        box.position.y = box.height * T3.scale / 2;
        box.rotation.y = -Math.acos(Math.abs(group[0].position.x - group[1].position.x) /
            group[0].position.distanceTo(group[1].position));

        // base
        box = new T3.model.Box({
            originalParent: me,
            width: me.width,
            height: 0.2,
            depth: me.depth,
            materialConfig: {
                initialized: me.generateSidewalkMaterials()
            }
        });
        box.position.set(
            // x
            Math.random() * (me.width - box.width),
            // y
            box.height * T3.scale / 2,
            // z
            Math.random() * (me.depth - box.depth)
        );
        box.real.receiveShadow = true;

        return this;
    };

    RoundBlock.prototype.generateRoundBlockMaterials = function (name, uv) {
        var i,
            texture = T3.AssetLoader.get(name),
            materialConfig,
            faceMaterials = [],
            index;

        uv = uv || {};
        texture.repeat.set(uv.x || 1, uv.y || 1);
        materialConfig = [{
            bumpScale: 0.1,
            shininess: 32,
            map: texture,
            bumpMap: texture,
            specularMap: texture
        }];

        index = ~~(Math.random() * materialConfig.length);
        var avoid = [2, 3];

        for (i = 0; i < 6; i += 1) {
            if (avoid.indexOf(i) > -1) {     // top and bottom faces
                faceMaterials.push(new THREE.MeshBasicMaterial());
            } else {
                faceMaterials.push(new THREE.MeshPhongMaterial($.extend({
                    shininess: 10,
                    shading: THREE.SmoothShading
                }, materialConfig[index])));
            }
        }
        return faceMaterials;
    };

    RoundBlock.prototype.generateSidewalkMaterials = function () {
        var texture = T3.AssetLoader.get('texture-sidewalk-1');
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(5, 5);
        texture.anisotropy = 16;
        return new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: texture,
            specular: 0xffffff,
            color: 0xffffff,
            bumpScale: 3,
            shininess: 1,
            shading: THREE.SmoothShading
        });
    };

    RoundBlock.prototype.initDatGui = function () {
    };

    T3.model.RoundBlock = RoundBlock;
})();