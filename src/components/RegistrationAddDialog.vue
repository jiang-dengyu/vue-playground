<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { supabase } from '../supabase'

const emit = defineEmits(['refresh'])
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

// 下拉選項
const categoryOptions = ['九玄七祖', '互解冤親債主', '本靈', '因果業力', '地基主', '赤靈子', '冤親債主', '動物靈子', '累世九玄七祖', '累世因果業力', '累世赤靈子', '累世冤親債主', '累世動物靈子', '累世歷代祖先', '歷代九玄七祖', '歷代祖先']
const relOptions = ['夫妻', '父母', '兒女', '公公', '婆婆', '岳父', '岳母', '親戚', '朋友']
const titleOptions = ['父', '母', '祖父', '祖母', '曾祖父', '曾祖母', '曾曾祖父', '曾曾祖母', '外祖父', '外祖母', '外曾祖父', '外曾祖母', '外曾曾祖父', '外曾曾祖母']
const orgOptions = ['天德堂', '中德堂', '美德堂', '信德堂', '勝德堂', '豐德堂', '敏德堂', '東德堂', '善德堂']
const jossOptions = Array.from({ length: 30 }, (_, i) => (i + 1) * 100)
const amountOptions = Array.from({ length: 991 }, (_, i) => 1000 + i * 100)

const form = reactive({
  year: '2026',
  paper_ticket_no: null,
  applicant: '',
  category: '',
  male_count: 0,
  female_count: 0,
  target_name: '',
  relationship: '',
  title: '',
  last_name: '',
  birthday: '',
  death_date: '',
  joss_paper_count: 0,
  organization: '',
  dry_food_count: 0,
  cooked_food_count: 0,
  amount: 0,
  is_overseas: false,
  address: ''
})

// 會員查詢邏輯
const querySearch = async (queryString, cb) => {
  if (!queryString) return cb([]);
  try {
    const { data, error } = await supabase
      .from('members')
      .select('name, address_1, address_2, lunar_birthday, is_overseas, overseas_address')
      .ilike('name', `%${queryString}%`)
      .limit(15);

    if (error) throw error;

    const results = data.map(m => ({
      ...m,
      value: m.name,
      full_address: m.is_overseas ? m.overseas_address : `${m.address_1 || ''}${m.address_2 || ''}`
    }));
    cb(results);
  } catch (err) {
    console.error('搜尋會員失敗:', err);
    cb([]);
  }
};

// 選擇會員後自動填入
const handleSelectMember = (item) => {
  form.applicant = item.name;
  form.address = item.full_address;
  form.birthday = item.lunar_birthday || '';
};

const rules = {
  paper_ticket_no: [{ required: true, message: '必選', trigger: 'change' }],
  applicant: [{ required: true, message: '必填', trigger: 'blur' }],
  category: [{ required: true, message: '必選', trigger: 'change' }],
  target_name: [{ required: true, message: '必填', trigger: 'blur' }],
  amount: [{ required: true, message: '必選', trigger: 'blur' }]
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const { error } = await supabase.from('chaojan_registrations').insert([form])
        if (error) throw error
        alert('報名成功！')
        dialogVisible.value = false
        emit('refresh')
      } catch (e) {
        alert('錯誤：' + e.message)
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<template>
  <div class="add-container">
    <el-button type="success" size="large" @click="dialogVisible = true">
      <el-icon><Plus /></el-icon> 新增法會報名
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="新增法會報名資料 (2026年度)"
      width="1100px" 
      top="5vh"
      @close="resetForm"
      destroy-on-close
    >
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="110px" 
        class="custom-form"
      >
        <el-divider content-position="left">第一區：基本資訊與地點</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="紙本單號" prop="paper_ticket_no">
              <el-select v-model="form.paper_ticket_no" placeholder="單號" filterable>
                <el-option v-for="n in 500" :key="n" :label="n" :value="n" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="報名者" prop="applicant">
              <el-autocomplete
                v-model="form.applicant"
                :fetch-suggestions="querySearch"
                clearable
                placeholder="輸入姓名搜尋會員"
                @select="handleSelectMember"
              >
                <template #default="{ item }">
                  <div class="search-item">
                    <span class="search-name">{{ item.name }}</span>
                    <span class="search-addr">{{ item.full_address }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="國內外">
              <el-select v-model="form.is_overseas">
                <el-option label="國內 (否)" :value="false" />
                <el-option label="國外 (是)" :value="true" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="組織單位">
              <el-select v-model="form.organization">
                <el-option v-for="item in orgOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="通訊地址">
              <el-input 
                v-model="form.address" 
                type="textarea" 
                :rows="2" 
                placeholder="請輸入完整長地址..." 
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="報名項目" prop="category">
              <el-select v-model="form.category" filterable allow-create placeholder="選取或手寫項目">
                <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">第二區：對象與壽辰忌日</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="對象姓名" prop="target_name">
              <el-input v-model="form.target_name" placeholder="對象名稱" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓氏" prop="last_name">
              <el-input v-model="form.last_name" placeholder="姓氏" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="關係" prop="relationship">
              <el-select v-model="form.relationship" filterable allow-create>
                <el-option v-for="item in relOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="稱謂" prop="title">
              <el-select v-model="form.title" filterable allow-create>
                <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="生日">
              <el-input v-model="form.birthday" placeholder="農曆或國曆生日" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="忌日">
              <el-input v-model="form.death_date" placeholder="忌日或遷化日期" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="男 (人數)">
              <el-select v-model="form.male_count">
                <el-option v-for="n in 101" :key="n-1" :label="n-1" :value="n-1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="女 (人數)">
              <el-select v-model="form.female_count">
                <el-option v-for="n in 101" :key="n-1" :label="n-1" :value="n-1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">第三區：物資與總額</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="金銀紙">
              <el-select v-model="form.joss_paper_count">
                <el-option v-for="n in jossOptions" :key="n" :label="n" :value="n" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="乾糧數量">
              <el-select v-model="form.dry_food_count">
                <el-option v-for="n in 21" :key="n-1" :label="n-1" :value="n-1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="熟食數量">
              <el-select v-model="form.cooked_food_count">
                <el-option v-for="n in 21" :key="n-1" :label="n-1" :value="n-1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="總金額" prop="amount">
              <el-select v-model="form.amount" filterable allow-create>
                <el-option v-for="n in amountOptions" :key="n" :label="n" :value="n" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting" size="large">確認新增</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.custom-form :deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: bold;
  color: #444;
}

.custom-form :deep(.el-input__inner),
.custom-form :deep(.el-textarea__inner),
.custom-form :deep(.el-select),
.custom-form :deep(.el-autocomplete) {
  font-size: 16px;
  width: 100%;
}

.el-divider__text {
  font-size: 16px;
  font-weight: bold;
  color: #e67e22;
}

/* 搜尋清單樣式 */
.search-item {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  padding: 5px 0;
}
.search-name {
  font-weight: bold;
  color: #409eff;
}
.search-addr {
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  text-align: right;
  padding-top: 10px;
}
</style>