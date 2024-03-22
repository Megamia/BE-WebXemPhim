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
      SELECT moviename
      FROM Movie
    `;
    
    if (searchTerm) {
      query += ` WHERE moviename LIKE @searchTerm`;
      request.input('searchTerm', `%${searchTerm}%`);
    }
    
    const result = await request.query(query);
    const names = result.recordset;
    res.status(200).json({ names });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;