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
}

export default IConfig;
