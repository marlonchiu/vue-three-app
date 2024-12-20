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
  console.log('🚀 ~ getImageCoords ~ data:', data)

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
    vDepth = position.z;
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

    newPos.z += 0.02 * sin(aOffset * PI * 2.0 + uTime * 5.0);
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
let geometry, material, points

loadImages(paths, function (images) {
  const imageCoords = getImageCoords(images[0])
  const imageCoords1 = getImageCoords(images[1])
  // const imageCoords = getImageCoords(getRandomValue(images))

  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  // 粒子上下运动
  const offsets = new Float32Array(count)
  // 设置无序随机时的顶点属性数据 position1 即可。
  // 基于随机的半径和角度来生成 xy 坐标，半径范围 1 - 2，保持中心空白可能变化时效果更好，用这样随机的圆环形状表示无序状态。
  const positions1 = new Float32Array(count * 3)

  const scale = 3.0
  for (let i = 0; i < count * 3; i += 3) {
    const [x, y] = getRandomValue(imageCoords)
    const z = Math.random()
    // positions.set([x * scale + (Math.random() - 0.5) * 0.03, y * scale + (Math.random() - 0.5) * 0.03, z * -0.3], i)

    positions.set([x * scale, y * scale, z * -0.3], i)

    offsets.set([Math.random()], i / 3)

    // const r = Math.random() + 1
    // const angle = Math.random() * Math.PI * 2
    // const x1 = Math.cos(angle) * r
    // const y1 = Math.sin(angle) * r
    // const z1 = (Math.random() - 0.5) * 2
    // positions1.set([x1, y1, z1], i)

    // 两个图形间变化
    const [x1, y1] = getRandomValue(imageCoords1)
    const z1 = z * -0.3
    positions1.set([x1 * scale, y1 * scale, z1], i)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
  geometry.setAttribute('position1', new THREE.BufferAttribute(positions1, 3))

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color('rgb(3,169,244)') },
      uColor1: { value: new THREE.Color('rgb(139,195,74)') }
      // uColor: { value: new THREE.Color(getRandomValue(COLORS)) }
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
    gsap.to(material.uniforms.uProgress, {
      value: 1,
      onComplete: () => {
        animating = false
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
