const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.post('/', async (req, res) => {
  try {
    const { movieId } = req.body;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryViews= `
      UPDATE Movie SET views = views + 1 where movieid = @movieId
    `;
    request.input('movieId', sql.Int, movieId);
    await request.query(queryViews);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;