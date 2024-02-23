const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: String,
  type: String, // "pdf" or "image"
  data: Buffer,
});

const File = mongoose.model('assignmentFile', fileSchema);

module.exports = File;