const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

//lấy danh sách
router.get("/:movieid", async (req, res) => {
  const movieId = req.params.movieid;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const query = `
      SELECT v.*
      FROM Video v
      WHERE v.movieid = @movieid
    `;
    const Result = await request.input("movieid", sql.Int, movieId).query(query);

    const videos = Result.recordset;

    res.status(200).json({
      videos: videos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.get("/select/:videoid", async (req, res) => {
    const videoId = req.params.videoid;
    try {
      await dbConnection();
      const pool = await sql.connect(dbConnection);
      const request = pool.request();
      const query = `
        SELECT v.*
        FROM Video v
        WHERE v.videoid = @videoid
      `;
      const Result = await request.input("videoid", sql.Int, videoId).query(query);
  
      const videos = Result.recordset;
  
      res.status(200).json({
        videos: videos,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error connecting to SQL Server" });
    }
  });

//xóa
router.delete("/:videoid", async (req, res) => {
  const videoId = req.params.videoid;

  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const deleteQuery = `
      DELETE FROM Video
      WHERE videoid = @videoid
    `;
    await request.input("videoid", sql.Int, videoId).query(deleteQuery);

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting Video: ", error);
    res.status(500).json({ message: "Error deleting Video" });
  }
});

//thêm
router.post("/add", async (req, res) => {
  const {
    videoname,
    urlserver,
    movieid
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const insertQuery = `
      INSERT INTO Video (videoname, urlserver, movieid)
      VALUES (@videoname, @urlserver, @movieid)
    `;
    await request
      .input("videoname", sql.NVarChar, videoname)
      .input("urlserver", sql.NVarChar, urlserver)
      .input("movieid", sql.Int, movieid)
      .query(insertQuery);

    res.status(201).json({ message: "Video created successfully" });
  } catch (error) {
    console.error("Error creating Video: ", error);
    res.status(500).json({ message: "Error creating Video" });
  }
});

//sửa movie
router.post("/edit/:videoid", async (req, res) => {
    const videoId = req.params.videoid;
  const {
    videoname,
    urlserver
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const updateQuery = `
      UPDATE Video
      SET videoname = @videoname,
          urlserver = @urlserver
      WHERE videoid = @videoid
    `;
    await request
      .input("videoid", sql.Int, videoId)
      .input("videoname", sql.NVarChar, videoname)
      .input("urlserver", sql.NVarChar, urlserver)
      .query(updateQuery);

    res.status(200).json({ message: "Video updated successfully" });
  } catch (error) {
    console.error("Error updating Video: ", error);
    res.status(500).json({ message: "Error updating Video" });
  }
});
module.exports = router;
