const express = require('express');
const SetTerm = require('./db/SetTerm')
const Results = require('./db/Result')
const Payment = require('./db/Payment')
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

  app.post('/api/confirmpayment', async (req, res) => {
    try {
      const { reference, transaction } = req.body;
      const payment = await Payment.findOne({ reference, transaction });
  
      if (payment) {
        const token = jwt.sign({ email: payment.reference, userId: payment.id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Reference and transaction id confirmed',  token: token});
      } else {
        res.status(401).json({ message: 'Invalid reference or transaction Id' });
      }
    } catch (error) {
      console.error('Error during comfirmation:', error);
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });