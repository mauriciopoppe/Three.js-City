/**
 * @author maurizzzio
 */

THREE.GlowShader = {

    uniforms: {
        uColor: {type: 'c', value: new THREE.Color(0xffffff)}
    },

    vertexShader: [
        "varying vec3 vNormal;",
        "void main() {",
            "vNormal = normalize(normalMatrix * normal);",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),

    fragmentShader: [
        "varying vec3 vNormal;",
        "uniform vec3 uColor;",
        "void main() {",
            "float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 5.0);",
            "gl_FragColor = vec4(uColor, 1.0) * intensity;",
        "}"

    ].join("\n")

};
