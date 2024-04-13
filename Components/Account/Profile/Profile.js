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

router.get("/", authenticateToken, async (req, res) => {
  try {
    await dbConnection();

    const userInfo = req.user;
    const { username } = userInfo;

    const pool = await sql.connect(dbConnection);

    const result = await pool
      .request()
      .query(`SELECT * FROM Users WHERE username = '${username}'`);

    if (result.recordset.length > 0) {
      const userInfoFromDB = result.recordset[0];
      const isAdmin = userInfoFromDB["userid"];
      if(isAdmin===1)
      {
        res.status(200).json({
          message: "User is Admin",
          userInfo: { ...userInfoFromDB, userId: userInfoFromDB.userId, isAdmin },
        });
      }else{
        res.status(201).json({
          message: "User isn't Admin",
          userInfo: { ...userInfoFromDB, userId: userInfoFromDB.userId },
        });
      }
      // console.log("Userid: "+userInfoFromDB['userid']);
      // if(isAdmin){
      //   console.log("IsAdmin");
      // }else{
      //   console.log("Not Admin");
      // }
      
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    await dbConnection();
    const { username, fullname, email, password, phone } = req.body;
    const { userId } = req.user;
    const pool = await sql.connect(dbConnection);
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, password)
      .input("phone", sql.NVarChar, phone)
      .input("userid", sql.Int, userId)
      .query(
        "UPDATE Users SET username = @username, fullname = @fullname, email = @email, password = @password, phone = @phone WHERE userid = @userid"
      );

    res.json({ message: "User information has been updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
