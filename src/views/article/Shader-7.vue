<script setup lang="ts">
defineOptions({ name: 'Shader7' })
import * as THREE from 'three'
// import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm'
import GUI from 'lil-gui'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * GUI 控制参数
 *
 */
let width = window.innerWidth
let height = window.innerHeight

const gui = new GUI()

const scene = new THREE.Scene()

const geometry = new THREE.SphereGeometry(1, 512, 512) // 256 128 64 32

const vertex = /* GLSL */ `
  const float PI = 3.1415925;

  uniform float uTime;
  uniform float uStrength;
  uniform float uFrequency;

  varying vec3 vNormal;
  varying float vNoise;

  // 3D Randomness
  // https://www.shadertoy.com/view/WljBDh
  float random(vec3 pos){
    return fract(sin(dot(pos, vec3(64.25375463, 23.27536534, 86.29678483))) * 59482.7542);
  }

  //	Classic Perlin 3D Noise
  //	by Stefan Gustavson
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

  float cnoise(vec3 P){
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  void main() {
    vec3 newPos = position;

    float noise = cnoise(position * uFrequency + uTime);

    // 黑多白少
    // noise = step(0.5, noise);
    // 黑白接近
    // noise = step(0.0, noise);
    // 白多黑少
    // noise = step(-0.5, noise);

    // cnoise 函数的返回值确实不是0.0-1.0，而且数值越接近-1.0黑色区域越接近消失。反之亦然，用0.0-1.0的数值去测试白色区域也会越来越少。

    // newPos +=  normal * noise * 1.0;
    newPos += normal * noise * uStrength * 1.0; // * 0.0

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    vNormal = normal;
    vNoise = noise;
  }
`

const fragment = /* GLSL */ `
  uniform float uTime;

  varying vec3 vNormal;
  varying float vNoise;

  vec3 rgb(float r, float g, float b) {
    return vec3(r, g, b) / 255.0;
  }

   // https://github.com/Experience-Monks/glsl-hsl2rgb/blob/master/index.glsl
    float hue2rgb(float f1, float f2, float hue) {
      if (hue < 0.0)
          hue += 1.0;
      else if (hue > 1.0)
          hue -= 1.0;
      float res;
      if ((6.0 * hue) < 1.0)
          res = f1 + (f2 - f1) * 6.0 * hue;
      else if ((2.0 * hue) < 1.0)
          res = f2;
      else if ((3.0 * hue) < 2.0)
          res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
      else
          res = f1;
      return res;
    }

    vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb;

        if (hsl.y == 0.0) {
            rgb = vec3(hsl.z); // Luminance
        } else {
            float f2;

            if (hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
            else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;

            float f1 = 2.0 * hsl.z - f2;

            rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
            rgb.g = hue2rgb(f1, f2, hsl.x);
            rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
        }
        return rgb;
    }

    vec3 hsl2rgb(float h, float s, float l) {
        return hsl2rgb(vec3(h, s, l));
  }


  void main() {
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

    // gl_FragColor = vec4(vNormal, 1.0);

    // vec3 color = vec3(vNoise);
    // gl_FragColor = vec4(color, 1.0);

    // 用 noise 数值 mix 两种颜色
    // vec3 color1 = vec3(1.0);
    // vec3 color2 = vec3(0.0, 1.0, 1.0);
    // vec3 color = mix(color1, color2, vNoise);
    // gl_FragColor = vec4(color, 1.0);

    // vec3 color1 = vec3(96./255., 200./255., 179./255.);
    // vec3 color2 = vec3(27./255., 80./255., 145./255.);
    // vec3 color = mix(color1, color2, vNoise);
    // gl_FragColor = vec4(color, 1.0);


    // vec3 color1 = _rgb(96., 200., 179.);
    // vec3 color2 = _rgb(27., 80., 145.);
    // vec3 color1 = _rgb(27., 80., 145.);
    // vec3 color2 = _rgb(110., 161., 212.);
    // vec3 color = mix(color1, color2, vNoise);
    // gl_FragColor = vec4(color, 1.0);

    // vec3 color = hsl2rgb(0.0, 1.0, 0.5);
    // gl_FragColor = vec4(color, 1.0);

    // 将 noise 数值作为 hue 色相值
    // vec3 color = hsl2rgb(vNoise, 1.0, 0.5);

    // vec3 color = hsl2rgb(vNoise * 0.1, 1.0, 0.5);

    // vec3 color = hsl2rgb(fract(uTime + vNoise * 0.1), 1.0, 0.5);

    // 金色多一些
    vec3 color = hsl2rgb(0.1 + vNoise * 0.1, 1.0, 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`

const material = new THREE.ShaderMaterial({
  extensions: {
    derivatives: '#extension GL_OES_standard_derivatives : enable'
  },
  uniforms: {
    uTime: { value: 0 },
    uFrequency: { value: 12 }, // 5
    uStrength: { value: 0.5 }
  },
  // wireframe: true,
  vertexShader: vertex,
  fragmentShader: fragment
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

gui.add(material.uniforms.uStrength, 'value', 0, 1, 0.01).name('uStrength')
gui.add(material.uniforms.uFrequency, 'value', 0, 20, 0.01).name('uFrequency')

const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100)
camera.position.set(0, 0, 4)
camera.lookAt(0, 0, 0)

// 3. 创建渲染器
// 般通过设置 renderer 里的 antialias 为 true 和设置 pixel ratio 来开启抗锯齿
const renderer = new THREE.WebGLRenderer({
  antialias: true
  // alpha: true
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)
renderer.setClearColor(0x000000, 1)

// document.querySelector('#app').appendChild(renderer.domElement)
document.body.appendChild(renderer.domElement)

// Animation
const orbitControls = new OrbitControls(camera, renderer.domElement)
const clock = new THREE.Clock()
function animate() {
  // time += 0.05
  // material.uniforms.uTime.value = time
  const time = clock.getElapsedTime()
  material.uniforms.uTime.value = time

  mesh.rotation.y = time
  // mesh.scale.setScalar(Math.sin(time)) // 放大缩小

  renderer.render(scene, camera)
  orbitControls.update()

  requestAnimationFrame(animate)
}

animate()

function resize() {
  width = window.innerWidth
  height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', resize)
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
