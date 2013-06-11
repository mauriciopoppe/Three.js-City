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
            box,
            tetrahedron;

        me.boxes = [];

        // create boxes that make the Classic
        for (i = 0; i < total; i += 1) {
            box = new T3.model.Box({
                originalParent: me,
                width: me.width * proportion[i],
                height: me.height * height[i],
                depth: me.depth * proportion[i],
                materialOptions: {
                    ambient: '#ffffff',     // ambient
                    color: color,       // diffuse
                    specular: color,    // specular
                    shininess: 0.4 * 128,   // shininess
                    wireframe: false
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
            me.boxes.push(box);
        }
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
        me.boxes.push(tetrahedron);
        tetrahedron.position.set(box.width, me.height * T3.scale, box.depth);
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