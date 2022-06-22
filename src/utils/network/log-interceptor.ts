import { AxiosResponse } from 'axios';

/**
 * Log into STDOUT in production
 * @param response
 */
const logInterceptor = (response: AxiosResponse<any, any>) => {
  //@ts-ignore
  const log = `status=${response?.status} request=${response?.config?.url}`;
  console.log(log);
  return response;
};

export default logInterceptor;
