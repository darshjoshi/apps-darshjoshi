import { BaseAPI } from '../base';
import { APIResponse } from '../types';

class ExampleAppAPI extends BaseAPI {
  constructor() {
    super('/example-app');
  }

  // Use inherited methods: getAll(), getById(), create(), update(), delete()

  // Add custom methods specific to this app
  getHealth = () => {
    return this.call<APIResponse>('/health', 'GET');
  };
}

export const exampleAppAPI = new ExampleAppAPI();
