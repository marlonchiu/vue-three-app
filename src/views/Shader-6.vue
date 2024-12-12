<script setup lang="ts">
defineOptions({ name: 'Shader6' })
import * as THREE from 'three'

/**
 * 顶点着色器
 *
 */
let width = window.innerWidth
let height = window.innerHeight
const container = document.getElementById('three')

// 1. 创建场景
const scene = new THREE.Scene()

// 2. 创建相机
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
// 4. 设置相机位置
// camera.position.set(0, 0, 1.5)
camera.position.set(1, 1, 4) // 立体视角
camera.lookAt(new THREE.Vector3())

// 3. 创建渲染器
// 般通过设置 renderer 里的 antialias 为 true 和设置 pixel ratio 来开启抗锯齿
const renderer = new THREE.WebGLRenderer({
  // antialias: true,
  // alpha: true
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)
renderer.setClearColor(0xe6fcf5, 1)
document.body.appendChild(renderer.domElement)

/**
 * 借助顶点着色器我们就能对几何体上每个顶点的位置进行改变从而实现特殊的效果
 *
 * 三维空间里的物体显示到二维屏幕上需要通过 MVP 矩阵变换操作，
 * 即 Model 模型矩阵、View 视图矩阵和 Projection 投影矩阵（前俩者可以合并为 modelViewMatrix）
 */
const vertex0 = /* GLSL */ `
  uniform float uTime;

  void main() {
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // 球体放大缩小
    // vec3 newPos = position * 0.7;

    // 球体大小动态变化
    // vec3 newPos = position * sin(uTime);

    // 顶点 y 坐标累加 sin 值
    vec3 newPos = position * 1.0;
    // newPos.y += sin(position.y * 4.0);
    // newPos.y += sin(position.y * (sin(uTime) + 1.0) * 5.0);
    // newPos.y += sin(position.y * 1.0 + uTime * 2.0);

    // xyz 坐标不同偏移
    newPos.y += sin(position.y * 1.0 + uTime * 2.0);
    newPos.x += 0.8 * sin(position.z * 0.5 + uTime * 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

const vertex = /* GLSL */ `
  //	Classic Perlin 3D Noise
  //	by Stefan Gustavson
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

  float cnoise(vec3 P){
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  // 3D Randomness
  float random(vec3 pos){
    return fract(sin(dot(pos, vec3(64.25375463, 23.27536534, 86.29678483))) * 59482.7542);
  }

  uniform float uTime;

  varying vec3 vNormal;

  void main() {


    /**
     * 每个顶点自带的属性有 position、uv 和 normal
     * normal （其为单位向量）表示偏移方向，用 noise 得到的数值表示偏移幅度,
     * 再累加到 position 上即可实现所需效果
     */

    // noise 函数
    vec3 newPos = position;

    // newPos += cnoise(position);

    // normal 作为颜色
    // newPos += normal * cnoise(position);
    // newPos += normal * cnoise(position * 5.0);

    // noise 的效果有更多平滑些的部分，因为邻近点的偏移数值或幅度相近，像是山脉一样有自然起伏，
    // 而 random 的效果与顶点是否邻近无关，任何位置都是一样的随机，因而骤变的情形更多。

    // newPos += normal * random(position);

    // 动态调整数值
    newPos += normal * cnoise(position * (sin(uTime) + 1.0) * 4.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    vNormal = normal;
  }
`

const fragment = /* GLSL */ `
  varying vec3 vNormal;

  void main() {
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

    gl_FragColor = vec4(vNormal, 1.0);
  }
`

//  6. 创建几何体 材质 Mesh = Geometry + Material
const geometry = new THREE.SphereGeometry(1, 64, 32)
// const geometry = new THREE.SphereGeometry(1, 32, 16)
// const geometry = new THREE.SphereGeometry(1, 64, 64)
// const geometry = new THREE.SphereGeometry(1, 128, 128)
// const geometry = new THREE.SphereGeometry(1, 256, 256)
console.log('🚀 ~ geometry:', geometry)

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  // 波纹模式
  wireframe: false,
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
  material.uniforms.uTime.value = time
  renderer.render(scene, camera)
  // mesh.scale.setScalar(Math.sin(time)) // 放大缩小
  mesh.rotation.y = time
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
