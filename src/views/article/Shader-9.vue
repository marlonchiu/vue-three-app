<script setup lang="ts">
defineOptions({ name: 'Shader9' })
import * as THREE from 'three'
import flagImg from '@/assets/spain-flag.webp'

let width = window.innerWidth
let height = window.innerHeight

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000)
camera.position.set(0, 1, 1)
camera.lookAt(new THREE.Vector3())

const vertexShader = /* GLSL */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vStrength;
  uniform vec2 uMouse;

  const float PI = 3.1415925;

  void main() {
    vUv = uv;
    vec3 newPos = position;
    newPos.z += 0.5 * sin(position.x * PI * 2.0);

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    // 另一种实现
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += 0.5 * sin(modelPosition.x * PI * 2.0);
    // // modelPosition.y += 0.5 * sin(modelPosition.x * PI * 2.0 + uTime);
    // gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // 动起来
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += 0.08 * sin(modelPosition.x * PI * 2.0 + uTime);
    // modelPosition.y += 0.1 * sin(modelPosition.z * PI * 1.5 + uTime);
    // gl_Position = projectionMatrix * viewMatrix * modelPosition;


    // smoothstep 平滑过渡
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += 0.08 * sin(modelPosition.x * PI * 2.0 + uTime);
    // modelPosition.y += 0.1 * sin(modelPosition.z * PI * 1.5 + uTime);
    // float strength = uv.x;
    // float strength = smoothstep(0.0, 1.0, uv.x);
    // float strength = smoothstep(0.2, 0.8, uv.x);
    // float strength = smoothstep(0.0, 0.5, abs(uv.x - 0.5));
    // float strength = smoothstep(0.3, 0.0, abs(uv.x - 0.5));

    // float dist = distance(uv, vec2(0.5));
    float dist = distance(uv, uMouse);
    // float strength = smoothstep(0.3, 0.0, abs(uv.x - 0.5 + 0.5 * sin(uTime)));
    float strength = smoothstep(0.3, 0.0, dist);
    vStrength = strength;
    // modelPosition.y += 0.3 * strength;
    modelPosition.y += 0.2 * sin(uTime) * strength;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

  }
`

const fragmentShader = /* GLSL */ `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  varying float vStrength;

  void main() {

    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
    // gl_FragColor = vec4(color, 1.0);

    vec3 color = vec3(vStrength);
    gl_FragColor = texture2D(uTexture, vUv);
  }
`

const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

// const geometry = new THREE.PlaneGeometry(1, 1, 30, 30)
const geometry = new THREE.PlaneGeometry(0.8, 0.534, 30, 30)

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: {
      // value: new THREE.TextureLoader().load('./assets/spain-flag.webp')
      value: new THREE.TextureLoader().load(flagImg)
    },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  },
  // wireframe: true,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
})

const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.x = -Math.PI / 2
scene.add(mesh)

// 3. 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)
renderer.setClearColor(0x000000, 1)

// document.querySelector('#app').appendChild(renderer.domElement)
document.body.appendChild(renderer.domElement)

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = (-e.clientY / window.innerHeight) * 2 + 1
})

// Animation
const clock = new THREE.Clock()
function animate() {
  let time = clock.getElapsedTime()
  material.uniforms.uTime.value = time * 2.0

  raycaster.setFromCamera(mouse, camera)
  const intersect = raycaster.intersectObject(mesh)
  if (intersect.length > 0) {
    console.log(intersect[0])
    material.uniforms.uMouse.value = intersect[0].uv
  }

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
