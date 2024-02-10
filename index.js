const express = require('express');
const SetTerm = require('./db/SetTerm')
const Results = require('./db/Result')
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


app.post('/api/setTerms', async (req, res) => {
  try {
    // Extract the values from the request body
    const {session, term } = req.body;

    // Find the existing document that matches the provided term and selectedClass
    let existingTerm = await SetTerm.findOne({session: session, term: term });

    // If no existing document found, create a new one
    if (!existingTerm) {
      existingTerm = new JssOneResult({ term: term, session: session });
    }

    // Update the results field of the existing or newly created document
 
    existingTerm.term = term;
    existingTerm.session = session;
   

    // Save the updated document to the database
    await existingTerm.save();

    // Send a success response
    res.status(200).json({ message: 'Term and session updated successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error updating term:', error);
    res.status(500).json({ error: 'Failed to update term' });
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });