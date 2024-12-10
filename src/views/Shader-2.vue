<script setup lang="ts">
defineOptions({ name: 'Shader2' })
import * as THREE from 'three'

/**
 * 三种修饰符 attribute/uniform/varying
 * 顶点着色器 vertex shader，片元着色器 fragment shader
 * 顶点着色器里只有 attribute，片元着色器里只有 varying 和 uniform
 *
 * 顶点坐标 position、纹理坐标 uv、法线向量 normal 都是顶点上的数据，
 *      在 ShaderMaterial 的顶点着色器里能直接使用
 *  attribute vec3 position;
 *  attribute vec3 normal;
 *  attribute vec2 uv;
 *
 *  uniform float uTime;
 *
 */
let width = window.innerWidth
let height = window.innerHeight
const container = document.getElementById('three')

// 1. 创建场景
const scene = new THREE.Scene()
// 2. 创建相机
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.position.set(0, 0, 2)

//  6. 创建几何体 材质 Mesh = Geometry + Material
// 平面
// const geometry = new THREE.PlaneGeometry(1, 1)
// 3D 立方体
const geometry = new THREE.BoxGeometry(1, 1, 1)
// 球体
// const geometry = new THREE.SphereGeometry(1, 32, 16)
// 椎体
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1)

console.log('🚀 ~ geometry:', geometry)
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// 球体
// const geometry = new THREE.SphereGeometry(1, 32, 32)

// 顶点着色器里需要设置 gl_Position 顶点位置，
// 在片元着色器里需要设置 gl_FragColor 片元 / 像素颜色，
// 两者都在没有返回值的 void main() { } 主函数里设置，并且 main 函数会被自动执行

// 变量 modelViewMatrix、projectionMatrix 和属性 position 都是 ShaderMaterial 里内置的可以直接拿来用

const vertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = `
  varying vec2 vUv;



  void main() {
    // 红色 rgba
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // vUv.x => 0.0-1.0
    // 渐变
    // gl_FragColor = vec4(vUv.x, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(vUv.y, 0.0, 0.0, 1.0);

    // 黑白灰
    // gl_FragColor = vec4(vec3(vUv.x), 1.0);
    // gl_FragColor = vec4(vec3(vUv.y), 1.0);

    // 青红、蓝粉效果
    // vUv 设置到 red 和 green 通道（blue 通道设为0.0 -- 青色红色效果； blue 通道设为1.0 -- 蓝色粉色的效果）
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // 颜色突变
    // 结合 GLSL 的内置函数做出颜色突变的效果，借助 step(edge, x) 函数，
    // 其会返回0.0或1.0数值，如果 x<edge 返回0.0，如果 x>edge 返回1.0
    // step(0.5, vUv.x) 通过 vUv.x 和 0.5 比较，小于0.5的返回0.0，大于0.5的返回1.0，
    // 并将该 color 变成转换成 vec3() 格式，于是就是黑白突变的格式。

    float color = step(0.3, vUv.x);

    // 黑白突变顺序互换
    // float color = step(0.5, 1.0 - vUv.x);
    // float color = step(vUv.x, 0.5);

    gl_FragColor = vec4(vec3(color), 1.0);

    // 重复效果、条纹效果
    // 当我们想实现重复效果时，可以通过对 vUv 乘以一定倍数放大，比如0.0-1.0放大3倍变成0.0-3.0，
    // 然后用 fract() 函数取小数使得数值在 0.0-1.0 里循环重复，
    // 比如1.1、2.1取小数后都变回0.1，再将该数值转换成 vec3 再设置到颜色上，就会产生重复的黑白渐变效果。
    gl_FragColor = vec4(vec3(fract(vUv.x * 3.0)), 1.0);
    gl_FragColor = vec4(vec3(step(0.5, fract(vUv.x * 3.0))), 1.0);
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
