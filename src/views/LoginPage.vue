<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
// 表單資料
const loginForm = reactive({
    email: '',
    password: '',
    rememberMe: false
})

// 控制密碼顯示狀態
const showPassword = ref(false)

// 登入邏輯 (目前僅作 Console 顯示)
async function handleLogin() {
    if (!loginForm.email || !loginForm.password) {
        alert("請輸入電子郵件與密碼")
        return
    }
    console.log("嘗試登入中...", {
        email: loginForm.email,
        password: loginForm.password
    })
    const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
    })
    if (error) {
        alert("登入失敗: " + error.message)
    } else {
        alert("登入成功！")
        router.push('/todo')
    }
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>歡迎回來</h2>
                <p>請輸入您的帳號密碼以存取待辦清單</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-item">
                    <label>電子郵件</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="loginForm.email" 
                            type="email" 
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                </div>

                <div class="form-item">
                    <label>密碼</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="loginForm.password" 
                            :type="showPassword ? 'text' : 'password'" 
                            placeholder="請輸入密碼"
                            required
                        />
                        <span class="toggle-password" @click="showPassword = !showPassword">
                            {{ showPassword ? '👁️' : '🙈' }}
                        </span>
                    </div>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="loginForm.rememberMe" />
                        記住我
                    </label>
                    <a href="#" class="forgot-link">忘記密碼？</a>
                </div>

                <el-button 
                    type="primary" 
                    class="login-btn" 
                    @click="handleLogin"
                >
                    立即登入
                </el-button>

                <div class="register-hint">
                    還沒有帳號嗎？ <a href="#">立即註冊</a>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* 背景容器：全螢幕置中 */
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    font-family: 'Noto Sans TC', sans-serif;
}

/* 登入卡片 */
.login-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    margin: 0;
    color: #334ED7;
    font-size: 1.8rem;
}

.login-header p {
    color: #6c757d;
    font-size: 0.9rem;
    margin-top: 8px;
}

/* 表單項目 */
.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 700;
    color: #495057;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.input-wrapper input:focus {
    outline: none;
    border-color: #334ED7;
    box-shadow: 0 0 0 3px rgba(51, 78, 215, 0.1);
}

.toggle-password {
    position: absolute;
    right: 12px;
    cursor: pointer;
    user-select: none;
}

/* 選項區 */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 0.85rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}

.forgot-link {
    color: #334ED7;
    text-decoration: none;
}

/* 按鈕與提示 */
.login-btn {
    width: 100%;
    height: 48px;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 8px;
    background-color: #334ED7;
    border: none;
}

.register-hint {
    text-align: center;
    margin-top: 20px;
    font-size: 0.9rem;
    color: #6c757d;
}

.register-hint a {
    color: #334ED7;
    text-decoration: none;
    font-weight: 700;
}
</style>