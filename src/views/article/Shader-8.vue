<script setup lang="ts">
defineOptions({ name: 'Shader8' })
import * as THREE from 'three'

/**
 * 顶点旋转
 *
 */
let width = window.innerWidth
let height = window.innerHeight

const scene = new THREE.Scene()

const geometry = new THREE.BoxGeometry(3, 1, 1, 64, 64, 64)

const vertexShader = /* GLSL */ `
  uniform float uTime;
  varying vec2 vUv;

  const float PI = 3.1415925;

  // https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
  // glsl-rotation-3d
  mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }


  void main() {
    vUv = uv;
    // vec3 newPos = position;

    // 旋转顶点
    vec3 axis = vec3(1.0, 0.0, 0.0);
    // vec3 axis = vec3(0.0, 1.0, 0.0);
    // vec3 axis = vec3(0.0, 0.0, 1.0);
    // vec3 axis = vec3(1.0, 1.0, 1.0);

    // float angle = PI / 4.0;

    // 让角度随时间变化，就能实现 mesh.rotation.y=time 同样的效果
    // float angle = uTime;

    // 旋转角度随x值而变化
    // float angle = position.x;
    // float angle = position.x + uTime;

    float angle = position.x + sin(uTime) * 3.0 + uTime;

    vec3 newPos = rotate(position, axis, angle);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

const fragmentShader = /* GLSL */ `
  varying vec2 vUv;

  void main() {

    // gl_FragColor = vec4(vUv, 0.0, 1.0);

    // 加个条纹
    vec3 color1 = vec3(0.847, 0.204, 0.373);
    vec3 color2 = vec3(1.0);
    float mixer = step(0.5, fract(vUv.y * 3.0));
    // vec3 color = vec3(mixer);
    vec3 color = mix(color1, color2, mixer);
    gl_FragColor = vec4(color, 1.0);

  }
`

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  // wireframe: true,
  vertexShader,
  fragmentShader
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100)
camera.position.set(0, 0, 3)
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
const clock = new THREE.Clock()
function animate() {
  let time = clock.getElapsedTime()
  material.uniforms.uTime.value = time

  // 旋转
  // mesh.rotation.y = time

  renderer.render(scene, camera)
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
