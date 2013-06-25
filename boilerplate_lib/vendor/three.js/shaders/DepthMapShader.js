/**
 * @author maurizzzio / http://mauro.41090@gmail.com
 *
 */

THREE.DepthMapShader = {

	uniforms: {
        "tColor":   { type: "t", value: null },
        "tDepth":   { type: "t", value: null }
    },

	vertexShader: [
        "varying vec2 vUv;",

        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),

	fragmentShader: [
        "varying vec2 vUv;",

        "uniform sampler2D tColor;",
        "uniform sampler2D tDepth;",
        "void main() {",
            "vec4 depth = texture2D( tDepth, vUv );",
            "gl_FragColor = vec4(depth.z, depth.z, depth.z, 1);",
        "}"
    ].join("\n")

};
