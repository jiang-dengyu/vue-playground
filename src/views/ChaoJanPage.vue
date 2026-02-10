<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { supabase } from '../supabase'
import RegistrationAddDialog from '@/components/RegistrationAddDialog.vue'

const tableData = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const filterYear = ref('')

// 抓取資料並執行排序 (1. 單號 2. 報名者 3. 項目)
const fetchData = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('chaojan_registrations')
      .select('*')
      .order('paper_ticket_no', { ascending: true })
      .order('applicant', { ascending: true })
      .order('category', { ascending: true })

    if (filterYear.value) query = query.eq('year', filterYear.value)
    if (searchKeyword.value) {
      query = query.or(`applicant.ilike.%${searchKeyword.value}%,target_name.ilike.%${searchKeyword.value}%,address.ilike.%${searchKeyword.value}%`)
    }

    const { data, error } = await query
    if (error) throw error
    tableData.value = data
  } catch (error) {
    alert('讀取失敗: ' + error.message)
  } finally {
    loading.value = false
  }
}

const totalAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + Number(item.amount), 0)
})

const getTagType = (cat) => {
  if (cat.includes('祖先')) return ''
  if (cat.includes('冤親')) return 'warning'
  return 'info'
}
// 定義項目顏色對應表 (背景色, 文字顏色)
const categoryColors = {
  '九玄七祖': { bg: '#E3F2FD', text: '#1976D2' },    // 藍色
  '歷代祖先': { bg: '#E3F2FD', text: '#1976D2' },    // 藍色系
  '歷代九玄七祖': { bg: '#E3F2FD', text: '#1976D2' },
  '累世歷代祖先': { bg: '#E3F2FD', text: '#1976D2' },
  
  '冤親債主': { bg: '#FFF3E0', text: '#E65100' },    // 橘色
  '累世冤親債主': { bg: '#FFF3E0', text: '#E65100' },
  '互解冤親債主': { bg: '#FFEBEE', text: '#C62828' }, // 深紅
  
  '因果業力': { bg: '#F3E5F5', text: '#7B1FA2' },    // 紫色
  '累世因果業力': { bg: '#F3E5F5', text: '#7B1FA2' },
  
  '本靈': { bg: '#E8F5E9', text: '#2E7D32' },        // 綠色
  '赤靈子': { bg: '#EFEBE9', text: '#5D4037' },      // 棕色
  '累世赤靈子': { bg: '#EFEBE9', text: '#5D4037' },
  
  '地基主': { bg: '#F9FBE7', text: '#827717' },      // 黃綠
  '動物靈子': { bg: '#E0F7FA', text: '#00838F' },    // 青色
  '累世動物靈子': { bg: '#E0F7FA', text: '#00838F' },
}

// 取得標籤樣式的函式
const getCategoryStyle = (cat) => {
  const style = categoryColors[cat]
  if (style) {
    return {
      backgroundColor: style.bg,
      color: style.text,
      borderColor: style.text,
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  }
  // 不在清單內的預設：純白底黑字
  return {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderColor: '#DCDFE6',
    borderWidth: '1px',
    borderStyle: 'solid'
  }
}

onMounted(() => fetchData())
</script>

<template>
  <div class="registration-container">
    <h2 class="page-title">報名管理系統</h2>

    <div class="action-bar">
      <div class="search-group">
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋報名者、對象或地址"
          class="search-input"
          clearable
          @clear="fetchData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filterYear" placeholder="年份" style="width: 130px" @change="fetchData">
          <el-option label="所有年份" value="" />
          <el-option label="2024 (甲辰)" value="2024" />
          <el-option label="2025 (乙巳)" value="2025" />
        </el-select>

        <el-button type="primary" @click="fetchData">搜尋資料</el-button>
      </div>

      <div class="tool-group">
        <RegistrationAddDialog @refresh="fetchData" />
      </div>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      v-loading="loading"
      header-cell-class-name="table-header"
      :default-sort="{ prop: 'paper_ticket_no', order: 'ascending' }"
    >
      <el-table-column prop="paper_ticket_no" label="紙本單號" width="100" sortable fixed="left" />
      <el-table-column prop="applicant" label="報名者" width="120" sortable />
      <el-table-column prop="category" label="項目" width="140" sortable>
        <template #default="scope">
          <el-tag size="large" :style="getCategoryStyle(scope.row.category)" class="custom-tag">
            {{ scope.row.category }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="target_name" label="對象" width="120" />
      <el-table-column prop="relationship" label="關係" width="100" />
      <el-table-column prop="title" label="稱謂" width="100" />
      <el-table-column prop="last_name" label="姓氏" width="100" />

      <el-table-column label="數量統計" width="150">
        <template #default="scope">
          <div class="count-box">
            <span>金銀紙: {{ scope.row.joss_paper_count }}</span>
            <span>乾糧: {{ scope.row.dry_food_count }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="amount" label="金額" width="110" align="right">
        <template #default="scope">
          <span class="amount-highlight">${{ scope.row.amount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="address" label="地址" min-width="250" show-overflow-tooltip />

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">編輯</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-stats">
      <span>當前顯示筆數：{{ tableData.length }}</span>
      <span class="total-price">總計金額：NT$ {{ totalAmount }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 全體字體放大 */
.registration-container {
  padding: 24px;
  background-color: #fcfcfc;
  font-size: 16px; /* 提高基礎字體 */
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 表格內的文字變大 */
:deep(.el-table) {
  font-size: 15px; 
}

/* 標頭加強顯示 */
:deep(.table-header) {
  background-color: #f5f7fa !important;
  color: #333;
  font-weight: bold;
  font-size: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.search-group {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 320px;
}

.count-box {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #666;
}

.amount-highlight {
  font-family: 'Courier New', Courier, monospace; /* 數字使用等寬字體更整齊 */
  font-weight: 800;
  color: #d32f2f;
  font-size: 18px;
}

.footer-stats {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #d32f2f;
}

.custom-tag {
  font-weight: bold;
  font-size: 14px;
  padding: 0 10px;
  height: 32px;
  line-height: 30px;
  border-radius: 4px;
}
</style>