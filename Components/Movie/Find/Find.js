const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.get('/', async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    
    const searchTerm = req.query.search;
    
    let query = `
      SELECT *
      FROM Movie
    `;
    
    if (searchTerm) {
      query += ` WHERE moviename LIKE @searchTerm`;
      request.input('searchTerm', `%${searchTerm}%`);
    }
    
    const result = await request.query(query);
    const movies = result.recordset;
    res.status(200).json({ movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;