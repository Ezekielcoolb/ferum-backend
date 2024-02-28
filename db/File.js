


const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    admission: String,
    firstname: String,
    surname: String,
    datePosted: String,
    answerImage: String,
});

const assignmentSchema = new mongoose.Schema({
    subjectCode: String,
    dateGiven: String,
    questionText: String,
    questionImage: String,
    correctionText: String,
    correctionImage: String,
    answers: [answerSchema] // Array of answer objects
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
