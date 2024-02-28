const express = require('express');
const router = express.Router();
const sql = require('mssql'); 
const dbConnection = require('../../../Config/dbConnection');

router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection); 
    const request = pool.request();
    const query = `
      SELECT *
      FROM Movie 
      WHERE movieid = @movieId
    `;
    request.input('movieId', sql.Int, movieId);
    const result = await request.query(query);
    const movies = result.recordset;
    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;