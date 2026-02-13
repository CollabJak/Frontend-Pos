import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    silent?: boolean;
  }

  interface InternalAxiosRequestConfig {
    silent?: boolean;
  }
}
