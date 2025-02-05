export default () => ({
  isProd: process.env.NODE_ENV === 'production',
  web: {
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  api: {
    port: Number(process.env.API_PORT),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    access: process.env.JWT_ACCESS_SECRET,
    refresh: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION_TIME,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION_TIME,
  },
  resend: {
    api: process.env.RESEND_API_KEY,
  },
});
