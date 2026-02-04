<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// --- 資料狀態 ---
const newTodo = ref("")
const searchingTarget = ref("")
const currentUser = ref("管理者") // 模擬當前使用者身分

const listItems = reactive({
    todos: []
})

// --- 生命週期：初始化 ---
onMounted(() => {
    fetchTodos()
    // 這裡可以順便檢查 Supabase 的 Auth 狀態來設定 currentUser
})

// --- 方法 ---
// 讀取資料
async function fetchTodos() {
    const { data, error } = await supabase
        .from('todos') // 確保你的 Supabase 資料表名稱是 todos
        .select('*')
        .order('id', { ascending: true })

    if (error) {
        console.error('抓取資料失敗:', error.message)
    } else {
        listItems.todos = data
        currentUser.value = "已連線使用者" // 這裡之後可以換成 auth.user()
    }
}
// 新增待辦事項
async function addListItem() {
    if (newTodo.value.trim() === "") return

    // 注意：ID 通常由資料庫自動產生，所以不傳送 ID
    const { data, error } = await supabase
        .from('todos')
        .insert([{ 
            title: newTodo.value, 
            is_completed: false 
            // 如果有 user_id 欄位，記得加上：user_id: user.id 
        }])
        .select() // 回傳新增的資料

    if (error) {
        alert('新增失敗: ' + error.message)
    } else {
        listItems.todos.push(data[0]) // 將回傳的新物件推入 UI
        newTodo.value = ""
    }
}

// 切換完成狀態
async function toggleStatus(todo) {
    const nextStatus = !todo.is_completed
    
    const { error } = await supabase
        .from('todos')
        .update({ is_completed: nextStatus })
        .eq('id', todo.id)

    if (error) {
        alert('更新失敗')
    } else {
        todo.is_completed = nextStatus
    }
}

// 刪除項目
async function deleteItem(id) {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

    if (error) {
        alert('刪除失敗')
    } else {
        listItems.todos = listItems.todos.filter(t => t.id !== id)
    }
}

// 搜尋過濾 (計算屬性)
const filteredTodos = computed(() => {
    return listItems.todos.filter(todo => 
        todo.title.toLowerCase().includes(searchingTarget.value.toLowerCase())
    )
})
</script>

<template>
    <div class="todo-app-container">
        <header class="header">
            <h1>我的待辦清單</h1>
            <span class="user-badge">當前身分：{{ currentUser }}</span>
        </header>

        <div class="input-section">
            <div class="input-group">
                <input 
                    v-model="newTodo" 
                    @keyup.enter="addListItem"
                    placeholder="想要做些什麼？" 
                />
                <el-button type="primary" @click="addListItem">新增事項</el-button>
            </div>
            
            <div class="search-group">
                <input 
                    v-model="searchingTarget" 
                    placeholder="搜尋關鍵字..." 
                />
            </div>
        </div>

        <div class="list-section">
            <div v-if="filteredTodos.length === 0" class="empty-state">
                暫無相關事項
            </div>
            
            <div 
                v-for="todo in filteredTodos" 
                :key="todo.id" 
                class="todo-item"
                :class="{ 'is-done': todo.is_completed }"
            >
                <div class="todo-info">
                    <span class="todo-id">#{{ todo.id }}</span>
                    <span class="todo-text">{{ todo.title }}</span>
                    <small class="todo-date">{{ todo.created_at }}</small>
                </div>
                
                <div class="todo-actions">
                    <el-button 
                        :type="todo.is_completed ? 'info' : 'success'" 
                        size="small" 
                        @click="toggleStatus(todo)"
                    >
                        {{ todo.is_completed ? '取消' : '完成' }}
                    </el-button>
                    <el-button type="danger" size="small" @click="deleteItem(todo.id)">刪除</el-button>
                </div>
            </div>
        </div>

        <footer class="footer">
            共 {{ listItems.todos.length }} 項，
            已完成 {{ listItems.todos.filter(t => t.is_completed).length }} 項
        </footer>
    </div>
</template>

<style scoped>
.todo-app-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    font-family: 'Noto Sans TC', sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.user-badge {
    background: #334ED7;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.input-group, .search-group {
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

.todo-item {
    background: white;
    margin-bottom: 10px;
    padding: 12px 15px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.3s;
    border-left: 5px solid #334ED7;
}

.todo-item.is-done {
    border-left-color: #6c757d;
    opacity: 0.7;
}

.is-done .todo-text {
    text-decoration: line-through;
    color: #6c757d;
}

.todo-id {
    color: #adb5bd;
    margin-right: 10px;
    font-weight: bold;
}

.todo-date {
    display: block;
    font-size: 0.7rem;
    color: #6c757d;
}

.todo-actions {
    display: flex;
    gap: 5px;
}

.footer {
    margin-top: 20px;
    text-align: center;
    font-size: 0.9rem;
    color: #495057;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #adb5bd;
}
</style>