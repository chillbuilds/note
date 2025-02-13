require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mysql = require('mysql2')
const app = express()
const port = process.env.port || 3000

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack)
      return
    }
    console.log('Connected to MySQL as ID ' + db.threadId)
  })

  app.get('/', (req, res) => {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })
  })
  
  app.get('/notes', (req, res) => {
    const testID = process.env.DB_TESTID
    const query = 'SELECT * FROM notes WHERE user_id = ?'
    db.query(query, [testID], (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err.stack)
        res.status(500).send('Error fetching users')
        return
      }
      console.log(results)
      res.json(results)
    })
  })
  // Start the server
  app.listen(port, () => {
    console.log(`localhost:${port}`)
  })
