/**
 * @author maurizzzio / http://maurizzzio.me
 * Ported from: http://www.gamerendering.com/2008/12/20/radial-blur-filter/
 */

THREE.RadialBlurShader = {

	uniforms: {
        "sampleDist": { type: "f", value: 1.0 },
        "sampleStrength": { type: "f", value: 1.5 }
	},

	vertexShader: [

        "varying vec2 vUv;",
        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "gl_Position = sign( gl_Position );",
        "}"
    ].join("\n"),

	fragmentShader: [

        "uniform sampler2D tex;",
        "varying vec2 vUv;",
        "uniform float sampleDist;",
        "uniform float sampleStrength;",

        "void main() {",
            "float samples[20];",
            "samples[0] = -0.08;",
            "samples[1] = -0.05;",
            "samples[2] = -0.03;",
            "samples[3] = -0.02;",
            "samples[4] = -0.01;",
            "samples[5] = 0.01;",
            "samples[6] = 0.02;",
            "samples[7] = 0.03;",
            "samples[8] = 0.05;",
            "samples[9] = 0.08;",

            "vec2 dir = 0.5 - vUv;",
            "float dist = sqrt(dir.x * dir.x + dir.y * dir.y);",
            "dir /= dist;",

            "vec4 color = texture2D(tex, vUv);",
            "vec4 sum = color;",
            "for (int i = 0; i < 10; i++) {",
                "sum += texture2D( tex, vUv + dir * samples[i] * sampleDist );",
            "}",

            "sum *= 1.0 / 11.0;",

            "float t = dist * sampleStrength;",
            "t = clamp(t, 0.0, 1.0);",
            "gl_FragColor = mix(color, sum, t);",
        "}"
    ].join("\n")

};
