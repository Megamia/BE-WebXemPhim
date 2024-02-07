const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0';
const fs = require('fs');
const dbConnection = require('../../../Config/dbConnection');
const sql = require('mssql'); 

// Middleware xác thực token
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

// Endpoint GET để lấy thông tin người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    await dbConnection(); // Kết nối đến cơ sở dữ liệu

    const userInfo = req.user; // Lấy thông tin người dùng từ token
    const { username } = userInfo; // Sử dụng username từ userInfo để thực hiện truy vấn

    const pool = await sql.connect(dbConnection);
    
    // Thực hiện truy vấn SQL để lấy thông tin người dùng từ bảng User
    const result = await pool.request()
      .query(`SELECT * FROM Users WHERE username = '${username}'`);

    if (result.recordset.length > 0) {
      const userInfoFromDB = result.recordset[0];
      res.json({ message: 'User information has been retrieved successfully', userInfo: userInfoFromDB });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint PUT để cập nhật thông tin người dùng
// Endpoint POST để cập nhật thông tin người dùng
router.post('/', authenticateToken, async (req, res) => {
  try {
    await dbConnection(); // Kết nối đến cơ sở dữ liệu

    const userInfo = req.user; // Lấy thông tin người dùng từ token
    const { username } = userInfo; // Sử dụng username từ userInfo để thực hiện truy vấn
    const { fullname, email, phone } = req.body; // Lấy thông tin cập nhật từ yêu cầu

    const pool = await sql.connect(dbConnection);
    
    // Thực hiện câu lệnh UPDATE để cập nhật thông tin người dùng
    await pool.request()
      .query(`UPDATE Users SET fullname = '${fullname}', email = '${email}', phone = '${phone}' WHERE username = '${username}'`);

    // Trả về thông báo thành công
    res.json({ message: 'User information has been updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
