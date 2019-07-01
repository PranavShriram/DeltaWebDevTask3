var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fieldSchema = new Schema({
    typeOfInput:String,
    label:String,
    position:Number,
    options:[String],
    required:{
        type:Boolean,
        default:false
    }
});

var Field = mongoose.model('Field',fieldSchema);

module.exports = Field;