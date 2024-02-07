const sql = require('mssql');
const dbConfig = require('./db');

async function connectToDatabase() {
  try {
    let pool = await sql.connect(dbConfig);
    // const result = await pool.request().query('SELECT * FROM Users');
    // const users = result.recordset;
    // console.log(users);
    // return users;
    console.log("Connected SQL");
    return pool;
  } catch (error) {
    console.log('Error connecting to SQL Server:', error);
  }
}

module.exports = connectToDatabase;