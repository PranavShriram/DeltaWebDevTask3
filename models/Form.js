var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Field = require('./Field');

var formSchema = new Schema({
    Date:String,
    reslimit:{
        type:Number,
        default:-1
    },
    creatingUser:String,
    title:{type:String,required:true},
    description:{type:String,required:true},
    fieldCount:{type:Number,default:0},
    fields:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Field'
    }],
    recentSubmissions:[
        {
          User:String,
          Date:String
        }
    ]
});

var Form = mongoose.model('Form',formSchema);

module.exports = Form;