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
 */
var scene = {};

var Application = {
    /**
     * local reference to the global scene
     */
    scene: scene,               // reference to the scene
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * THREE.PerspectiveCamera
     */
    camera: null,

    // extra
    /**
     * Stats helper
     */
    stats: null,
    /**
     * OrbitAndPanControls
     */
    cameraControls: null,
    /**
     * References to the coordinate helper objects
     * e.g.
     *      axes: THREE.Object3D(),
     *      ground: THREE.Mesh(),
     *      gridX: THREE.Mesh(),
     *      gridY: THREE.Mesh(),
     *      gridZ: THREE.Mesh()
     */
    coordinates: {},
    /**
     * dat.GUI true/false values used to determine the visibility
     * of each coordinate helper object
     */
    coordinatesGUI: null,

    /**
     * Map to each object that belong to this application, each object must have
     * a reference from here to the object itself
     */
    objects: {},

    /**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    initialize: function () {
        var me = this;

        // init the renderer
        if( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        me.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        me.renderer.setClearColorHex( 0xAAAAAA, 1 );
        me.renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('webgl-container').appendChild(me.renderer.domElement);

        // allow 'f' to go fullscreen where this feature is supported
        if( THREEx.FullScreen.available() ){
            THREEx.FullScreen.bindKey();
            document.getElementById('fullscreen').innerHTML	+= "Press <i>f</i> for fullscreen";
        }

        return this;
    },

    /**
     * Creates the cameras used in this application
     * @param {Object} parameters
     * @param {boolean} parameters.cameraPan If set to true then an instance of OrbitAndPanControls is
     * created and referenced with Application.cemeraControls
     * @returns {*}
     */
    createCameras: function (parameters) {
        var me = this,
            canvasRatio = window.innerWidth / window.innerHeight;

//        // create a camera control
//        if (parameters) {
//            if (parameters.cameraPan) {
//                var camera = new THREE.PerspectiveCamera( 25, canvasRatio, 1, 10000 );
//                camera.position.set(185, 40, 170);
//                me.cameraControls = new THREE.OrbitAndPanControls(camera);
//                me.cameraControls.dynamicDampingFactor = 0.25;
//            }
//        }
//
//        // put a camera in the scene
//        me.camera = new THREE.PerspectiveCamera( 25, canvasRatio, 1, 10000 );
//        me.camera.position.set(10, 10, 10);
//        scene.add(me.camera);

        var camera = new THREE.PerspectiveCamera( 25, canvasRatio, 1, 10000 );
        camera.position.set( 185, 40, 170 );

        me.cameraControls = new THREE.TrackballControls( camera );
        me.cameraControls.dynamicDampingFactor = 0.25;

        me.camera = new THREE.PerspectiveCamera( 25, canvasRatio, 1, 10000 );
        scene.add( me.camera );

        // transparently support window resize
        THREEx.WindowResize.bind(me.renderer, me.camera);

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // create the scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

        // create some lights to show lambert and phong material objects
        var ambientLight = new THREE.AmbientLight( 0x222222 );
        scene.add(ambientLight);

        var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
        light.position.set( 20, 40, 50 );
        scene.add(light);

        var light2 = new THREE.DirectionalLight( 0xffffff, 1.0 );
        light2.position.set( -50, 25, -20 );
        scene.add(light2);

        return this;
    },

    /**
     * Creates a basic green cube
     * @chainable
     */
    createObjects: function () {
        var me = this;
        // BASIC MATERIALS:
        // THREE.MeshBasicMaterial() - (needs lighting)
        // THREE.MeshNormalMaterial() - normal material with default coloring on the faces

        // LIGHTS
        // THREE.PointLight - Affects objects using MeshLambertMaterial or MeshPhongMaterial.
        // THREE.DirectionalLight - creates a light pointing to the target

        // cube example
        var urlPrefix = 'images/';
        var urls = [
            urlPrefix + 'posx.jpg', urlPrefix + 'negx.jpg',
            urlPrefix + 'posy.jpg', urlPrefix + 'negy.jpg',
            urlPrefix + 'posz.jpg', urlPrefix + 'negz.jpg',
        ];
        var textureCube = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderLib['cube'];
        shader.uniforms['tCube'].value = textureCube;
        var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);
        scene.add(mesh);

        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initStats: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.top	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    /**
     * Initializes the dat.GUI helper adding some basic options to
     * the coordinates helpers
     * @chainable
     */
    initDatGui: function () {

        var me = this,
            effectController = {
                gridX: me.coordinatesGUI.gridX,
                gridY: me.coordinatesGUI.gridY,
                gridZ: me.coordinatesGUI.gridZ,
                ground: me.coordinatesGUI.ground,
                axes: me.coordinatesGUI.axes
            };

        var gui = new dat.GUI(),
            folder;

        folder = gui.addFolder('Grid display');
        folder.add(effectController, 'gridX').name('Show XZ grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridX);
        });
        folder.add(effectController, 'gridY').name('Show YZ grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridY);
        });
        folder.add(effectController, 'gridZ').name('Show XY grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridZ);
        });
        folder.add(effectController, 'ground').name('Show ground').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.ground);
        });
        folder.add(effectController, 'axes').name('Show axes').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.axes);
        });

        return this;
    },

    /**
     * Initializes the Coordinates helper, by default it draws the xyz-axes, a ground and
     * a grid in the XZ plane
     * @param [options]
     * @param {boolean} options.axes True to draw axes
     * @param {boolean} options.ground True to draw the ground
     * @param {boolean} options.gridX True to draw a grid in the XZ plane
     * @param {boolean} options.gridY True to draw a grid in the YZ plane
     * @param {boolean} options.gridZ True to draw a grid in the XY plane
     * @returns {*}
     */
    initCoordinates: function (options) {
        var me = this;
        me.coordinatesGUI = {
            axes: true,
            ground: true,
            gridX: true,
            gridY: false,
            gridZ: false
        };
        $.extend(me.coordinatesGUI, options);
        
        // add all coordinates helpers to the scene
        me.coordinates.ground = Coordinates.drawGround({size:10000});
        me.coordinates.gridX = Coordinates.drawGrid({size:10000,scale:0.01});
        me.coordinates.gridY = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
        me.coordinates.gridZ = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
        me.coordinates.axes = Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});

        // remove objects depending on me.coordinatesGUI
        !me.coordinatesGUI.ground && scene.remove(me.coordinates.ground);
        !me.coordinatesGUI.gridX && scene.remove(me.coordinates.gridX);
        !me.coordinatesGUI.gridY && scene.remove(me.coordinates.gridY);
        !me.coordinatesGUI.gridZ && scene.remove(me.coordinates.gridZ);
        !me.coordinatesGUI.axes && scene.remove(me.coordinates.axes);

        return this;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( Application.animate );

        // do the render
        Application.render();

        // update stats
        Application.stats.update();
    },

    /**
     * Render loop
     */
    render: function () {
        var me = this,
            delta = me.clock.getDelta();

        me.camera.lookAt(new THREE.Vector3(0, 0, 0));
        me.camera.updateProjectionMatrix();

        // update camera controls
        me.cameraControls && me.cameraControls.update(delta);

        // actually render the scene
        me.renderer.render( scene, me.camera );
    }
};

/************** START THE APPLICATION **************/
Application
    .initialize()
    .createScene()
    .createCameras({
        cameraPan: true
    })
    .createObjects();

Application
    .initStats()
    .initCoordinates({
        axes: false
    })
    .initDatGui();

Application.animate();