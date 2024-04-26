const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

router.get("/:movieId", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { movieId } = req.params;
    // console.log("movieId: " + movieId);
    const queryMovie = `
      SELECT m.*, 
      (SELECT COUNT(*) FROM List_Follow f WHERE f.movieid = m.movieid) AS count_follow,
      (SELECT count(*) FROM Video v WHERE v.movieid = m.movieid) AS count_video
      FROM Movie m 
      WHERE m.movieid = ${movieId};
    `;
    const queryCategory = `
      SELECT c.*
      FROM category c
      INNER JOIN list_category lc ON lc.categoryid = c.categoryid
      INNER JOIN Movie m ON m.movieid = lc.movieid
      WHERE m.movieid = ${movieId}
    `;
    const queryType = `
      SELECT t.*
      FROM Type t
      INNER JOIN list_type lt ON lt.typeid = t.typeid
      INNER JOIN Movie m ON m.movieid = lt.movieid
      WHERE m.movieid = ${movieId}
    `;
    const queryVideo = `
      SELECT v.videoid, v.videoname
      FROM Video v
      INNER JOIN Movie m ON m.movieid = v.movieid
      WHERE m.movieid = ${movieId}
    `;
    const movieResult = await request.query(queryMovie);
    const categoryResult = await request.query(queryCategory);
    const typeResult = await request.query(queryType);
    const videoResult = await request.query(queryVideo);
    const movies = movieResult.recordset;
    const categories = categoryResult.recordset;
    const types = typeResult.recordset;
    const videos = videoResult.recordset;
    res.status(200).json({
      movies: movies,
      categories: categories,
      types: types,
      videos: videos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
