/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/7/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */

/* GLOBALS:
 * THREE
 * Coordinates
 * THREEx.FullScreen
 * T3.ObjectManager
 */

T3.Application = {
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * Instance of T3.controller.World
     */
    controller: null,
    /**
     * Stats instance
     */
    stats: null,
    /**
     * dat.GUI instance
     */
    datGUI: new dat.GUI(),
    /**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    createRender: function () {
        var me = this;

        // init the renderer
        if( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        me.renderer = new THREE.WebGLRenderer({
//            antialias: true
        });
        me.renderer.shadowMapEnabled = true;
        me.renderer.shadowCameraNear = 0;
        me.renderer.shadowCameraFar = 1000;
        me.renderer.shadowCameraFov = 100;

        me.renderer.shadowMapBias = 0.0039;
        me.renderer.shadowMapDarkness = 0.5;
        me.renderer.shadowMapWidth = 2048;
        me.renderer.shadowMapHeight = 2048;

        me.renderer.gammaInput = true;
        me.renderer.gammaOutput = true;
        me.renderer.physicallyBasedShading = true;

        me.renderer.setClearColorHex( 0xAAAAAA, 1 );
        me.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('webgl-container').appendChild(me.renderer.domElement);

        // allow 'f' to go fullscreen where this feature is supported
        if( THREEx.FullScreen.available() ){
            THREEx.FullScreen.bindKey();
        }

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // instantiate the scene (global)
        scene = new THREE.Scene();
//        scene.fog = new THREE.Fog( 0x808080, 4000, 4000 );
        return this;
    },

    /**
     * Creates the lights used in the scene
     * @chainable
     */
    createSceneLights: function () {
        var light,
            // http://planetpixelemporium.com/tutorialpages/light.html
//            color = 0xffd6aa,       // 100W Tungsten like color
            color = 0xfff1e0,       // Halogen like color
            k, d;

        light = new THREE.AmbientLight(0x111111);
        T3.ObjectManager.add('ambient-light-1', light);

        light = new THREE.DirectionalLight(color, 0.8);
        light.position.set(-1000, 1000, 1000);
        T3.ObjectManager.add('directional-light-2', light);

        // directional light to simulate sun light
        k = 3;
        d = 1000;
        light = new THREE.DirectionalLight(color, 1.5);
        light.position.set(1000 * k, 100 * k, -200 * k);
        light.initDatGui = function (gui) {
            var folder = gui.addFolder('World');
            folder
                .add(light, 'shadowCameraVisible')
                .name('Shadow camera');
        };
        T3.ObjectManager.add('directional-light-3', light);
        light.castShadow = true;

        var shadowMapMultiplier = 12;
        light.shadowMapWidth = 1 << shadowMapMultiplier;
        light.shadowMapHeight = 1 << shadowMapMultiplier;
        light.shadowCameraNear = 1500;
        light.shadowCameraFar= 4000;

        light.shadowCameraVisible = false;
        light.shadowCameraLeft = -d * 2;
        light.shadowCameraRight = 0;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;
//        light.shadowBias = 0.00001;
        light.shadowBias = -0.001;
//        light.shadowDarkness = 0.35;
//        var mesh = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
//        mesh.position.set(100, 10, -20);`
//        scene.add(mesh);

        //****** sphere + point light ******
//        var colorLight = 0xffffff;
//
//        light = new THREE.PointLight( 0xffffff, 1 );
//        T3.ObjectManager.add('point-light', light);
//
//        // light representation (little sphere)
//        var sphereMesh, sphere;
//        sphereMesh = new THREE.Mesh(
//            new THREE.SphereGeometry( 100, 16, 8, 1 ),
//            new THREE.MeshBasicMaterial( {color: colorLight} )
//        );
//        sphere = new T3.model.Object3D({
//            name: 'sphere-light-point',
//            real: sphereMesh,
//            update: function () {
//                typeof this.r !== "undefined" ? (this.r += 0.01) : (this.r = 0);
//                this.real.position.x = 100 * Math.cos( this.r );
//                this.real.position.z = 100 * Math.sin( this.r );
//            }
//        });
//        sphere.real.scale.set(0.05, 0.05, 0.05);
//        sphere.real.position = light.position;

        return this;
    },

    /**
     * Initializes the world controller
     * @chainable
     */
    initController: function () {
        var me = this;
        // keyboard controller
        T3.controller.Keyboard.init();

        // World
        me.world = new T3.controller.World({
            renderer: me.renderer,
            activeCamera: T3.ObjectManager.get('camera-main')
        });
        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initHelpers: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.bottom	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {
        var delta = T3.Application.clock.getDelta();

        // loop on request animation loop
        // - it has to be at the beginning of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( T3.Application.animate );

        // update Stats helper
        T3.Application.stats.update();

        // update TWEEN engine
        TWEEN.update();

        // do the render
        T3.Application.world.update(delta);
        T3.Application.world.render();
    },

    /************** LAUNCHER *************/
    launch: function () {

        // init the world
        this.createRender()
            .createScene()
            .createSceneLights();

        this.initHelpers();

        this.datGUI.close();

        // inits the world controller
        this.initController();

        $('#mask').fadeOut(3000);
        $('#spinner').fadeOut(3000);

        // animate the world and the scene
        this.animate();
    }
};

/************** START THE APPLICATION **************/
(function () {
    T3.AssetLoader.debug();
    T3.AssetLoader
        .registerAsset('texture-marble', THREE.ImageUtils.loadTexture('images/textures/marble.jpg'))
        .registerAsset('texture-water', THREE.ImageUtils.loadTexture('images/textures/water.jpg'))
        .registerAsset('texture-world', THREE.ImageUtils.loadTexture('images/textures/world.jpg'))
        .registerAsset('texture-snow-1', THREE.ImageUtils.loadTexture('images/textures/snow_1.jpg'))
        .registerAsset('texture-glass-1', THREE.ImageUtils.loadTexture('images/textures/glass.jpg'))
        .registerAsset('texture-glass-2', THREE.ImageUtils.loadTexture('images/textures/glass_2.jpg'))
        .registerAsset('texture-office', THREE.ImageUtils.loadTexture('images/textures/offices.jpg'))
        .registerAsset('texture-office-specular', THREE.ImageUtils.loadTexture('images/textures/offices_specular.jpg'))
        .registerAsset('texture-office-bumpmap', THREE.ImageUtils.loadTexture('images/textures/offices_bumpmap.jpg'))
        .registerAsset('texture-road-x', THREE.ImageUtils.loadTexture('images/textures/roadposx.png'))
        .registerAsset('texture-road-z', THREE.ImageUtils.loadTexture('images/textures/roadposz.jpg'))
        .registerAsset('texture-sidewalk-1', THREE.ImageUtils.loadTexture('images/textures/sidewalk_1.jpg'))
        .registerAsset('texture-residential', THREE.ImageUtils.loadTexture('images/textures/residential.jpg'))
        .registerAsset('texture-residential-specular', THREE.ImageUtils.loadTexture('images/textures/residential_specular_2.jpg'))
        .registerAsset('texture-residential-bumpmap', THREE.ImageUtils.loadTexture('images/textures/residential_bumpmap.jpg'))
        .registerAsset('texture-grass', THREE.ImageUtils.loadTexture('images/textures/grass.jpg'))
        .registerAsset('lensflare-0', THREE.ImageUtils.loadTexture('images/lensflare0_alpha.png'))
        .registerAsset('texture-tree-leaves', THREE.ImageUtils.loadTexture('obj/textures/tree_leaves.png'))
        .registerAsset('texture-tree-trunk', THREE.ImageUtils.loadTexture('obj/textures/tree_trunk.jpg'));
    T3.AssetLoader
        .addToLoadQueue('obj/tree-trunk.js', 'tree-trunk')
        .addToLoadQueue('obj/tree-leaves.js', 'tree-leaves')
        .addToLoadQueue('obj/Skyline.body.js', 'car-body-geometry')
        .addToLoadQueue('obj/Skyline.exhaust.js', 'car-exhaust-geometry')
        .addToLoadQueue('obj/Skyline.windows.js', 'car-windows-geometry')
        .addToLoadQueue('obj/Skyline.lightsBack.js', 'car-lights-back-geometry')
        .addToLoadQueue('obj/Skyline.lightsFront.js', 'car-lights-front-geometry')
        .addToLoadQueue('obj/Skyline.tire.js', 'car-tire-geometry')
        .addToLoadQueue('obj/Skyline.rim.js', 'car-rim-geometry')
        .addToLoadQueue('obj/Skyline.interior.js', 'car-interior-geometry');

    T3.SoundLoader.debug();
    T3.SoundLoader
        .addToLoadQueue('sounds/engine.wav', 'sound-engine-1')
        .addToLoadQueue('sounds/engine_2.wav', 'sound-engine-2')
        .addToLoadQueue('sounds/engine_3.mp3', 'sound-engine-3')
        .addToLoadQueue('sounds/alternator_whine.wav', 'sound-engine-4')
        .addToLoadQueue('sounds/bg_menu.ogg', 'music-1');
    T3.AssetLoader.load(function () {
        T3.SoundLoader.load(T3.Application.launch, T3.Application);
    }, T3.Application);
})();