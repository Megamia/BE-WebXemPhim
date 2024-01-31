const express = require('express');
const sql = require('mssql');
const db =require('./Config/db');
const cors = require('cors');

const app = express();
const port = 4000;
app.use(cors());

app.get('/api/data', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query('SELECT username, password FROM Users');
    res.json(result.recordset);
  } catch (error) {
    console.log('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function connectToDatabase() {
  try {
    await sql.connect(db);
    console.log('Connected to SQL Server');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log('Error connecting to SQL Server:', error);
  }
}

connectToDatabase();