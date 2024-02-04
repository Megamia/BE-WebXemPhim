const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const username = req.session.user.username;

    const pool = await sql.connect(dbConnection);
    const selectQuery = 'SELECT * FROM Users WHERE username = @username';
    const result = await pool.request().input('username', sql.NVarChar, username).query(selectQuery);

    const userInfo = result.recordset[0];

    res.status(200).json(userInfo);
  } catch (error) {
    console.error('Error querying the database:', error.message);

    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const username = req.session.user.username;
    const { fullname, email, phone } = req.body;

    // Cập nhật thông tin người dùng trong cơ sở dữ liệu
    const pool = await sql.connect(dbConnection);
    const updateQuery = `UPDATE Users SET fullname = '${fullname}', email = '${email}', phone = '${phone}' WHERE username = '${username}'`;
    await pool.request().query(updateQuery);

    res.status(200).json({ message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    console.error('Error querying the database:', error.message);

    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;