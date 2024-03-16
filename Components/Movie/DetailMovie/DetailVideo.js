const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConnection = require('../../../Config/dbConnection');

router.get('/:movieId/:videoId', async (req, res) => {
  try {
    const { videoId,movieId } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryVideo= `
      SELECT v.*
      FROM Video v
      WHERE v.videoid = @videoId and v.movieid = @movieId
    `;
    const queryListVideo = `
      SELECT v.videoid, v.videoname
      FROM Video v
      INNER JOIN Movie m ON m.movieid = v.movieid
      WHERE m.movieid = @movieId
    `;
    const queryMovie = `
      SELECT m.*
      FROM Movie m
      WHERE m.movieid = @movieId
    `;
    request.input('movieId', sql.Int, movieId);
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