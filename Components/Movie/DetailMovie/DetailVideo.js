const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryVideo= `
      SELECT v.*
      FROM Video v
      WHERE v.videoid = @videoId
    `;
    const queryListVideo = `
      SELECT v1.videoid, v1.videoname, v1.videourl
      FROM Video v1
      INNER JOIN Video v2 ON v1.movieid = v2.movieid
      WHERE v2.videoid = @videoid
    `;
    const queryMovie = `
      SELECT m.*
      FROM Movie m
      INNER JOIN Video v ON v.movieid = m.movieid
      WHERE v.videoid = @videoid
    `;
    request.input('videoId', sql.Int, videoId);
    const movieResult = await request.query(queryMovie);
    const listvideoResult = await request.query(queryListVideo);
    const videoResult = await request.query(queryVideo);
    const movies = movieResult.recordset;
    const listvideos = listvideoResult.recordset;
    const videos = videoResult.recordset;
    res.status(200).json({videos, listvideos, movies});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting to SQL Server' });
  }
});

module.exports = router;