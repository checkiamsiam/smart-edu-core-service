interface IConfig {
  isDevelopment: boolean;
  port: number | string;
  jwt: {
    secret: string;
  };
}

export default IConfig;
