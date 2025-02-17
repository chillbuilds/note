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
app.use(express.urlencoded({ extended: true }))

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

app.get('/last_note', (req, res) => {
    const testID = process.env.DB_TESTID
    const updateQuery = 'SELECT notes.title, notes.content, notes.id, notes.folder_id, folders.name AS folder_name FROM notes JOIN folders ON notes.folder_id = folders.id WHERE notes.user_id = ? ORDER BY notes.modified_at DESC LIMIT 1'

    pool.query(updateQuery, [testID], (err, results) => {
        if (err) {
            console.error('error fetching last_note endpoint query: ' + err.stack)
            return res.status(500).send('error fetching last note')
        }
        res.json(results)
    })
})

app.get('/folder_names', (req, res) => {
    const testID = process.env.DB_TESTID
    const query = 'SELECT DISTINCT folders.id AS folder_id, folders.name FROM folders WHERE folders.user_id = ?'

    pool.query(query, [testID], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack)
            return res.status(500).send('error fetching folder names')
        }
        res.json(results)
    })
})

app.get('/note_names', (req, res) => {
    let folderName = req.query.folder_name
    const testID = process.env.DB_TESTID
    const query = 'SELECT notes.title FROM notes JOIN folders ON notes.folder_id = folders.id WHERE notes.user_id = ? AND folders.name = ? ORDER BY notes.modified_at DESC'

    pool.query(query, [testID, folderName], (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack)
            return res.status(500).send('Error fetching notes')
        }
        console.log(results)
        res.json(results)
    })
})

app.get('/note', (req, res) => {
    const noteName = req.query.title
    const testID = process.env.DB_TESTID

    const noteQuery = 'SELECT notes.id, notes.folder_id, folders.name AS folder_name, notes.title, notes.content, notes.modified_at, notes.created_at FROM notes JOIN folders ON notes.folder_id = folders.id WHERE notes.user_id = ? AND notes.title = ? ORDER BY notes.modified_at DESC'

    pool.query(noteQuery, [testID, noteName], (err, results) => {
        if (err) {
            console.error('error executing query: ' + err.stack)
            return res.status(500).send('error fetching notes')
        }
        res.json(results)
    })

})


app.post('/add_folder', (req, res) => {
    const { name, user_id } = req.body
    const query = 'INSERT INTO folders (name, user_id) VALUES (?, ?)'
    
    pool.query(query, [name, user_id], (err, result) => {
        if (err) {
            console.error('Error inserting folder: ' + err.stack)
            return res.status(500).send('Error inserting folder')
        }
        res.status(200).send('folder added successfully')
    })
})

app.post('/add_note', (req, res) => {
    const { user_id, title, content, folder_id} = req.body
    const query = 'INSERT INTO notes (user_id, title, content, folder_id) VALUES (?, ?, ?, ?)'
    
    pool.query(query, [user_id, title, content, folder_id], (err, result) => {
        if (err) {
            console.error('Error inserting note: ' + err.stack)
            return res.status(500).send('Error inserting note')
        }
        res.status(200).send('Note added successfully')
    })
})

app.get('/update_note', (req, res) => {
    const { title, content, folder_id, id } = req.query
    console.log(req.query)
    const testID = process.env.DB_TESTID
    const query = 'UPDATE notes SET title = ?, content = ?, folder_id = ?, WHERE id = ?'
    
    pool.query(query, [title, content, folder_id, id], (err, result) => {
        if (err) {
            console.error('Error inserting note: ' + err.stack)
            return res.status(500).send('Error inserting note')
        }
        res.status(200).send('note updated')
    })
})

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
