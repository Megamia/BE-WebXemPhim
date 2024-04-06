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

router.get("/:typeid", async (req, res) => {
  try {
    const typeId = req.params.typeid;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryType = `
      SELECT t.*
      FROM Type t
      WHERE typeid = @typeid
    `;
    const typeResult = await request
      .input("typeid", sql.Int, typeId)
      .query(queryType);

    const types = typeResult.recordset;

    res.status(200).json({
      types: types,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

//xóa movie
router.delete("/:typeid", async (req, res) => {
  const typeId = req.params.typeid;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const deleteQuery = `
      DELETE FROM Type
      WHERE typeid = @typeid
    `;
    await request.input("typeid", sql.Int, typeId).query(deleteQuery);

    res.status(200).json({ message: "Type deleted successfully" });
  } catch (error) {
    console.error("Error deleting Type: ", error);
    res.status(500).json({ message: "Error deleting Type" });
  }
});

router.post("/add", async (req, res) => {
  const { typename, typeurl } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const insertQuery = `
      INSERT INTO Type (typename, typeurl)
      VALUES (@typename, @typeurl)
    `;
    await request
      .input("typename", sql.NVarChar, typename)
      .input("typeurl", sql.NVarChar, typeurl)
      .query(insertQuery);
    res.status(201).json({ message: "Type created successfully" });
  } catch (error) {
    console.error("Error creating Type: ", error);
    res.status(500).json({ message: "Error creating Type" });
  }
});

router.post("/edit/:typeid", async (req, res) => {
  const typeId = req.params.typeid;
  const { typename, typeurl } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const updateQuery = `
      UPDATE Type
      SET typename = @typename,
          typeurl = @typeurl
      WHERE typeid = @typeid
    `;
    await request
      .input("typeid", sql.Int, typeId)
      .input("typename", sql.NVarChar, typename)
      .input("typeurl", sql.NVarChar, typeurl)
      .query(updateQuery);

    res.status(200).json({ message: "Type updated successfully" });
  } catch (error) {
    console.error("Error updating Type: ", error);
    res.status(500).json({ message: "Error updating Type" });
  }
});

module.exports = router;
