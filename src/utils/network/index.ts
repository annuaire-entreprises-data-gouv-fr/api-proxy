import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import constants from "../../constants";
import handleError from "./handle-errors";

const httpClient = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return axios({
    timeout: constants.defaultTimeout,
    ...config,
  })
    .then((response) => response)
    .catch((error) => handleError(error));
};

const httpGet = (url: string, config?: AxiosRequestConfig) =>
  httpClient({ ...config, url, method: "GET" });

export { httpClient, httpGet };

export default httpClient;
