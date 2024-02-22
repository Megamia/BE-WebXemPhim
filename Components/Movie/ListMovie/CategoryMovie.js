const express = require('express');
const router = express.Router();
const sql = require('mssql'); 
const dbConnection = require('../../../Config/dbConnection');

router.get('/:categoryUrl', async (req, res) => {
  try {
    const { categoryUrl } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection); 
    const request = pool.request();
    const query = `
      SELECT m.*
      FROM Movie m
      INNER JOIN list_category lc ON lc.movieid = m.movieid
      INNER JOIN category c ON c.categoryid = lc.categoryid
      WHERE c.categoryurl = @categoryUrl
    `;
    request.input('categoryUrl', sql.NVarChar, categoryUrl);
    const result = await request.query(query);
    const movies = result.recordset;
    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;