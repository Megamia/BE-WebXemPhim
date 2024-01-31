const express = require('express');
const sql = require('mssql');
const db = require('./Config/db');
const cors = require('cors');

const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

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

app.post('/api/signup', async (req, res) => {
  try {
    const { username, fullname, email, password, phone } = req.body;

    const pool = await sql.connect(db);

    const checkUserQuery = `SELECT * FROM Users WHERE username = '${username}'`;
    const checkUserResult = await pool.request().query(checkUserQuery);

    if (checkUserResult.recordset.length > 0) {
      return res.status(400).json({ error: 'Người dùng đã tồn tại' });
    }

    const insertUserQuery = `INSERT INTO Users (username, fullname, email, password, phone) VALUES ('${username}', '${fullname}', '${email}', '${password}', '${phone}')`;
    await pool.request().query(insertUserQuery);

    res.status(200).json({ message: 'Đăng kí thành công' });
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