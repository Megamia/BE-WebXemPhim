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

router.get("/:categoryid", async (req, res) => {
  try {
    const categoryId = req.params.categoryid;
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const queryCategory = `
      SELECT c.*
      FROM Category c
      WHERE categoryid = @categoryid
    `;
    const categoryResult = await request.input("categoryid", sql.Int, categoryId).query(queryCategory);

    const categories = categoryResult.recordset;

    res.status(200).json({
        categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting to SQL Server" });
  }
});

//xóa movie
router.delete("/:categoryid", async (req, res) => {
  const categoryId = req.params.categoryid;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const deleteQuery = `
      DELETE FROM Category
      WHERE categoryid = @categoryid
    `;
    await request.input("categoryid", sql.Int, categoryId).query(deleteQuery);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category: ", error);
    res.status(500).json({ message: "Error deleting category" });
  }
});

router.post("/add", async (req, res) => {
  const {
    categoryname,
    categoryurl,
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const insertQuery = `
      INSERT INTO Category (categoryname, categoryurl)
      VALUES (@categoryname, @categoryurl)
    `;
    await request
      .input("categoryname", sql.NVarChar, categoryname)
      .input("categoryurl", sql.NVarChar, categoryurl)
      .query(insertQuery);
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    console.error("Error creating Category: ", error);
    res.status(500).json({ message: "Error creating Category" });
  }
});

router.post("/edit/:categoryid", async (req, res) => {
  const categoryId = req.params.categoryid;
  const {
    categoryname,
    categoryurl,
  } = req.body;
  try {
    await dbConnection();
    const pool = await sql.connect(dbConnection);
    const request = pool.request();
    const updateQuery = `
      UPDATE Category
      SET categoryname = @categoryname,
          categoryurl = @categoryurl
      WHERE categoryid = @categoryid
    `;
    await request
      .input("categoryid", sql.Int, categoryId)
      .input("categoryname", sql.NVarChar, categoryname)
      .input("categoryurl", sql.NVarChar, categoryurl)
      .query(updateQuery);

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating Category: ", error);
    res.status(500).json({ message: "Error updating Category" });
  }
});

module.exports = router;