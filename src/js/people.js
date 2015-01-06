define(function(){

  function People(world, posX, posY, name){

    // basic property
    this.name = name;
    if(Math.random() > 0.5)this.gender = "male";
    else this.gender = "female";
    this.age = 0;

    // world related
    this.world = world;
    this.posX = posX;
    this.posY = posY;
    this.background = "../img/people.png"
    this.direction = 0; // 0 up 1 right 2 down 3 left
    world.grid[posX][posY].people = this;
    world.grid[posX][posY].hasPeople = true;

    // money related
    this.income = 0;
    this.outcome = 0;
    this.incomeItems = [];
    this.outcomeItems = [];
    this.breads = 0;
    this.job = [];
    this.town = {};


    // personality
    this.meanness = Math.random();
    this.braveNess = Math.random();
    this.friendNess = Math.random();

    // relation related
    this.friends = [] // enemy also in this list
    this.chatwith = function(friend){
      // get the info form a friend
    }

    // update related
    this.date = 0;

    // nearby
    this.nearby = []; // the 8 near blocks

    this.update = function(){
      if(this.date == this.world.date)return;
      this.date = this.world.date;
      // draw user image
      var context = this.world.context;
      var mimg = new Image();
      var that = this;
      mimg.onload = function(){
        var sourceX = 5;
        var sourceY = 2;
        var sourceWidth = 24;
        var sourceHeight = 33;
        var destWidth = 16;
        var destHeight = 16;
        var destX = that.posX*20 + 10 + 2;
        var destY = that.posY*20 + 10 + 2;
        context.drawImage(mimg, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
      }
      mimg.src = this.background;
    }

    // update neighbor
    this.nearby = [];
    for(var i=0; i<3; i++){
      for(var j=0; j<3;j++){
        var targetPlace = this.world.grid[i+this.posX-1][j+this.posY-1];
        if(i=1 && j=1)continue; // it's himself
        this.nearby.push(targetPlace);
      }
    }

    // update personal info



    // action related
    this.move = function(pos){

    }

    this.makeDecision = function(){

    }
    
    this.workOnFarm = function(farm){

    }

    this.workOnHouse = function(house){

    }

    this.attack = function(people){

    }

  }

  return {
    'People': People,
  }
})

