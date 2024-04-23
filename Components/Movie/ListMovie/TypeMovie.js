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
      SELECT m.movieid,m.moviename, m.views,m.poster,v.videoname,m.movieurl,
      (SELECT CAST(AVG(value) AS DECIMAL(10, 1)) FROM Rating WHERE movieid = m.movieid) AS average_rating
      FROM Movie m
      INNER JOIN list_type lt ON lt.movieid = m.movieid
      INNER JOIN type t ON t.typeid = lt.typeid
      LEFT JOIN (
        SELECT v.movieid, MAX(v.dateupload) AS max_dateupload
        FROM Video v
             GROUP BY v.movieid
      ) AS subquery ON m.movieid = subquery.movieid
      LEFT JOIN Video v ON v.movieid = m.movieid AND v.dateupload = subquery.max_dateupload
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