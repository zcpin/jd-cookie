<template>
  <el-container class="main-container">
    <!-- 左侧导航 -->
    <el-aside width="220px" class="sider">
      <div class="sider-header">
        <h1 class="app-title">Cookie同步工具</h1>
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
}

.sider {
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

.sider-header {
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
}

.app-title {
  margin: 0;
  font-size: 1.4rem;
  color: #303133;
  font-weight: 600;
}

.side-menu {
  border-right: none;
}

.content-wrapper {
  position: relative;
  background-color: #f5f7fa;
  padding: 20px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 1.2rem;
  font-weight: 500;
}

.data-table {
  margin-top: 24px;
}

.version-footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.float-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sider {
    width: 180px !important;
  }

  .content-wrapper {
    padding: 15px;
  }

  .float-btn {
    right: 20px;
    bottom: 20px;
  }
}
</style>
<script setup lang="ts">
import {onMounted, reactive, ref, toRaw} from 'vue'
import {Lightning} from "@element-plus/icons-vue"
import {ElForm} from "element-plus";
import type {Account, QinglongConfig, TableItem} from "@/types"
import {JD_LOGIN_URL} from "@/global/constants.ts";
import {getConfig, openWindow} from "@/utils";

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
