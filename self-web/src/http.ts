import axios, {type AxiosResponse, type InternalAxiosRequestConfig, type Method} from "axios";

export interface Response<T = unknown> {
  status: number;
  message: string;
  data?: T;
  error?: Exception;
}

export interface Exception {
  reason: string;
  message?: string;
  stackTrack?: string;
}

const http = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 场景：自动携带 Token
    const token = localStorage.getItem('token');
    if (token) {
      // 这里的 header key 根据后端要求，通常是 Authorization 或 X-Access-Token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    if (res.status && res.status !== 200) {
      console.error('业务错误:', res.message);

      if (res.status === 401) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }

    return response;
  },
  (error) => {
    console.error('网络错误:', error.message);
    return Promise.reject(error);
  }
);


async function fetch<T>(method: Method, url: string, data?: T, params?: object): Promise<T> {
  const response = await http.request({method, url, data, params})
  if (response.data.status !== 200) {
    if (response.data.error !== null) {
      throw new Error(response.data.error!.message)
    }
    throw new Error("request error")
  }

  return response.data.data!
}

export async function fetchGet<T>(url: string, params?: object): Promise<T> {
  return fetch<T>('get', url, undefined, params)
}

export async function fetchPost<T>(url: string, data: T, params?: object): Promise<T> {
  return fetch<T>('post', url, data, params)
}
