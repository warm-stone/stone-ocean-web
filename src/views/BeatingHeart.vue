<template>
  <div class="heart-container">
    <!-- 文字显示层 -->
    <div class="text-layer">
      <span :style="{ color: textColor }">
        {{ text }}
      </span>
    </div>

    <el-button-group class="setting-button-group">
      <el-button @click="drawerValue = true">
        设置
      </el-button>
    </el-button-group>
    <!-- Canvas 动画层 -->
    <div class="canvas-layer">
      <canvas ref="pinkboard" @click="changeText"></canvas>
    </div>
  </div>

  <!-- 设置抽屉 -->
  <el-drawer title="设置" placement="top" :closable="false" v-model="drawerValue">
    <el-space direction="vertical" size="large">
      <el-space>
        文字：
        <el-input v-model="text" placeholder="请输入文字" style="width: auto" />
        <el-color-picker v-model="textColor" alpha transfer :colors="defaultTextColors" />
      </el-space>
      <el-space>
        心形颜色：
        <el-color-picker v-model="heartColor" alpha transfer :colors="defaultHeartColors" />
      </el-space>
    </el-space>
  </el-drawer>
</template>

<script setup lang="ts">
// @ts-nocheck // 抑制当前文件所有 TS 错误（简单粗暴，应急用）
// 或只抑制特定错误（更精准）
// @ts-ignore: 7006 // 抑制隐式 any 错误
// @ts-ignore: 18047 // 抑制可能为 null 错误

import { onMounted, onUnmounted, ref, watch } from 'vue';
import { ElButton, ElButtonGroup, ElDrawer, ElSpace, ElInput, ElColorPicker } from 'element-plus';

console.log('原始链接：https://developer.aliyun.com/article/1503823?spm=5176.26934562.main.1.368121792vA8ED')

// --- 响应式状态 ---
const text = ref('ZSM最漂亮了');
const textColor = ref('#ea80b0');
const heartColor = ref('#ea80b0');
const drawerValue = ref(false);
const pinkboard = ref(null); // Canvas DOM 引用

// --- 常量 ---
const defaultTextColors = ['#ea80b0', '#2D8CF0', '#FF9900', '#19C919', '#9B1DEA', '#EA4CA3'];
const defaultHeartColors = ['#ea80b0', '#2D8CF0', '#FF9900', '#19C919', '#9B1DEA', '#EA4CA3'];
const textArr = ['ZSM最漂亮了'];

const ANIMATION_SETTINGS = {
  particles: {
    length: 500,
    duration: 2,
    velocity: 100,
    effect: -0.75,
    size: 30,
  },
};

// --- 动画核心逻辑封装 ---
class HeartAnimation {
  constructor(canvas, color) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationFrameId = null;
    this.particlePool = new ParticlePool(ANIMATION_SETTINGS.particles.length);
    this.particleRate = ANIMATION_SETTINGS.particles.length / ANIMATION_SETTINGS.particles.duration;
    this.time = null;
    this.heartImage = this.createHeartImage(color);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  createHeartImage(color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = ANIMATION_SETTINGS.particles.size;
    canvas.width = size;
    canvas.height = size;

    ctx.beginPath();
    let t = -Math.PI;
    let point = this.pointOnHeart(t);
    ctx.moveTo(point.x * size / 350 + size / 2, -point.y * size / 350 + size / 2);
    while (t < Math.PI) {
      t += 0.01;
      point = this.pointOnHeart(t);
      ctx.lineTo(point.x * size / 350 + size / 2, -point.y * size / 350 + size / 2);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }

  pointOnHeart(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - 1 * Math.cos(4 * t),
    };
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  update(deltaTime) {
    this.particlePool.update(deltaTime);

    const amount = this.particleRate * deltaTime;
    for (let i = 0; i < amount; i++) {
      const t = Math.PI - 2 * Math.PI * Math.random();
      const pos = this.pointOnHeart(t);
      const dir = { x: pos.x, y: pos.y };
      const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      dir.x = (dir.x / length) * ANIMATION_SETTINGS.particles.velocity;
      dir.y = (dir.y / length) * ANIMATION_SETTINGS.particles.velocity;

      this.particlePool.add(
        this.canvas.width / 2 + pos.x * 10,
        this.canvas.height / 2 - pos.y * 10,
        dir.x,
        -dir.y
      );
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particlePool.draw(this.ctx, this.heartImage);
  }

  animate(timestamp) {
    const newTime = timestamp / 1000;
    const deltaTime = newTime - (this.time || newTime);
    this.time = newTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  start() {
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  changeColor(newColor) {
    this.heartImage = this.createHeartImage(newColor);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize.bind(this));
  }
}

// --- 粒子池和粒子类 (保持简洁) ---
class Particle {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.age = 0;
  }

  initialize(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * ANIMATION_SETTINGS.particles.effect;
    this.acceleration.y = dy * ANIMATION_SETTINGS.particles.effect;
    this.age = 0;
  }

  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  }

  draw(context, image) {
    const ease = (t) => (--t) * t * t + 1;
    const size = image.width * ease(this.age / ANIMATION_SETTINGS.particles.duration);
    context.globalAlpha = 1 - this.age / ANIMATION_SETTINGS.particles.duration;
    context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
  }
}

class ParticlePool {
  constructor(length) {
    this.particles = new Array(length).fill().map(() => new Particle());
    this.firstActive = 0;
    this.firstFree = 0;
    this.duration = ANIMATION_SETTINGS.particles.duration;
  }

  add(x, y, dx, dy) {
    this.particles[this.firstFree].initialize(x, y, dx, dy);
    this.firstFree = (this.firstFree + 1) % this.particles.length;
    if (this.firstActive === this.firstFree) {
      this.firstActive = (this.firstActive + 1) % this.particles.length;
    }
  }

  update(deltaTime) {
    let i = this.firstActive;
    do {
      this.particles[i].update(deltaTime);
      i = (i + 1) % this.particles.length;
    } while (i !== this.firstFree);

    while (this.particles[this.firstActive].age >= this.duration && this.firstActive !== this.firstFree) {
      this.firstActive = (this.firstActive + 1) % this.particles.length;
    }
  }

  draw(context, image) {
    let i = this.firstActive;
    do {
      this.particles[i].draw(context, image);
      i = (i + 1) % this.particles.length;
    } while (i !== this.firstFree);
  }
}

// --- 组件逻辑 ---
let animationInstance = null;

onMounted(() => {
  if (pinkboard.value) {
    animationInstance = new HeartAnimation(pinkboard.value, heartColor.value);
    animationInstance.start();
  }
});

onUnmounted(() => {
  if (animationInstance) {
    animationInstance.destroy();
  }
});

watch(heartColor, (newColor) => {
  if (animationInstance) {
    animationInstance.changeColor(newColor);
  }
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let randomOld = 0;

function changeText() {
  if (textArr.length <= 1) return;
  let random;
  do {
    random = getRndInteger(0, textArr.length - 1);
  } while (random === randomOld);
  randomOld = random;
  text.value = textArr[random];
}
</script>

<style scoped>
.heart-container {
  position: relative;
  width: 100%;
  height: 100vh; /* 使用视口高度确保全屏 */

  overflow: hidden;
}

.text-layer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* 确保文字在 Canvas 之上 */
  font-size: 2.5rem; /* 增大字体 */
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.setting-button-group {
  position: absolute;
  top: 16px;
  left: 16px; /* 移至右上角，不遮挡文字 */
  z-index: 2;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
