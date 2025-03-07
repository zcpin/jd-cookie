import type {JdCookieEnv, JdCookieValue, QinglongConfig} from "@/types";
import {JD_COOKIE} from "@/global/constants.ts";
import Qinglong from "@/utils/qinglong.ts";
// 获取配置信息
export const getConfig = async (): Promise<QinglongConfig> => {
    const {panel} = await chrome.storage.local.get('panel')
    if (!panel) {
        throw new Error('请先配置面板信息')
    }
    if (!panel.url || !panel.cid || !panel.secret) {
        throw new Error('请先配置面板信息')
    }
    return panel as QinglongConfig
}
// 获取环境变量JD_COOKIE的id
export const getEnvId = (envs: JdCookieEnv[], pin: string): number => {
    const env = envs.find((env) => {
        // 增加空值检查，避免运行时错误
        return env.name === JD_COOKIE && env.value?.includes(pin);
    });
    if (env) {
        return env.id || 0;
    }
    return 0
}

// 解析cookie
export const parseCookie = (cookies: chrome.cookies.Cookie[]): JdCookieValue | undefined => {
    // 检查输入参数是否为有效数组
    if (!Array.isArray(cookies)) {
        console.error('Invalid input: cookies must be an array');
        return undefined;
    }

    let ptPin: string | undefined = undefined;
    let ptKey: string | undefined = undefined;

    // 单次遍历找到 pt_pin 和 pt_key
    for (const cookie of cookies) {
        if (cookie.name === 'pt_pin') {
            ptPin = cookie.value;
        } else if (cookie.name === 'pt_key') {
            ptKey = cookie.value;
        }
        if (ptPin !== undefined && ptKey !== undefined) {
            break;
        }
    }

    // 检查是否找到了必要的 cookie
    if (!ptPin || !ptKey) {
        console.warn('Missing required cookies: pt_pin or pt_key not found');
        return undefined;
    }

    return {
        pt_pin: ptPin!,
        pt_key: ptKey!
    };
}


// 推送cookie到青龙面板
export const pushCookie = async (qinglong: Qinglong, cookies: chrome.cookies.Cookie[]): Promise<boolean> => {
    const jdCookieInfo = parseCookie(cookies)
    if (!jdCookieInfo) {
        return false
    }
    const {pt_pin} = jdCookieInfo
    // 将jdCookieInfo拼成k1=v1;k2=v2; 这样的格式
    const jdCookie = Object.entries(jdCookieInfo).map(([k, v]) => `${k}=${v};`).join('')
    const eid = getEnvId(await qinglong.getEnv(), pt_pin)
    let result: boolean
    if (eid) {
        result = await qinglong.updateEnv({
            id: eid,
            name: JD_COOKIE,
            value: jdCookie,
            remarks: pt_pin,
        })
    } else {
        result = await qinglong.addEnv({
            name: JD_COOKIE,
            value: jdCookie,
            remarks: pt_pin,
        })
    }
    return result
}

// 打开新窗口 chrome 发送消息通知background.js打开窗口
export const openWindow = async (url: string, width: number = 600, height: number = 900) => {
    // 发送消息
    await chrome.runtime.sendMessage({action: 'openWindow', url: url, width: width, height: height});
}
