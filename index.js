var express = require('express'),
    app = express(),
    port = 3000,
    ejs = require('ejs'),
    User = require('./models/User')
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    Form = require('./models/Form'),
    Field = require('./models/Field'),
    ResponseField = require('./models/ResponseField'),
     multer = require('multer');
    
 

    mongoose.connect('mongodb://localhost:27017/myForm', {useNewUrlParser: true});

    app.set("view engine","ejs");    
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser())
    app.use(session({
        key: 'user_sid',
        secret: 'somerandonstuff',
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000
        }
    }));
    app.use(flash());
    app.use(express.static(__dirname + '/public'));
    app.use(methodOverride('_method'));
 
//   const multerConf = 
//   {  
//      storage:multer.diskStorage({
//         destination: function(req, file, callback) {
//             callback(null, "./public/images");
//         },
//         filename: function(req, file, callback) {
//           const ext = file.mimetype.split('/')[1];
//           console.log(file);
//           callback(null,file.filename+'.'+ext);
//         }
//     }),
  
//   } 
  const storage = multer.diskStorage({
      destination:'./public/uploads',
      filename:function(req,file,cb){
          cb(null,Date.now()+file.fieldname+file.originalname);
      }
  });
  const upload = multer(
    {
        storage:storage
    }); 
  
  
// app.get("/imageUpload",(req,res) => {
//     res.render("testImageUpload");
// });

// app.post("/upload",multer(multerConf).single('photo'),(req,res) => {
   
//     if(req.file)
//     { 
//         console.log(req.file);
//         req.body.photo = req.file.filename;
//     }
// })

//=========================================================
//USER DEFINED FUNCTIONS
//=========================================================    

function generateSalt(length)
{
return crypto.randomBytes(Math.ceil(length/2))
.toString('hex') 
.slice(0,length);   
}

function hashSaltPassword(password)
{

var salt = generateSalt(16);
const cipher = crypto.createCipher('aes192', salt);  
var encrypted = cipher.update(password, 'utf8', 'hex');  
encrypted += cipher.final('hex');
 return {
     salt:salt,
     passwordHash:encrypted
 };
}

function decryptHash(salt,hash)
{
const decipher = crypto.createDecipher('aes192', salt);  
var decrypted = decipher.update(hash, 'hex', 'utf8');  
decrypted += decipher.final('utf8');   
return decrypted;   
}

async function addField(req,res)
{
    try
    {
        var foundForm = await Form.findOne({_id:req.params.id});
    }
    catch(err)
    {
        console.log(err);
    }
    try
    { 
       if(req.body.type == "text")
       { 
            var createdField = await Field.create({  
                typeOfInput:"text",
                label:"Untitled",
                position:foundForm.fieldCount+1
           });
       }
       else if(req.body.type == "number"){

          var createdField = await Field.create({  
              typeOfInput:"number",
              label:"Untitled",
              position:foundForm.fieldCount+1
          });
       }
       else if(req.body.type == "radio"){
           var arr = [];
           arr.push("Fill option here");
        var createdField = await Field.create({  
            typeOfInput:"radio",
            label:"Untitled",
            position:foundForm.fieldCount+1,
            options:arr
        });
        console.log(createdField);
       }
       else if(req.body.type == "image")
       {
            var createdField = await Field.create({  
                typeOfInput:"image",
                label:"Untitled",
                position:foundForm.fieldCount+1,
            });
       }
       else if(req.body.type == "check")
       {
        var createdField = await Field.create({  
            typeOfInput:"check",
            label:"Untitled",
            position:foundForm.fieldCount+1,
            options:arr
        });
       }
       else if(req.body.type == "pdf")
       {
        var createdField = await Field.create({  
            typeOfInput:"pdf",
            label:"Untitled",
            position:foundForm.fieldCount+1,
        });
       }

    }
    catch(err)
    {
        console.log(err);
    }
    try
    {
        foundForm.fields.push(createdField);
        foundForm.fieldCount += 1;
        var savedFoundForm = await foundForm.save();
        res.redirect("/form/"+req.params.id+"/edit")
    }
    catch(err)
    {
        console.log(err);
    }
}

async function setupDashboard(req,res)
{
    try {
        
        var foundUser = await User.findOne({username:req.session.user});
        var forms = [];

        for(var i = 0;i < foundUser.form.length;i++){

            var foundForm = await Form.findOne({_id:foundUser.form[i].template});
            forms.push(foundForm);
        }
      
        
        res.render("dashboard.ejs",{foundUser:foundUser,forms:forms,message:req.flash("info")});
    } catch (error) {
        console.log(error);
    }
}

async function settingTime(req,res)
{  
    try {
       
        console.log(req.body);
        var updateQuery = {};

        if(req.body.date != ''){
          updateQuery.Date = new Date(req.body.date).getTime();
        }
        if(req.body.number != ''){
           updateQuery.reslimit = req.body.number;
        } 
       // var foundForm = await Form.findOne({_id:req.params.formid});
        var updatedFoundForm = await Form.findOneAndUpdate({_id:req.params.formid},{$set:updateQuery}); 
        res.redirect("/form/" + req.params.formid+"/edit"); 

    } catch (error) {
        console.log(error);
    }
     
}

async function addForm(req,res)
{
    if(req.params.type == "blank")
      { 
         try
         {  
           var createdForm = await Form.create({creatingUser:req.session.user,title:"Untitled",description:"Enter form description"});
         }
         catch(err)
         {
             console.log(err);
         }
         if(createdForm)
         { 
            try
            {  
             var foundUser = await User.findOne({username:req.session.user});
            } 
            catch(err)
            {
                console.log(err);
            }  
            try
            {
                foundUser.form.push({
                  template:createdForm._id,
                  TotalResponses:0,
                  responses:[]
                });
                var savedUser = await foundUser.save();
                console.log(savedUser);
                res.redirect("/form/" + createdForm._id + "/edit");
            }
            catch(err)
            {
                console.log(err);
            }
         }  
      }
      else if(req.params.type == "contact")
      {
        try
        {  
          var createdForm = await Form.create({creatingUser:req.session.user,title:"Contact Information",description:"Enter form description"});
        }
        catch(err)
        {
            console.log(err);
        }
        try
        {  
         var foundUser = await User.findOne({username:req.session.user});
        } 
        catch(err)
        {
            console.log(err);
        }  
        try
        {   
            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Name",
                position:1,
               required:true
            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Email",
                position:2,
               required:true
            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Address",
                position:3,
               required:true
            });
            createdForm.fields.push(createdField);
            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Phone number",
                position:4,
               required:true
            });
            createdForm.fields.push(createdField);
              createdForm.fieldCount = createdForm.fieldCount +  4;
            var savedForm = await createdForm.save();
            foundUser.form.push({
              template:createdForm._id,
              TotalResponses:0,
              responses:[]
            });
            var savedUser = await foundUser.save();
            console.log(savedUser);
            res.redirect("/form/" + createdForm._id + "/edit");
        }
  
        catch(err)
        {
            console.log(err);
        }
     } 
     else if(req.params.type == "rsvp")
     {
        try
        {  
          var createdForm = await Form.create({creatingUser:req.session.user,title:"Event RSVP",description:"Event Address: 123 Your Street Your City, ST 12345 Contact us at (123) 456-7890 or no_reply@example.com"});
        }
        catch(err)
        {
            console.log(err);
        }
        try
        {  
         var foundUser = await User.findOne({username:req.session.user});
        } 
        catch(err)
        {
            console.log(err);
        }  
        try
        {   
            var createdField = await Field.create({
                typeOfInput:"radio",
                label:"Can you attend",
                position:1,
                options:["Yes I will be there","Sorry cant make it"]

            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"text",
                label:"What are the names of people attending",
                position:2,
               required:true
            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"radio",
                label:"How did you hear about this event?",
                position:3,
                options:["Website","Friend","Newsletter","Advertisement"]
              
            });
            createdForm.fields.push(createdField);
            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Comments and/or questions",
                position:4,
               required:true
            });
            createdForm.fields.push(createdField);
            createdForm.fieldCount = createdForm.fieldCount +  4;


            var savedForm = await createdForm.save();
            foundUser.form.push({
              template:createdForm._id,
              TotalResponses:0,
              responses:[]
            });
            var savedUser = await foundUser.save();
            console.log(savedUser);
            res.redirect("/form/" + createdForm._id + "/edit");
        }
  
        catch(err)
        {
            console.log(err);
        }  
     }
     else if(req.params.type == "tshirt")
     { 
        try
        {  
          var createdForm = await Form.create({creatingUser:req.session.user,title:"T-Shirt Sign Up",description:"Enter your name and size to sign up for a T-Shirt."});
        }
        catch(err)
        {
            console.log(err);
        }
        try
        {  
         var foundUser = await User.findOne({username:req.session.user});
        } 
        catch(err)
        {
            console.log(err);
        }  
        try
        {   
            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Name",
                position:1,
                

            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"radio",
                label:"Shirt Size",
                position:2,
               options:["XS","S","M","L","XL"]
            });
            createdForm.fields.push(createdField);

            var createdField = await Field.create({
                typeOfInput:"text",
                label:"Comments",
                position:3,
              
            });
            createdForm.fields.push(createdField);
            createdForm.fieldCount = createdForm.fieldCount +  3;


            var savedForm = await createdForm.save();
            foundUser.form.push({
              template:createdForm._id,
              TotalResponses:0,
              responses:[]
            });
            var savedUser = await foundUser.save();
            console.log(savedUser);
            res.redirect("/form/" + createdForm._id + "/edit");
        }
  
        catch(err)
        {
            console.log(err);
        }  
     }
}
async function renderSettings(req,res)
{
    try{
      
         var foundForm = await Form.findOne({_id:req.params.formid});
         res.render("settings",{form:foundForm})
    }
    catch(err){
        console.log(err);
    }
}
async function findAndPopulateForm(req,res)
{ 
  try
  {   

    var foundFormPopulated = await Form.findOne({_id:req.params.id}).populate('fields');
  }
  catch(err)
  {
      console.log(err);
  }
  if(req.session.user == foundFormPopulated.creatingUser)
  {
    try
    {   
        var populatedFields = foundFormPopulated.fields.sort((a,b) => a.position > b.position);
        res.render("formEdit",{form:foundFormPopulated,populatedFields:populatedFields});
    }
    catch(err)
    {
        console.log(err);
    }
  } 
  else
  {  
      req.flash("info","You are not allowed to view this form");
      res.redirect("/dashboard")
  }
  
  
}

async function deleteField(req,res)
{   
    console.log("YOU HIT THE DELETE ROUTE");
    try {
        console.log(req.params.id,req.params.formid);
       var deletedfield = await Field.findOneAndDelete({_id:req.params.id});
        
       var foundForm = await Form.findOne({_id:req.params.formid});

       for(var i = 0;i < foundForm.fields.length;i++)
       {
           if(foundForm.fields[i] == req.params.id)
           {
               foundForm.fields.splice(i,1);
           }
       }
       foundForm.fieldCount = foundForm.fieldCount-1;
       var savedFoundForm = await foundForm.save();
       res.redirect("/form/"+req.params.formid+"/edit");

    } catch (error) {
        console.log(error);
    }
}
async function updateForm(req,res)
{
    try {
        
       var foundForm = await Form.findOneAndUpdate({_id:req.params.id},{$set:{title:req.body.title,description:req.body.description}});
    } catch (error) {
        console.log(err);
    }
    try {
        // foundForm.title = req.body.title;
        // foundForm.description = req.body.description;

        for(var i = 0;i < foundForm.fields.length;i++)
        {  
           var currentField = await Field.findOne({_id:foundForm.fields[i]}); 
           if(currentField.typeOfInput == "text")
           { 
             var queryString = currentField.position+"label";
             var required;
             var queryString1 = "check"+currentField.position;
             console.log( req.body[queryString1]);
             if(req.body[queryString1] && req.body[queryString1])
              required = true;
             else
              required = false; 

             var updatedField = await Field.findOneAndUpdate({_id:foundForm.fields[i]},{$set:{label:req.body[queryString],required:required}});
           }  
           else if(currentField.typeOfInput == "number")
           { 
             var queryString = currentField.position+"label";
             var required;
             var queryString1 = "check"+currentField.position;
             console.log( req.body[queryString1]);
             if(req.body[queryString1] && req.body[queryString1])
              required = true;
             else
              required = false; 
             var updatedField = await Field.findOneAndUpdate({_id:foundForm.fields[i]},{$set:{label:req.body[queryString],required:required}});
           }
           else if(currentField.typeOfInput == "radio")
           {
            var queryString = currentField.position+"label";
            var required;
            var queryString1 = "check"+currentField.position;
            console.log( req.body[queryString1]);
            if(req.body[queryString1] && req.body[queryString1])
             required = true;
            else
             required = false; 
            var updatedField = await Field.findOneAndUpdate({_id:foundForm.fields[i]},{$set:{label:req.body[queryString],required:required}});
           } 
           else if(currentField.typeOfInput == "image")
           {
            var queryString = currentField.position+"label";
            var required;
            var queryString1 = "check"+currentField.position;
            console.log( req.body[queryString1]);
            if(req.body[queryString1] && req.body[queryString1])
             required = true;
            else
             required = false; 
            var updatedField = await Field.findOneAndUpdate({_id:foundForm.fields[i]},{$set:{label:req.body[queryString],required:required}});
           }
        }
        res.redirect("/form/"+req.params.id+"/edit")
    } catch (error) {
         console.log(error);
    }
}

async function editRadioButtonOptions(req,res){

    try {
        
        var foundField = await Field.findOne({_id:req.params.radioid});
        console.log(foundField);
        var query;
        var resArray = [];
        console.log(req.body)

        for(var i = 0;i < foundField.options.length;i++)
        { 
             query = "option"+i;
             resArray.push(req.body[query]);
        }
        console.log(resArray);
        var foundFieldUpdated = await Field.findOneAndUpdate({_id:req.params.radioid},{$set:{label:req.body.label,options:resArray}});
        res.redirect("/form/"+req.params.formid+"/edit");  
    } catch (error) {
        console.log(error);
    }
}

async function updateFormField(req,res){

    try {
        var currentField = await Field.findOne({_id:req.params.fieldID});
        if(currentField.typeOfInput == "text")
        { 
          var queryString = currentField.position+"label";
          console.log(req.body);
          console.log(req.body[queryString]);
          var updatedField = await Field.findOneAndUpdate({_id:req.params.fieldID},{$set:{label:req.body[queryString]}});
          console.log(updatedField);

        }  
        else if(currentField.typeOfInput == "number")
        { 
          var queryString = currentField.position+"label";
          var updatedField = await Field.findOneAndUpdate({_id:req.params.fieldID},{$set:{label:req.body[queryString]}});
          console.log(updatedField);
        } 
        res.redirect("/form/"+req.params.id+"/edit")

    } catch (error) {
        console.log(error);
    }
}

async function deleteRadioButtonOption(req,res)
{
    try {
        
       var foundField = await Field.findOne({_id:req.params.radioid});
       
       foundField.options.splice(req.params.i,1);

       var savedFoundField = await foundField.save();
       res.redirect("/form/"+req.params.formid+"/radio/"+req.params.radioid);

    } catch (error) {
        console.log(error);
    }
}
async function updateFormHeader(req,res)
{
   
    try {
        var foundForm = await Form.findOneAndUpdate({_id:req.params.id},{$set:{title:req.body.title,description:req.body.description}});
        console.log(foundForm);
        res.redirect("/form/"+req.params.id+"/edit")
     } catch (error) {
         console.log(err);
     }
}
// async function addTemplate(req,res)
// {
//     try
//     {
//         var createdForm = await Form.create({creatingUser:req.session.user,title:"Contact Information",description:"Enter form description"});
 
//     }
//     catch(err)
//     {
//         console.log(err);
//     }
// }
async function getFormAndRender(req,res)
{
    try {
        
        var foundFormPopulated  = await Form.findOne({_id:req.params.id}).populate('fields');
      
        var populatedFields = foundFormPopulated.fields.sort((a,b) => a.position > b.position);
        res.render("renderForm",{form:foundFormPopulated,populatedFields:populatedFields,message:req.flash("info")});
      
    } catch (error) {
        console.log(error);
    }
}
async function renderRadioButton(req,res)
{
    try{
        
        var radioFieldId = req.params.radioid;
        var formID = req.params.formid;
        
        var foundField = await Field.findOne({_id:radioFieldId});
        res.render("editRadioButton",{formid:formID,foundField:foundField});

    }catch(err)
    {
        console.log(err);
    }
}

async function getExplore(req,res)
{
    var allUsers = await User.find({});
    
    var allForms = [];

    for(var i = 0;i < allUsers.length;i++)
    {
        for(var j = 0;j< allUsers[i].form.length;j++)
        {   
            
            allForms.push(allUsers[i].form[j]);
        }
    }
    allForms.sort((a,b) => a.TotalResponses < b.TotalResponses);
    console.log(allForms);
    var trending = [];
    var formsPopulated = [];

    var trendingPopulated = [];
     
    for(var i = 0;i < allForms.length;i++)
    {   
        var foundForm = await Form.findOne({_id:allForms[i].template}) 

       if(i <= 3) 
       {   
           trendingPopulated.push(foundForm);
       }
       formsPopulated.push(foundForm);

    }
    res.render("explore",{forms:formsPopulated,trending:trendingPopulated})
}

async function addRadioButtonOption(req,res)
{
     try {
         
        var foundField = await Field.findOne({_id:req.params.radioid});

        foundField.options.push("Fill option here");
        var savedFoundField = await foundField.save();

        res.redirect("/form/"+req.params.formid+"/radio/"+req.params.radioid);

     } catch (error) {
         console.log(error);
     }
}
async function postFormResponse(req,res)
{  
    
   
    try {
      
     
      var formID = req.params.id;
      var foundForm = await Form.findOne({_id:formID}).populate('fields');
      var foundUser = await User.findOne({username:req.session.user});
      var foundFormFields = foundForm.fields;

     
       console.log(req.body);
    } catch (error) {
        console.log(error);
    }

    var flag = 0;
    var formIndex;
    for(var i = 0;i < foundUser.formSubmitted.length;i++){
       
        if(foundUser.formSubmitted[i].template == formID)
        {    
            
          //  foundUser.formSubmitted[i].count = foundUser.formSubmitted[i].count+!;
            formIndex = i;
            flag = 1;
            break;
        }
    }
    
    if(flag == 0)
    {
        foundUser.formSubmitted.push({
            template:formID,
            count:0
        });
        var saveUSer = await foundUser.save();
        formIndex =  foundUser.formSubmitted.length-1;
    }
    console.log(formIndex,foundForm.reslimit); 
    if(foundForm.reslimit == -1 || foundUser.formSubmitted[formIndex].count+1 <= foundForm.reslimit)
    { 
        if(!foundForm.Date || parseInt(Date.now()) < parseInt(foundForm.Date))
        {
            console.log(req.body);
            foundUser.formSubmitted[formIndex].count =  foundUser.formSubmitted[formIndex].count+1;
            try
            {
            var saved = await foundUser.save();
            }
            catch(err)
            {
                console.log(err);
            }
            try {
                console.log("reached");

            var foundUser = await User.findOne({username:foundForm.creatingUser});
            
            for(var j = 0;j < foundUser.form.length;j++)
            {   
                
                if(foundUser.form[j].template.equals(foundForm._id))
                {     
                    var createdResponseFieldArray = [],createdResponseFieldArray1 = [];
                    for(var i = 0;i < foundFormFields.length;i++)
                    {   
                        var queryString = "input"+foundFormFields[i].position;
                    //  console.log(foundFormFields[i].type,req.body.queryString)

                    if(foundFormFields[i].typeOfInput == "text" || foundFormFields[i].typeOfInput == "number")
                    {
                        var createdResponseField = await ResponseField.create({
                            type:foundFormFields[i].typeOfInput,
                            value:req.body[queryString],
                            position:foundFormFields[i].position,
                        
                        });
                        createdResponseFieldArray.push(createdResponseField._id);
                        createdResponseFieldArray1.push(createdResponseField);

                    }
                    else if(foundFormFields[i].typeOfInput == "radio"){
                        var createdResponseField = await ResponseField.create({
                            type:foundFormFields[i].typeOfInput,
                            value:req.body[queryString],
                            position:foundFormFields[i].position,
                            options:foundFormFields[i].options
                        });
                        createdResponseFieldArray.push(createdResponseField._id);
                        createdResponseFieldArray1.push(createdResponseField);

                    }
                    else if(foundFormFields[i].typeOfInput == "check")
                    {  
                        console.log(foundFormFields[i]);
                        
                        var createdResponseField = await ResponseField.create({
                            type:foundFormFields[i].typeOfInput,
                        
                            position:foundFormFields[i].position,
                            options:foundFormFields[i].options,
                            answers:[]
                        });
                        createdResponseFieldArray.push(createdResponseField._id);
                        var answers = [];
                    if(req.body[queryString])
                    {    
                        console.log("++++++++++++++++++++++++++")
                        console.log(typeof req.body[queryString])
                      
                       if(typeof req.body[queryString] == "string")
                       { 
                         answers.push(req.body[queryString])
                       }else{
                        for(var i = 0;i < req.body[queryString].length;i++)
                        {  
                            answers.push(req.body[queryString][i]);
                        }
                       } 
                       
                    } 

                        var updatedField = await ResponseField.findOneAndUpdate({_id:createdResponseField._id},{checkAnswers:answers}) 
                        createdResponseFieldArray1.push(updatedField);

                    }
                    
                
            
                    }

                    var flag = 0,flag1 = 0;
                    for(var k = 0;k < createdResponseFieldArray1.length;k++)
                    {   
                        flag1 = 0;
                        console.log(foundUser);
                        for(var l = 0;l < foundUser.form[j].responseAnalytics.length;l++)
                        {  
                            if(foundUser.form[j].responseAnalytics[l].position == createdResponseFieldArray1[k].position)
                            {   flag = 0;
                                flag1 = 1
                                for(m = 0;m < foundUser.form[j].responseAnalytics[l].arr.length;m++)
                                {  
                                    console.log(foundUser.form[j].responseAnalytics[l].arr[m].value,createdResponseFieldArray1[k].value)
                                    if(createdResponseFieldArray1[k].type != "check" && createdResponseFieldArray1[k].value == foundUser.form[j].responseAnalytics[l].arr[m].value)
                                    { 
                                        foundUser.form[j].responseAnalytics[l].arr[m].count = foundUser.form[j].responseAnalytics[l].arr[m].count+1;
                                        flag = 1;   
                                    }

                                }
                                if(flag == 0)
                                {  
                                    foundUser.form[j].responseAnalytics[l].arr.push({
                                        value: createdResponseFieldArray1[k].value,
                                        count:1
                                    })
                                    console.log(foundUser);
                                }
                            }
                        }
                        if(flag1 == 0)
                        {  console.log(createdResponseFieldArray1[k]);
                        if(createdResponseFieldArray1[k].type != "check")
                        { 
                            var arr = [];
                            arr.push({
                                value:createdResponseFieldArray1[k].value,
                                count:1,
                            })
                        foundUser.form[j].responseAnalytics.push(
                            {
                                position:createdResponseFieldArray1[k].position,
                                arr:arr
                            });
                        }
                        }
                    }

                    var savedUser = await foundUser.save(); 

                    
                    for(var k = 0;k < req.files.length;k++)
                    {   console.log(req.files[k].fieldname,req.body[queryString]);
                        
                            var createdResponseField = await ResponseField.create({
                                type:"image",
                                position:req.files[k].fieldname.substr(5,req.files[k].fieldname.length),
                                url:req.files[k].path
                            });
                            createdResponseFieldArray.push(createdResponseField._id);
                    }  
                    
                    
                    
                    foundUser.form[j].responses.push(createdResponseFieldArray); 
                    foundUser.form[j].TotalResponses  =  foundUser.form[j].TotalResponses+1;
            
                    var savedFoundUser = await foundUser.save();
            
                    res.redirect("/form/"+formID+"/response")
                break;
                } 
            }
        
                
            } catch (error) {
                console.log(error);
            }
        }
        else
        {
            req.flash("info","Form is closed");
            res.redirect("/form/"+formID+"/response")
        } 
  }
  else{
    req.flash("info","You have reached response limit for the form");
    res.redirect("/form/"+formID+"/response")
  }
   
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

async function viewAnalytics(req,res)
{
    try{
        var foundUser = await User.findOne({username:req.session.user});
        var foundForm = await Form.findOne({_id:req.params.id}).populate('fields');
        var sortedQuestionFields = foundForm.fields.sort((a,b) => a.position > b.position);
      if(req.session.user == foundForm.creatingUser)
      {  
        var pieChartData = [];
        for(var i = 0;i < foundUser.form.length;i++)
        {   
             if(foundUser.form[i].template.equals(req.params.id))
            {    
                 console.log(foundUser.form[i].responseAnalytics)
                for(var j = 0;j < foundUser.form[i].responseAnalytics.length;j++)
                { 
                    var arr = []
                    foundUser.form[i].responseAnalytics[j].arr.sort((a,b) => parseInt(a.count) < parseInt(b.count));
                    var maxLen = 10 < foundUser.form[i].responseAnalytics[j].arr.length?10:foundUser.form[i].responseAnalytics[j].arr.length;
                    console.log(maxLen);
                    var sum = 0;
                    console.log(foundUser.form[i].responseAnalytics[j])
                    for(var k = 0;k < maxLen;k++)
                    {
                      sum += parseInt(foundUser.form[i].responseAnalytics[j].arr[k].count);
                      
                    }
                    for(var k = 0;k < maxLen;k++)
                    {
                       arr.push({
                           y:(foundUser.form[i].responseAnalytics[j].arr[k].count/sum)*100,
                           label:foundUser.form[i].responseAnalytics[j].arr[k].value,
                           color:getRandomColor()
                       })
                       // sum += parseInt(foundUser.form[i].responseAnalytics.arr[k].value);
                    }
                    pieChartData.push({
                       arr:arr,
                       position: foundUser.form[i].responseAnalytics[j].position
                    });
                    
                }
                   console.log(pieChartData)
            //    var responseFields = [];
            //      if(foundUser.form[i].responses[parseInt(number)-1])
            //      {
            //            for(var j = 0;j < foundUser.form[i].responses[parseInt(number)-1].length;j++)
            //            {  
            //                var foundResponseField = await ResponseField.findOne({_id:foundUser.form[i].responses[number-1][j]});
            //                responseFields.push(foundResponseField);
            //            }  
            //    }      
                
                res.render("viewAnalytics",{foundUser:foundUser.form[i],form:foundForm,analytics:foundUser.form[i].responseAnalytics,pieChartData:pieChartData});
            }
        }
      }else{
            req.flash("info","You are not allowed to view this form analytics");
            res.redirect("/dashboard")
        }
        
    }
    catch(err)
    {
        console.log(err);
    }
}

async function viewResponse(req,res,number)
{
     try{
         console.log(number);
         var foundUser = await User.findOne({username:req.session.user});
         var foundForm = await Form.findOne({_id:req.params.id}).populate('fields');
        if(req.session.user == foundForm.creatingUser)
        { 
         var sortedQuestionFields = foundForm.fields.sort((a,b) => a.position > b.position);
         for(var i = 0;i < foundUser.form.length;i++)
         {
             if(foundUser.form[i].template.equals(req.params.id))
             {    
                var responseFields = [];
                  console.log(number);
                  if(foundUser.form[i].responses[parseInt(number)-1])
                  {
                        for(var j = 0;j < foundUser.form[i].responses[parseInt(number)-1].length;j++)
                        {  
                            var foundResponseField = await ResponseField.findOne({_id:foundUser.form[i].responses[number-1][j]});
                            responseFields.push(foundResponseField);
                        }  
                }      
               
                 var sortedResponseFields = responseFields.sort((a,b) => a.position > b.position)
                 res.render("viewResponse",{responseFields:sortedResponseFields,form:foundForm,total:foundUser.form[i].TotalResponses,populatedFields:sortedQuestionFields,number:number});
             }
         }
        }else{
            req.flash("info","You are not allowed to view this form response");
            res.redirect("/dashboard")
        }
     }
     catch(err)
     {
         console.log(err);
     }
}

//=========================================================
//LOGIN AND REGISTER ROUTES
//=========================================================


    app.get("/",(req,res) => {
        res.redirect("/login");
    })
    
    app.get("/register",(req,res)=>{
        res.render("register",{message:req.flash('info')});
    });   
    
    app.post("/register",(req,res)=>{
          
        
        var generatedSaltAndHash = hashSaltPassword(req.body.password);
        
        var user = {username:req.body.username,salt:generatedSaltAndHash.salt,hash:generatedSaltAndHash.passwordHash};
       
        User.find({username:req.body.username},(err,foundUsers) => {
    
            if(foundUsers.length > 0)
            {
                req.flash("info","Username already taken");
                res.redirect("/register");
            }
            else
            {
                User.create(user,(err,userCreated)=>{
                    if(err)
                     console.log(err);
                    else
                    {  
                        req.session.user = userCreated.username;
                        res.redirect("/dashboard")
                    } 
               });
            }
        })
    
        
    })
    
    app.get("/login",(req,res)=>{
        res.render("login",{message:req.flash('info')});
    });  
    app.post("/logout",(req,res) => 
    {
        req.session.user = "";
        res.redirect("/login");
    
    });
    app.post("/login",(req,res)=>{
        
        User.find({username:req.body.username}).then((user)=>{
         if(user.length == 0)
         {   
    
              req.flash('info', 'Incorrect username')
    
              res.redirect("/login");
         }   
         else
         {
          var passwordOfUser = decryptHash(user[0].salt,user[0].hash);
            if(req.body.password === passwordOfUser)
            {   
    
                req.session.user = user[0].username;
    
                res.redirect('/dashboard');
            }
            else
            {
                req.flash('info', 'Incorrect credentials')
                res.redirect("/login");
            }
        }  
       }).catch((err)=>{
           console.log(err)
       });
    });
        
   
//=========================================================
//DASHBOARD ROUTES
//=========================================================
app.get("/dashboard",checkAuthenticity,(req,res) => {
   setupDashboard(req,res);
});
app.get("/explore",checkAuthenticity,(req,res) =>{
    getExplore(req,res);
 });

//=========================================================
//FORM BUILDER ROUTES
//========================================================= 
app.post("/form/:type",checkAuthenticity,(req,res) => {
     addForm(req,res);
});

app.get("/form/:id/edit",checkAuthenticity,(req,res) => {

      findAndPopulateForm(req,res);
});

app.post("/form/:id/field",checkAuthenticity,(req,res) => {
    
    addField(req,res);
});

app.put("/form/:id",checkAuthenticity,(req,res) => {
    updateForm(req,res);
});

app.put("/form/:id/main",checkAuthenticity,(req,res) => {
     updateFormHeader(req,res);
});

app.get("/settings/:formid",checkAuthenticity,(req,res) => {
      
      renderSettings(req,res);
});

app.post('/settings/:formid',checkAuthenticity,(req,res) => {
  
    
    settingTime(req,res)
    // console.log(givenDate.getTime());
    // console.log( Date.now() > req.body.date)
    //res.send("hello");
   // console.log(req.body);
});
app.put("/form/:id/field/:fieldID",checkAuthenticity,(req,res) => {
    console.log("YOU HIT THE PUT ROUTE");
    updateFormField(req,res);
});

app.delete("/field/:id/delete/:formid",checkAuthenticity,(req,res) => {
    console.log("YOU HIT DELETE ROUTE");
    deleteField(req,res);
});

//=========================================================
//FORM BUILDER RADIO BUTTON ROUTES
//========================================================= 
app.get("/form/:formid/radio/:radioid",checkAuthenticity,(req,res) => {
    renderRadioButton(req,res);
});

app.get("/form/:formid/check/:radioid",checkAuthenticity,(req,res) => {
    renderRadioButton(req,res);
});

app.post("/form/:formid/radio/:radioid/add",checkAuthenticity,(req,res) => {
    addRadioButtonOption(req,res);
});
app.post("/form/:formid/radio/:radioid/delete/:i",checkAuthenticity,(req,res) => {
   deleteRadioButtonOption(req,res);
})

app.put("/form/:formid/radio/:radioid",checkAuthenticity,(req,res) => {
    editRadioButtonOptions(req,res);
});


//=========================================================
//FORM RESPONSE ROUTES
//========================================================= 

app.get("/form/:id/response",checkAuthenticity,(req,res) => {
    getFormAndRender(req,res);
});

app.post("/form/:id/response",checkAuthenticity,upload.any(),(req,res) => {
    postFormResponse(req,res);
});

app.get("/form/:id/viewresponse/:number",checkAuthenticity,(req,res) => {
    viewResponse(req,res,req.params.number);
});
app.get("/form/:id/analytics",checkAuthenticity,(req,res) => {
    viewAnalytics(req,res);
});

// app.post("/form/:id/viewresponse/:number",(req,res) => {
//     viewResponse(req,res,req.params.number);
// });
//=======================================
//Middleware
//=======================================
function checkAuthenticity(req,res,next){
    if(req.session.user && req.session.user != "")
      next();
    else
     res.redirect("/login");  
}


app.listen(port,(req,res) => {
    console.log("MyForm server has started");
})    