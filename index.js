const express = require('express');
const SetTerm = require('./db/SetTerm')
const Assignment = require('./db/File')
const Results = require('./db/Result')
const Payment = require('./db/Payment')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');




const port = process.env.PORT || 10000;




app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"))
// Serve your React app (build it first)
app.use(express.static('client/build'));
require('./db/config')
require('dotenv').config();

// Set up multer storage
// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
      cb(null, file.filename + "_" + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });
app.use(upload.fields([{ name: 'questionImage', maxCount: 1 }, { name: 'correctionImage', maxCount: 1 }, { name: 'answerImage', maxCount: 1 }])); // Use Multer middleware for handling file uploads

// POST route to handle assignment creation with file uploads
app.post('/api/assignments', async (req, res) => {
  try {
    
    const {title, topic, category, deadline, subjectCode, dateGiven, questionText, correctionText, answers } = req.body;
    let questionImage = null;
    let correctionImage = null;

    if (req.files && req.files['questionImage']) {
      questionImage = req.files['questionImage'][0].path; // Get the path of question image
      const { filename, path: filepath } = req.files['questionImage'][0];
      questionImage = { filename, filepath };
    }

    if (req.files && req.files['correctionImage']) {
      correctionImage = req.files['correctionImage'][0].path; // Get the path of correction image
      const { filename, path: filepath } = req.files['correctionImage'][0];
      correctionImage = { filename, filepath };
    } 

    let formattedAnswers = []; // Default to an empty array

    if (answers && answers.length > 0) {
      formattedAnswers = answers.map(answer => {
        const formattedAnswer = {
          admission: answer.admission,
          firstname: answer.firstname,
          surname: answer.surname,
          datePosted: answer.datePosted,
          answerImage: null // Set answerImage to null by default
        };
        // Check if answerImage is present in the answer object
        if (answer.answerImage && req.files && req.files[answer.answerImage]) {
          formattedAnswer.answerImage = req.files[answer.answerImage][0].path; // Get the path of answer image
          const { filename, path: filepath } = req.files[answer.answerImage][0];
          formattedAnswer.answerImage = { filename, filepath };
        }
        return formattedAnswer;
      });
    }

    // Map over the answers array to format answer objects properly
     

    const assignment = new Assignment({ 
      title,
      topic,
      deadline,
      category,
      subjectCode, 
      dateGiven, 
      questionText, 
      questionImage,
      correctionText, 
      correctionImage,
      answers: formattedAnswers
    });

    await assignment.save();

    res.status(201).send('Assignment data saved successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});







app.post('/api/paymentreference', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json({ message: 'Payment reference saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/set-terms', async (req, res) => {
  const { session, term } = req.body;

  try {
    const newSetTerm = new SetTerm({ session, term });
    await newSetTerm.save();
    res.json({ success: true, message: 'Term set successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error setting term' });
  }
});

  app.post('/api/saveResults', async (req, res) => {
    try {
      // Extract the values from the request body
      const {currentSession, term, selectedClass, results } = req.body;
  
      // Find the existing document that matches the provided term and selectedClass
      let existingResults = await Results.findOne({currentSession: currentSession, term: term, selectedClass: selectedClass });
  
      // If no existing document found, create a new one
      if (!existingResults) {
        existingResults = new Results({currentSession: currentSession, term: term, selectedClass: selectedClass });
      }
  
      // Update the results field of the existing or newly created document
      existingResults.results = results;
      existingResults.term = term;
      existingResults.selectedClass = selectedClass;
      existingResults.currentSession = currentSession;
  
      // Save the updated document to the database
      await existingResults.save();
  
      // Send a success response
      res.status(200).json({ message: 'Results updated successfully' });
    } catch (error) {
      // Handle errors
      console.error('Error updating  results:', error);
      res.status(500).json({ error: 'Failed to update results' });
    }
  });

  app.get('/api/assignments/subject/:subjectCode', async (req, res) => {
    try {
      const assignment = await Assignment.find({ subjectCode: req.params.subjectCode });
    
      if (!assignment) {
        return res.status(404).send('Assignment not found');
      }
    
      // Here you would send the assignment data to the frontend
      res.status(200).json(assignment);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  app.get('/api/assignments/student/:id', async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
    
      if (!assignment) {
        return res.status(404).send('Assignment not found');
      }
    
      // Here you would send the assignment data to the frontend
      res.status(200).json(assignment);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  

  app.get('/api/get-all-assignments', async (req, res) => {
    try {
      const assignment = await Assignment.find();
    
      if (!assignment) {
        return res.status(404).send('Assignment not found');
      }
    
      // Here you would send the assignment data to the frontend
      res.status(200).json(assignment);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });


  app.get('/api/studentsresults/:currentSession/:term/:selectedClass', async (req, res) => {
    try {
    
       // Extract the value from the request parameters
       const currentSession = req.params.currentSession;
       const term = req.params.term;
       const selectedClass = req.params.selectedClass;
  
       // Find documents where the value at index 0 in the results array matches the provided value
       const results = await Results.find({currentSession: currentSession, term: term, selectedClass: selectedClass });
   
       if (!results) {
         // If no matching documents found, send a 404 error response
         return res.status(404).json({ error: 'results not found' });
       }
   
       // Send the matching documents as response
       res.status(200).json({ results });
     } catch (error) {
       // Handle errors
       console.error('Error fetching results:', error);
       res.status(500).json({ error: 'Failed to fetch  results' });
     }
  });

  app.get('/api/term', async (req, res) => {
    try {
      
      const term = await SetTerm.find();
  
      if (!term ) {
        return res.status(404).json({ message: 'term not found' });
      }
  
      res.status(200).json(term);
    } catch (error) {
      console.error('Error fetching term:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/confirmpayment/:reference', async (req, res) => {
    try {
      const reference = req.params.reference;
  
      // Query the database for the payment with the provided reference
      const payment = await Payment.findOne({ reference });
  
      // If no payment found with the provided reference, return a 404 status
      if (!payment) {
        return res.status(404).json({ message: 'Payment reference ID not found not found' });
      }
  
      // If payment found, return it in the response
      res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/allpayments', async (req, res) => {
    try {
      
      const payment = await Payment.find();
  
      if (!payment ) {
        return res.status(404).json({ message: 'payment not found' });
      }
  
      res.status(200).json(payment);
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/updateTerm', async (req, res) => {
    try {
      const { session, term } = req.body;
  
      // Update all documents in the collection with the provided values
      await SetTerm.updateMany({}, { session, term });
  
      res.status(200).json({ message: 'Term updated successfully' });
    } catch (error) {
      console.error('Error updating Term:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/assignments/update-answers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
  
      if (!id || !answers || !Array.isArray(answers)) {
        return res.status(400).send('Assignment ID and an array of answers are required.');
      }
  
      const assignment = await Assignment.findById(id);
  
      if (!assignment) {
        return res.status(404).send('Assignment not found.');
      }
  
      // Update answers in the assignment object
      answers.forEach(updatedAnswer => {
        const existingAnswer = assignment.answers.find(ans => ans._id.toString() === updatedAnswer._id.toString());
        if (existingAnswer) {
          // Update only the provided fields for the answer
          if (updatedAnswer.firstname) {
            existingAnswer.firstname = updatedAnswer.firstname;
          }
          if (updatedAnswer.surname) {
            existingAnswer.surname = updatedAnswer.surname;
          }
          if (updatedAnswer.datePosted) {
            existingAnswer.datePosted = updatedAnswer.datePosted;
          }
          // Handle answerImage if provided
          if (req.files && req.files['answerImage']) {
            const { filename, path: filepath } = req.files['answerImage'][0];
            existingAnswer.answerImage = { filename, filepath };
          }
        } else {
          // If answer doesn't exist, add it to the array
          const newAnswer = { ...updatedAnswer };
          if (req.files && req.files['answerImage']) {
            const { filename, path: filepath } = req.files['answerImage'][0];
            newAnswer.answerImage = { filename, filepath };
          }
          assignment.answers.push(newAnswer);
        }
      });
  
      await assignment.save();
  
      res.status(200).send('Answers updated successfully.');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  
  

  app.put('/api/assignments/update-correction/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { correctionText } = req.body;
      let correctionImage = null;
  
      if (!id) {
        return res.status(400).send('Assignment ID is required.');
      }
  
      const assignment = await Assignment.findById(id);
  
      if (!assignment) {
        return res.status(404).send('Assignment not found.');
      }
  
      // Update correctionText if provided
      if (correctionText) {
        assignment.correctionText = correctionText;
      }
  
      // Check if correctionImage is provided
      if (req.files && req.files['correctionImage']) {
        correctionImage = req.files['correctionImage'][0].path; // Get the path of correction image
        const { filename, path: filepath } = req.files['correctionImage'][0];
        correctionImage = { filename, filepath };
      }
  
      // Update assignment's correctionImage field
      assignment.correctionImage = correctionImage;
  
      await assignment.save();
  
      res.status(200).send('Correction data updated successfully.');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


  