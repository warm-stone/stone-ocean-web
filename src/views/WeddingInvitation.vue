<template>
  <div class="invite">
    <!-- 背景音乐：请将《简单爱》mp3 放到 public/music/simple-love.mp3 -->
    <audio
      ref="audioRef"
      :src="musicSrc"
      loop
      preload="auto"
      @play="playing = true"
      @pause="playing = false"
      @error="onAudioError"
    />
    <button
      class="music-btn"
      :class="{ playing }"
      type="button"
      :title="playing ? '关闭背景音乐' : '开启背景音乐'"
      aria-label="播放或暂停背景音乐"
      @click="toggleMusic"
    >
      <span class="disc">♫</span>
    </button>
    <span v-if="mutedPending" class="music-hint">轻触屏幕，开启背景音乐 ♪</span>

    <!-- 封面 -->
    <section class="cover">
      <img class="cover-bg" :src="coverSrc" alt="婚纱照封面" />
      <div class="cover-mask"></div>
      <div class="petals" aria-hidden="true">
        <span
          v-for="(pt, i) in petals"
          :key="i"
          class="petal"
          :style="{
            left: pt.left,
            animationDelay: pt.delay,
            animationDuration: pt.dur,
            fontSize: pt.size,
          }"
        >
          🌸
        </span>
      </div>
      <div class="hearts" aria-hidden="true">
        <span
          v-for="(h, i) in hearts"
          :key="i"
          class="heart"
          :style="{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.dur,
            fontSize: h.size,
          }"
        >
          💕
        </span>
      </div>
      <div class="cover-content">
        <p class="cover-eng">WE ARE GETTING MARRIED</p>
        <h1 class="cover-names">
          <span class="name">{{ BRIDE }}</span>
          <span class="hrt">❤</span>
          <span class="name">{{ GROOM }}</span>
        </h1>
        <p class="cover-date">{{ WEDDING_DATE }}</p>
        <p class="cover-sub">一生一世 · 只愿有你</p>
        <span class="sparkle sp-1" aria-hidden="true">✨</span>
        <span class="sparkle sp-2" aria-hidden="true">✨</span>
        <div class="scroll-cue">
          <span>向下滑动</span>
          <i class="chevron">⌄</i>
        </div>
      </div>
    </section>

    <!-- 引言 -->
    <section class="intro section-pad reveal">
      <p class="orn">❀</p>
      <div class="float-poem fp-intro" aria-label="开篇诗词">
        <p v-for="(line, li) in openingPoem" :key="li" class="float-line">
          <span
            v-for="(fc, ci) in line.chars"
            :key="ci"
            class="float-char"
            :style="{ animationDelay: fc.delay + 'ms' }"
            >{{ fc.ch }}</span
          >
        </p>
      </div>
      <p class="intro-text">
        我们从相识、相知到相爱，一路走来历经风雨，终于决定携手步入婚姻的殿堂。
        这一天我们期待已久，真诚地邀请您，与我们一同见证这幸福时刻。
      </p>
      <div class="intro-photo">
        <img :src="introSrc" alt="婚纱照" loading="lazy" />
      </div>
    </section>

    <!-- 倒计时 -->
    <section class="countdown section-pad reveal">
      <h2 class="section-title">距离婚礼还有</h2>
      <p class="section-en">COUNTDOWN</p>
      <div class="divider"><i></i><span>❦</span><i></i></div>
      <div class="cd-boxes">
        <div class="cd-cell">
          <span :key="days" class="cd-num">{{ days }}</span>
          <span class="cd-label">天</span>
        </div>
        <div class="cd-cell">
          <span :key="hours" class="cd-num">{{ pad(hours) }}</span>
          <span class="cd-label">时</span>
        </div>
        <div class="cd-cell">
          <span :key="minutes" class="cd-num">{{ pad(minutes) }}</span>
          <span class="cd-label">分</span>
        </div>
        <div class="cd-cell">
          <span :key="seconds" class="cd-num">{{ pad(seconds) }}</span>
          <span class="cd-label">秒</span>
        </div>
      </div>
    </section>

    <!-- 婚礼信息 -->
    <section class="info section-pad reveal">
      <h2 class="section-title">婚礼信息</h2>
      <p class="section-en">WEDDING INFORMATION</p>
      <div class="divider"><i></i><span>❦</span><i></i></div>
      <div class="info-card">
        <div class="info-row">
          <span class="info-icon">✦</span>
          <div class="info-body">
            <p class="info-label">良辰吉日</p>
            <p class="info-value">{{ WEDDING_DATE }} · {{ WEEKDAY }}</p>
          </div>
        </div>
        <div class="info-row">
          <span class="info-icon">✦</span>
          <div class="info-body">
            <p class="info-label">婚宴时间</p>
            <p class="info-value">{{ CEREMONY_TIME }}</p>
          </div>
        </div>
        <div class="info-row">
          <span class="info-icon">✦</span>
          <div class="info-body">
            <p class="info-label">婚宴地点</p>
            <p class="info-value">{{ VENUE }}</p>
            <p class="info-value venue-address">{{ VENUE_ADDRESS }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 相册 -->
    <section class="album section-pad reveal">
      <h2 class="section-title">甜蜜瞬间</h2>
      <p class="section-en">PRECIOUS MOMENTS</p>
      <div class="divider"><i></i><span>❦</span><i></i></div>
      <div class="float-poem fp-album" aria-label="甜蜜瞬间诗词">
        <p v-for="(line, li) in sweetPoem" :key="li" class="float-line">
          <span
            v-for="(fc, ci) in line.chars"
            :key="ci"
            class="float-char"
            :style="{ animationDelay: fc.delay + 'ms' }"
            >{{ fc.ch }}</span
          >
        </p>
      </div>
      <div v-for="(seg, i) in gallery" :key="i" :class="['segment', 'seg-' + seg.layout]">
        <img
          v-if="seg.layout === 'wide'"
          :src="seg.photos[0]?.src"
          :alt="`婚纱照 ${i + 1}`"
          loading="lazy"
        />
        <div v-else class="seg-cols">
          <div v-for="(col, ci) in seg.cols" :key="ci" class="seg-col">
            <img
              v-for="ph in col"
              :key="ph.src"
              :src="ph.src"
              :alt="`婚纱照 ${i + 1}`"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 结尾 -->
    <section class="closing section-pad reveal">
      <p class="orn">❀</p>
      <h2 class="section-title">诚挚邀请</h2>
      <p class="section-en">WITH OUR BEST WISHES</p>
      <div class="divider"><i></i><span>❦</span><i></i></div>
      <p class="closing-text">
        您的出席，是我们的荣幸<br />
        您的祝福，是我们的动力
      </p>
      <div class="float-poem fp-closing" aria-label="邀请诗词">
        <p v-for="(line, li) in invitePoem" :key="li" class="float-line">
          <span
            v-for="(fc, ci) in line.chars"
            :key="ci"
            class="float-char"
            :style="{ animationDelay: fc.delay + 'ms' }"
            >{{ fc.ch }}</span
          >
        </p>
      </div>
      <p class="closing-names">{{ BRIDE }} &amp; {{ GROOM }}</p>
      <p class="closing-date">{{ WEDDING_DATE }} · {{ WEEKDAY }}</p>
      <p class="closing-bye">我们婚礼见 ❤</p>
    </section>

    <footer class="footer">— END —</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

// ====== 婚礼信息配置（修改这里即可） ======
const BRIDE = '郑思敏'
const GROOM = '胡志强'
const WEDDING_DATE = '2026.10.03' // 婚礼日期
const WEEKDAY = '星期六'
const CEREMONY_TIME = '12:08' // TODO: 婚宴时间(吉时)
const VENUE = '乐安酒店' // 婚宴地点
const VENUE_ADDRESS = '山东惠民乐安一路乐安花苑小区西门西南60米' // 婚宴地址
// ========================================

const src = (name: string) => `${import.meta.env.BASE_URL}invite/${name}.jpg`
const coverSrc = src('photo-02')
const introSrc = src('photo-01')
const musicSrc = `${import.meta.env.BASE_URL}music/simple-love.mp3`

interface Photo {
  src: string
}

interface AlbumSeg {
  layout: 'wide' | 'masonry'
  photos: Photo[]
  cols: Photo[][] // masonry：左右两列拆分
}

const P = (name: string): Photo => ({ src: src(name) })

// 瀑布流段：照片按奇偶交替拆入左右两列（flex 双列，跨浏览器/微信 WebView 稳定）
const masonry = (names: string[]): AlbumSeg => {
  const photos = names.map(P)
  const cols: Photo[][] = [[], []]
  photos.forEach((ph, idx) => {
    cols[idx % 2]!.push(ph)
  })
  return { layout: 'masonry', photos, cols }
}

const wide = (name: string): AlbumSeg => ({ layout: 'wide', photos: [P(name)], cols: [] })

// 相册编排：竖版照片两列瀑布流，横版照片整幅展示
const gallery: AlbumSeg[] = [
  masonry(['photo-03', 'photo-04']),
  wide('photo-05'),
  masonry(['photo-09', 'photo-10', 'photo-12', 'photo-14']),
  wide('photo-07'),
  masonry(['photo-15', 'photo-16', 'photo-17', 'photo-18']),
  wide('photo-11'),
  masonry(['photo-20', 'photo-21']),
  wide('photo-13'),
]

// ====== 章节诗词（悬浮文字） ======
interface FloatChar {
  ch: string
  delay: number
}

interface PoemLine {
  chars: FloatChar[]
}

// 将诗句按字拆分，每字错开动画延迟，形成波浪悬浮效果
const poem = (lines: string[]): PoemLine[] => {
  let n = 0
  return lines.map((line) => ({
    chars: line.split('').map((ch) => ({ ch, delay: n++ * 90 })),
  }))
}

// 开头：执子之手，与子偕老
const openingPoem = poem(['死生契阔，与子成说', '执子之手，与子偕老'])
// 甜蜜瞬间：鹊桥仙
const sweetPoem = poem(['金风玉露一相逢，便胜却人间无数', '两情若是久长时，又岂在朝朝暮暮'])
// 邀请：愿得一心人，白头不相离
const invitePoem = poem(['愿得一心人，白头不相离'])

// 飘落花瓣装饰
const petals = Array.from({ length: 8 }, (_, i) => ({
  left: `${(i * 12 + 4) % 100}%`,
  delay: `${(i % 5) * 1.6}s`,
  dur: `${9 + (i % 4) * 2}s`,
  size: `${15 + (i % 3) * 6}px`,
}))

// 升腾爱心装饰
const hearts = Array.from({ length: 5 }, (_, i) => ({
  left: `${(i * 19 + 7) % 100}%`,
  delay: `${(i % 4) * 2.2}s`,
  dur: `${10 + (i % 3) * 2.5}s`,
  size: `${13 + (i % 2) * 7}px`,
}))

// ====== 倒计时 ======
const WEDDING_STAMP = new Date('2026-10-03T00:00:00').getTime()
const now = ref(Date.now())
let timer: number | undefined

const diff = computed(() => Math.max(0, WEDDING_STAMP - now.value))
const days = computed(() => Math.floor(diff.value / 86_400_000))
const hours = computed(() => Math.floor(diff.value / 3_600_000) % 24)
const minutes = computed(() => Math.floor(diff.value / 60_000) % 60)
const seconds = computed(() => Math.floor(diff.value / 1_000) % 60)
const pad = (n: number) => String(n).padStart(2, '0')

// ====== 背景音乐《简单爱》 ======
const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const mutedPending = ref(false) // 已静音自动播放，等待首次交互恢复声音
let userToggled = false
let firstTouchHandler: (() => void) | undefined

const toggleMusic = () => {
  userToggled = true
  mutedPending.value = false
  const audio = audioRef.value
  if (!audio) return
  if (playing.value) {
    audio.pause()
  } else {
    audio.muted = false
    audio.play().catch(() => {
      // 播放失败通常是音频文件尚未放入 public/music/，静默处理
      console.warn('[背景音乐] 播放失败，请确认 public/music/simple-love.mp3 存在')
    })
  }
}

const onAudioError = () => {
  console.warn('[背景音乐] 音频加载失败，请确认 public/music/simple-love.mp3 存在')
}

// ====== 滚动渐显 ======
let observer: IntersectionObserver | undefined

onMounted(() => {
  document.title = `婚礼邀请函｜${BRIDE} & ${GROOM}`
  const audio = audioRef.value
  if (audio) {
    audio.volume = 0.5
    // 默认播放：先尝试有声自动播放；被浏览器拦截时降级为静音自动播放，
    // 静音播放完成后在首次交互时恢复声音（浏览器要求用户手势才能出声）
    audio.play().catch(() => {
      audio.muted = true
      audio
        .play()
        .then(() => {
          mutedPending.value = true
        })
        .catch(() => {})
    })
  }
  // 首次任意点击/触摸时恢复声音（并兜底启动播放）
  firstTouchHandler = () => {
    mutedPending.value = false
    const target = audioRef.value
    if (!target) return
    if (!userToggled) {
      target.muted = false
      target.play().catch(() => {})
    }
  }
  window.addEventListener('pointerdown', firstTouchHandler, { once: true })

  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          observer?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.reveal').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  if (firstTouchHandler) window.removeEventListener('pointerdown', firstTouchHandler)
  observer?.disconnect()
})
</script>

<style scoped>
.invite {
  --bg: #fbf3ec;
  --card: #fffaf5;
  --ink: #4a3f3c;
  --accent: #c98d80;
  --accent-soft: #e9c9bd;
  --gold: #b89161;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family:
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}

.section-pad {
  padding: 64px 22px;
}

.orn {
  color: var(--accent);
  font-size: 22px;
  margin: 0 0 18px;
}

.section-title {
  margin: 0;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 6px;
}

.section-en {
  margin: 6px 0 0;
  color: var(--accent);
  font-size: 11px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

/* 装饰分隔线 */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 22px auto 0;
  max-width: 240px;
  color: var(--gold);
}

.divider i {
  display: block;
  height: 1px;
  width: 74px;
  background: linear-gradient(90deg, transparent, var(--gold));
  transform: scaleX(0);
  transition: transform 0.9s ease 0.15s;
}

.divider i:last-child {
  background: linear-gradient(90deg, var(--gold), transparent);
}

.divider span {
  opacity: 0;
  transition: opacity 0.6s ease 0.55s;
}

.reveal.in-view .divider i {
  transform: scaleX(1);
}

.reveal.in-view .divider span {
  opacity: 1;
}

/* ===== 背景音乐按钮 ===== */
.music-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 250, 245, 0.9);
  color: var(--accent);
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(74, 63, 60, 0.22);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.music-btn:active {
  transform: scale(0.92);
}

.music-btn .disc {
  display: inline-block;
  line-height: 1;
}

.music-btn.playing {
  box-shadow:
    0 0 0 0 rgba(201, 141, 128, 0.45),
    0 4px 14px rgba(74, 63, 60, 0.22);
  animation: pulsering 2s ease-out infinite;
}

.music-btn.playing .disc {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulsering {
  0% {
    box-shadow:
      0 0 0 0 rgba(201, 141, 128, 0.45),
      0 4px 14px rgba(74, 63, 60, 0.22);
  }
  70% {
    box-shadow:
      0 0 0 14px rgba(201, 141, 128, 0),
      0 4px 14px rgba(74, 63, 60, 0.22);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(201, 141, 128, 0),
      0 4px 14px rgba(74, 63, 60, 0.22);
  }
}

/* 静音自动播放时的提示气泡 */
.music-hint {
  position: fixed;
  top: 32px;
  right: 74px;
  z-index: 50;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 250, 245, 0.94);
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 1px;
  box-shadow: 0 4px 14px rgba(74, 63, 60, 0.18);
  pointer-events: none;
  animation: hintIn 0.8s ease both;
}

@keyframes hintIn {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ===== 封面 ===== */
.cover {
  position: relative;
  height: 100vh;
  min-height: 620px;
  overflow: hidden;
}

.cover-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: kenburns 14s ease-out forwards;
}

@keyframes kenburns {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.22) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

.cover-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 0 24px;
}

.cover-content > * {
  animation: fadeUp 0.9s ease both;
}

.cover-eng {
  margin: 0 0 26px;
  font-size: 12px;
  letter-spacing: 8px;
  text-transform: uppercase;
  opacity: 0.92;
  animation-delay: 0.1s;
}

.cover-names {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 22px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: clamp(30px, 8vw, 44px);
  letter-spacing: 4px;
  animation-delay: 0.3s;
}

.hrt {
  display: inline-block;
  color: #f2b8b0;
  font-size: 0.62em;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.25);
  }
  40% {
    transform: scale(1);
  }
  55% {
    transform: scale(1.2);
  }
}

.cover-date {
  margin: 22px 0 0;
  font-size: 18px;
  letter-spacing: 6px;
  font-weight: 300;
  animation-delay: 0.55s;
}

.cover-date::before,
.cover-date::after {
  content: '—';
  margin: 0 10px;
  color: #f2c9b8;
}

.cover-sub {
  margin: 14px 0 0;
  font-size: 14px;
  letter-spacing: 6px;
  opacity: 0.9;
  animation-delay: 0.75s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* 封面星光 */
.sparkle {
  position: absolute;
  animation: twinkle 2.4s ease-in-out infinite;
  pointer-events: none;
}

.sp-1 {
  top: 24%;
  left: 16%;
  font-size: 18px;
}

.sp-2 {
  top: 34%;
  right: 14%;
  font-size: 14px;
  animation-delay: 1.1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.scroll-cue {
  position: absolute;
  bottom: 34px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  letter-spacing: 2px;
  opacity: 0.85;
  animation-delay: 1.3s;
}

.chevron {
  font-style: normal;
  font-size: 20px;
  animation: bounce 1.6s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

/* 飘落花瓣 */
.petals,
.hearts {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.petal {
  position: absolute;
  top: -6%;
  color: #f7d9d1;
  animation: falling linear infinite;
  opacity: 0.85;
}

@keyframes falling {
  0% {
    transform: translateY(-8vh) rotate(0deg);
  }
  100% {
    transform: translateY(108vh) rotate(360deg);
  }
}

/* 升腾爱心 */
.heart {
  position: absolute;
  bottom: -6%;
  color: rgba(242, 184, 176, 0.55);
  animation: rising linear infinite;
}

@keyframes rising {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-110vh) rotate(20deg);
  }
}

/* ===== 引言 ===== */
.intro {
  text-align: center;
}

/* ===== 悬浮诗词 ===== */
.float-poem {
  text-align: center;
}

.float-line {
  margin: 0 0 8px;
  line-height: 1.7;
}

.float-line:last-child {
  margin-bottom: 0;
}

.float-char {
  display: inline-block;
  margin: 0 2px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  animation: floatChar 3.4s ease-in-out infinite;
  will-change: transform;
}

@keyframes floatChar {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.fp-intro {
  margin: 0 0 30px;
}

.fp-intro .float-char {
  font-size: 17px;
  color: var(--ink);
}

.fp-album {
  margin: 26px 0 0;
}

.fp-album .float-char {
  font-size: 15px;
  color: var(--accent);
}

.fp-closing {
  margin: 26px 0 0;
}

.fp-closing .float-char {
  font-size: 17px;
  color: var(--accent);
}

.intro-text {
  margin: 0 auto 34px;
  max-width: 560px;
  line-height: 2;
  font-size: 14px;
  color: #6b5d58;
}

.intro-photo,
.segment img {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(74, 63, 60, 0.14);
}

.intro-photo img {
  display: block;
  width: 100%;
  border-radius: 12px;
}

/* ===== 倒计时 ===== */
.countdown {
  text-align: center;
}

.cd-boxes {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.cd-cell {
  min-width: 64px;
  padding: 16px 8px 12px;
  background: var(--card);
  border: 1px solid #f0dcd2;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cd-num {
  font-size: 26px;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  animation: pop 0.5s ease;
}

@keyframes pop {
  0% {
    transform: scale(1.25);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.cd-label {
  font-size: 12px;
  color: #a08d86;
  letter-spacing: 2px;
}

/* ===== 婚礼信息 ===== */
.info {
  text-align: center;
}

.info-card {
  margin: 24px auto 0;
  max-width: 480px;
  background: var(--card);
  border: 1px solid #f0dcd2;
  border-radius: 16px;
  padding: 10px 22px;
  text-align: left;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px dashed #f0dcd2;
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  color: var(--gold);
  font-size: 15px;
  line-height: 1.5;
}

.info-label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #a08d86;
  letter-spacing: 3px;
}

.info-value {
  margin: 0;
  font-size: 16px;
  color: var(--ink);
  letter-spacing: 1px;
}

.venue-address {
  margin-top: 4px;
  line-height: 1.7;
  color: #6b5d58;
}

/* ===== 相册 ===== */
.album {
  text-align: center;
}

.segment {
  margin-top: 34px;
}

.seg-wide img {
  display: block;
  width: 100%;
}

.seg-cols {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: left;
}

.seg-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seg-col img {
  width: 100%;
  display: block;
}

@media (hover: hover) and (pointer: fine) {
  .segment img,
  .intro-photo img {
    transition: transform 0.5s ease;
  }

  .segment img:hover,
  .intro-photo:hover img {
    transform: scale(1.02);
  }
}

/* ===== 结尾 ===== */
.closing {
  text-align: center;
  background: linear-gradient(180deg, #f6e7dd 0%, var(--bg) 100%);
}

.closing-text {
  margin: 26px 0 0;
  line-height: 2;
  font-size: 14px;
  color: #6b5d58;
}

.closing-names {
  margin: 30px 0 0;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: 22px;
  letter-spacing: 4px;
  color: var(--accent);
}

.closing-date {
  margin: 12px 0 0;
  font-size: 13px;
  letter-spacing: 3px;
  color: #a08d86;
}

.closing-bye {
  margin: 28px 0 0;
  color: var(--accent);
  letter-spacing: 2px;
}

.footer {
  padding: 40px 0 48px;
  text-align: center;
  color: #c4b2ab;
  font-size: 11px;
  letter-spacing: 4px;
}

/* ===== 滚动渐显 ===== */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.reveal.in-view {
  opacity: 1;
  transform: none;
}

/* 尊重系统"减少动态效果"设置 */
@media (prefers-reduced-motion: reduce) {
  .petal,
  .heart,
  .sparkle,
  .chevron,
  .hrt,
  .disc,
  .cover-bg,
  .cd-num,
  .float-char {
    animation: none !important;
  }

  .cover-content > * {
    animation: none !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* 桌面端居中限宽 */
@media (min-width: 640px) {
  .section-pad {
    max-width: 640px;
    margin: 0 auto;
  }

  .cover-content {
    max-width: 640px;
    margin: 0 auto;
  }
}
</style>
