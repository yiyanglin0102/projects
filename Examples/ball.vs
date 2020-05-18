/*
 * Simple Shader for exercise 8-3
 * The student should make this more interesting, but the interesting parts
 * might be the fragment shader.
  */

/* pass interpolated variables to the fragment */
varying vec2 v_uv;
varying vec3 v_normal;

uniform float size;

/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    // pass the texture coordinate to the fragment
    v_uv = uv;
    // the main output of the shader (the vertex position)
    float height = 1.0;    // get the green value

    vec3 pos = position + height*normal * size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

    v_normal = normalMatrix * normal;

}
