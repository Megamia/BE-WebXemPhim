const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConnection = require("../../../Config/dbConnection");


router.get("/", async (req, res) => {
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryDonate = `
      SELECT d.*
      FROM Donate d
    `;
    const donateResult = await request.query(queryDonate);

    const donates = donateResult.recordset;

    res.status(200).json({
        donates: donates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.get("/history/:donateid", async (req, res) => {
  try {
    const donateId = req.params.donateid;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryDonate = `
      SELECT hd.*,u.username
      FROM Donate_History hd
      INNER JOIN Users u ON u.userid = hd.userid
      WHERE donateid = ${donateId}
    `;
    const donateResult = await request.query(queryDonate);

    const donates = donateResult.recordset;

    res.status(200).json({
        donates: donates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

router.get("/:donateid", async (req, res) => {
  try {
    const donateId = req.params.donateid;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryDonate = `
      SELECT d.*
      FROM Donate d
      WHERE donateid = ${donateId}
    `;
    const donateResult = await request.query(queryDonate);

    const donates = donateResult.recordset;

    res.status(200).json({
        donates: donates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});


module.exports = router;