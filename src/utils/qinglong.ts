import type {AxiosInstance} from "axios";
import axios from "axios";
import type {JdCookieEnv, QinglongConfig} from "@/types";
import {JD_COOKIE, QL_TOKEN} from "@/global/constants.ts";

class Qinglong {
    // axios客服端
    private http: AxiosInstance
    private readonly url: string
    private readonly cid: string
    private readonly secret: string

    constructor(config: QinglongConfig) {
        this.url = config.url
        this.cid = config.cid
        this.secret = config.secret
        this.http = axios.create({
            baseURL: config.url,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    // 获取token
    async getToken(): Promise<string> {
        // 先从本地获取
        const result = await chrome.storage.local.get(QL_TOKEN)
        if (result[QL_TOKEN] && result[QL_TOKEN].expire > Math.floor(new Date().getTime() / 1000)) {
            return result[QL_TOKEN].token
        }
        const {data} = await axios.get(`${this.url}/open/auth/token`, {
            params: {
                client_id: this.cid,
                client_secret: this.secret
            }
        })
        const {token, expiration} = data.data
        if (!token) {
            throw new Error('获取token失败')
        }
        const tokenInfo = {
            token,
            expire: expiration
        }
        await chrome.storage.local.set({
            QL_TOKEN: tokenInfo
        })
        return token
    }

    async setToken(): Promise<void> {
        const token = await this.getToken()
        this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // 获取环境变量列表
    async getEnv(): Promise<JdCookieEnv[]> {
        await this.setToken()
        const {data} = await this.http.get(`${this.url}/open/envs`, {
            params: {
                searchValue: JD_COOKIE,
                t: Date.now()
            }
        })
        return data.data as JdCookieEnv[]
    }

    // 更新环境变量
    async updateEnv(env: JdCookieEnv): Promise<boolean> {
        await this.setToken()
        const {data} = await this.http.put(`/open/envs`, env)
        console.log(data)
        return data.code === 200
    }

    // 新增环境变量
    async addEnv(env: JdCookieEnv): Promise<boolean> {
        await this.setToken()
        const {data} = await this.http.post(`/open/envs`, env)
        console.log(data)
        return data.code === 200
    }

}

// 将类暴露出去
export default Qinglong