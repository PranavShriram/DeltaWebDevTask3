var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var responseFieldSchema = new Schema({
    type:String,
    value:String,
    position:Number,
    options:[String],
    url:String,
    checkAnswers:[String]
});

var ResponseField = mongoose.model('responseField',responseFieldSchema);

module.exports = ResponseField;