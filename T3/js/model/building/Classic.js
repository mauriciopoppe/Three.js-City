/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Classic,
        id = 0;

    Classic = function (config) {
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
        this.height = config.height || 20 + (Math.random() * 30);

        /**
         * Depth of the Box
         * @type {number}
         */
        this.depth = config.depth || 10;

        T3.model.Object3D.call(this, config);

        Classic.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Classic, T3.model.Object3D);

    /**
     * Init this building Classic (it's made out of little boxes)
     * @chainable
     */
    Classic.prototype.init = function () {
        var me = this,
            color = '#555',
            proportion = [0.8, 0.7, 0.5, 0.3],
            height = [0.6, 0.8, 0.9, 1],
            total = proportion.length,
            i,
            j,
            box,
            tetrahedron,
            textures = ['texture-office'],
            texture = T3.AssetLoader.get(textures[~~(Math.random() * textures.length)]),
            faceMaterials;

        // create boxes that make the Classic
        for (i = 0; i < total; i += 1) {
            faceMaterials= [];
            for (j = 0; j < 6; j += 1) {
                if (j == 2 || j == 3) {     // top and bottom faces
                    faceMaterials.push(new THREE.MeshBasicMaterial());
                } else {
                    faceMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
                }
            }
            box = new T3.model.Box({
                originalParent: me,
                width: me.width * proportion[i],
                height: me.height * height[i],
                depth: me.depth * proportion[i],
                materialConfig: {
                    initialized: new THREE.MeshFaceMaterial(faceMaterials)
                }
            });
            box.position.set(
                // x
                (me.width - box.width) / 2,
                // y
                box.height * T3.scale / 2,
                // z
                (me.depth - box.depth) / 2
            );
            box.real.castShadow = true;
            box.real.receiveShadow = true;
        }

        // top
        tetrahedron = new T3.model.Mesh({
            originalParent: me,
            geometryConfig: {
                initialized: me.createPyramid(
                    box.width, box.depth
                )
            },
            materialConfig: {
                initialized: new THREE.MeshBasicMaterial({
                    color: color,
                    side: THREE.DoubleSide
                })
            }
        });
        tetrahedron.position.set(box.width, me.height * T3.scale, box.depth);

        // base
        box = new T3.model.Box({
            originalParent: me,
            width: me.width,
            height: 0.2,
            depth: me.depth
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

    Classic.prototype.initDatGui = function () {
    };

    Classic.prototype.createPyramid = function (width, depth) {
        var geometry;
        width /= 2;
        depth /= 2;
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(width, 0, depth));
        geometry.vertices.push(new THREE.Vector3(-width, 0, depth));
        geometry.vertices.push(new THREE.Vector3(-width, 0, -depth));
        geometry.vertices.push(new THREE.Vector3(width, 0, -depth));
        geometry.vertices.push(new THREE.Vector3(0, 1 + Math.random() * 2, 0));

        // sides
        geometry.faces.push(new THREE.Face3(0, 1, 4));
        geometry.faces.push(new THREE.Face3(1, 2, 4));
        geometry.faces.push(new THREE.Face3(2, 3, 4));
        geometry.faces.push(new THREE.Face3(3, 0, 4));

        // bottom
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(2, 3, 0));

        return geometry;
    };

    T3.model.Classic = Classic;
})();