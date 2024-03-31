const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

//lấy danh sách phim
router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryMovie = `
      SELECT m.*
      FROM Movie m
    `;
    const movieResult = await request.query(queryMovie);

    const movies = movieResult.recordset;

    res.status(200).json({
      movies: movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

//xóa movie
router.delete("/:movieid", async (req, res) => {
  const movieId = req.params.movieid;

  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const deleteQuery = `
      DELETE FROM Movie
      WHERE movieid = @movieid
    `;
    await request.input("movieid", sql.Int, movieId).query(deleteQuery);

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Error deleting movie: ", error);
    res.status(500).json({ message: "Error deleting movie" });
  }
});

//thêm movie
router.post("/add", async (req, res) => {
  const {
    poster,
    background,
    moviename,
    moviesubname,
    moviedescribe,
    author,
    release_year,
    time,
    episodes,
    movieurl,
    trailerurl,
    types,
    category,
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const insertMovieQuery = `
      INSERT INTO Movie (poster, background, moviename, moviesubname, moviedescribe, author, release_year, time, episodes, movieurl, trailerurl)
      VALUES (@poster, @background, @moviename, @moviesubname, @moviedescribe, @author, @release_year, @time, @episodes, @movieurl, @trailerurl)
    `;
    await request
      .input("poster", sql.NVarChar, poster)
      .input("background", sql.NVarChar, background)
      .input("moviename", sql.NVarChar, moviename)
      .input("moviesubname", sql.NVarChar, moviesubname)
      .input("moviedescribe", sql.NVarChar, moviedescribe)
      .input("author", sql.NVarChar, author)
      .input("release_year", sql.Int, release_year)
      .input("time", sql.NVarChar, time)
      .input("episodes", sql.Int, episodes)
      .input("movieurl", sql.NVarChar, movieurl)
      .input("trailerurl", sql.NVarChar, trailerurl)
      .query(insertMovieQuery);

    const movieId = (await pool.query("SELECT @@IDENTITY AS movieId"))
      .recordset[0].movieId;

    if (types != null) {
      for (const typeId of types) {
        const insertMovieTypeQuery = `
          INSERT INTO List_type (movieid, typeid)
          VALUES (${movieId}, ${typeId})
        `;
        await request.query(insertMovieTypeQuery);
      }
    }
    if (category != null) {
      const insertMovieCategoryQuery = `
        INSERT INTO List_Category (movieid, categoryid)
        VALUES (@movieId, @categoryId)
      `;
      await request
        .input("movieId", sql.Int, movieId)
        .input("categoryId", sql.Int, category)
        .query(insertMovieCategoryQuery);
    }
    res.status(201).json({ message: "Movie created successfully" });
  } catch (error) {
    console.error("Error creating movie: ", error);
    res.status(500).json({ message: "Error creating movie" });
  }
});

//sửa movie
router.post("/edit/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const {
    poster,
    background,
    moviename,
    moviesubname,
    moviedescribe,
    author,
    release_year,
    time,
    episodes,
    movieurl,
    trailerurl,
    types,
    category,
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const updateMovieQuery = `
      UPDATE Movie
      SET poster = @poster,
          background = @background,
          moviename = @moviename,
          moviesubname = @moviesubname,
          moviedescribe = @moviedescribe,
          author = @author,
          release_year = @release_year,
          time = @time,
          episodes = @episodes,
          movieurl = @movieurl,
          trailerurl = @trailerurl
      WHERE movieid = @movieId
    `;
    await request
      .input("movieId", sql.Int, movieId)
      .input("poster", sql.NVarChar, poster)
      .input("background", sql.NVarChar, background)
      .input("moviename", sql.NVarChar, moviename)
      .input("moviesubname", sql.NVarChar, moviesubname)
      .input("moviedescribe", sql.NVarChar, moviedescribe)
      .input("author", sql.NVarChar, author)
      .input("release_year", sql.Int, release_year)
      .input("time", sql.NVarChar, time)
      .input("episodes", sql.Int, episodes)
      .input("movieurl", sql.NVarChar, movieurl)
      .input("trailerurl", sql.NVarChar, trailerurl)
      .query(updateMovieQuery);

    // Delete existing types for this movie
    await request.query(`DELETE FROM List_type WHERE movieid = ${movieId}`);

    // Insert updated types for this movie
    if (types != null) {
      for (const typeId of types) {
        const insertMovieTypeQuery = `
          INSERT INTO List_type (movieid, typeid)
          VALUES (${movieId}, ${typeId})
        `;
        await request.query(insertMovieTypeQuery);
      }
    }

    // Update category for this movie
    const updateMovieCategoryQuery = `
      UPDATE List_Category
      SET categoryid = @categoryId
      WHERE movieid = @movieId
    `;
    await request
      .input("categoryId", sql.Int, category)
      .query(updateMovieCategoryQuery);

    res.status(200).json({ message: "Movie updated successfully" });
  } catch (error) {
    console.error("Error updating movie: ", error);
    res.status(500).json({ message: "Error updating movie" });
  }
});
module.exports = router;
