const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../Config/dbConnection');

router.get('/', async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryDonate = `
      SELECT d.*
      FROM Donate d
    `;
    const movieDonate = await request.query(queryDonate);
    const donates = movieDonate.recordset;
    res.status(200).json({donates});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;