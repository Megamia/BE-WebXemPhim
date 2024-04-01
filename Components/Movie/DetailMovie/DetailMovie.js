const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");

const secretKey =
  "as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ").slice(1)[0];

    if (token == null) {
      return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Error verifying token" });
  }
};

router.post("/add/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const { movieId } = req.params;
// const parsedMovieId = parseInt(movieId, 10);
    const { userId } = req.user;
    console.log("movieId: " + movieId);
    console.log("userId: " + userId);

    console.log("Lấy được movieid: " + movieId);
    const insertQuery = `
  INSERT INTO List_Follow (movieid, userid) VALUES ('${movieId}', '${userId}');
`;

    await pool.request().query(insertQuery);
    isFollow = true;
    res.status(200).json({ message: "Insert successful",isFollow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.post("/del/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const { movieId } = req.params;
    const { userId } = req.user;
    const deleteQuery = `
  DELETE FROM List_Follow WHERE movieid = '${movieId}' AND userid = '${userId}';
`;
    await pool.request().query(deleteQuery);
    isFollow = false;
    res.status(200).json({ message: "Delete successful",isFollow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.get("/check/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const { movieId } = req.params;
    const { userId } = req.user;
    const checkQuery = `
      SELECT * FROM List_Follow  WHERE movieid = '${movieId}' AND userid = '${userId}';
    `;

    const result = await pool.request().query(checkQuery);

    if (result.recordset.length > 0) {
      isFollow = true;
      res.status(200).json({ message: "Already!", isFollow });
    } else {
      isFollow = false;
      res.status(201).json({ message: "Not followed!", isFollow });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});


router.get("/:movieId", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { movieId } = req.params;
    // console.log("movieId: " + movieId);
    const queryMovie = `
      SELECT m.*
      FROM Movie m
      WHERE m.movieid = ${movieId}
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
