import axios, { AxiosInstance } from 'axios';

const Agent = require('agentkeepalive');

function createKeepAliveAgent() {
  return new Agent.HttpsAgent({
    maxSockets: 10,
    maxFreeSockets: 10,
    timeout: 60_000,
    freeSocketTimeout: 30_000,
  });
}

function createAxiosInstance(baseURL: string, intervalMs: number = 1_000): AxiosInstance {
  const axiosInstance = axios.create(
    {
      baseURL,
      httpsAgent: createKeepAliveAgent(),
    },
  );
  let lastInvocationTime: number|undefined;

  const scheduler = (config: any) => {
    const now = Date.now();
    if (lastInvocationTime) {
      lastInvocationTime += intervalMs;
      const waitPeriodForThisRequest = lastInvocationTime - now;
      if (waitPeriodForThisRequest > 0) {
        return new Promise((resolve) => {
          setTimeout(
            () => resolve(config),
            waitPeriodForThisRequest,
          );
        });
      }
    }

    lastInvocationTime = now;
    return config;
  };

  axiosInstance.interceptors.request.use(scheduler);
  return axiosInstance;
}

export {
  createAxiosInstance,
};
