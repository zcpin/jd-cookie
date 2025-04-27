<template>
  <el-container class="main-container">
    <!-- 左侧导航 -->
    <el-aside width="220px" class="sider">
      <div class="sider-header">
        <h1 class="app-title">Cookie</h1>
        <div class="header-actions">
          <el-button
              @click="toggleDark()"
              size="small"
              circle
              :icon="isDark ? Moon : Sunny"
              class="theme-toggle"
          />
          <el-tag size="small" type="info" effect="plain" class="version-tag">
            v{{ version }}
          </el-tag>
        </div>
      </div>


      <el-menu
          :default-active="activeTab"
          class="side-menu"
          @select="handleMenuSelect"
      >
        <el-menu-item index="config">
          <el-icon>
            <setting/>
          </el-icon>
          <span>面板配置</span>
        </el-menu-item>

        <el-menu-item index="account">
          <el-icon>
            <user/>
          </el-icon>
          <span>账号管理</span>
        </el-menu-item>

        <el-menu-item index="env">
          <el-icon>
            <coin/>
          </el-icon>
          <span>环境变量</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-main class="content-wrapper">
      <div class="content-container">
        <!-- 面板配置 -->
        <transition name="fade" mode="out-in">
          <el-card v-if="activeTab === 'config'" class="config-section">
            <template #header>
              <div class="card-header">
                <span>面板配置</span>
              </div>
            </template>

            <el-form :model="panelForm" label-width="100px">
              <el-form-item label="面板地址">
                <el-input
                    v-model="panelForm.url"
                    placeholder="https://api.example.com"
                />
              </el-form-item>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="Client ID">
                    <el-input
                        v-model="panelForm.cid"
                        placeholder="请输入客户端ID"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="安全密钥">
                    <el-input
                        v-model="panelForm.secret"
                        type="password"
                        placeholder="••••••••"
                        show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-button type="primary" @click="saveConfig">保存配置</el-button>
            </el-form>
          </el-card>
        </transition>

        <!-- 账号管理 -->
        <transition name="fade" mode="out-in">
          <el-card v-if="activeTab === 'account'" class="account-section">
            <template #header>
              <div class="card-header">
                <span>账号管理</span>
              </div>
            </template>

            <el-form :model="accountForm" label-width="100px" ref="accountRef">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="登录账号">
                    <el-input
                        v-model="accountForm.account"
                        placeholder="user@example.com"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="账户密码">
                    <el-input
                        v-model="accountForm.password"
                        type="password"
                        placeholder="••••••••"
                        show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="备注信息">
                <el-input
                    v-model="accountForm.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="输入备注信息（可选）"
                />
              </el-form-item>

              <el-button type="primary" @click="saveAccount">保存账号</el-button>
            </el-form>

            <el-table
                :data="tableData"
                class="data-table"
                stripe
                style="width: 100%"
            >
              <el-table-column prop="account" label="账号" min-width="180"/>
              <el-table-column prop="remark" label="备注" width="120"/>
              <el-table-column prop="createTime" label="添加时间" width="150"/>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                      type="danger"
                      size="small"
                      @click="deleteItem(scope.row.account)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </transition>
      </div>

      <!-- 版本信息 -->
      <div class="version-footer">
        <el-tag type="info" effect="dark" round>版本号 {{ version }}</el-tag>
      </div>

      <!-- 悬浮按钮 -->
      <el-button
          v-if="panelForm.url && panelForm.cid && panelForm.secret"
          class="float-btn"
          type="warning"
          :icon="Lightning"
          circle
          size="large"
          @click="handleSettings"
      />
    </el-main>
  </el-container>
</template>
<style scoped>
.main-container {
  height: 100vh;
  background-color: #f0f2f5;
}

.sider {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
  font-weight: bold;
}

.side-menu {
  border-right: none;
}

.sider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-toggle {
  background-color: transparent;
  color: inherit;
}

.version-tag {
  background: transparent;
  color: #909399;
  border: none;
}

/* 暗黑模式适配 */
html.dark {
  background-color: #181818;
}

html.dark .sider {
  background-color: #1f1f1f;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.4);
}

html.dark .el-card {
  background-color: #2b2b2b;
  border-color: #333;
}

html.dark .content-wrapper {
  background-color: #181818;
}

html.dark .el-menu {
  background-color: #1f1f1f;
}

html.dark .el-menu-item {
  color: #ccc;
}

html.dark .el-menu-item.is-active {
  background-color: #3a3a3a;
  color: #67c23a;
}

html.dark .app-title {
  color: #f2f2f2;
}

html.dark .version-footer {
  color: #aaa;
}


.side-menu .el-menu-item {
  font-size: 15px;
}

.side-menu .el-menu-item:hover {
  background-color: #f5f7fa;
}

.side-menu .el-menu-item.is-active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.content-wrapper {
  position: relative;
  background-color: #f9fafc;
  padding: 30px 20px;
  overflow-y: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
}

.el-card {
  border-radius: 10px;
  overflow: hidden;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item .el-input,
.el-form-item .el-textarea {
  width: 100%;
}

.el-button {
  margin-top: 10px;
}

.data-table {
  margin-top: 30px;
  border-radius: 10px;
  overflow: hidden;
}

.data-table .el-table__header {
  background-color: #f5f7fa;
}

.data-table .el-button {
  margin: 0 auto;
  display: block;
}

.version-footer {
  position: fixed;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #909399;
}

.float-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  animation: float 2s infinite ease-in-out;
  z-index: 1000;
}

/* 按钮浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .sider {
    width: 160px !important;
  }

  .content-wrapper {
    padding: 20px 10px;
  }

  .float-btn {
    right: 20px;
    bottom: 20px;
  }
}
</style>

<script setup lang="ts">
import {onMounted, reactive, ref, toRaw} from 'vue'
import {Lightning, Moon, Sunny} from "@element-plus/icons-vue"
import {ElForm} from "element-plus";
import type {Account, QinglongConfig, TableItem} from "@/types"
import {JD_LOGIN_URL} from "@/global/constants.ts";
import {getConfig, openWindow} from "@/utils";
import {useDark, useToggle} from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const targetUrl = ref<string>(JD_LOGIN_URL)
const activeTab = ref('config')
const version = ref('1.0.0')
const panelForm = reactive<QinglongConfig>({
  url: '',
  cid: '',
  secret: '',
})
let accountForm = reactive<Account>({
  account: '',
  password: '',
  remark: ''
})
let tableData = reactive<TableItem[]>([])

const handleMenuSelect = (tab: string) => {
  activeTab.value = tab
}
// 获取面板配置
const getPanelConfig = async () => {
  const result = await getConfig()
  panelForm.url = result.url
  panelForm.cid = result.cid
  panelForm.secret = result.secret
}
// 获取账号列表
const getAccountList = async () => {
  const result = await chrome.storage.local.get('tableData')
  tableData = reactive<TableItem[]>(result.tableData)
}
// 删除账号
const deleteItem = async (account: string) => {
  tableData = tableData.filter(item => item.account !== account)
  if (!tableData.length) {
    await chrome.storage.local.remove('tableData')
    return
  }
  await chrome.storage.local.set({
    tableData: toRaw(tableData)
  })
  await getAccountList()
}
// 保存账号
const saveAccount = async () => {
  const accountInfo = {
    account: accountForm.account,
    password: accountForm.password,
    remark: accountForm.remark,
    createTime: new Date().toLocaleString(),
    lastSync: ''
  }
  if (tableData.length > 0 && tableData.some(item => item.account === accountForm.account)) {
    // 账号相同，则将原账号删除
    tableData = tableData.filter(item => item.account !== accountForm.account)
  }
  tableData.push(accountInfo)
  await chrome.storage.local.set({
    tableData: toRaw(tableData)
  })

  // 提示
  accountForm = reactive<Account>({
    account: '',
    password: '',
    remark: ''
  })
  await getPanelConfig()
}
// 初始化数据
onMounted(() => {
  getPanelConfig()
  getAccountList()
})
// 保存配置
const saveConfig = () => {
  chrome.storage.local.set({
    panel: panelForm
  })
}
// 打开窗口
const handleSettings = () => {
  openWindow(targetUrl.value)
}
</script>
