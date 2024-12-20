<script setup lang="ts">
defineOptions({ name: 'Shader5' })
import * as THREE from 'three'

/**
 * 棋盘格
 *
 * smoothstep 和 mix、distance、length、clamp、sin、step 内置函数
 */
let width = window.innerWidth
let height = window.innerHeight
const container = document.getElementById('three')

// 1. 创建场景
const scene = new THREE.Scene()

// 2. 创建相机
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000)
// 4. 设置相机位置
camera.position.set(0, 0, 1.5)
// camera.position.set(1, 1, 1) // 立体视角
camera.lookAt(new THREE.Vector3())

// 3. 创建渲染器

// 般通过设置 renderer 里的 antialias 为 true 和设置 pixel ratio 来开启抗锯齿
const renderer = new THREE.WebGLRenderer({
  // antialias: true,
  // alpha: true
})
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)
renderer.setClearColor(0xe6fcf5, 1)
document.body.appendChild(renderer.domElement)

const vertex = /* GLSL */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment0 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    vec3 mask1 = vec3(step(0.5, fract(vUv.x * 3.0)));
    vec3 mask2 = vec3(step(0.5, fract(vUv.y * 3.0)));
    // 竖条纹
    // vec3 color = mask1;
    // 横条纹
    vec3 color = mask2;
    gl_FragColor = vec4(color, 1.0);
  }
`
const fragment1 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    vec3 mask1 = vec3(step(0.5, fract(vUv.x * 3.0)));
    vec3 mask2 = vec3(step(0.5, fract(vUv.y * 3.0)));
    vec3 color = abs(mask1- mask2);
    gl_FragColor = vec4(color, 1.0);
  }
`
const fragment2 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    // vec3 color1 = vec3(1.0, 1.0, 0.0);
    // vec3 color2 = vec3(0.0, 1.0, 1.0);
    vec3 color1 = vec3(0.0, 0.0, 0.0);
    vec3 color2 = vec3(1.0, 1.0, 0.0); // 黄色


    float mask1 = step(0.5, fract(vUv.x * 3.0));
    float mask2 = step(0.5, fract(vUv.y * 3.0));
    float mixer = abs(mask1 - mask2);
    vec3 color = mix(color1, color2, mixer);
    gl_FragColor = vec4(color, 1.0);
  }
`
const fragment3 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    // 1. 模糊圆，数值从中心0.0往四周增大
    // float strength = distance(vUv, vec2(0.5));
    // float strength = step(0.2, distance(vUv, vec2(0.5)));

    // 2. 中心黑色，数值从-0.2向四周增大到正数
    // float strength = distance(vUv, vec2(0.5)) - 0.2;

    // 3. 离中心0.2的位置数值为0.0，向外和向内都是增大
    // float strength = abs(distance(vUv, vec2(0.5)) - 0.2);

    // 4.对一个较小的数取 step 就能画出圆环效果，圆环上是数值小于0.01的变成0.0，外部和内部是大于0.01的变成1.0。
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.2));
    float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.2));

    vec3 color = vec3(strength);
    gl_FragColor = vec4(color, 1.0);
  }
`

// 对角线渐变用 abs 再度实现
const fragment4 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    // vUv.x+vUv.y 从左下角到右上角范围是0.0-2.0，我们先减去1.0变化到 -1.0 - 1.0，
    // 再取绝对值变成1.0 - 0.0 - 1.0，最后用1.0减去变成0.0-1.0-0.0就是所需的效果了

    float mixer1 = vUv.x + vUv.y;
    float mixer2 = 2.0 - (vUv.x + vUv.y);
    float mixer = min(mixer1, mixer2);
    // float mixer = 1.0 - abs((vUv.x + vUv.y - 1.0));
    vec3 color = vec3(mixer);
    gl_FragColor = vec4(color, 1.0);
  }
`
// 抗锯齿 aastep
const fragment5 = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  float aastep(float threshold, float value) {
    #ifdef GL_OES_standard_derivatives
      float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
      return smoothstep(threshold-afwidth, threshold+afwidth, value);
    #else
      return step(threshold, value);
    #endif
  }


  void main() {
    // float strength = step(0.25, distance(vUv, vec2(0.5)));
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.2));

    float strength = aastep(0.01, abs(distance(vUv, vec2(0.5)) - 0.2));

    vec3 color = vec3(strength);
    gl_FragColor = vec4(color, 1.0);
  }
`
// 抗锯齿 smoothstep
const fragment = /* GLSL */ `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    // smoothstep(edge1, edge2, x) 接收3个参数，当 x<=edge1 时返回0.0；
    // 当 x>=edge2 时返回1.0；当 edge1<x<edge2 时返回平滑插值的数值。

    float strength = smoothstep(0.2, 0.8, vUv.x);
    vec3 color = vec3(strength);
    gl_FragColor = vec4(color, 1.0);
  }
`

//  6. 创建几何体 材质 Mesh = Geometry + Material
// 平面
const geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
// 3D 立方体
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// 球体
// const geometry = new THREE.SphereGeometry(1, 64, 32)
// 椎体
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1)
console.log('🚀 ~ geometry:', geometry)

// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  extensions: {
    derivatives: true
  },
  vertexShader: vertex,
  fragmentShader: fragment
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Animation
let time = 0
let clock = new THREE.Clock()
function animate() {
  // time += 0.05
  // material.uniforms.uTime.value = time
  let time = clock.getElapsedTime()
  material.uniforms.uTime.value = time
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resize)
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
