const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");


router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryType = `
      SELECT t.*
      FROM Type t
    `;
    const typeResult = await request.query(queryType);

    const types = typeResult.recordset;

    res.status(200).json({
      types: types,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

module.exports = router;