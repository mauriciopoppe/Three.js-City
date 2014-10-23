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
        window.scene = new THREE.Scene();
        window.scene.fog = new THREE.Fog( 0x808080, 300, 1500);
        window.scene.fog.visible = true;
        return this;
    },

    toggleFogStatus: function () {
        if (scene.fog.visible) {
            scene.fog.near = 300;
            scene.fog.far = 1500;
        } else {
            scene.fog.near = Infinity;
            scene.fog.far = Infinity;
        }
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

    initDatGui: function () {
        var gui = this.datGUI;
        var folder = gui.addFolder('World');

        folder
            .add(T3.ObjectManager.get('directional-light-3'), 'shadowCameraVisible')
            .name('Shadow camera');
        folder
            .add(scene.fog, 'visible')
            .name('Fog visibility')
            .onFinishChange(this.toggleFogStatus);
        return this;
    },

    /************** LAUNCHER *************/
    launch: function () {

        // init the world
        this.createRender()
            .createScene()
            .createSceneLights()
            .initDatGui();

        this.initHelpers();

        this.datGUI.close();

        // hide the simulation bodies
        Ape.debug = false;

        // inits the world controller
        this.initController();

        $('#loader').fadeOut(3000);

        // animate the world and the scene
        this.animate();
    }
};

/************** START THE APPLICATION **************/
(function () {
    T3.AssetLoader.debug();
    T3.AssetLoader

    // texture
        .addToLoadQueue('texture-marble', 'images/textures/marble.jpg', 'texture')
        .addToLoadQueue('texture-water', 'images/textures/water.jpg', 'texture')
        .addToLoadQueue('texture-world', 'images/textures/world.jpg', 'texture')
        .addToLoadQueue('texture-snow-1', 'images/textures/snow_1.jpg', 'texture')
        .addToLoadQueue('texture-glass-1', 'images/textures/glass.jpg', 'texture')
        .addToLoadQueue('texture-glass-2', 'images/textures/glass_2.jpg', 'texture')
        .addToLoadQueue('texture-glass-3', 'images/textures/glass_3.jpg', 'texture')
        .addToLoadQueue('texture-glass-3-door', 'images/textures/glass_3_door.jpg', 'texture')
        .addToLoadQueue('texture-office', 'images/textures/offices.jpg', 'texture')
        .addToLoadQueue('texture-office-specular', 'images/textures/offices_specular.jpg', 'texture')
        .addToLoadQueue('texture-office-bumpmap', 'images/textures/offices_bumpmap.jpg', 'texture')
        .addToLoadQueue('texture-road-x', 'images/textures/roadposx.png', 'texture')
        .addToLoadQueue('texture-road-z', 'images/textures/roadposz.jpg', 'texture')
        .addToLoadQueue('texture-sidewalk-1', 'images/textures/sidewalk_1.jpg', 'texture')
        .addToLoadQueue('texture-residential', 'images/textures/residential.jpg', 'texture')
        .addToLoadQueue('texture-residential-specular', 'images/textures/residential_specular_2.jpg', 'texture')
        .addToLoadQueue('texture-residential-bumpmap', 'images/textures/residential_bumpmap.jpg', 'texture')
        .addToLoadQueue('texture-grass', 'images/textures/grass.jpg', 'texture')
        .addToLoadQueue('lensflare-0', 'images/lensflare0_alpha.png', 'texture')
        .addToLoadQueue('texture-tree-leaves', 'obj/textures/tree_leaves.png', 'texture')
        .addToLoadQueue('texture-tree-trunk', 'obj/textures/tree_trunk.jpg', 'texture')

    // json
        .addToLoadQueue('tree-trunk', 'obj/tree-trunk.js', 'json')
        .addToLoadQueue('tree-leaves', 'obj/tree-leaves.js', 'json')
        .addToLoadQueue('car-body-geometry', 'obj/Skyline.body.js', 'json')
        .addToLoadQueue('car-exhaust-geometry', 'obj/Skyline.exhaust.js', 'json')
        .addToLoadQueue('car-windows-geometry', 'obj/Skyline.windows.js', 'json')
        .addToLoadQueue('car-lights-back-geometry', 'obj/Skyline.lightsBack.js', 'json')
        .addToLoadQueue('car-lights-front-geometry', 'obj/Skyline.lightsFront.js', 'json')
        .addToLoadQueue('car-tire-geometry', 'obj/Skyline.tire.js', 'json')
        .addToLoadQueue('car-rim-geometry', 'obj/Skyline.rim.js', 'json')
        .addToLoadQueue('car-interior-geometry', 'obj/Skyline.interior.js', 'json');

    T3.SoundLoader.debug();
    T3.SoundLoader
        .addToLoadQueue('sounds/engine.wav', 'sound-engine-1')
        .addToLoadQueue('sounds/engine_2.wav', 'sound-engine-2')
        .addToLoadQueue('sounds/engine_3.mp3', 'sound-engine-3')
        .addToLoadQueue('sounds/alternator_whine.wav', 'sound-engine-4')
        .addToLoadQueue('sounds/bg_menu.ogg', 'music-1');
    var scope = angular.element($('body')).scope();
    T3.AssetLoader.load(function () {
        scope = angular.element($('body')).scope();
        scope.$apply(function () { scope.loading = 'Loading Sounds'; });
        T3.SoundLoader.load(function () {
            scope = angular.element($('body')).scope();
            scope.$apply(function () { scope.loading = 'Generating City'; });
            setTimeout (function () {
                T3.Application.launch();
            }, 10);
        }, T3.Application);
    }, T3.Application);
})();