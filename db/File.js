const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true
  },
  questionImage: {
    type: String, // Assuming you'll store image URLs
    required: true
  }
});

const Assignment = mongoose.model('Assignment', questionSchema);

module.exports = Assignment;


// const mongoose = require('mongoose');

// const answerSchema = new mongoose.Schema({
//     admission: String,
//     firstname: String,
//     surname: String,
//     datePosted: String,
//     answerImage: String,
// });

// const assignmentSchema = new mongoose.Schema({
//     subjectCode: String,
//     dateGiven: String,
//     questionText: String,
//     questionImage: String,
//     correctionText: String,
//     correctionImage: String,
//     answers: [answerSchema] // Array of answer objects
// });

// const Assignment = mongoose.model('Assignment', assignmentSchema);

// module.exports = Assignment;
