#pragma phaserTemplate(shaderName)

#pragma phaserTemplate(extensions)

#pragma phaserTemplate(features)

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#pragma phaserTemplate(fragmentDefine)

uniform vec2 uResolution;

varying vec4 outTint;

#pragma phaserTemplate(outVariables)

#pragma phaserTemplate(fragmentHeader)

void main ()
{
    vec4 fragColor = outTint;

    #pragma phaserTemplate(fragmentProcess)

    gl_FragColor = fragColor;
}