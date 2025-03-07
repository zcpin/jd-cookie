// 在扩展的 popup 或后台脚本中打开新窗口
import {JD_LOGIN_URL, JD_MAIN_URL, JD_MY_URL} from "@/global/constants.ts";
import {getConfig, parseCookie, pushCookie} from "@/utils";
import Qinglong from "@/utils/qinglong.ts";

// 监听扩展图标被点击
chrome.action.onClicked.addListener(async () => {
    // 打开扩展内置页面
    const extUrl = chrome.runtime.getURL('public/index.html');
    // 两种打开方式任选其一
    await chrome.tabs.create({url: extUrl});      // 打开扩展本地页面
});

// 监听请求完成事件
chrome.webRequest.onCompleted.addListener(async function (details) {
        // 在这里处理请求完成后的逻辑
        await handleRequestCompleted(details);
    },
    {urls: ["*://*.m.jd.com/*"]}
);


// 监听消息sendMessage
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse): boolean {
    console.log(sendResponse);
    if (message.action === 'clearCookies') {
        // 清除cookie
        clearCookies(sender.url as string, sender.tab?.id as number).then(r => console.log(r))
    } else if (message.action === 'openWindow') {
        openWindow(message.url, message.width, message.height).then(r => console.log(r))
    } else if (message.action === 'pushCookies') {
        syncCookie().then(r => console.log(r))
    }
    sendResponse()
    return true;
});

// 同步cookie到青龙
async function syncCookie() {
    // 获取cookie
    const cookies = await chrome.cookies.getAll({url: JD_MAIN_URL})
    const config = await getConfig()
    const qinglong = new Qinglong(config)
    // 推送cookie
    const result = await pushCookie(qinglong, cookies)
    if (result) {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/images/icon-128.png'),
            title: '提示',
            message: 'cookie同步成功'
        })
    } else {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/images/icon-128.png'),
            title: '提示',
            message: 'cookie同步失败'
        })
    }
}

// 处理登录请求完成
async function handleRequestCompleted(details: any) {
    // 你的处理逻辑,获取cookie并推送
    // 当https://m.jd.com/加载完成，获取cookie并推送 并转到https://my.m.jd.com
    if (details.url === JD_MAIN_URL) {
        // 获取cookie
        const cookies = await chrome.cookies.getAll({url: details.url})
        const cookie = parseCookie(cookies)
        console.log("cookie", cookie)
        if (!cookie) {
            return
        }
        // 跳转到登录页面
        await chrome.tabs.update(details?.tabId, {url: JD_MY_URL})
    }
}

// 清除cookie
async function clearCookies(url: string, tabId: number) {
    // 获取当前页面所有的 Cookie
    chrome.cookies.getAll({url}).then(cookies => {
        // 遍历所有 Cookie 并清除
        for (const cookie of cookies) {
            chrome.cookies.remove({
                url: url,
                name: cookie.name
            }, function (details) {
                if (details) {
                    console.log('Cookie removed:', details);
                } else {
                    console.error('Cookie not found!');
                }
            });
        }
    })

    await chrome.tabs.update(tabId, {url: JD_LOGIN_URL})
}

// 打开新窗口
async function openWindow(url: string, width: number = 600, height: number = 900) {
    try {
        // 获取存储的当前窗口ID
        const wid = await chrome.storage.local.get('jd')
        // 判断当前窗口是否存在
        if (wid.jd) {
            // 如果窗口已存在，则聚焦到该窗口
            await chrome.windows.update(wid.jd, {
                focused: true,
                state: 'normal'
            });
            return;
        }
    } catch (e) {
        console.error(e)
    }

    try {
        // 创建新窗口
        const newWindow = await chrome.windows.create({
            url: url,
            type: "panel",
            width: width,
            height: height
        });
        if (!newWindow) {
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/images/icon-128.png'),
                title: '提示',
                message: '打开窗口失败'
            })
            return
        }

        // 保存当前窗口ID
        await chrome.storage.local.set({jd: newWindow.id});

        // 监听窗口关闭事件，删除存储的当前窗口ID
        chrome.windows.onRemoved.addListener((windowId) => {
            if (windowId === newWindow?.id) {
                // 删除存储的当前窗口ID
                chrome.storage.local.remove('jd');
            }
        });
        const tabId = newWindow.tabs ? newWindow.tabs[0].id : -1;

        const listener = (details: any) => {
            if (details.tabId === tabId && details.url === JD_MY_URL) {
                // 注入内容脚本
                chrome.scripting.executeScript({
                    target: {tabId: details.tabId},
                    files: ['assets/content.js']
                });
                // 移除监听器，避免重复注入
                chrome.webNavigation.onCompleted.removeListener(listener);
            }
        }
        // 监听特定 URL 的页面加载完成事件
        chrome.webNavigation.onCompleted.addListener(listener, {
            url: [{urlEquals: JD_MY_URL}],
        });

        // 监听页面加载完成事件，获取跳转后的 URL
        // chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        //     // 获取当前页面的 URL
        //     if (tabId === tab.id && changeInfo.status === "complete" && tab.url === JD_MY_URL) {
        //         // 注入内容脚本提取数据
        //         await chrome.scripting.executeScript({
        //             target: {tabId: tab.id},
        //             files: ['assets/content.js']
        //
        //             // func: async () => {
        //             //     // 移除tips
        //             //     const tips = document.querySelector("#m_common_tip")
        //             //     tips?.remove()
        //             //     // 移除底部按钮
        //             //     const imk = document.querySelector("#imk2FixedBottom")
        //             //     imk?.remove()
        //             //
        //
        //             //
        //             //     // 创建div
        //             //     const div = document.createElement('div');
        //             //     div.style.width = '300px';
        //             //     div.style.margin = '10px auto';
        //             //     div.style.padding = '10px';
        //             //     div.style.backgroundColor = '#f0f0f0';
        //             //     div.style.borderRadius = '8px';
        //             //     div.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        //             //     div.style.textAlign = 'center';
        //             //     div.style.position = 'relative';
        //             //     div.style.bottom = '10px';
        //             //     div.style.left = '0';
        //             //     div.style.zIndex = '999999999';
        //             //
        //             //     // 创建第一个按钮
        //             //     const button1 = document.createElement('button');
        //             //     button1.textContent = '切换账号';
        //             //     button1.style.padding = '10px 20px';
        //             //     button1.style.margin = '5px';
        //             //     button1.style.fontSize = '16px';
        //             //     button1.style.cursor = 'pointer';
        //             //     button1.style.backgroundColor = '#4CAF50';
        //             //     button1.style.color = 'white';
        //             //     button1.style.border = 'none';
        //             //     button1.style.borderRadius = '4px';
        //             //     button1.style.transition = 'background-color 0.3s';
        //             //
        //             //     // 创建第二个按钮
        //             //     const button2 = document.createElement('button');
        //             //     button2.textContent = '推送cookie';
        //             //     button2.style.padding = '10px 20px';
        //             //     button2.style.margin = '5px';
        //             //     button2.style.fontSize = '16px';
        //             //     button2.style.cursor = 'pointer';
        //             //     button2.style.backgroundColor = '#008CBA';
        //             //     button2.style.color = 'white';
        //             //     button2.style.border = 'none';
        //             //     button2.style.borderRadius = '4px';
        //             //     button2.style.transition = 'background-color 0.3s';
        //             //
        //             //     // 将按钮添加到div中
        //             //     div.appendChild(button1);
        //             //     div.appendChild(button2);
        //             //
        //             //     // 将div添加到body中
        //             //     document.body.appendChild(div);
        //             //
        //             //     // 绑定点击事件
        //             //     button1.addEventListener('click', async function () {
        //             //         // 发送消息到 background.js
        //             //         await chrome.runtime.sendMessage({action: 'clearCookies'});
        //             //     });
        //             //
        //             //     button2.addEventListener('click', async function () {
        //             //         // 发送消息到 background.js
        //             //         await chrome.runtime.sendMessage({action: 'pushCookies'});
        //             //     });
        //             //     await chrome.storage.local.set({buttonInjected: true});
        //             // }
        //         })
        //     }
        // });


    } catch (e) {
        console.error(e)
    }
}
