
var pieChart = function(dataPoints,radius,x,y)
{
      this.dataPoints = dataPoints;
      this.radius = radius;
      this.x = x;
      this.y = y;
     
      this.draw = function(ctx)
      {    
           var start_angle = 0;
           var end_angle;
           
            for(var i = 0;i < dataPoints.length;i++)
            {   
                   
                ctx.strokeStyle = dataPoints[i].color;
               
             
                ctx.beginPath(); 
                ctx.fillStyle = dataPoints[i].color;
                end_angle = start_angle + (dataPoints[i].y/100)*2;
                ctx.moveTo(x,y);
                ctx.arc(x,y,radius,start_angle*Math.PI,end_angle*Math.PI);
                console.log(start_angle,end_angle);
               
                //ctx.closePath();
                ctx.fill();
                start_angle = end_angle;
            }
          //Legend
              ctx.fillStyle = "white";
              ctx.fillRect(580,80,150,300);
             ctx.fillStyle = "black"
             ctx.font = '20px serif';
             ctx.fillText('Legend', 400, 100);
             
             ctx.font = "12px arial"
             for(var i = 0;i < dataPoints.length;i++)
             {     ctx.fillStyle = dataPoints[i].color;
                   ctx.fillRect(420,127+i*20,10,10);
                   ctx.fillStyle = "black";
                   ctx.fillText(dataPoints[i].label,440,120+20*i+15);
             }

      }
}



