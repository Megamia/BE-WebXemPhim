const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryMovie = `
    SELECT TOP 8 m.movieid, m.moviename, m.views, m.background, m.moviedescribe, m.author, m.release_year, m.movieurl, m.poster, v.videoname, m.movieurl,
    (SELECT CAST(AVG(value) AS DECIMAL(10, 1)) FROM Rating WHERE movieid = m.movieid) AS average_rating
    FROM Movie m
    LEFT JOIN (
      SELECT v.movieid, MAX(v.dateupload) AS max_dateupload
      FROM Video v
      WHERE v.dateupload <= GETDATE()
      GROUP BY v.movieid
  ) AS subquery ON m.movieid = subquery.movieid
    LEFT JOIN Video v ON v.movieid = m.movieid AND v.dateupload = subquery.max_dateupload
    ORDER BY m.views DESC
    `;
    const queryType = `
    SELECT m.movieid, t.*
    FROM (${queryMovie}) 
    AS top_movies
    JOIN List_type lt ON lt.movieid = top_movies.movieid
    JOIN Type t ON t.typeid = lt.typeid
    JOIN Movie m ON m.movieid = lt.movieid;
    `;
    const resultMovie = await request.query(queryMovie);
    const resultType = await request.query(queryType);
    const movies = resultMovie.recordset;
    const types = resultType.recordset;
    res.status(200).json({ movies, types });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
