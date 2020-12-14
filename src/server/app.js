const path = require("path");

const express = require("express");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));

app.get("/:id", (req, res, _next) => {
  const darkModeEnabled = req.query.dm || false;
  res.render(`page${req.params.id}`, { pageTitle: `Page${req.params.id}`, darkModeEnabled });
});

app.get("/", (_req, res, _next) => {
  res.redirect("/1");
});

app.listen(3000);
