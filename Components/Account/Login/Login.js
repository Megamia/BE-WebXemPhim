const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sql = require('mssql'); 
const secretKey = 'as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0'; 
const dbConnection = require('../../../Config/dbConnection');
const fs = require('fs');

router.post('/', async (req, res) => {
  try {
    await dbConnection();
    const { username, password } = req.body;
    const pool = await sql.connect(dbConnection); 
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);
    const query = 'SELECT * FROM Users WHERE username = @username AND password = @password';
    const result = await request.query(query);
    const user = result.recordset[0];
    if (user) {
      const token = jwt.sign({ username: user.username, userId: user.userid }, secretKey, { expiresIn: '1h' });  
      res.status(200).json({ token: token });
    } else {
      res.status(401).json({ message: 'Invalid username or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;