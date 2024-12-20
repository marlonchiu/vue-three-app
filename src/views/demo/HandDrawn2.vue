<!--
  黑白手绘线稿图变3D彩色粒子，带你用Three.js Shader一步步实现（下）

  https://mp.weixin.qq.com/s/3-zMC7ore1v_ldysgODSYA
  https://juejin.cn/post/7377567987118833715

  https://noni.cmiscm.com/

  https://codepen.io/GuLiu/pen/BaeZEqR

  https://news.cgtn.com/event/2019/whorunschina/index.html
-->

<script setup>
defineOptions({ name: 'HandDrawn2' })
import { onMounted, onUnmounted } from 'vue'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

let width = window.innerWidth
let height = window.innerHeight

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000)
camera.position.set(0, 0, 2)
camera.lookAt(new THREE.Vector3())

const renderer = new THREE.WebGLRenderer({
  antialias: true
  // alpha: true
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(width, height)
renderer.setClearColor(0xe6fcf5, 1)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
// controls.enablePan = false

// const paths = ['@/assets/fish-03.svg', '@/assets/cookie-01.svg', '@/assets/matches-03.svg', '@/assets/triangle-01.svg']
const paths = [
  'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/fish-03.svg',
  'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/cookie-01.svg',
  'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/matches-03.svg',
  'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/triangle-01.svg'
]

function loadImages(paths, whenLoaded) {
  const images = []
  paths.forEach((path) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    // img.setAttribute('crossOrigin', '')
    img.onload = function () {
      images.push(img)
      if (images.length === paths.length) {
        whenLoaded(images)
      }
    }
    img.src = path
  })
}

const size = 100
const canvas = document.createElement('canvas')
canvas.width = size
canvas.height = size
const ctx = canvas.getContext('2d')
// document.body.appendChild(canvas)
// canvas.classList.add('test-canvas')
// canvas.style.position = 'fixed'
// canvas.style.top = 0
// canvas.style.left = 0

function getImageCoords(img) {
  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data

  // 过滤出黑色位置的坐标
  const imageCoords = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const red = data[(y * size + x) * 4]
      // const green = data[(y * size + x) * 4 + 1];
      // const blue = data[(y * size + x) * 4 + 2];
      // const alpha = data[(y * size + x) * 4 + 3];
      if (red > 0 && red < 50) {
        // imageCoords.push(x, y);
        imageCoords.push([x / size - 0.5, 0.5 - y / size])
      }
    }
  }
  return imageCoords
}

function setGeometryAttributes(imageCoords) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i += 3) {
    const [x, y] = getRandomValue(imageCoords)
    const scale = 3.0
    const z = Math.random()
    // positions.set([x * scale, y * scale, z * -0.3], i)
    positions.set(
      [
        // x * scale, y * scale,
        x * scale + 0.001 * (Math.random() - 0.5),
        y * scale + 0.001 * (Math.random() - 0.5),
        z * -0.3
      ],
      i
    )
  }
  return positions
}

function getRandomValue(data) {
  return data[Math.floor(Math.random() * data.length)]
}

const COLORS = [
  'rgb(244,67,54)',
  'rgb(233,30,99)',
  'rgb(156,39,176)',
  'rgb(103,58,183)',
  'rgb(63,81,181)',
  'rgb(33,150,243)',
  'rgb(3,169,244)',
  'rgb(0,188,212)',
  'rgb(0,150,136)',
  'rgb(76,175,80)',
  'rgb(139,195,74)',
  'rgb(205,220,57)',
  'rgb(255,235,59)',
  'rgb(255,193,7)',
  'rgb(255,152,0)',
  'rgb(255,87,34)'
]

const vertexShader = /* GLSL */ `
  attribute float aOffset;
  attribute vec3 position1;
  uniform float uTime;

  varying float vDepth;

  const float PI = 3.141592653589793238;

  varying float vProgress;

  uniform float uProgress;

  void main() {
    // vDepth = position.z;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 粒子上下运动
    // vec3 newPos = position;

    // 粒子无序展示
    // vec3 newPos = position1;

    // 粒子由无序到有序
    // vec3 newPos = mix(position1, position, abs(sin(uTime/2.)));

    // float progress = abs(sin(uTime/2.0));
    // vProgress = progress;
    // vec3 newPos = mix(position, position1, progress);

    vec3 newPos = mix(position, position1, uProgress);
    vDepth = mix(position.z, position1.z, uProgress);
    newPos.z += 0.03 * sin(aOffset * PI * 2.0 + uTime * 5.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    gl_PointSize = 12.0;
  }
`

const fragmentShader = /* GLSL */ `
  uniform vec3 uColor;
  uniform vec3 uColor1;

  varying float vDepth;
  varying float vProgress;
  uniform float uProgress;

  vec3 setColor(vec3 color, float depth) {
    float value = depth / -0.3 * 30.0;
    float r = clamp(color.r - value * 5.0/255.0, 0.0, 1.0);
    float g = clamp(color.g - value * 5.0/255.0, 0.0, 1.0);
    float b = clamp(color.b - value * 5.0/255.0, 0.0, 1.0);
    return vec3(r, g, b);
  }

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float mask = smoothstep(0.5, 0.499, dist);
    // vec3 color = setColor(uColor, vDepth);
    // vec3 color = mix(uColor, uColor1, vProgress);
    vec3 color = mix(uColor, uColor1, uProgress);
    color = setColor(color, vDepth);
    gl_FragColor = vec4(color, 1.0 * mask);
  }
`
const count = 16000
let current = 0
let geometry, material, points
let geometryAttributes = []

loadImages(paths, function (images) {
  images.forEach((img) => {
    const imageCoords = getImageCoords(img)
    geometryAttributes.push(setGeometryAttributes(imageCoords))
  })

  geometry = new THREE.BufferGeometry()

  // 粒子上下运动
  const offsets = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    offsets.set([Math.random()], i)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(geometryAttributes[current], 3))
  geometry.setAttribute('position1', new THREE.BufferAttribute(geometryAttributes[current], 3))
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))

  const color = new THREE.Color(getRandomValue(COLORS))
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      // uColor: { value: new THREE.Color("rgb(3,169,244)") },
      // uColor1: { value: new THREE.Color("rgb(139,195,74)") },
      uColor: { value: color },
      uColor1: { value: color }
    },
    // 文章中不显示的问题解决
    transparent: true,
    depthTest: false,
    depthWrite: false,
    // wireframe: true,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
})

const clock = new THREE.Clock()
function animate() {
  let time = clock.getElapsedTime()
  if (material) {
    material.uniforms.uTime.value = time
  }

  renderer.render(scene, camera)
  controls.update()

  requestAnimationFrame(animate)
}

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

// 点击变化
let animating = false
window.addEventListener('click', () => {
  if (!animating) {
    animating = true
    current++
    current = current % paths.length

    geometry.attributes.position1.array = geometryAttributes[current]
    geometry.attributes.position1.needsUpdate = true
    const color = new THREE.Color(getRandomValue(COLORS))
    material.uniforms.uColor1.value = color

    gsap.to(material.uniforms.uProgress, {
      value: 1,
      onComplete: () => {
        animating = false
        geometry.attributes.position.array = geometryAttributes[current]
        geometry.attributes.position.needsUpdate = true
        material.uniforms.uColor.value = color
        material.uniforms.uProgress.value = 0
      }
    })
  }
})

onMounted(() => {
  window.addEventListener('resize', resize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
