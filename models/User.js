var mongoose = require('mongoose');
var Form = require('./Form');
var ResponseField = require('./ResponseField');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:{type:String,required:true},
    salt:{type:String,required:true},
    hash:{type:String,required:true},
    formSubmitted:[{
       template:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Form'
       },
       count:{
        type:Number,
        default:0
      },
    }],
    form:[{
       template:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Form'
        },
        TotalResponses:{
            type:Number,
            default:0
        },
        responses:[
     
            [{
                type:mongoose.Schema.Types.ObjectId,
                ref:'ResponseField'
            }]
        ],
        responseAnalytics:[
            { 
                position:Number,
                arr:[{
                    value:String,
                    count:Number,

                }]
            }
        ]

    }]
  
});

var User = mongoose.model('User',userSchema);

module.exports = User;