<template>
  <div class="invite">
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
      <div class="cover-content">
        <p class="cover-eng">WE ARE GETTING MARRIED</p>
        <h1 class="cover-names">
          <span class="name">{{ BRIDE }}</span>
          <span class="amp">&</span>
          <span class="name">{{ GROOM }}</span>
        </h1>
        <p class="cover-date">{{ WEDDING_DATE }}</p>
        <p class="cover-sub">一生一世 · 只愿有你</p>
        <div class="scroll-cue">
          <span>向下滑动</span>
          <i class="chevron">⌄</i>
        </div>
      </div>
    </section>

    <!-- 引言 -->
    <section class="intro section-pad reveal">
      <p class="orn">❀</p>
      <p class="quote">
        于千万人之中，遇见你所遇见的人<br />
        于千万年之中，时间无涯的荒野里<br />
        没有早一步，也没有晚一步<br />
        刚好赶上了
      </p>
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
      <div class="cd-boxes">
        <div class="cd-cell">
          <span class="cd-num">{{ days }}</span>
          <span class="cd-label">天</span>
        </div>
        <div class="cd-cell">
          <span class="cd-num">{{ pad(hours) }}</span>
          <span class="cd-label">时</span>
        </div>
        <div class="cd-cell">
          <span class="cd-num">{{ pad(minutes) }}</span>
          <span class="cd-label">分</span>
        </div>
        <div class="cd-cell">
          <span class="cd-num">{{ pad(seconds) }}</span>
          <span class="cd-label">秒</span>
        </div>
      </div>
    </section>

    <!-- 婚礼信息 -->
    <section class="info section-pad reveal">
      <h2 class="section-title">婚礼信息</h2>
      <p class="section-en">WEDDING INFORMATION</p>
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
      </div>
    </section>

    <!-- 相册 -->
    <section class="album section-pad reveal">
      <h2 class="section-title">甜蜜瞬间</h2>
      <p class="section-en">PRECIOUS MOMENTS</p>
      <div
        v-for="(seg, i) in gallery"
        :key="i"
        :class="['segment', seg.layout === 'wide' ? 'seg-wide' : 'seg-masonry']"
      >
        <img
          v-for="ph in seg.photos"
          :key="ph.src"
          :src="ph.src"
          :alt="`婚纱照 ${i + 1}`"
          loading="lazy"
        />
      </div>
    </section>

    <!-- 结尾 -->
    <section class="closing section-pad reveal">
      <p class="orn">❀</p>
      <h2 class="section-title">诚挚邀请</h2>
      <p class="closing-text">
        您的出席，是我们的荣幸<br />
        您的祝福，是我们的动力
      </p>
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
// ========================================

const src = (name: string) => `${import.meta.env.BASE_URL}invite/${name}.jpg`
const coverSrc = src('photo-02')
const introSrc = src('photo-01')

interface Photo {
  src: string
}

interface AlbumSeg {
  layout: 'wide' | 'masonry'
  photos: Photo[]
}

const P = (name: string): Photo => ({ src: src(name) })

// 相册编排：竖版照片两列瀑布流，横版照片整幅展示，穿插排布
const gallery: AlbumSeg[] = [
  { layout: 'masonry', photos: [P('photo-03'), P('photo-04'), P('photo-06'), P('photo-08')] },
  { layout: 'wide', photos: [P('photo-05')] },
  { layout: 'masonry', photos: [P('photo-09'), P('photo-10'), P('photo-12'), P('photo-14')] },
  { layout: 'wide', photos: [P('photo-07')] },
  { layout: 'masonry', photos: [P('photo-15'), P('photo-16'), P('photo-17'), P('photo-18')] },
  { layout: 'wide', photos: [P('photo-11')] },
  { layout: 'masonry', photos: [P('photo-19'), P('photo-20'), P('photo-21')] },
  { layout: 'wide', photos: [P('photo-13')] },
]

// 飘落花瓣装饰
const petals = Array.from({ length: 8 }, (_, i) => ({
  left: `${(i * 12 + 4) % 100}%`,
  delay: `${(i % 5) * 1.6}s`,
  dur: `${9 + (i % 4) * 2}s`,
  size: `${15 + (i % 3) * 6}px`,
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

// ====== 滚动渐显 ======
let observer: IntersectionObserver | undefined

onMounted(() => {
  document.title = `婚礼邀请函｜${BRIDE} & ${GROOM}`
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

.cover-eng {
  margin: 0 0 26px;
  font-size: 12px;
  letter-spacing: 8px;
  text-transform: uppercase;
  opacity: 0.92;
}

.cover-names {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 18px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: clamp(30px, 8vw, 44px);
  letter-spacing: 4px;
}

.amp {
  color: #f2c9b8;
  font-family: serif;
  font-size: 0.7em;
}

.cover-date {
  margin: 22px 0 0;
  font-size: 18px;
  letter-spacing: 6px;
  font-weight: 300;
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
.petals {
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

/* ===== 引言 ===== */
.intro {
  text-align: center;
}

.quote {
  margin: 0 0 26px;
  line-height: 2.1;
  color: var(--accent);
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: 16px;
  letter-spacing: 2px;
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
  background: linear-gradient(180deg, var(--bg) 0%, #f6e7dd 100%);
}

.cd-boxes {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 34px;
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
  margin: 30px auto 0;
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

.seg-masonry {
  columns: 2;
  column-gap: 12px;
  text-align: left;
}

.seg-masonry img {
  width: 100%;
  margin-bottom: 12px;
  break-inside: avoid;
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
