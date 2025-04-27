// content-script.js
const injectHtml = () => {
    if (!document.getElementById('custom-floating')) {
        // 移除无关元素
        document.querySelector("#m_common_tip")?.remove();
        document.querySelector("#imk2FixedBottom")?.remove();
        document.querySelector<HTMLElement>(".modal__close")?.click();

        // 样式
        const style = document.createElement("style");
        style.textContent = `
#custom-floating {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background-color: #409EFF;
  border-radius: 30px 0 0 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: width 0.4s ease, height 0.4s ease;
  z-index: 99999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

#custom-floating:hover {
  width: 220px;
  height: 140px;
}

.custom-icon {
  width: 100%;
  height: 100%;
  background: url('https://img.icons8.com/ios-filled/50/ffffff/settings.png') center/30px no-repeat;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

#custom-floating:hover .custom-icon {
  opacity: 0;
  transform: scale(0.7);
}

.custom-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease 0.1s;
}

#custom-floating:hover .custom-actions {
  opacity: 1;
  pointer-events: auto;
}

.custom-btn {
  width: 160px;
  background-color: #67C23A;
  color: white;
  border: none;
  padding: 8px 0;
  border-radius: 20px;
  font-size: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.custom-btn:hover {
  background-color: #5daf34;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Toast */
#toast {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100000000;
  opacity: 0;
  transition: opacity 0.5s ease;
}`;
        document.head.appendChild(style);

        // 结构
        const container = document.createElement("div");
        container.id = "custom-floating";

        const iconDiv = document.createElement("div");
        iconDiv.className = "custom-icon";

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "custom-actions";

        const btn1 = document.createElement("button");
        btn1.className = "custom-btn";
        btn1.textContent = "切换账号";

        const btn2 = document.createElement("button");
        btn2.className = "custom-btn";
        btn2.textContent = "推送Cookie";

        actionsDiv.appendChild(btn1);
        actionsDiv.appendChild(btn2);

        container.appendChild(iconDiv);
        container.appendChild(actionsDiv);

        document.body.appendChild(container);

        // Toast提示函数
        const showToast = (message: string) => {
            let toast = document.getElementById('toast') as HTMLDivElement;
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast';
                document.body.appendChild(toast);
            }
            toast.textContent = message;
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
            }, 1500);
        };

        // 绑定事件
        btn1.addEventListener('click', async () => {
            await chrome.runtime.sendMessage({action: 'clearCookies'});
            showToast('已切换账号');
        });

        btn2.addEventListener('click', async () => {
            await chrome.runtime.sendMessage({action: 'pushCookies'});
            showToast('Cookie推送成功');
        });
    }
}

// 根据文档状态决定注入时机
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectHtml();
} else {
    document.addEventListener('DOMContentLoaded', injectHtml);
}