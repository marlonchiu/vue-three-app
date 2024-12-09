<!-- https://juejin.cn/post/7386532770476474377 入门 -->

<script setup lang="ts">
defineOptions({ name: 'GetStarted' })
import { onMounted } from 'vue'
import * as THREE from 'three'

// scene， 这个就是场景，相当于之前例子里的房间，里面放物体灯光等东西
// camera，这个相当于人眼
// cube，相当于物体
// renderer，就是渲染器
// ambient，环境光。就相当于普通晴天的时候房间里面的光，物体的投影几乎看不见
// direction，平行光。相当于一个台灯照射出的光，投到物体上会出现投影

interface IThreeObj {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  cube: THREE.Mesh
  renderer: THREE.WebGLRenderer
  ambient: THREE.AmbientLight
  direction: THREE.DirectionalLight
}

const ThreeObj = {} as IThreeObj

const width = window.innerWidth
const height = window.innerHeight

// geometry: 一个物体的外骨架
// material：物体的材质
// new THREE.Mesh(geometry, material)： 通过传入骨架和材质创建一个物体，这非常合理，骨架外面贴上材质就是一个物体了。
// cube.position.set(0, 0, 0)：设置物体在0,0,0这个位置，这就是xyz坐标的原点

// 创建一个正方块
const createBox = () => {
  const geometry = new THREE.BoxGeometry(50, 50, 50)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(0, 0, 0)
  ThreeObj.cube = cube
}

// 创建相机
const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
  camera.position.set(200, 200, 200)
  camera.lookAt(ThreeObj.cube.position)
  ThreeObj.camera = camera
}

// 创建一个渲染器
const createRenderer = () => {
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000)
  renderer.setSize(width, height)
  document.getElementById('three')?.appendChild(renderer.domElement)
  ThreeObj.renderer = renderer
}

// 创建灯光
const createLight = () => {
  const ambient = new THREE.AmbientLight(0xffffff)
  const direction = new THREE.DirectionalLight(0xffffff, 1)
  direction.position.set(100, 200, 50)
  ThreeObj.ambient = ambient
  ThreeObj.direction = direction
}

const create = () => {
  createBox()
  createCamera()
  createRenderer()
  createLight()
}

// 创建一个场景
const initScene = () => {
  const scene = new THREE.Scene()
  scene.add(ThreeObj.cube)
  scene.add(ThreeObj.ambient)
  scene.add(ThreeObj.direction)
  ThreeObj.scene = scene
}

const render = () => {
  // 注意调用顺序，只有先调用初始化场景之后才有相机、场景这两个对象
  initScene()
  // 将眼睛(camera)和屋子(scene)做为参数传到render函数里进行渲染
  ThreeObj.renderer.render(ThreeObj.scene, ThreeObj.camera)
}

onMounted(() => {
  create()
  render()
})
</script>

<template>
  <div id="three"></div>
</template>

<style scoped></style>
