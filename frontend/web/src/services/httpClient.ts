// Web platform HTTP client implementation using axios
import axios, { type AxiosInstance } from 'axios';
import type { ApiClient } from '@/services/apiDefinitions';

const createAxiosInstance = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            // Add auth token if available
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('API request error:', error);
            return Promise.reject(error);
        }
    );

    return instance;
};

const axiosInstance = createAxiosInstance('http://localhost:8080/api');

/**
 * Web platform implementation of ApiClient using axios
 */
export const webHttpClient: ApiClient = {
    get: async <T>(url: string): Promise<T> => {
        const response = await axiosInstance.get<T>(url);
        return response.data;
    },

    post: async <T>(url: string, data?: any): Promise<T> => {
        const response = await axiosInstance.post<T>(url, data);
        return response.data;
    },

    put: async <T>(url: string, data?: any): Promise<T> => {
        const response = await axiosInstance.put<T>(url, data);
        return response.data;
    },

    delete: async <T>(url: string): Promise<T> => {
        const response = await axiosInstance.delete<T>(url);
        return response.data;
    },
};
