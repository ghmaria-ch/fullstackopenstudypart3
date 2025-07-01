require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
   } 
   else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
 

  next(error)
}
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};




app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
morgan.token('body', (req) => JSON.stringify(req.body)); // Convert body to a string

// Use Morgan middleware for logging, including the request body for POST requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


  app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  if (!name) {
    return response.status(400).json({ error: 'name missing' });
  }

  if (!number) {
    return response.status(400).json({ error: 'number missing' });
  }

  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' });
      }

      const person = new Person({ name, number });

      person.save()
        .then(savedPerson => {
          response.json(savedPerson);
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});


  app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})  

// app.get("/info", (request, response) => {
//     const currentDate = new Date();
//     response.send(`
//       <p>Phonebook has info for ${persons.length} people</p>
//       <p>${currentDate}</p>
//       `);
//   });
app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    const currentDate = new Date();
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${currentDate}</p>
      `);
  });
});

  app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      if (person){
      response.json(person)
      }
       else {
        response.status(404).end() 
      }
    })
   .catch(error => next(error))
})
  

  // app.delete('/api/persons/:id', (request, response) => {
  //   const id = request.params.id
  //   persons = persons.filter(person => person.id !== id)
  //   response.status(204).end()
  // })


app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});


  app.use(unknownEndpoint);
  app.use(errorHandler)
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
