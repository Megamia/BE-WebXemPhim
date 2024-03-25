const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const dbConnection = require("../../Config/dbConnection");

const secretKey =
  "as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.sendStatus(403); // Forbidden
      }
      req.user = decoded;
      console.log("Decoded User:", decoded);
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Error verifying token" });
  }
};

router.post("/", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const { price } = req.body;
    const userId = req.user.userId;
    const donateInfo = `SELECT * FROM Donate WHERE price = '${price}'`;
    const result = await pool.request().query(donateInfo);
    const donateid = result.recordset[0].donateid;

    const insertQuery = `INSERT INTO Donate_History (userid, donateid, date) VALUES ('${userId}', '${donateid}', FORMAT(GETDATE(), 'yyyy-MM-dd HH:mm:ss'))`;
    await pool.request().query(insertQuery);
    res.json({
      message: "Donate history information has been updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/", authenticateToken, async (req, res) => {
    try {
        await dbConnection();
        const pool = await sql.connect(dbConnection);
        const request = pool.request();
      const { userId } = req.user;
      let historyInfo = `SELECT D.*, DH.date
                            FROM Donate D
                            INNER JOIN Donate_History DH ON D.donateid = DH.donateid
                            WHERE DH.userid = '${userId}'`;
      const result = await request.query(historyInfo);
      const history = result.recordset;
    //   console.log("Userid: " + userId);
    //   console.log("Lịch sử donate:", history);
      res.status(200).json({ history });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
module.exports = router;
