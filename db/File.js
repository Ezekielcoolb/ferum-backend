


const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    admission: String,
    firstname: String,
    surname: String,
    datePosted: String,
    answerImage: {
        filename: String,
        filepath: String
    },
});

const assignmentSchema = new mongoose.Schema({
    title: String,
    topic: String,
    category: String,
    subjectCode: String,
    dateGiven: String,
    deadline: String,
    questionText: String,
    questionImage: {
        filename: String,
        filepath: String
    },
    correctionText: String,
    correctionImage: {
        filename: String,
        filepath: String
    },
    answers: [answerSchema] // Array of answer objects
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
