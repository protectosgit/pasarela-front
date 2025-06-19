import axios, { AxiosError, AxiosInstance } from 'axios';

export class ResilienceMiddleware {
  private retryCount: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    private readonly axiosInstance: AxiosInstance,
    maxRetries = 3,
    retryDelay = 1000
  ) {
    this.retryCount = 0;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Reset retry count on successful response
        this.retryCount = 0;
        return response;
      },
      async (error: AxiosError) => {
        if (!this.shouldRetry(error)) {
          return Promise.reject(error);
        }

        this.retryCount++;

        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
        await this.sleep(delay);

        // Retry the request
        return this.axiosInstance(error.config!);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Don't retry if we've hit the max retries
    if (this.retryCount >= this.maxRetries) {
      return false;
    }

    // Only retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status <= 599);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const waitForConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
}; 