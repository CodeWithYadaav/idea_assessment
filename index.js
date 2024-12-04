const express = require("express");
const { getAllPosts, createPost } = require("./controller");
const sequelize = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json()); 


app.get("/posts", getAllPosts);
app.post("/posts", createPost);

sequelize.sync({ alter: true }) 
  .then(() => {
    console.log("Database synchronized");
    app.listen(PORT, () => {
      console.log(`Server is up and running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Error synchronizing the database:", err);
  });
