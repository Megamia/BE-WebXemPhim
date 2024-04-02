const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey =
  "as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0";
const dbConnection = require("../../../Config/dbConnection");
const sql = require("mssql");

router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const result = await pool.request().query(`SELECT * FROM Users`);

    if (result.recordset.length > 0) {
      const users = result.recordset;
      res.json(users);
    } else {
      res.status(404).json({ error: "No users found" });
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving users." });
  }
});

router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await dbConnection();

    const pool = await sql.connect(dbConnection);

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`DELETE FROM Users WHERE UserId = @userId`);

    if (result.rowsAffected[0] > 0) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  } finally {
    sql.close();
  }
});

module.exports = router;
