const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.post('/', async (req, res) => {
  try {
    await dbConnection(); 

    const { username, fullname, email, password, phone } = req.body;
    const pool = await sql.connect(dbConnection);

    if (!username.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Tên người dùng và mật khẩu không được để trống' });
    }

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

module.exports = router;