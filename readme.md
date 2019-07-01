# DeltaWebDevTask3
A google forms like form builder for delta inductions

## Steps for installation 
1. Clone the repository locally

2. Install nodejs from [Nodejs official website](https://nodejs.org/en/)

3. Open the terminal in the folder where you have cloned the project.

4. Now run the following commands 
```
   npm cache clean
   npm install
```

5. Now, you should be able to see the node modules folder with all dependencies installed.

6. Install the mongodb community edition from here [Mongodb official documentation](https://docs.mongodb.com/manual/administration/install-community/)

7. Ensure that mongo service has started and is listening on port 27017

8. Now , run the following command back in the terminal at the project folder
`node index.js`

9. Navigate to http://localhost:3000/register and you should be able to view the register page

## Application User Manual

1. Register yourself by opening http://localhost:3000/register route.

2. Once you have registered, http://localhost:3000/dashboard is opened automatically where you can create your form by choosing a template.

3. The form edit route opens where you can edit the form.Add fields by using the buttons on the side.**Before you click add field ensure that all changes that you made are saved by clicking confirm edit**

4. To limit the number of responses per user or to set expiry date for the form click the settings button on the navbar.By default the form never expires and any user can submit any number of responses.

5. Use the link in the settings page to submit response .The link can be shared via twitter or facebook.

6. Now,the form admin can view the submitted responses by clicking the responses button on the form edit page.

7. The responses can be viewed individually or by clicking the analytics tab in the form of a **piechart diagram**

8. The explore page can be used to view all forms and the top four trending forms.




