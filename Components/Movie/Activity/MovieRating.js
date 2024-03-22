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
      return res.sendStatus(401); // Unauthorized
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

router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryRating = `SELECT movieid, CAST(AVG(value) AS DECIMAL(10, 1)) AS average_rating, COUNT(*) AS review_count
      FROM Rating
      WHERE movieid = ${movieId}
      GROUP BY movieid;`;
    const ratingResult = await request.query(queryRating);
    const ratings = ratingResult.recordset;
    res.status(200).json({ ratings});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     await dbConnection();
//     const { movieid, value } = req.body;
//     const { userId } = req.user;
//     const pool = await sql.connect(dbConnection);
//     await pool
//       .request()
//       .query(
//         `INSERT INTO Rating (movieid, userid, value) VALUES ('${movieid}', '${userId}', '${value}')`
//       );
//     res.json({ message: "User information has been updated successfully" });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.post("/", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const { movieid, value } = req.body;
    const { userId } = req.user;
    const pool = await sql.connect(dbConnection);

    // Truy vấn kiểm tra sự tồn tại của hàng dữ liệu
    const checkExistQuery = `SELECT * FROM Rating WHERE movieid = '${movieid}' AND userid = '${userId}'`;
    const checkExistResult = await pool.request().query(checkExistQuery);

    if (checkExistResult.recordset.length > 0) {
      // Hàng dữ liệu đã tồn tại
      res.status(201).json({ message: "Rating already exists" });
    } else {
      // Hàng dữ liệu chưa tồn tại, thực hiện INSERT
      const insertQuery = `INSERT INTO Rating (movieid, userid, value) VALUES ('${movieid}', '${userId}', '${value}')`;
      await pool.request().query(insertQuery);
      res.status(200).json({ message: "Rating added successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
