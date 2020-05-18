/* Procedural shading example for Exercise 8-3 */
/* the student should make this more interesting */

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

/* colors for the checkerboard */
uniform vec3 light;
uniform vec3 dark;
uniform float size;

/* number of checks over the UV range */
uniform float checks;

varying vec3 v_normal;

uniform sampler2D texture;
const vec3 lightDir = vec3(2,1,0);
const vec3 baseColor = vec3(0,1,0);

void main()
{
    float x = v_uv.x * checks;
    float y = v_uv.y * checks;
   
    float total = floor(x) + floor(y);
    bool isEven = mod(total,2.0)==0.0;

    vec3 nhat = normalize(v_normal);
    
    float lights = abs(dot(nhat, lightDir));
    
    vec4 col1 = lights * vec4(light,1.0);
    vec4 col2 = lights * vec4(dark,1.0);

    gl_FragColor = (isEven)? col2:col1;
}
