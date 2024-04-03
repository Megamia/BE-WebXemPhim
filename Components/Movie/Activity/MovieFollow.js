const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey =
  "as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0";
const dbConnection = require("../../../Config/dbConnection");
const sql = require("mssql");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

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

router.get("/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { movieId } = req.params;
    const { userId } = req.user;

    const queryMovieFL = `
      SELECT f.*
      FROM List_Follow f
      WHERE f.movieid = ${movieId} and f.userid =${userId}
    `;

    const movieflResult = await request.query(queryMovieFL);

    const follow = movieflResult.recordset;
    if (follow.length > 0) {
      res.status(200).json({ data: follow, isFollow: true });
    } else {
      res.status(201).json({ message: "Chưa follow", isFollow: false });
    }
    // console.log(JSON.stringify(follow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});


router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    // console.log("Userid: " + userId);

    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const result = await pool.request()
      .query(`SELECT * FROM List_Follow WHERE userid = ${userId}`);

    const follow = result.recordset;
    if (follow.length > 0) {
      res.status(200).json({ message: "Found movies", data: follow });
    } else {
      res.status(404).json({ error: "No movies found" });
    }
  } catch (error) {
    console.error("Error retrieving movies:", error);
    res.status(500).json({ error: "An error occurred while retrieving movies." });
  }
});


router.post("/add/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { movieId } = req.params;
    const { userId } = req.user;
    isFollow = true;
    // console.log("Lấy được data: " + userId + "," + movieId);
    const queryaddMovieFL = `
      INSERT INTO List_Follow (movieid, userid) VALUES ('${movieId}', '${userId}');
      `;

    const moviefladdResult = await request.query(queryaddMovieFL);

    const addfollow = moviefladdResult.recordset;

    res.status(200).json({ data: addfollow, isFollow });
    // console.log(JSON.stringify(addfollow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.post("/del/:movieId", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { movieId } = req.params;
    const { userId } = req.user;
    isFollow = false;
    //   console.log("Lấy được data: " + userId + "," + movieId);
    const querydelMovieFL = `
        DELETE FROM List_Follow WHERE movieid = '${movieId}' AND userid = '${userId}';
        `;

    const moviefldelResult = await request.query(querydelMovieFL);

    const delfollow = moviefldelResult.recordset;

    res.status(200).json({ data: delfollow, isFollow });
    //   console.log(JSON.stringify(delfollow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;
