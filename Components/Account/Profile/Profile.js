const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0';
const fs = require('fs');
const dbConnection = require('../../../Config/dbConnection');
const sql = require('mssql');
const { Console } = require('console');

const authenticateToken = (req, res, next) => {
  try {
    const tokensData = fs.readFileSync('tokens.json', 'utf8');
    const tokens = JSON.parse(tokensData);

    if (tokens && tokens.token) {
      const token = tokens.token;
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        req.user = decoded;
        next();
      });
    } else {
      res.status(401).json({ message: 'Token not provided' });
    }
  } catch (error) {
    console.error('Error reading tokens file:', error);
    res.status(500).json({ message: 'Error reading tokens file' });
  }
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    await dbConnection(); 

    const userInfo = req.user; 
    const { username } = userInfo; 

    const pool = await sql.connect(dbConnection);

    const result = await pool.request()
      .query(`SELECT * FROM Users WHERE username = '${username}'`);

    if (result.recordset.length > 0) {
      const userInfoFromDB = result.recordset[0];
      // console.log("Users: ", userInfoFromDB);
      // const tokensData = fs.readFileSync('tokens.json', 'utf8');
      // const tokens = JSON.parse(tokensData);
      // console.log("Token: ", tokens);
      res.json({ message: 'User information has been retrieved successfully', userInfo: userInfoFromDB });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    await dbConnection(); 
    const { username, fullname, email, phone } = req.body; 
    const { userId } = req.user;
    const pool = await sql.connect(dbConnection);

    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('fullname', sql.NVarChar, fullname)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('userid', sql.Int, userId)
      .query('UPDATE Users SET username = @username, fullname = @fullname, email = @email, phone = @phone WHERE userid = @userid');

      res.json({ message: 'User information has been updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
