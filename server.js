const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017/myd'; // Your MongoDB URI
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to myd database'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define your Mongoose schema
const drugInfoSchema = new mongoose.Schema({
  id: Number,
  name: { type: String, index: true },
  substitute0: String,
  substitute1: String,
  substitute2: String,
  substitute3: String,
  substitute4: String,
  sideEffect0: String,
  sideEffect1: String,
  sideEffect2: String,
  use0: { type: String, index: true },
  use1: { type: String, index: true },
  use2: { type: String, index: true },
  chemicalClass: String,
  habitForming: String,
  therapeuticClass: String,
  actionClass: String,
}, { collection: 'druginfo' });

const DrugInfo = mongoose.model('druginfo', drugInfoSchema);

// Define route to fetch drug information by name
app.get('/drug/:name', async (req, res) => {
  try {
    const drugName = req.params.name.trim();
    console.log(`Searching for drugs with name or use containing: ${drugName}`);

    // Perform search with name or use0 fields
    const drugs = await DrugInfo.find({
      $or: [
        { name: new RegExp(drugName, 'i') },
        { use0: new RegExp(drugName, 'i') },
        { use1: new RegExp(drugName, 'i') }
      ]
    });

    console.log("Queried drugs:", drugs);

    if (drugs.length === 0) {
      return res.status(404).json({ error: 'No drugs found' });
    }

    const formattedDrugs = drugs.map(drug => ({
      name: drug.name,
      substitutes: [
        drug.substitute0,
        drug.substitute1,
        drug.substitute2,
        drug.substitute3,
        drug.substitute4,
      ].filter(substitute => substitute),
      sideEffects: [
        drug.sideEffect0,
        drug.sideEffect1,
        drug.sideEffect2,
      ].filter(effect => effect),
      uses: [
        drug.use0,
        drug.use1,
        drug.use2,
      ].filter(use => use),
      chemicalClass: drug.chemicalClass || 'N/A',
      habitForming: drug.habitForming || 'N/A',
      therapeuticClass: drug.therapeuticClass || 'N/A',
      actionClass: drug.actionClass || 'N/A',
    }));

    res.json(formattedDrugs);
  } catch (error) {
    console.error('Error during drug query:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = 5000; // Your desired port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
