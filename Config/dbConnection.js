const sql = require('mssql');
const dbConfig = require('./db');

async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to SQL Server');
  } catch (error) {
    console.log('Error connecting to SQL Server:', error);
  }
}

module.exports = connectToDatabase;