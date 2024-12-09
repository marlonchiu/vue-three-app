<!--
  https://juejin.cn/post/7358704808525971475
  作者：古柳 / 微信：xiaoaizhj 备注「可视化加群」欢迎进群交流
  「手撸一个星系，送给心爱的姑娘！（Three.js Shader 粒子系统实现）- 牛衣古柳 - 20240417」
  https://mp.weixin.qq.com/s/_vZIRze7SWO4R7gRaFukoQ
  https://juejin.cn/post/7358704808525971475

  https://actium.co.jp/
  https://codepen.io/prisoner849/pen/RwyzrVj
-->

<script setup lang="ts">
defineOptions({ name: 'Particle' })
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let w = window.innerWidth
let h = window.innerHeight

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(60, w / h, 0.001, 1000)
camera.position.set(0, 3, 24)
camera.lookAt(scene.position)

const renderer = new THREE.WebGLRenderer({
  antialias: true
  // alpha: true,
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(w, h)
renderer.setClearColor(0x160016, 1)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
// controls.enablePan = false

const count1 = 50000
const count2 = 100000
const geometry = new THREE.BufferGeometry()
const positions = []
const sizes = []
const shifts = []
for (let i = 0; i < count1 + count2; i++) {
  // 球体部分
  let theta = Math.random() * Math.PI * 2
  // let phi = Math.random() * Math.PI; // 两极密集
  let phi = Math.acos(Math.random() * 2 - 1) // 分布更均匀

  let angle = (Math.random() * 0.9 + 0.1) * Math.PI * 0.1
  let strength = Math.random() * 0.9 + 0.1 // 0.1-1
  shifts.push(theta, phi, angle, strength)

  let size = Math.random() * 1.5 + 0.5 // 0.5-2.0
  sizes.push(size)

  if (i < count1) {
    // 中心球体粒子
    let r = Math.random() * 0.5 + 9.5
    // let x = r * Math.sin(phi) * Math.cos(theta)
    // let y = r * Math.cos(phi)
    // let z = r * Math.sin(phi) * Math.sin(theta)
    let { x, y, z } = new THREE.Vector3().randomDirection().multiplyScalar(r)
    positions.push(x, y, z)
  } else {
    // 外围圆盘粒子
    let r = 10
    let R = 40
    let rand = Math.pow(Math.random(), 1.5)
    let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r) // 通过 rand=0-1 数值去线性插值 R^2 和 r^2 大概是按圆圈面积采样粒子分布更均匀
    let { x, y, z } = new THREE.Vector3().setFromCylindricalCoords(
      radius, // 半径
      Math.random() * 2 * Math.PI, // 角度
      (Math.random() - 0.5) * 2 // 高度y -1-1
    )
    positions.push(x, y, z)
  }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))
geometry.setAttribute('aShift', new THREE.Float32BufferAttribute(shifts, 4))

const vertexShader = /* GLSL */ `
  attribute float aSize;
  varying vec3 vColor;
  uniform float uTime;
  attribute vec4 aShift;
  const float PI = 3.141592653589793238;

  void main() {
    vec3 color1 = vec3(227., 155., 0.);
    vec3 color2 = vec3(100., 50., 255.);

    float d = length(abs(position) / vec3(40., 10., 40.)); // 中间黄色、外面紫色
    d = clamp(d, 0., 1.);

    vColor = mix(color1, color2, d) / 255.;

    vec3 transformed = position;
    float theta = mod(aShift.x + aShift.z * uTime, PI * 2.);
    float phi = mod(aShift.y + aShift.z * uTime, PI * 2.);
    transformed += vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * aShift.w;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = aSize * 50.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* GLSL */ `
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord.xy - 0.5);
    if (d > 0.5) discard;
    // gl_FragColor = vec4(vColor, step(0.5, 1.0 - d));
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.1, d));
  }
`

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthTest: false
})
const points = new THREE.Points(geometry, material)
// 调整相机角度；使粒子系统沿z轴的稍微倾斜，并随时间不断沿y轴旋转，这里还更改旋转顺序为 ZYX 轴。
points.rotation.order = 'ZYX'
points.rotation.z = 0.2
scene.add(points)

let clock = new THREE.Clock()
function render() {
  // if (!threeRef.value) return
  const time = clock.getElapsedTime()
  points.rotation.y = time * 0.01
  material.uniforms.uTime.value = time
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(render)
}

function resize() {
  w = window.innerWidth
  h = window.innerHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

onMounted(() => {
  window.addEventListener('resize', resize)
  render()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
