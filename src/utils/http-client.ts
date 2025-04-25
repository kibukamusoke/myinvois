import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP client wrapper around Axios
 */
export class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Make a GET request
   * @param url The URL to make the request to
   * @param config The Axios request configuration
   * @returns A promise resolving to the response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make a POST request
   * @param url The URL to make the request to
   * @param data The data to send
   * @param config The Axios request configuration
   * @returns A promise resolving to the response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   * @param url The URL to make the request to
   * @param data The data to send
   * @param config The Axios request configuration
   * @returns A promise resolving to the response data
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle errors from Axios
   * @param error The error to handle
   */
  private handleError(error: any): never {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new MyInvoisApiError(
        error.response.data?.message || error.response.statusText,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new MyInvoisApiError(
        'No response received from server',
        0,
        { request: error.request }
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new MyInvoisApiError(
        error.message || 'Unknown error',
        0,
        {}
      );
    }
  }
}

/**
 * Custom error class for API errors
 */
export class MyInvoisApiError extends Error {
  /** The HTTP status code */
  public statusCode: number;
  /** The response data */
  public responseData: any;
  
  constructor(message: string, statusCode: number, responseData: any) {
    super(message);
    this.name = 'MyInvoisApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}