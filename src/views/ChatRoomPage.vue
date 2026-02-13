<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import NavBar from '../components/NavBar.vue'

// 狀態管理
const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const chatContainer = ref(null)
const loading = ref(true)

// 取得當前使用者
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    currentUser.value = user
    // 或是從 profiles table 獲取更多資訊 (如果有的話)
  }
}

// 捲動到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 載入歷史訊息
const fetchMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
    
    if (error) throw error
    
    if (data) {
      messages.value = data
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error fetching messages:', error.message)
  } finally {
    loading.value = false
  }
}

// 發送訊息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return

  const messageData = {
    content: newMessage.value,
    user_id: currentUser.value.id,
    user_email: currentUser.value.email, // 暫時存email當作顯示名稱，正式版建議關聯 profiles
    created_at: new Date().toISOString()
  }

  try {
    const { error } = await supabase
      .from('messages')
      .insert([messageData])

    if (error) throw error
    
    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error.message)
    alert('發送失敗: ' + error.message)
  }
}

// 訂閱即時訊息
let subscription = null

const subscribeToMessages = () => {
  subscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      messages.value.push(payload.new)
      scrollToBottom()
    })
    .subscribe()
}

onMounted(async () => {
  await getCurrentUser()
  await fetchMessages()
  subscribeToMessages()
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})

// 時間格式化
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="chat-page">
    <NavBar /> <!-- 引入導覽列 -->
    
    <div class="chat-container">
      <header class="chat-header">
        <h1>💬 即時聊天室</h1>
        <p class="status">目前在線: {{ currentUser ? currentUser.email : '未登入' }}</p>
      </header>
      
      <div class="messages-area" ref="chatContainer">
        <div v-if="loading" class="loading-state">載入中...</div>
        <div v-else-if="messages.length === 0" class="empty-state">
          還沒有訊息，開始聊天吧！
        </div>
        
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'mine': currentUser && msg.user_id === currentUser.id }"
        >
          <div class="message-bubble">
            <div class="sender-name" v-if="!currentUser || msg.user_id !== currentUser.id">
              {{ msg.user_email?.split('@')[0] || '匿名' }}
            </div>
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.created_at) }}</div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="輸入訊息..." 
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()">
          發送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.chat-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.status {
  color: #666;
  font-size: 0.9rem;
}

.messages-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f8f9fa;
}

.loading-state, .empty-state {
  text-align: center;
  color: #aaa;
  margin-top: 50px;
}

.message-wrapper {
  display: flex;
  justify-content: flex-start;
}

.message-wrapper.mine {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
}

.message-wrapper.mine .message-bubble {
  background: #334ED7;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper:not(.mine) .message-bubble {
  border-bottom-left-radius: 4px;
}

.sender-name {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 4px;
}

.message-content {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 4px;
  text-align: right;
  opacity: 0.7;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #eee;
  border-radius: 30px;
  font-size: 1rem;
  transition: border-color 0.3s;
  outline: none;
}

input:focus {
  border-color: #334ED7;
}

button {
  padding: 12px 25px;
  background: #334ED7;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(51, 78, 215, 0.3);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 捲軸美化 */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
</style>
