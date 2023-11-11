interface IConfig {
  isDevelopment: boolean;
  port: number | string;
  jwt: {
    secret: string;
  };
  redis: {
    url: string;
    expires_in: number | string;
  };
  initPaymentEndpoint: string;
}

export default IConfig;
