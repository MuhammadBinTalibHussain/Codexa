const express = require("express");
const protect = require("../middleware/auth");
const { validateObjectId, validateSnippet } = require("../middleware/validators");
const {
  getSnippets, getSnippetById, getSnippetsByUser, createSnippet, updateSnippet, deleteSnippet,
} = require("../controller/snippetController");

const router = express.Router();

// NOTE: "/user/:userId" must come before "/:id" or Express matches "user" as an id.
router.get("/", getSnippets);
router.get("/user/:userId", protect, getSnippetsByUser);
router.get("/:id", validateObjectId("id"), getSnippetById);
router.post("/", protect, validateSnippet, createSnippet);
router.put("/:id", protect, validateObjectId("id"), updateSnippet);
router.delete("/:id", protect, validateObjectId("id"), deleteSnippet);

module.exports = router;
