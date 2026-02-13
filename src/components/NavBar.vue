<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const isOpen = ref(false)

// 切換選單
const toggleMenu = () => {
    isOpen.value = !isOpen.value
}

// 登出邏輯
async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        alert("登出失敗")
    } else {
        isOpen.value = false
        router.push('/login')
    }
}

// 導向
const navigateTo = (path) => {
    isOpen.value = false
    router.push(path)
}
</script>

<template>
    <div class="nav-container">
        <button class="menu-trigger" @click="toggleMenu" :class="{ 'active': isOpen }">
            <span class="icon">{{ isOpen ? '✕' : '☰' }}</span>
            <span class="text">功能選單</span>
        </button>

        <transition name="slide-fade">
            <div v-if="isOpen" class="dropdown-menu">
                <div class="menu-item" @click="navigateTo('/todo')">
                    <span class="menu-icon">📝</span> 待辦清單 (Todo)
                </div>
                <div class="menu-item" @click="navigateTo('/chatroom')">
                    <span class="menu-icon">💬</span> 聊天室 (Chat Room)
                </div>
                <div class="menu-item disabled">
                    <span class="menu-icon">👤</span> 個人設定 (尚未開放)
                </div>
                <hr />
                <div class="menu-item logout" @click="handleLogout">
                    <span class="menu-icon">🚪</span> 登出系統
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.nav-container {
    /* 固定在畫面上方 */
    position: fixed;
    top: 40px; /* 這裡的數值可以微調，直到與你的 LoginCard 上緣對齊 */
    left: 40px;
    z-index: 999;
    font-family: 'Noto Sans TC', sans-serif;
}

.menu-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: white;
    border: none;
    border-radius: 50px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    color: #334ED7;
    font-weight: 700;
}

.menu-trigger:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(51, 78, 215, 0.2);
}

.menu-trigger.active {
    background: #334ED7;
    color: white;
}

.dropdown-menu {
    position: absolute;
    top: 55px;
    left: 0;
    width: 200px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.menu-item {
    padding: 12px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #495057;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.menu-item:hover:not(.disabled) {
    background: #f5f7fa;
    color: #334ED7;
}

.menu-item.logout {
    color: #e63946;
}

.menu-item.logout:hover {
    background: #fff5f5;
}

.menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

hr {
    border: 0;
    border-top: 1px solid #eee;
    margin: 5px 0;
}

/* 動畫效果 */
.slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>