import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://bihqharjyezzxhsghell.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaHFoYXJqeWV6enhoc2doZWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NzM0MjMsImV4cCI6MjA0MTU0OTQyM30.7W7Vpd7fol3UWLUFLqUiHty2hdTrD-H3-4LT78wveFk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Example route to fetch data from Supabase
app.get('/data', async (req, res) => {
    try {
        const { data, error } = await supabase.from('deposit').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
