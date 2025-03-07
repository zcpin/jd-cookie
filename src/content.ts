// content-script.js
const injectHtml = () => {
    if (!document.getElementById('custom-div')) {
        // 移除tips
        const tips = document.querySelector("#m_common_tip")
        tips?.remove()
        // 移除底部按钮
        const imk = document.querySelector("#imk2FixedBottom")
        imk?.remove()

        // 关闭弹窗
        document.querySelector<HTMLElement>(".modal__close")?.click()
        const style = document.createElement("style");
        style.textContent = `
  .custom-btn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 10px;
    transition: background-color 0.3s;
  }
  .custom-btn:hover {
    background-color: #45a049;
  }

.custom-div {
    width: 300px;
    margin: 10px auto;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    text-align: center;
    position: absolute;
    top: 40px;
    right: 10px;
    z-index: 999999999;
}
`;


        const div = document.createElement("div");
        div.className = "custom-div";
        div.id = "custom-div";
        document.head.appendChild(style);

        // 创建按钮
        const btn1 = document.createElement("button");
        btn1.className = "custom-btn";
        btn1.textContent = "切换账号";
        const btn2 = document.createElement("button");
        btn2.className = "custom-btn";
        btn2.textContent = "推送Cookie";


        div.appendChild(btn1);
        div.appendChild(btn2)

        // 绑定点击事件
        btn1.addEventListener('click', async function () {
            // 发送消息到 background.js
            await chrome.runtime.sendMessage({action: 'clearCookies'});
        });

        btn2.addEventListener('click', async function () {
            // 发送消息到 background.js
            await chrome.runtime.sendMessage({action: 'pushCookies'});
        });
        document.body.appendChild(div);

    }
}

// 根据文档状态决定注入时机
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectHtml();
} else {
    document.addEventListener('DOMContentLoaded', injectHtml);
}