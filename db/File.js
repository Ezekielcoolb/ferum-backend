const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    admission: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    datePosted: {
        type: Date,
        default: Date.now
    },
    answerImage: {
        type: String, // Storing image URL
        required: true
    }
});

const assignmentSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true
    },
    dateGiven: {
        type: String,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    questionImage: {
        type: String, // Storing image URL
        required: true
    },
    correctionText: {
        type: String,
        required: true
    },
    correctionImage: {
        type: String, // Storing image URL
        required: true
    },
    answers: [answerSchema] // Array of answer objects
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
