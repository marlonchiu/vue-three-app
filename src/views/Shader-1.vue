<script setup lang="ts">
defineOptions({ name: 'Shader1' })
import * as THREE from 'three'

let width = window.innerWidth
let height = window.innerHeight
const container = document.getElementById('three')

// 1. 创建场景
const scene = new THREE.Scene()
// 2. 创建相机
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.position.set(0, 0, 2)

//  6. 创建几何体 材质 Mesh = Geometry + Material
const geometry = new THREE.PlaneGeometry(1, 1)
console.log('🚀 ~ geometry:', geometry)
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// 球体
// const geometry = new THREE.SphereGeometry(1, 32, 32)

// 顶点着色器里需要设置 gl_Position 顶点位置，
// 在片元着色器里需要设置 gl_FragColor 片元 / 像素颜色，
// 两者都在没有返回值的 void main() { } 主函数里设置，并且 main 函数会被自动执行

// 变量 modelViewMatrix、projectionMatrix 和属性 position 都是 ShaderMaterial 里内置的可以直接拿来用

const vertex = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = `
  void main() {
    // GLSL 里 rgb 范围都是 0.0-1.0
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

// const material = new THREE.MeshBasicMaterial({
//   color: 0xff0000,
//   wireframe: true
// })
const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// 3. 创建渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
renderer.setClearColor('#e6fcf5', 1)
// container?.appendChild(renderer.domElement)
document.body.appendChild(renderer.domElement)

// 4. 将相机添加到渲染器中
scene.add(camera)

// 5. 动画
const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
