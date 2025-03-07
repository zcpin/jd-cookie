// 封装axios http请求
import axios from 'axios'

export default axios.create({
    baseURL: 'https://github.com',
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + ''
    }
})

