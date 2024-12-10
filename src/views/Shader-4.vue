<script setup lang="ts">
defineOptions({ name: 'Shader4' })
import * as THREE from 'three'

/**
 * 自定义颜色渐变
 * mix 插值颜色
 * mix(x, y, a) 为线性插值，结果为 x*(1-a)+y*a，浮点数 a 的范围是0.0到1.0
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
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(width, height)
renderer.setClearColor('#e6fcf5', 1)
document.body.appendChild(renderer.domElement)

const vertex = /* GLSL */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* GLSL */ `
  varying vec2 vUv;

  uniform float uTime;

  void main() {
    // vec3(1.0, 0.0, 1.0) // pink 粉色
    vec3 color1 = vec3(1.0, 1.0, 0.0); // yellow 黄色
    vec3 color2 = vec3(0.0, 1.0, 1.0); // cyan 青色

    // // 对角线上渐变过去再渐变回来
    // float mixer1 = vUv.x + vUv.y;
    // float mixer2 = 2.0 - (vUv.x + vUv.y);
    // float mixer = min(mixer1, mixer2);

    // vec3 color = mix(color1, color2, mixer);
    // // vec3 color = mix(color1, color2, step(0.5, mixer));
    // gl_FragColor = vec4(color, 1.0);

    // 限制最大值后再相乘
    float mixer1 = vUv.x + vUv.y;
    mixer1 = clamp(mixer1, 0.0, 1.0);
    float mixer2 = 2.0 - (vUv.x + vUv.y);
    mixer2 = clamp(mixer2, 0.0, 1.0);
    float mixer = mixer1 * mixer2;

    vec3 color = mix(color1, color2, mixer);
    // vec3 color = mix(color1, color2, step(0.5, mixer));
    gl_FragColor = vec4(color, 1.0);

  }
`

//  6. 创建几何体 材质 Mesh = Geometry + Material
// 平面
const geometry = new THREE.PlaneGeometry(1, 1)
// 3D 立方体
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// 球体
// const geometry = new THREE.SphereGeometry(1, 32, 32)
// 椎体
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1)
console.log('🚀 ~ geometry:', geometry)

// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
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
  material.uniforms.uTime.value = time * 3.0
  renderer.render(scene, camera)
  // requestAnimationFrame(animate)
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
