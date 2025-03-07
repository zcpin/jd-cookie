export interface QinglongConfig {
    url: string
    cid: string
    secret: string
}

export interface QinglongToken {
    token: string
    expire: number
}

export interface TableItem {
    account: string
    remark: string
    createTime: string
    lastSync: string
}


export interface Account {
    account: string
    password: string
    remark: string
}

export interface JdCookieEnv {
    id?: number;
    value: string;
    timestamp?: string;
    status?: number;
    position?: number;
    name: string;
    remarks?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface JdCookieValue {
    pt_pin: string;
    pt_key: string
}