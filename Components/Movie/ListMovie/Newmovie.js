const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

router.get("/", async (req, res) => {
  try {
    await dbConnection();

    const pool = await sql.connect(dbConnection);

    const request = pool.request();

    const query = `
    SELECT m.movieid,m.moviename, m.views,m.poster,v.videoname
    FROM Movie m
    JOIN (
        SELECT v.movieid, MAX(v.dateupload) AS max_dateupload
        FROM Video v
        WHERE v.dateupload <= GETDATE()
        GROUP BY v.movieid
    ) AS subquery ON m.movieid = subquery.movieid
    JOIN Video v ON v.movieid = m.movieid AND v.dateupload = subquery.max_dateupload
    ORDER BY ABS(DATEDIFF(MINUTE, subquery.max_dateupload, GETDATE())) ASC;
    `;
    const result = await request.query(query);
    const movies = result.recordset;

    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
