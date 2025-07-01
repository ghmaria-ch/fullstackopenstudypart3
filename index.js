require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
morgan.token('body', (req) => JSON.stringify(req.body)); // Convert body to a string

// Use Morgan middleware for logging, including the request body for POST requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }
      
    const nameExists = persons.some(person => person.name === body.name);
    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }
      
    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })  
  })

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})  

app.get("/info", (request, response) => {
    const currentDate = new Date();
    response.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${currentDate}</p>
      `);
  });

  app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      if (person){
      response.json(person)
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  })
  
  
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
