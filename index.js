const express = require('express');
const SetTerm = require('./db/SetTerm')
const File = require('./db/File')
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

// Serve your React app (build it first)
// app.use(express.static('client/build'));
require('./db/config')
require('dotenv').config();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint for uploading files
app.post('/uploadAssignment', upload.single('file'), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const fileType = path.extname(originalname).toLowerCase().slice(1);

    const newFile = new File({
      name: originalname,
      type: fileType,
      data: buffer,
    });

    await newFile.save();
    res.status(201).send('File uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
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


// Endpoint for fetching files
app.get('/assignmentFiles', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });