require(['world', 'town', 'people'], function(World, Town, People){
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  // draw basic grid
  // padding 10px
  for(var xcount = 0; (xcount*20 + 10)< 640; xcount ++){
    // drow row
    context.moveTo(xcount*20 + 10, 10);
    context.lineTo(xcount*20 + 10, 470);
    context.lineWidth = 1;
    context.strokeStyle = '#CCCCCC';
    context.stroke();
  }
  
  for(var ycount = 0; (ycount*20 + 10) < 480; ycount ++){
    context.moveTo(10, ycount*20 + 10);
    context.lineTo(630, ycount*20 + 10);
    context.lineWidth = 1;
    context.strokeStyle = '#CCCCCC';
    context.stroke(); 
  }

  var mworld = new World.World(context);
  new World.Tree(mworld, 10, 10);
  new World.TallTree(mworld, 10, 20);
  //new People.People(mworld, 15, 15, "Adward");



  setInterval(function(){
    window.requestAnimationFrame(function(){
      mworld.update();
    });
  },15)

  
})