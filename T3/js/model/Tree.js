/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    
    var Tree;

    Tree = function (config) {
        config = config || {};

        T3.model.Object3D.call(this, config);
    
        Tree.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Tree, T3.model.Object3D);

    /**
     * The tree is composed of two meshes, the first one is the
     * trunk ()
     * @chainable
     */
    Tree.prototype.init = function () {
        var me = this,
            leaves,
            leavesTexture,
            trunk,
            trunkTexture;

        leavesTexture = T3.AssetLoader.get('texture-tree-leaves');
        leaves = new THREE.Mesh(
            T3.AssetLoader.get('tree-leaves').geometry,
            new THREE.MeshPhongMaterial({
                map: leavesTexture,
                bumpMap: leavesTexture,
                bumpScale: 1,
                transparent: true,
                opacity: 1,
                ambient: 0x000000,
                side: THREE.DoubleSide
            })
        );
        leaves.castShadow = true;
        leaves.receiveShadow = true;
//        leaves.matrixAutoUpdate = false;
//        leaves.updateMatrix();
        leaves.scale.set(T3.scale, T3.scale, T3.scale);

        trunkTexture = T3.AssetLoader.get('texture-tree-trunk');
        trunk = new THREE.Mesh(
            T3.AssetLoader.get('tree-trunk').geometry,
            new THREE.MeshPhongMaterial({
                map: trunkTexture,
                bumpMap: trunkTexture,
                bumpScale: 15,
                side: THREE.DoubleSide
            })
        );
        trunk.castShadow = true;
        trunk.receiveShadow = true;
//        trunk.matrixAutoUpdate = false;
//        trunk.updateMatrix();
        trunk.scale.set(T3.scale, T3.scale, T3.scale);

        me.add(leaves);
        me.add(trunk);
        return this;
    };

    T3.model.Tree = Tree;
})();