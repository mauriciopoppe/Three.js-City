/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Block;

    Block = function (config) {
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
        this.height = config.height || 10 + (Math.random() * 10);

        /**
         * Depth of the Box
         * @type {number}
         */
        this.depth = config.depth || 10;

        T3.model.Object3D.call(this, config);

        Block.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Block, T3.model.Object3D);

    /**
     * Init this building block (it's made out of little boxes)
     * @chainable
     */
    Block.prototype.init = function () {
        var me = this;
        me.createBlocks();
//        me.real = new THREE.Mesh(
//            new THREE.CubeGeometry(
//                me.width * T3.scale,
//                me.height * T3.scale,
//                me.depth * T3.scale
//            ),
//            new THREE.MeshNormalMaterial()
//        );
//        me.add(me.real);
//        me.real.position.set(
//            me.width * T3.scale / 2,
//            me.height * T3.scale / 2,
//            me.depth * T3.scale / 2
//        );

        me.createLights();
    };

    /**
     * Lamps created in each block
     * @type {Array}
     */
    Block.prototype.lamps = [];

    /**
     * Creates a series of stacked boxes applying a texture to each one
     * of them,
     * @chainable
     */
    Block.prototype.createBlocks = function () {
        var me = this,
            height = [1, 0.8, 0.5],
            textures = ['texture-glass', 'texture-glass_2', 'texture-residential'],
            total = height.length,
            i,
            box;

        // create boxes that make the block
        var blockFaceMaterial = me.generateFaceMaterials(textures);
        for (i = 0; i < total; i += 1) {
            box = new T3.model.Box({
                originalParent: me,
                // from the 80% of parent's width the width will be in the range
                // 50% <= width <= 100 which is 40% <= width <= 80%
                width: 0.8 * me.width * (0.5 + 0.5 * Math.random()),
                height: me.height * height[i] * (0.3 + 0.7 * Math.random()),
                depth: 0.8 * me.depth * (0.5 + 0.5 * Math.random()),
                materialConfig: {
                    initialized: new THREE.MeshFaceMaterial(
                        blockFaceMaterial
                    )
                }
            });
            box.position.set(
                // x
                0.1 * me.width +
                    Math.random() * (me.width * 0.8 - box.width),
                // y
                box.height * T3.scale / 2,
                // z
                0.1 * me.depth +
                    Math.random() * (me.depth * 0.8 - box.depth)
            );
            box.real.receiveShadow = true;
            box.real.castShadow = true;
        }

        // base block
        box = new T3.model.Box({
            originalParent: me,
            width: me.width,
            height: 0.2,
            depth: me.depth,
            materialConfig: {
                initialized: new THREE.MeshFaceMaterial(
                    me.generateFaceMaterials(
                        T3.AssetLoader.get('texture-sidewalk'),
                        []
                    )
                )
            }
        });
        box.real.receiveShadow = true;

        return this;
    };

    /**
     * Each box may have a texture in each side, this method creates an array
     * of materials used in each side (basic materials with textures), also
     * each value of the `avoid` array doesn't have a texture (the avoid array
     * is an array of avoided faces e.g. [2, 3] for the top and bottom faces)
     * @param textures
     * @param [avoid]
     * @returns {Array}
     */
    Block.prototype.generateFaceMaterials = function (textures, avoid) {
        var i,
            texture,
            faceMaterials = [];
        avoid = avoid || [2, 3];

        if (textures instanceof THREE.Texture) {
            texture = textures;
        } else {
            // must be an array
            texture = T3.AssetLoader.get(textures[~~(Math.random() * textures.length)]);
        }
        for (i = 0; i < 6; i += 1) {
            if (avoid.indexOf(i) > -1) {     // top and bottom faces
                faceMaterials.push(new THREE.MeshBasicMaterial());
            } else {
                faceMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
            }
        }
        return faceMaterials;
    };

    /**
     * Creates the lights in each block, it can create 4 lights at each corner
     * of the block, currently it's creating 2 lights at random places
     */
    Block.prototype.createLights = function () {
        var me = this,
            i,
            light,
            dx = [-1, -1, 1, 1],
            dy = [1, -1, -1, 1],
            total = dx.length,
            selected = ~~(Math.random() * total);

        for (i = 0; i < total / 2; i += 1) {
            light = me.createLamp(me);
            light.position.set(
                dx[selected] * me.width * T3.scale / 2 * 0.9,
                0,
                dy[selected] * -me.depth * T3.scale / 2 * 0.9
            );
            light.matrixAutoUpdate = false;
            light.updateMatrix();
            selected = (selected + 2) % total;
            me.lamps.push(light);
        }
    };

    /**
     * Creates the base lamp, a stick and a X like decoration
     * @param parent
     * @returns {T3.model.Object3D}
     */
    Block.prototype.createLamp = function (parent) {
        var base,
            left,
            right,
            lightContainer;
        lightContainer = new T3.model.Object3D({
            originalParent: parent
        });

        // base
        base = new T3.model.Box({
            originalParent: lightContainer,
            width: 0.2,
            depth: 0.2,
            height: 7
        });
        base.position.y = base.height * T3.scale / 2;
        lightContainer.base = base;

        // top left
        left = new T3.model.Box({
            originalParent: lightContainer,
            width: 0.2,
            depth: 0.2,
            height: 3
        });
        left.rotation.x = -Math.PI / 2;
        left.position.y = base.height * T3.scale;

        right = new T3.model.Box({
            originalParent: lightContainer,
            width: 0.2,
            depth: 0.2,
            height: 3
        });
        right.rotation.z = -Math.PI / 2;
        right.position.y = base.height * T3.scale;

        lightContainer.topXLike = right;
        return lightContainer;
    };

    T3.model.Block = Block;
})();