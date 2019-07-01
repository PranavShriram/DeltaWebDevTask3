
// if(sessionStorage.getItem('focusInput'))
// {  
    
//    var inputToFocus  = document.querySelector('#'+sessionStorage.getItem('focusInput'));
    
//    inputToFocus.focus();
// }
// else
// {   
//     var firstInput = document.querySelector('input');
   
      
//     sessionStorage.setItem('focusInput',firstInput.id);
//     firstInput.focus();
// }

// var inputAll = document.querySelectorAll('input');

// for(var i = 0;i < inputAll.length;i++)
// {
//     inputAll[i].addEventListener('focus',function()
//     {
//         sessionStorage.setItem('focusInput',this.id);
//     });
// }
// function inputBlur(e)
// {   
//     console.log(e.parentNode);
//     e.parentNode.parentNode.submit();
// }

// function inputBlur1(e)
// {
//     e.parentNode.submit();
// }

var openSettings = document.querySelector('.settings-open-button');
var settingsForm = document.querySelector('.settings-form');
var displayRow = document.querySelector('.disp_row');


openSettings.addEventListener("click",function()
{  
    if(settingsForm.style.display == "none")
     settingsForm.style.display = "";
    else
      settingsForm.style.display = "none"; 

    
        displayRow.classList.toggle("opacitySet")
    
});