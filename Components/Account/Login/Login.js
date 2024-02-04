const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.post('/', async (req, res) => {
  try {
    await dbConnection();

    const { username, password } = req.body;
    const pool = await sql.connect(dbConnection);

    const loginUserQuery = 'SELECT * FROM Users WHERE username = @username AND password = @password';
    const request = pool.request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);
    const loginUserResult = await request.query(loginUserQuery);

    if (loginUserResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const user = loginUserResult.recordset[0];

    req.session.user = user;

    res.status(200).json({ message: 'Đăng nhập thành công', user });
  } catch (error) {
    console.log('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;