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
        // TODO: create the lights in each block
//        me.createLights();
    };

    Block.prototype.createBlocks = function () {
        var me = this,
            height = [1, 0.8, 0.5],
            total = height.length,
            i,
            box;

        // create boxes that make the block
        for (i = 0; i < total; i += 1) {
            box = new T3.model.Box({
                originalParent: me,
                // from the 80% of parent's width the width will be in the range
                // 50% <= width <= 100 which is 40% <= width <= 80%
                width: 0.8 * me.width * (0.5 + 0.5 * Math.random()),
                height: me.height * height[i] * (0.3 + 0.7 * Math.random()),
                depth: 0.8 * me.depth * (0.5 + 0.5 * Math.random())
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
        }

        // base block
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
        return this;
    };

    Block.prototype.createLights = function () {
        var me = this,
            points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 10, 0),
                new THREE.Vector3(1, 13, 0),
                new THREE.Vector3(2, 13.5, 0),
                new THREE.Vector3(3, 13, 0),
                new THREE.Vector3(4, 12, 0)
            ],
            spline,
            numberOfInterpolations = 20,
            point,
            geometry = new THREE.Geometry();

        spline = new THREE.Spline(points);
        for (var i = 0; i < numberOfInterpolations; i += 1) {
            point = spline.getPoint(i / numberOfInterpolations);
            geometry.vertices[i] = new THREE.Vector3(
                point.x * T3.scale,
                point.y * T3.scale,
                point.z * T3.scale
            );
        }

        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: '#555',
            side: THREE.DoubleSide,
            linewidth: 5 * T3.scale
        }));
        line.position.x = -1000;
        me.add(line);
    };

    T3.model.Block = Block;
})();