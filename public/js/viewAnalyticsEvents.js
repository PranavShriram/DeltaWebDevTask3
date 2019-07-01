

var number = parseInt(document.querySelector('.pieChartTotal').textContent)


for(var i = 1;i <= number;i++)
{  

    var data = JSON.parse(document.querySelector(".piechart"+i).textContent);
    console.log(data);
    var p = new pieChart(data,100,200,200);
    var canvas = document.querySelector('#canvas'+i);
    var ctx = canvas.getContext('2d');
    p.draw(ctx)
}
