<script setup lang="ts">
defineOptions({ name: 'Shader3' })
import * as THREE from 'three'

/**
 * 介绍绘制圆形，包括用 length() 函数结合 step() 绘制，通过移动坐标原点实现完整圆形，也可用 distance() 函数替代。
 * 讲解了半径动态变化，用 uniforms 传入时间控制，实现圆圈半径随时间周期变化及一组重复圆圈的动态变化。
 * 此外有径向条纹效果，通过对距离的操作实现，还能让条纹动起来。最后强调了理解计算顺序的重要性。
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
    // vec3 color = vec3(step(0.5, fract(vUv.x * 3.0)));
    // gl_FragColor = vec4(color, 1.0);

    // 绘制渐变圆形
    // float dist = length(vUv);
    // vec3 color = vec3(dist);
    // gl_FragColor = vec4(color, 1.0);


    // 绘制圆形
    // float dist = length(vUv);
    // vec3 color = vec3(step(0.5, dist));
    // gl_FragColor = vec4(color, 1.0);

    // 通过 vUv - vec2(0.5) 将所有坐标整体移动
    // float radius = 0.5;
    // float distance = length(vUv - vec2(0.5));
    // float alpha = step(radius, distance);
    // gl_FragColor = vec4(vec3(alpha), 1.0);

    // 半径动态变化
    // float distance = length(vUv - vec2(0.5));
    // float radius = 0.5 * (sin(uTime) * 0.5 + 0.5);
    // float alpha = step(radius, distance);
    // gl_FragColor = vec4(vec3(alpha), 1.0);

    // 一组重复圆圈动态变化
    // float distance = length(fract(vUv * 5.0) - vec2(0.5));
    // float radius = 0.5 * (sin(uTime) * 0.5 + 0.5);
    // // float alpha = step(radius, distance);
    // // gl_FragColor = vec4(vec3(alpha), 1.0);
    // vec3 color = vec3(step(radius, distance));
    // gl_FragColor = vec4(color, 1.0);

    // 一组重复圆圈动态变化 半径不一致
    // float distance = length(fract(vUv * 5.0) - vec2(0.5));
    // // 半径大小随时间周期变化
    // float radius = 0.5 * (sin(uTime + vUv.x + vUv.y) * 0.5 + 0.5);
    // float alpha = step(radius, distance);
    // gl_FragColor = vec4(vec3(alpha), 1.0);

    // 径向条纹效果 反向运动可以减去 uTime * 0.5  倍率0.1 控制变换速度
    float distance = fract((length(vUv - vec2(0.5)) / 0.707 - uTime * 0.1) * 5.0);
    float radius = 0.5;
    float alpha = step(radius, distance);
    vec3 color = vec3(alpha);
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
