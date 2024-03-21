const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

router.get("/:categoryUrl", async (req, res) => {
  try {
    const { categoryUrl } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    // const query = `
    // SELECT m.movieid,m.moviename, m.views,m.poster, v.videoname
    // FROM Movie m
    // INNER JOIN list_category lc ON lc.movieid = m.movieid
    // INNER JOIN category c ON c.categoryid = lc.categoryid
    // JOIN (
    //   SELECT v.movieid, MAX(v.dateupload) AS max_dateupload
    //   FROM Video v
    //        GROUP BY v.movieid
    // ) AS subquery ON m.movieid = subquery.movieid
    // JOIN Video v ON v.movieid = m.movieid AND v.dateupload = subquery.max_dateupload
    // WHERE c.categoryurl = @categoryUrl
    // `;
    const query = `
        SELECT m.movieid, m.moviename, m.views, m.poster, v.videoname,
        (SELECT CAST(AVG(value) AS DECIMAL(10, 1)) FROM Rating WHERE movieid = m.movieid) AS average_rating
        FROM Movie m
        INNER JOIN list_category lc ON lc.movieid = m.movieid
        INNER JOIN category c ON c.categoryid = lc.categoryid
        JOIN (
        SELECT v.movieid, MAX(v.dateupload) AS max_dateupload
        FROM Video v
        GROUP BY v.movieid
        ) AS subquery ON m.movieid = subquery.movieid
        JOIN Video v ON v.movieid = m.movieid AND v.dateupload = subquery.max_dateupload
        WHERE c.categoryurl = @categoryUrl
        `;
    request.input("categoryUrl", sql.NVarChar, categoryUrl);
    const result = await request.query(query);
    const movies = result.recordset;
    res.status(200).json({ movies: movies });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
