/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Park;

    Park = function (config) {
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
//        this.height = config.height || 20 + (Math.random() * 30);
        this.height = config.height || 10 + (Math.random() * 30);

        /**
         * Depth of the Box
         * @type {number}
         */
        this.depth = config.depth || 10;

        T3.model.Object3D.call(this, config);

        Park.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Park, T3.model.Object3D);

    /**
     * Init this building Park (it's made out of little boxes)
     * @chainable
     */
    Park.prototype.init = function () {
        var me = this;
        // base
        me.createBase();
        return this;
    };

    Park.prototype.createBase = function () {
        var me = this,
            i,
            margin = 15,
            width = me.width / 2 * T3.scale,
            depth = me.depth / 2 * T3.scale,
            dx = [
                0, 0,
                me.width / 2, me.width / 2
            ],
            dz = [
                0, me.depth / 2,
                0, me.depth / 2
            ],
            base;

        // sidewalk
        base = new T3.model.Box({
            originalParent: me,
            width: me.width,
            height: 0.2,
            depth: me.depth,
            materialConfig: {
                initialized: me.generateSidewalkMaterials('texture-sidewalk-1')
            }
        });
        base.position.set(0, base.height * T3.scale / 2, 0);
        base.real.receiveShadow = true;

        // trees & grass
        for (i = 0; i < 4; i += 1) {
            base = new THREE.Mesh(
                new THREE.PlaneGeometry(width - margin * 2, depth - margin * 2),
                me.generateSidewalkMaterials('texture-grass', {
                    bumpScale: 1
                })
            );
            base.rotation.x = Math.PI / 2;
            base.position.set(
                dx[i] * T3.scale - width / 2,
                2.5,
                dz[i] * T3.scale - depth / 2
            );
            base.receiveShadow = true;
            me.add(base);

            var tree = new T3.model.Tree();
            tree.position.set(
                // - width moves to the bottom left corner of the base
                // - width / 2 moves to the center of the grass
                dx[i] * T3.scale - width / 2,
                2.5,
                dz[i] * T3.scale - depth / 2
            );
            tree.scale.multiplyScalar(0.5 + Math.random() * 0.5);
            tree.rotation.y = Math.random() * 2 * Math.PI;
            me.add(tree);
        }

        // fountain
        T3.World.fountain = new T3.model.Fountain({
            originalParent: me
        });
    };

    Park.prototype.generateSidewalkMaterials = function (textureName, options) {
        var texture = T3.AssetLoader.get(textureName);
        options = options || {};
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(5, 5);
        texture.anisotropy = 16;
        return new THREE.MeshPhongMaterial($.extend({
            map: texture,
            bumpMap: texture,
            specular: 0xffffff,
            color: 0xffffff,
            bumpScale: options.bumpScale || 3,
            shininess: 1,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading
        }, options));
    };

    Park.prototype.initDatGui = function () {
    };

    T3.model.Park = Park;
})();