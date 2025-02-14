require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mysql = require('mysql2')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

// Create a pool of connections with keep-alive settings
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, // Maximum number of connections in the pool
    enableKeepAlive: true, // Keep connections alive
    keepAliveInitialDelay: 10000 // Initial delay of 10 seconds before sending keep-alive packets
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/test', (req, res) => {
    const testID = process.env.DB_TESTID
    console.log('test id:', testID)
    res.sendFile(path.join(__dirname, 'public', 'test.html'))
})

app.get('/folder_names', (req, res) => {
    const testID = process.env.DB_TESTID
    const query = 'SELECT DISTINCT folder_name FROM notes WHERE user_id = ? ORDER BY modified_at DESC'

    pool.query(query, [testID], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack)
            return res.status(500).send('error fetching folder names')
        }
        res.json(results)
    })
})

app.get('/note_names', (req, res) => {
    const folderName = req.query.folder_name
    const testID = process.env.DB_TESTID
    const query = 'SELECT title FROM notes WHERE user_id = ? AND folder_name = ? AND note_type != ? ORDER BY modified_at DESC'

    pool.query(query, [testID, folderName, 'placeholder'], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack)
            return res.status(500).send('Error fetching notes')
        }
        res.json(results)
    })
})

app.get('/note', (req, res) => {
    const noteName = req.query.title
    const testID = process.env.DB_TESTID

    console.log(noteName)
    const query = 'SELECT folder_name, title, content, modified_at, created_at FROM notes WHERE user_id = ? AND  title = ? AND note_type != ? ORDER BY modified_at DESC'

    pool.query(query, [testID, noteName, 'placeholder'], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack)
            return res.status(500).send('Error fetching notes')
        }
        res.json(results)
    })
})


app.post('/add_folder', (req, res) => {
    const { user_id, title, content, folder_name } = req.body
    const query = 'INSERT INTO notes (user_id, title, content, note_type, folder_name) VALUES (?, ?, ?, ?, ?)'
    
    pool.query(query, [user_id, title, content, 'placeholder', folder_name], (err, result) => {
        if (err) {
            console.error('Error inserting folder: ' + err.stack)
            return res.status(500).send('Error inserting folder')
        }
        res.status(200).send('Folder added successfully')
    })
})

app.post('/add_note', (req, res) => {
    const { user_id, title, content, folder_name } = req.body
    const query = 'INSERT INTO notes (user_id, title, content, note_type, folder_name) VALUES (?, ?, ?, ?, ?)'
    
    pool.query(query, [user_id, title, content, 'note', folder_name], (err, result) => {
        if (err) {
            console.error('Error inserting note: ' + err.stack)
            return res.status(500).send('Error inserting note')
        }
        res.status(200).send('Note added successfully')
    })
})

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
