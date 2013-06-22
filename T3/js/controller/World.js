/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:51 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var World,
        activeCamera;

    World = function (config) {

        /**
         * The world can have many cameras, so the this is a reference to
         * the active camera that's being used right now
         * @type {T3.model.Camera}
         */
        activeCamera = config.activeCamera;

        /**
         * THREE Renderer
         * @type {Object}
         */
        World.renderer = config.renderer;

        /**
         * Composer (event manager to handle shaders)
         * @type {Object}
         */
        World.composer = new THREE.EffectComposer(World.renderer);
        World.composer.setSize(
            window.innerWidth * T3.devicePixelRatio,
            window.innerHeight * T3.devicePixelRatio
        );

        /**
         * The number of calls to the update method % 1000000007
         * @type {number}
         */
        World.ticks = 0;

        World.prototype.init.call(this);
    };

    // statics
    World.GRAVITY = 9.81;

    World.prototype = {
        init: function () {
            var me = this,
                gridSize = 5,
                freeSpace;

            // some good music O:
            me.initMusic();
            // put the scene in a huge cube
            me.initSkyBox();

            // cameras used for the world
            me.initCameras();
            // coordinates helper
            me.initCoordinates();

            // world objects
            freeSpace = me.createBuildingBlocks(gridSize);
            me.createRoads(freeSpace);
            me.createLampParticles();
            me.createLampWires();
            // car
            me.createCar();
            // rain!
            me.createRain();

            // car auto acceleration (for the motion detection system)
            me.initCarAutoAcceleration();

            // postprocessing
            me.initPostprocessing();

        },

        /**
         * Initializes the coordinate helper (its wrapped in a model in T3)
         */
        initCoordinates: function () {
            new T3.model.Coordinates({
                ground: true
//                gridX: true
            });
        },

        /**
         * Plays some background music
         */
        initMusic: function () {
            var options = {
                    enabled: true,
                    loop: true,
                    volume: 1
                },
                music = T3.SoundLoader.playSound('music-1', {
                    loop: options.loop,
                    volume: options.volume
                });
            if (!options.enabled) {
                music.stop();
            }

            function initDatGui(gui) {
                var folder = gui.addFolder('Music');
                folder
                    .add(options, 'enabled')
                    .name('Enabled')
                    .onFinishChange(function (value) {
                        if (value) {
                            music = T3.SoundLoader.playSound('music-1');
                        } else {
                            music.stop();
                        }
                    });
                folder
                    .add(options, 'loop')
                    .name('Loop')
                    .onChange(function (value) {
                        music.node.loop = value;
                    });
                folder
                    .add(options, 'volume', 0, 1)
                    .name('Volume')
                    .onChange(function (value) {
                        music.node.gain.value = value;
                    });
            }
            initDatGui(T3.Application.datGUI);
        },

        /**
         * Creates an instance of a car
         */
        createCar: function () {
            var me = this;
            me.car = new T3.model.Car({
                name: 'car'
            });

            // attach cameras to the car
            me.car.add(T3.ObjectManager.get('camera-main').real);
        },

        /**
         * Creates an instance of the rain system
         */
        createRain: function () {
            var me = this;
            me.rainSystem = new T3.model.RainSystem({
                name: 'rain-system'
            });
        },

        /**
         * Creates the building blocks of the world (supported: block, classic),
         * the idea is to create a grid of roads and make a block in each space that
         * is not in the grid, after the method is complete {@link T3.model.Block}
         * has an array of the lamps created in each block
         * @param {number} gridSize
         */
        createBuildingBlocks: function (gridSize) {
            var me = this,
                rows = [],
                cols = [],
                total,
                i,
                j;

            // grid generation
            total = 0;
            rows[total] = cols[total] = 0;
            total += 1;
            while (total < gridSize) {
                rows[total] = rows[total - 1] + 3 + ~~(Math.random() * 3);
                cols[total] = cols[total - 1] + 3 + ~~(Math.random() * 3);
                total += 1;
            }
            for (i = 0; i < gridSize - 1; i += 1) {
                for (j = 0; j < gridSize - 1; j += 1) {
                    me.createBuildings(
                        cols[i] + 1, rows[j] + 1,
                        cols[i + 1] - 1, rows[j + 1] - 1
                    );
                }
            }
            return {rows: rows, cols: cols};
        },

        /**
         * Creates a single building given its top left and bottom right coordinates
         * (in the [x, z] axis respectively), this method creates either a Block
         * building or Classic building
         * @param x1
         * @param z1
         * @param x2
         * @param z2
         */
        createBuildings: function (x1, z1, x2, z2) {
            var object,
                models = ['Block', 'Classic'],
                probability = [0, 0.9, 1],
                random,
                width = 10,
                depth = 10;

            random = Math.random();
            for (var i = 0; i < probability.length - 1; i += 1) {
                if (random >= probability[i] && random <= probability[i + 1]) {
                    random = i;
                    break;
                }
            }
            object = new T3.model[models[random]]({
                width: width * (x2 - x1 + 1),
                depth: depth * (z2 - z1 + 1)
            });

            // since each object is added with its center at the center of the parent
            // lets move the object such that its bottom x,y,z corner is at the center
            // of the parent
            object.position.set(
                x1 * width * T3.scale + object.width * T3.scale / 2,
                0,
                z1 * depth * T3.scale + object.depth * T3.scale / 2
            );
        },

        /**
         * Creates the road used in the app
         * @param {Object} freeSpace
         */
        createRoads: function (freeSpace) {
            var i,
                j,
                width = 10,
                depth = 10,
                mesh,
                lastRow = freeSpace.rows[freeSpace.rows.length - 1],
                texture,
                boxWidth,
                geometry,
                material;

            // cols (x)
            texture = T3.AssetLoader.get('texture-road-z');
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat = new THREE.Vector2(1, -5);
            texture.anisotropy = 16;

            material = new THREE.MeshPhongMaterial({
                map: texture,
                bumpMap: texture,
                ambient: 0x353535,
                specular: 0x333333,
                color: 0xffffff,
                bumpScale: 1,
                shininess: 1,
                shading: THREE.SmoothShading
            });

            for (i = 0; i < freeSpace.cols.length; i += 1) {
                mesh = new T3.model.Mesh({
                    geometryConfig: {
                        initialized: new THREE.CubeGeometry(width, 0.2, depth * (lastRow + 1))
                    },
                    materialConfig: {
                        initialized: material
                    }
                });

                // since each object is added with its center at the center of the parent
                // lets move the object such that its bottom x,y,z corner is at the center
                // of the parent
                mesh.position.set(
                    freeSpace.cols[i] * width * T3.scale + width * T3.scale / 2,
                    -1,
                    depth * (lastRow + 1) * T3.scale / 2
                );

                mesh.real.matrixAutoUpdate = false;
                mesh.real.updateMatrix();
                mesh.real.receiveShadow = true;

            }

            // rows (z)
            texture = T3.AssetLoader.get('texture-road-x');
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat = new THREE.Vector2(1, -1);
            texture.anisotropy = 16;
            material = new THREE.MeshPhongMaterial({
                map: texture,
                bumpMap: texture,
                ambient: 0x353535,
                specular: 0x333333,
                color: 0xffffff,
                bumpScale: 3,
                shininess: 1,
                shading: THREE.SmoothShading
            });

            for (i = 0; i < freeSpace.rows.length; i += 1) {
                for (j = 0; j < freeSpace.cols.length - 1; j += 1) {
                    boxWidth = width * (freeSpace.cols[j + 1] - freeSpace.cols[j] - 1);
                    geometry = new THREE.CubeGeometry(
                        boxWidth,
                        0.2,
                        depth
                    );
                    mesh = new T3.model.Mesh({
                        geometryConfig: {
                            initialized: geometry
                        },
                        materialConfig: {
                            initialized: material
                        }
                    });

                    // since each object is added with its center at the center of the parent
                    // lets move the object such that its bottom x,y,z corner is at the center
                    // of the parent
                    mesh.position.set(
                        boxWidth * T3.scale / 2 + width * (freeSpace.cols[j] + 1) * T3.scale,
                        -1,
                        freeSpace.rows[i] * depth * T3.scale + depth * T3.scale / 2
                    );
                    mesh.real.matrixAutoUpdate = false;
                    mesh.real.updateMatrix();
                    mesh.real.receiveShadow = true;
                }
            }
        },

        /**
         * Creates a particle systems with the lamps created in each building block
         */
        createLampParticles: function () {
            var lamps = T3.model.Block.prototype.lamps,
                position,
                i,
                j,
                factor = 1.1,
                dx = [factor, -factor, 0, 0],
                dz = [0, 0, -factor, factor],
                geometry = new THREE.Geometry(),
                material = new THREE.ParticleBasicMaterial({
                    size: 100,
                    color: 0xffffff,
                    map: T3.AssetLoader.get('lensflare-0'),
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                }),
                lamp,
                particleSystem;


            for (i = 0; i < lamps.length; i += 1) {
                lamp = lamps[i];
                lamp.parent.updateMatrixWorld();
                position = lamp.parent.localToWorld(lamp.position);
                for (j = 0; j < 4; j += 1) {
                    geometry.vertices.push(
                        new THREE.Vector3(
                            position.x + dx[j] * lamp.topXLike.height * T3.scale / 2,
                            lamp.base.height * T3.scale,
                            position.z + dz[j] * lamp.topXLike.height * T3.scale / 2
                        )
                    );
                }
            }
            particleSystem = new THREE.ParticleSystem(geometry, material);
            particleSystem.initDatGui = function(gui) {
                var me = this,
                    folder = gui.addFolder('Lamps');

                folder
                    .add(me, 'visible')
                    .name('Visible')
                    .onFinishChange(function (value) {
                        me.visible = value;
                    });
            };
            T3.ObjectManager.add('lensflare', particleSystem);
        },

        createLampWires: function () {
            var i,
                points,
                mesh,
                lamps = T3.model.Block.prototype.lamps,
                height = lamps[0] && lamps[0].base.height * T3.scale,
                positions = [],
                wires = [];

            function createWiresInAxis(positions, axis) {
                var i,
                    last;
                last = positions[0];
                for (i = 1; i < positions.length; i += 1) {
                    if (last[axis] === positions[i][axis]) {
                        points = [];
                        points.push(last);
                        points.push(new THREE.Vector3(
                            (last.x + positions[i].x) / 2,
                            (last.y + positions[i].y) / 2 - 10,
                            (last.z + positions[i].z) / 2
                        ));
                        points.push(positions[i]);

                        // wire
                        mesh = new THREE.Mesh(
                            new THREE.TubeGeometry(
                                new THREE.SplineCurve3(points), // spline
                                100,                            // extrusion segments
                                0.3,                            // radius
                                16,                             // segments (> 4 is better)
                                false,                          // closed
                                true                            // debug
                            ),
                            new THREE.MeshBasicMaterial({
                                color: 0x222222,
                                side: THREE.DoubleSide
                            })
                        );
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        mesh.position.set(0, height, 0);
                        scene.add(mesh);
                        wires.push(mesh);
                    }
                    last = positions[i];
                }
            }

            function initDatGui(gui) {
                var folder = gui.addFolder('Wires');

                folder
                    .add({visible: true}, 'visible')
                    .name('Visible')
                    .onChange(function (value) {
                        var len = wires.length;
                        while (len--) {
                            wires[len].visible = value;
                        }
                    });
            }

            // gather all lamp positions
            for(i = 0; i < lamps.length; i += 1) {
                positions.push(lamps[i].position.clone());
            }

            // sort wires with an equal x coordinate
            positions.sort(function (a, b) {
                if (a.x !== b.x) { return a.x < b.x ? -1 : 1; }
                return a.z < b.z ? -1 : 1;
            });
            createWiresInAxis(positions, 'x');

            // sort wires with an equal z coordinate
            positions.sort(function (a, b) {
                if (a.z !== b.z) { return a.z < b.z ? -1 : 1; }
                return a.x < b.x ? -1 : 1;
            });
            createWiresInAxis(positions, 'z');

            initDatGui(T3.Application.datGUI);
        },

        /**
         * The world is responsible of updating its children
         * @param delta
         */
        update: function (delta) {
            var me = this,
                manager = T3.ObjectManager;

            World.ticks = (World.ticks + 1) % 1000000007;

            // game update logic goes here
            // CAMERA
            activeCamera.update(delta);

            // ROTATING LIGHT
//            manager.get('sphere-light-point').update(delta);

            // CAR MOVEMENT
            me.car && me.car.update(delta);

            // RAIN SYSTEM
            me.rainSystem && me.rainSystem.update(delta);
        },

        render: function () {
//            World.renderer.render(scene, activeCamera.real);
//            World.renderer.clear();
            World.composer.render();
        },

        /**
         * Add postprocessing shaders to the scene
         */
        initPostprocessing: function () {
            var me = this,
                renderModel;
            renderModel = new THREE.RenderPass(scene, activeCamera.real);

            // The resolution on new displays can be supported
            // through this shader
            var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
            effectFXAA.uniforms.resolution.value.set(
                1 / (window.innerWidth * T3.devicePixelRatio),
                1 / (window.innerHeight * T3.devicePixelRatio)
            );
            effectFXAA.renderToScreen = true;

            // Radial blur shader :)
            var radialShader = new THREE.ShaderPass(THREE.RadialBlurShader);
            radialShader.renderToScreen = true;
            World.radialShader = radialShader;

            World.composer.addPass(renderModel);
            World.composer.addPass(effectFXAA);
            World.composer.addPass(radialShader);

            // resize callback to fix the retina issue
            // http://uihacker.blogspot.com/2013/03/javascript-antialias-post-processing.html
            window.addEventListener('resize', function () {
                effectFXAA.uniforms.resolution.value.set(
                    1 / (window.innerWidth * T3.devicePixelRatio),
                    1 / (window.innerHeight * T3.devicePixelRatio)
                );
                World.composer.setSize(
                    window.innerWidth * T3.devicePixelRatio,
                    window.innerHeight * T3.devicePixelRatio
                );
            }, false);

            // dat.gui
            function initDatGui(gui) {
                var out = gui.addFolder('Postprocessing');

                //<debug>
                // copy shader
                var radialShaderFolder = out.addFolder('Radial Blur');
                radialShaderFolder
                    .add(radialShader, 'enabled')
                    .name('Enabled');

                radialShaderFolder
                    .add(radialShader.uniforms.sampleDist, 'value', 0.0, 1.0)
                    .name('Distance')
                    .listen();

                radialShaderFolder
                    .add(radialShader.uniforms.sampleStrength, 'value', 0.0, 5)
                    .name('Strength');
//
//                radialShaderFolder
//                    .add(radialShader.uniforms.sampleStrength, 'value', 0.0, 5.0)
//                    .name('Strength');
                //</debug>
            }
            initDatGui(T3.Application.datGUI);
        },

        /**
         * Wraps the world in a cube with a texture in the inside of it
         */
        initSkyBox: function () {
            var path = "images/cube/ice/",
                extension = '.jpg',
                dimension = 10000,
                mesh,
                urls = [ path + 'posx' + extension, path + 'negx' + extension,
                    path + 'posy' + extension, path + 'negy' + extension,
                    path + 'posz' + extension, path + 'negz' + extension],
                textureCube = THREE.ImageUtils.loadTextureCube(urls);

            var shader = THREE.ShaderLib[ "cube" ];
            shader.uniforms[ "tCube" ].value = textureCube;

            var material = new THREE.ShaderMaterial( {
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            mesh = new THREE.Mesh(
                new THREE.CubeGeometry(dimension, dimension, dimension),
                material
            );
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
//            mesh.position.y = dimension * 0.47;
            T3.ObjectManager.add('skybox', mesh);
        },

        /**
         * Initializes the cameras used in the world
         */
        initCameras: function () {
            var camera,
                positions = [
                    {x: 0, y: 30, z: -150},
                    {x: 0, y: 15, z: -100},
                    {x: 3, y: 10, z: 0}
                ],
                lookAt = [
                    new THREE.Vector3(0, 10, 10),
                    new THREE.Vector3(0, 10, 10),
                    new THREE.Vector3(0, 10, 10)
                ];

            // cube camera (used to reflect what the camera is targeting)
            camera = new THREE.CubeCamera(
                T3.model.Camera.near,       // near
                1000,                       // far
                128                         // cube resolution
            );
            camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
            T3.ObjectManager.add('camera-cube', camera);

            // orbit and pan camera
            new T3.model.Camera({
                name: 'camera-main',
                cameraPan: true,
                renderer: World.renderer,
                position: new THREE.Vector3(0, 30, -150)
            });

            // active camera is the world's current camera
            activeCamera = T3.ObjectManager.get('camera-main');

            // listen to camera switches
            var current = 0;
            $('#switch').on('click', function () {
                var next = (current + 1) % positions.length,
                    tween;
                tween = new TWEEN.Tween(activeCamera.real.position)
                    .to(positions[next], 2000)
                    .easing(TWEEN.Easing.Quartic.InOut)
                    .onUpdate(function() {
                        activeCamera.lookAt(lookAt[next]);
                    })
                    .onComplete(function() {
                        activeCamera.lookAt(lookAt[next]);
                    });
                tween.start();
                current = next;
//                activeCamera.lookAt(lookAt[next]);
            });
        },

        /**
         * Makes the car auto accelerate and activates one of the motion detection
         * systems, the pixel diff between frames or the HeadTrackr library
         */
        initCarAutoAcceleration: function () {
            var $buttons = $('.motion'),
                i,
                motionDetectionSystems =
                    ['MotionDetection', 'MotionDetectionHeadTrackr'],
                status = false,
                activeController;

            for (i = 0; i < motionDetectionSystems.length; i += 1) {
                T3.controller[motionDetectionSystems[i]].initialize();
            }

            $buttons.on('click', function () {
                var $me = $(this),
                    motion = $me.data('motion'),
                    controller = T3.controller[motion],
                    $canvas = $(controller.canvas);

                // only one controller might be available at any time,
                // so in the case where the user wants to activate the old controller
                //
                if (status && controller != activeController) {
                    return;
                }
                activeController = controller;
                if (status) {
                    T3.Keyboard.set('W', false);
                    controller.stop();
                    $canvas.fadeOut();
                    $me.addClass('off');
                    $me.removeClass('on');
                } else {
                    T3.Keyboard.set('W', true);
                    controller.start();
                    $canvas.fadeIn();
                    $me.addClass('on');
                    $me.removeClass('off');
                }
                status = !status;
            });
        }
    };
    T3.World = T3.controller.World = World;

})();