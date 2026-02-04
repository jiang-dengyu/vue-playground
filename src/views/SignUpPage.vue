<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '../supabase'

// 表單資料
const signupForm = reactive({
    email: '',
    password: '',
    confirmPassword: ''
})

const isLoading = ref(false)

// 註冊邏輯
async function handleSignUp() {
    // 1. 基本前端驗證
    if (!signupForm.email || !signupForm.password) {
        alert("請填寫完整資料")
        return
    }
    if (signupForm.password !== signupForm.confirmPassword) {
        alert("兩次輸入的密碼不一致")
        return
    }
    if (signupForm.password.length < 6) {
        alert("密碼長度至少需要 6 位數")
        return
    }

    isLoading.value = true
    
    // 2. 呼叫 Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
    })

    isLoading.value = false

    if (error) {
        alert("註冊失敗: " + error.message)
    } else {
        alert("註冊成功！請檢查您的電子郵件以驗證帳號 (如果 Supabase 有開啟 Email 驗證)。")
        // 這裡可以導向登入頁
        console.log("User Data:", data)
    }
}
</script>

<template>
    <div class="signup-container">
        <div class="signup-card">
            <div class="signup-header">
                <h2>建立帳號</h2>
                <p>加入我們，開始管理您的待辦事項</p>
            </div>

            <form @submit.prevent="handleSignUp" class="signup-form">
                <div class="form-item">
                    <label>電子郵件</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="signupForm.email" 
                            type="email" 
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                </div>

                <div class="form-item">
                    <label>設定密碼</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="signupForm.password" 
                            type="password" 
                            placeholder="至少 6 位數"
                            required
                        />
                    </div>
                </div>

                <div class="form-item">
                    <label>確認密碼</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="signupForm.confirmPassword" 
                            type="password" 
                            placeholder="請再次輸入密碼"
                            required
                        />
                    </div>
                </div>

                <el-button 
                    type="primary" 
                    class="signup-btn" 
                    :loading="isLoading"
                    @click="handleSignUp"
                >
                    註冊帳號
                </el-button>

                <div class="login-hint">
                    已經有帳號了？ <a href="#">立即登入</a>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.signup-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
    font-family: 'Noto Sans TC', sans-serif;
}

.signup-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.signup-header {
    text-align: center;
    margin-bottom: 30px;
}

.signup-header h2 {
    margin: 0;
    color: #334ED7;
    font-size: 1.8rem;
}

.signup-header p {
    color: #6c757d;
    font-size: 0.9rem;
    margin-top: 8px;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 700;
    color: #495057;
}

.input-wrapper input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box; /* 確保 padding 不會撐破容器 */
}

.input-wrapper input:focus {
    outline: none;
    border-color: #334ED7;
    box-shadow: 0 0 0 3px rgba(51, 78, 215, 0.1);
}

.signup-btn {
    width: 100%;
    height: 48px;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 8px;
    background-color: #334ED7;
    margin-top: 10px;
}

.login-hint {
    text-align: center;
    margin-top: 20px;
    font-size: 0.9rem;
    color: #6c757d;
}

.login-hint a {
    color: #334ED7;
    text-decoration: none;
    font-weight: 700;
}
</style>