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
        World.activeCamera = activeCamera = config.activeCamera;

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

        this.simulatedObjects = [];
        this.maxContacts = 256;
        /**
         * Holds the contacts to be resolved by the Collision
         * Resolver class
         * @type {Ape.collision.CollisionData}
         */
        this.collisionData = new Ape.collision.CollisionData();

        /**
         * Holds the contact resolver
         * @type {Ape.collision.ContactResolver}
         */
        this.resolver = new Ape.collision.ContactResolver({
            velocityIterations: this.maxContacts * 8,
            positionIterations: this.maxContacts * 8
        });

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
//            me.createRain();

            // init motion detection
            me.initMotion();

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
            if (!T3.SoundLoader.getWebAudioInstance()) {
                return;
            }

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
                        music.volume(value);
                    });
            }
            initDatGui(T3.Application.datGUI);
        },

        /**
         * Creates an instance of a car
         */
        createCar: function () {
            var me = this,
                config = {
                    width: 20,
                    depth: 40,
                    height: 40
                };

            var box = Ape.CollisionShapeFactory.createBox(config);
            box.body.acceleration.set(0, 0, 0);
            box.body.setMass(1e17);
            box.body.setInertiaTensor(
                new Ape.Matrix3().setBlockInertialTensor(
                    new Ape.Vector3(config.width * 0.5, config.height * 0.5, config.depth * 0.5),
                    box.body.getMass()
                )
            );
            this.simulatedObjects.push(box);

            me.car = new T3.model.Car({
                name: 'car',
                simulationInstance: box
            });
            me.car.position = box.body.position;

            // attach cameras to the car
            me.car.add(T3.ObjectManager.get('camera-main').real);
        },

        createStaticObject: function (config) {
            var box = Ape.CollisionShapeFactory.createBox({
                width: config.width,
                depth: config.depth,
                height: config.height
            });
            box.body.setInverseMass(0);
            box.body.setInertiaTensor(
                new Ape.Matrix3().setBlockInertialTensor(
                    new Ape.Vector3(config.width * 0.5, config.height * 0.5, config.depth * 0.5),
                    box.body.getMass()
                )
            );
            box.body.acceleration.set(0, 0, 0);
            box.body.position = config.position.clone();
            box.calculateInternals();
            this.simulatedObjects.push(box);
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
                selected,
                models = ['Block', 'Classic', 'RoundBlock', 'Park'],
//                probability = [0, 0, 0, 1, 1],
                probability = [0, 0.7, 0.8, 0.9, 1],
                max = [Infinity, Infinity, 1, 1],
                current = [0, 0, 0, 0],
                random,
                total,
                i, j, k;

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
                    // chose a model (restrict the number of models of the selected
                    // type using `max`)
                    do {
                        random = Math.random();
                        for (k = 0; k < probability.length - 1; k += 1) {
                            if (random >= probability[k] && random <= probability[k + 1]) {
                                selected = k;
                                break;
                            }
                        }
                    } while(current[selected] === max[selected]);

                    // update current
                    current[selected] += 1;

                    me.createBuildings(
                        cols[i] + 1, rows[j] + 1,
                        cols[i + 1] - 1, rows[j + 1] - 1,
                        models[selected]
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
         * @param model
         */
        createBuildings: function (x1, z1, x2, z2, model) {
            var me = this,
                object,
                width = 10,
                depth = 10;

            object = new T3.model[model]({
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
            me.createStaticObject({
                width: object.width * T3.scale,
                depth: object.depth * T3.scale,
                height: object.width * T3.scale,
                position: object.position
            });
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
                material,
                commonOptions = {
                    ambient: 0x353535,
                    specular: 0x333333,
                    color: 0xffffff,
                    bumpScale: 1,
                    shininess: 10,
                    shading: THREE.SmoothShading
                };

            // cols (x)
            texture = T3.AssetLoader.get('texture-road-z');
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat = new THREE.Vector2(1, -5);
            texture.anisotropy = 16;

            material = new THREE.MeshPhongMaterial($.extend({
                map: texture,
                bumpMap: texture
            }, commonOptions));

            for (i = 0; i < freeSpace.cols.length; i += 1) {
                mesh = new T3.model.Mesh({
                    geometryConfig: {
                        initialized: new THREE.CubeGeometry(width, 0.2, depth * (lastRow + 1))
                    },
                    materialConfig: {
                        initialized: material
                    }
                });
                T3.intersectable.push(mesh.real);

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
            material = new THREE.MeshPhongMaterial($.extend({
                map: texture,
                bumpMap: texture
            }, commonOptions));

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
                    T3.intersectable.push(mesh.real);

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
            var me = this;

            World.ticks = (World.ticks + 1) % 1000000007;

            // PHYSICS ENGINE
            var objects = me.simulatedObjects,
                rigidBody;
            for (var i = -1; ++i < objects.length;) {
                rigidBody = objects[i];
                rigidBody.body.integrate(delta);
                rigidBody.calculateInternals();
            }

            // game update logic goes here
            // CAMERA
            activeCamera.update(delta);

            // CAR MOVEMENT
            me.car && me.car.update(delta);

            // RAIN SYSTEM
            // commented because it's slower since chrome 32
//            me.rainSystem && me.rainSystem.update(delta);

            // COLLISION DETECTION
//            me.resolveContacts(delta);

//            World.fountain && World.fountain.update(delta);
        },

        resolveContacts: function (delta) {
            var me = this;
            // Set up the collision data structure
            this.collisionData.reset(this.maxContacts);
            this.collisionData.friction = 0;
            this.collisionData.restitution = 0.3;
            this.collisionData.tolerance = 0.1;

            var i, j,
                total = this.simulatedObjects.length;

            // collide the box with the planes

            for (i = 0; i < total; i += 1) {
                for (j = i + 1; j < total; j += 1) {
                    Ape.collision.CollisionDetector.prototype
                        .detect(
                            this.simulatedObjects[i],
                            this.simulatedObjects[j],
                            this.collisionData
                        );
                }
            }
            this.resolver.resolveContacts(
                this.collisionData.contacts,
                this.collisionData.contacts.length,
                delta
            );
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

            //<debug>
            // depth map
//            var depthShader = new THREE.ShaderPass(THREE.DepthMapShader);
//            depthShader.renderToScreen = true;
            //</debug>

            World.composer.addPass(renderModel);
            World.composer.addPass(effectFXAA);
            World.composer.addPass(radialShader);
//            World.composer.addPass(depthShader);

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
                var out = gui.addFolder('Postprocessing'),
                    controller,
                    $dom;

                //<debug>
                // copy shader
                var radialShaderFolder = out.addFolder('Radial Blur');
                radialShaderFolder
                    .add(radialShader, 'enabled')
                    .name('Enabled');

                controller = radialShaderFolder
                    .add(radialShader.uniforms.sampleDist, 'value', 0.0, 1.0)
                    .name('Distance (Read only)')
                    .listen();
                radialShader.maxStrength = 1.5;
                $dom = $(controller.domElement);
                $dom.find('input').attr('disabled', 'disabled');
                $dom.find('.slider-fg').css({
                    background: '#555555'
                });

                radialShaderFolder
                    .add(radialShader, 'maxStrength', 0.0, 4.0)
                    .name('Strength');
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

            var shader = THREE.ShaderLib['cube'];
            shader.uniforms['tCube'].value = textureCube;

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
                active = 0,
                config = [{
                    position: new THREE.Vector3(0, 30, -150),
                    lookAt: new THREE.Vector3(0, 10, 10)
                }, {
                    position: new THREE.Vector3(0, 15, -100),
                    lookAt: new THREE.Vector3(0, 10, 10)
                }, {
                    position: new THREE.Vector3(3, 10, 0),
                    lookAt: new THREE.Vector3(0, 10, 10)
                }, {
                    position: new THREE.Vector3(0, 480, -10),
                    lookAt: new THREE.Vector3(0, 10, 10)
                }];

            // modify angular vars
            var scope = angular.element($('body')).scope();
            scope.$apply(function () {
                var localStorageCameras = JSON.parse(localStorage.getItem('cameras')) || [],
                    i;

                for(i = 0; i < config.length; i += 1) {
                    scope.cameras.push(config[i]);
                }
                for (i = 0; i < localStorageCameras.length; i += 1) {
                    scope.cameras.push(localStorageCameras[i]);
                }
                scope.activeIndex = active;
                scope.cameras[active].active = true;
            });

            // cube camera (used to reflect what the camera is targeting)
            camera = new THREE.CubeCamera(
                0.1,        // near
                100,        // far
                128         // cube resolution
            );
            camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
            T3.ObjectManager.add('camera-cube', camera);

            // orbit and pan camera
            new T3.model.Camera({
                name: 'camera-main',
                cameraPan: true,
                renderer: World.renderer,
                position: config[active].position.clone()
            });

            // active camera is the world's current camera
            activeCamera = T3.World.activeCamera =
                T3.ObjectManager.get('camera-main');
        },

        /**
         * Makes the car auto accelerate and activates one of the motion detection
         * systems, the pixel diff between frames or the HeadTrackr library
         */
        initMotion: function () {
            var scope = angular.element($('body')).scope();
            scope.$apply(function () {
                for (var i = 0; i < scope.motions.length; i += 1) {
                    T3.controller[scope.motions[i].data].initialize();
                }
            });
        }
    };
    T3.World = T3.controller.World = World;

})();