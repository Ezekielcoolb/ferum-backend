const mongoose = require('mongoose');

const setTermSchema = new mongoose.Schema({
  session: String,
  term: String,
});

const SetTerm = mongoose.model('SetTerm', setTermSchema);

module.exports = SetTerm;