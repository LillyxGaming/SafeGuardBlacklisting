const express = require('express');
const axios = require('axios');
require('dotenv').config(); // For using API keys from the .env file
const path = require('path');

const app = express();
const port = 3000;  // The server will run on port 3000

// Serve static files (HTML, CSS, JS, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route to handle the home page (index.html)
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a route to handle the user lookup API request
app.post('/lookup', async (req, res) => {
    console.log(req.body);
    const { userID } = req.body;  // Extract the userID from the request body

    if (!userID) {
        return res.status(400).json({ error: 'UserID is required' });
    }

    // Trello API URL to fetch cards
    const url = `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;

    try {
        // Fetch the data from Trello
        const response = await axios.get(url);

        // Find the card associated with the userID
        const userCard = response.data.find(card => card.name.includes(userID));

        if (userCard) {
            // Retrieve the list ID to determine status based on list
            const listId = userCard.idList;

            // Assign the correct box class based on list ID
            let boxClass = '';

            if (listId === '681d4eb4ad2deee3116e5ae7') {
                boxClass = 'staff'; // Staff list
            } else if (listId === '681d4eb7945d5855a39a8004') {
                boxClass = 'flagged'; // Flagged list
            } else if (listId === '681d4ebb2c88f48e6923d392') {
                boxClass = 'blacklisted'; // Blacklisted list
            } else {
                boxClass = 'safe'; // Default to safe if no matching list
            }

            // Example response with status and card data
            res.json({
                found: true,
                status: boxClass,  // Return the correct boxClass
                cardTitle: userCard.name,
                description: userCard.desc,
                boxClass: boxClass  // Assign a class based on list
            });
        } else {
            res.json({ found: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from Trello' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
