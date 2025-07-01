
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
.then(result => {
  console.log('connected to MongoDB')
})
.catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})


const personSchema = new mongoose.Schema({
    name: {
    type: String,
    minLength: 3,
    required: true,
  },
   number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Check for format: 2-3 numbers, hyphen, followed by numbers
        // Total length must be 8 or more

        return /^(\d{2,3})-(\d+)$/.test(v) && v.length >= 8;
      },
      message: (props) => {
        // Examples of different props being used:
        return `Validation failed for ${props.path}: '${props.value}'.
                This field expects a phone number with format: XX-XXXXXX or XXX-XXXXX`;
      },
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)