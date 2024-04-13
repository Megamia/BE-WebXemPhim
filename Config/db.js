const db = {
  user: 'sa',
  password: 'sa',
  // server: '26.150.181.207', // DESKTOP-DU2RDFE
  server: '26.138.51.32',   // DESKTOP-8F687F2
  // server: '26.227.56.79',   // VIETANH
  database: 'WebXemPhim',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
};

module.exports = db;