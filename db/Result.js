// models/ResultModel.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  currentSession: String,
    term: String,
    selectedClass: String,
  results: [[mongoose.Schema.Types.Mixed]] // Array of arrays of mixed types
});

const Result = mongoose.model('studentResults', ResultSchema);

module.exports = Result;
