const express = require('express');
const router = express.Router();
const sql = require('mssql'); 
const dbConnection = require('../../../Config/dbConnection');

router.get('/:typeUrl', async (req, res) => {
  try {
    const { typeUrl } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection); 
    const request = pool.request();
    const query = `
      SELECT m.*
      FROM Movie m
      INNER JOIN list_type lt ON lt.movieid = m.movieid
      INNER JOIN type t ON t.typeid = lt.typeid
      WHERE t.typeurl = @typeUrl
    `;
    request.input('typeUrl', sql.NVarChar, typeUrl);
    const result = await request.query(query);
    const movies = result.recordset;
    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;