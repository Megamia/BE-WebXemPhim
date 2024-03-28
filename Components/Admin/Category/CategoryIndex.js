const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");


router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryCategory = `
      SELECT c.*
      FROM Category c
    `;
    const categoryResult = await request.query(queryCategory);

    const categories = categoryResult.recordset;

    res.status(200).json({
        categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;