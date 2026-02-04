<script setup>
import { ref, reactive, computed } from 'vue'

// --- 資料狀態 ---
const newTodo = ref("")
const searchingTarget = ref("")
const currentUser = ref("管理者") // 模擬當前使用者身分

const listItems = reactive({
    todos: [
        { id: 1, title: "學習 PostgreSQL 語法", is_completed: false, created_at: "2024-05-20" },
        { id: 2, title: "完成 Vue 元件改版", is_completed: true, created_at: "2024-05-21" }
    ]
})

// --- 方法 ---

// 新增待辦事項
function addListItem() {
    if (newTodo.value.trim() !== "") {
        const nextId = listItems.todos.length > 0 
            ? Math.max(...listItems.todos.map(t => t.id)) + 1 
            : 1;
            
        listItems.todos.push({
            id: nextId,
            title: newTodo.value,
            is_completed: false,
            created_at: new Date().toLocaleDateString()
        })
        newTodo.value = ""
    }
}

// 切換完成狀態
function toggleStatus(todo) {
    todo.is_completed = !todo.is_completed
}

// 刪除項目
function deleteItem(id) {
    const index = listItems.todos.findIndex(t => t.id === id)
    if (index !== -1) {
        listItems.todos.splice(index, 1)
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