const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

router.get("/", async (req, res) => {
  try {
    await dbConnection();

    const pool = await sql.connect(dbConnection);

    const request = pool.request();

    const query1 = `
    SELECT M.*, AvgRatings.average_value,(SELECT count(*) FROM Video v WHERE v.movieid = m.movieid) AS count_video
FROM Movie M
JOIN (
    SELECT movieid, AVG(value) AS average_value
    FROM Rating
    GROUP BY movieid
) AS AvgRatings ON M.movieid = AvgRatings.movieid
JOIN List_Category LC ON M.movieid = LC.movieid
WHERE LC.categoryid = 1
ORDER BY AvgRatings.average_value DESC;
    `;
    const result1 = await request.query(query1);
    const phimbo = result1.recordset;

    const query2 = `
    SELECT M.*, AvgRatings.average_value,(SELECT count(*) FROM Video v WHERE v.movieid = m.movieid) AS count_video
FROM Movie M
JOIN (
    SELECT movieid, AVG(value) AS average_value
    FROM Rating
    GROUP BY movieid
) AS AvgRatings ON M.movieid = AvgRatings.movieid
JOIN List_Category LC ON M.movieid = LC.movieid
WHERE LC.categoryid = 2
ORDER BY AvgRatings.average_value DESC;
    `;
    const result2 = await request.query(query2);
    const phimle = result2.recordset;

    res.status(200).json({ phimbo: phimbo, phimle: phimle });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
