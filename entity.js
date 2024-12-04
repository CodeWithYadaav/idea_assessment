const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define Post model
const Post = sequelize.define("Post", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
}, {
  tableName: "posts",
  timestamps: true, 
});

// Define Tag model Another table
const Tag = sequelize.define("Tag", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "tags",
  timestamps: true,
});

Post.belongsToMany(Tag, { through: "PostTags" });
Tag.belongsToMany(Post, { through: "PostTags" });

module.exports = { Post, Tag };
