<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { supabase } from '../supabase'

const memberData = ref([])
const loading = ref(false)
const searchKeyword = ref('')

const fetchMembers = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('members')
      .select('*')
      .order('id', { ascending: false })

    if (searchKeyword.value) {
      query = query.or(`name.ilike.%${searchKeyword.value}%,phone.ilike.%${searchKeyword.value}%,address_1.ilike.%${searchKeyword.value}%`)
    }

    const { data, error } = await query
    if (error) throw error
    memberData.value = data
  } catch (error) {
    console.error('Error fetching members:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  console.log('編輯會員', row)
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除此會員嗎？')) return
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (!error) fetchMembers()
}

onMounted(() => {
  fetchMembers()
})
</script>

<template>
  <div class="member-container">
    <h2 class="page-title">會員資料管理</h2>

    <div class="action-bar">
      <div class="search-group">
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋姓名、電話或地址"
          class="search-input"
          clearable
          @clear="fetchMembers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="fetchMembers">搜尋會員</el-button>
      </div>

      <div class="tool-group">
        <el-button type="success" size="large">新增會員</el-button>
      </div>
    </div>

    <el-table :data="memberData" border stripe v-loading="loading" style="width: 100%" header-cell-class-name="table-header">
      <el-table-column prop="name" label="姓名" width="120" fixed="left">
        <template #default="scope">
          <span class="name-text">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="生日資訊(農)" width="220">
        <template #default="scope">
          <div class="birthday-info">
            <div><el-tag size="small" type="success">農</el-tag> {{ scope.row.lunar_birthday || '未填' }} </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="居住地址" min-width="300" show-overflow-tooltip>
        <template #default="scope">
          <div v-if="scope.row.is_overseas">
            <el-tag type="danger" size="small">國外</el-tag> {{ scope.row.overseas_address }}
          </div>
          <div v-else>
            {{ scope.row.address_1 }} {{ scope.row.address_2 }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="organization" label="組織" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.organization" effect="plain">{{ scope.row.organization }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">編輯</el-button>
          <el-divider direction="vertical" />
          <el-button link type="danger" @click="handleDelete(scope.row.id)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-stats">
      <span>總會員數：{{ memberData.length }} 位</span>
    </div>
  </div>
</template>

<style scoped>
.member-container {
  padding: 24px;
  background-color: #fcfcfc;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.search-group {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 350px;
}

/* 強化字體與閱讀感 */
:deep(.el-table) {
  font-size: 16px;
}

:deep(.table-header) {
  background-color: #f8f9fb !important;
  font-size: 16px;
  color: #2c3e50;
}

.name-text {
  font-weight: bold;
  color: #409eff;
}

.birthday-info {
  line-height: 1.6;
  font-size: 14px;
}

.footer-stats {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #606266;
}
</style>