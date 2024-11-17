<template>
    <header class="header-image" :class="{ 'hide-header': isHeaderHidden }">
        <div class="background-blur" :style="{ backgroundImage: 'url(' + Shared.background + ')' }"></div>
        <div class="header-content">
            <h1>{{ Shared.info.title }}</h1>
            <p class="header-bio">{{ Shared.info.bio }}</p>
        </div>
    </header>
</template>

<script setup lang="ts">
import { Shared } from '@/types/shared';
import { ref, onMounted, onUnmounted } from 'vue';

// 用于控制头图是否隐藏
const isHeaderHidden = ref(false);

// 处理滚动事件，判断是否需要隐藏头图
function handleScroll() {
  isHeaderHidden.value = window.scrollY > 100;  // 滚动超过100px时隐藏头图
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.header-image {
  position: relative;
  height: 300px;
  width: 100%; /* 确保宽度占满父容器 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  overflow: hidden; /* 确保背景容器不会溢出 */
  transition: transform 0.3s, opacity 0.3s;
}

.hide-header {
  transform: translateY(-100%); /* 隐藏头图 */
  opacity: 0;
}

.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  filter: blur(3px); /* 只对背景图片应用模糊效果 */
  z-index: 0;
}

.header-content {
  position: relative;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  padding: 20px;
  border-radius: 10px;
  z-index: 1; /* 确保文字内容在模糊背景之上 */
}

.header-bio {
  font-size: 14px;
  opacity: 0.8;
}
</style>
