const { Post, Tag } = require("./entity");
const multer = require("multer");
const path = require("path");
const { Op } = require("sequelize");

// Multer for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedFileTypes = /jpeg|jpg|png/;
      const isValidExtension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
      const isValidMimeType = allowedFileTypes.test(file.mimetype);
  
      if (isValidExtension && isValidMimeType) {
        return cb(null, true);
      }
      cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    },
  });
  

// Controller to get all posts with sorting, pagination, and filtering
exports.getAllPosts = async (req, res) => {
  try {
    const { keyword, tag, sortBy = "createdAt", order = "DESC", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    // Add keyword filter for title or description
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ];
    }

    // Include tag filter if specified
    const include = [];
    if (tag) {
      include.push({
        model: Tag,
        where: { name: { [Op.eq]: tag } },
      });
    }

    // Fetch posts with pagination, sorting, and filtering
    const posts = await Post.findAndCountAll({
      where,
      include,
      order: [[sortBy, order]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    // Return results with pagination metadata
    res.status(200).json({
      data: posts.rows,
      meta: {
        total: posts.count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error); 
    res.status(500).json({ error: "An error occurred while fetching posts." });
  }
};


// Controller to create a new post
exports.createPost = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, tags } = req.body;
      const image = req.file ? req.file.path : null;

      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
      }

      // Create the post
      const post = await Post.create({
        title,
        description,
        image,
      });

      if (tags && tags.length) {
        const tagArray = Array.isArray(tags) ? tags : [tags];

        const tagInstances = await Promise.all(
          tagArray.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
            return tag;
          })
        );

        // Associate tags with the post
        await post.addTags(tagInstances);
      }

      res.status(201).json({
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "An error occurred while creating the post." });
    }
  },
];
