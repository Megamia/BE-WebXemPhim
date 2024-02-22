const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sql = require('mssql'); 
const secretKey = 'as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0'; 
const dbConnection = require('../../../Config/dbConnection');

router.get('/', async (req, res) => {
  try {
    await dbConnection();
    
    const pool = await sql.connect(dbConnection); 

    const request = pool.request();

    const query = 'SELECT * FROM Movie'; // Thay đổi truy vấn để lấy danh sách phim từ bảng "Movies"
    const result = await request.query(query);
    const movies = result.recordset;

    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;