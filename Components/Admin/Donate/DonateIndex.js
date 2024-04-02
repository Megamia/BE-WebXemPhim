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

router.post("/add", async (req, res) => {
  const { img, donatename, description, price } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const insertDonateQuery = `
      INSERT INTO Donate (img, donatename, description, price)
      VALUES (@img, @donatename, @description, @price)
    `;
    await request
      .input("img", sql.NVarChar, img)
      .input("donatename", sql.NVarChar, donatename)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Float, price)
      .query(insertDonateQuery);
    res.status(201).json({ message: "Donate created successfully" });
  } catch (error) {
    console.error("Error creating Donate: ", error);
    res.status(500).json({ message: "Error creating Donate" });
  }
});

router.delete("/:donateid", async (req, res) => {
  const { donateid } = req.params;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const deleteDonateQuery = `
    DELETE FROM Donate
    WHERE donateid = @donateId
    `;
    await request.input("donateId", sql.Int, donateid).query(deleteDonateQuery);
    res.status(201).json({ message: "Donate deleted successfully" });
  } catch (error) {
    console.error("Error deleting Donate: ", error);
    res.status(500).json({ message: "Error deleting Donate" });
  }
});

router.post("/edit/:donateid", async (req, res) => {
  const { img, donatename, description, price } = req.body;
  const { donateid } = req.params;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const editDonateQuery = `
    UPDATE Donate
      SET img = @img,
          donatename = @donatename,
          description = @description,
          price = @price
      WHERE donateid = @donateId
    `;
    await request
      .input("img", sql.NVarChar, img)
      .input("donatename", sql.NVarChar, donatename)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Float, price)
      .input("donateId", sql.Int, donateid)
      .query(editDonateQuery);
    res.status(201).json({ message: "Donate updated successfully" });
  } catch (error) {
    console.error("Error updating Donate: ", error);
    res.status(500).json({ message: "Error updating Donate" });
  }
});

module.exports = router;
