// Miniprogram HTTP client implementation using Taro.request
import Taro from '@tarojs/taro';
import type { ApiClient } from '@/services/apiDefinitions';

const BASE_URL = 'http://localhost:8080/api';

/**
 * Miniprogram implementation of ApiClient using Taro.request
 */
export const miniprogramHttpClient: ApiClient = {
    get: async <T>(url: string): Promise<T> => {
        try {
            const response = await Taro.request({
                url: `${BASE_URL}${url}`,
                method: 'GET',
                header: {
                    'Content-Type': 'application/json',
                    // Add auth token if available
                    ...(Taro.getStorageSync('token') && {
                        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
                    })
                }
            });

            if (response.statusCode === 200) {
                return response.data as T;
            } else {
                throw new Error(`Request failed with status ${response.statusCode}`);
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    post: async <T>(url: string, data?: any): Promise<T> => {
        try {
            const response = await Taro.request({
                url: `${BASE_URL}${url}`,
                method: 'POST',
                data,
                header: {
                    'Content-Type': 'application/json',
                    ...(Taro.getStorageSync('token') && {
                        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
                    })
                }
            });

            if (response.statusCode === 200) {
                return response.data as T;
            } else {
                throw new Error(`Request failed with status ${response.statusCode}`);
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    put: async <T>(url: string, data?: any): Promise<T> => {
        try {
            const response = await Taro.request({
                url: `${BASE_URL}${url}`,
                method: 'PUT',
                data,
                header: {
                    'Content-Type': 'application/json',
                    ...(Taro.getStorageSync('token') && {
                        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
                    })
                }
            });

            if (response.statusCode === 200) {
                return response.data as T;
            } else {
                throw new Error(`Request failed with status ${response.statusCode}`);
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    delete: async <T>(url: string): Promise<T> => {
        try {
            const response = await Taro.request({
                url: `${BASE_URL}${url}`,
                method: 'DELETE',
                header: {
                    'Content-Type': 'application/json',
                    ...(Taro.getStorageSync('token') && {
                        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
                    })
                }
            });

            if (response.statusCode === 200) {
                return response.data as T;
            } else {
                throw new Error(`Request failed with status ${response.statusCode}`);
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
};
