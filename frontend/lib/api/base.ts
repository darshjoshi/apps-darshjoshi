import api from './client';
import { AxiosResponse } from 'axios';

export class BaseAPI {
  constructor(protected endpoint: string) {}

  // Standard CRUD operations
  getAll = <T = any>(): Promise<AxiosResponse<T>> => {
    return api.get(`${this.endpoint}/data`);
  };

  getById = <T = any>(id: string | number): Promise<AxiosResponse<T>> => {
    return api.get(`${this.endpoint}/data/${id}`);
  };

  create = <T = any>(data: any): Promise<AxiosResponse<T>> => {
    return api.post(`${this.endpoint}/data`, data);
  };

  update = <T = any>(id: string | number, data: any): Promise<AxiosResponse<T>> => {
    return api.put(`${this.endpoint}/data/${id}`, data);
  };

  delete = <T = any>(id: string | number): Promise<AxiosResponse<T>> => {
    return api.delete(`${this.endpoint}/data/${id}`);
  };

  // Custom endpoint call
  call = <T = any>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<AxiosResponse<T>> => {
    const endpoint = `${this.endpoint}${path}`;

    switch (method) {
      case 'GET':
        return api.get(endpoint);
      case 'POST':
        return api.post(endpoint, data);
      case 'PUT':
        return api.put(endpoint, data);
      case 'DELETE':
        return api.delete(endpoint);
      default:
        return api.get(endpoint);
    }
  };
}
