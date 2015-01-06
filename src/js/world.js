define(function(){
  function World(context){

    this.interval = 60; // frame per update
    this.updateCount = 0;
    this.date = 0;
    this.gridMaxX = 31;
    this.gridMaxY = 23;
    this.grid =[];
    this.date = 0;
    this.context = context;

    // init grid
    for(var i=0;i<this.gridMaxX;i++){
      for(var j=0;j<this.gridMaxY;j++){
        this.grid[i] = this.grid[i]||[];
        this.grid[i][j] = {};
        var blankBlock = new Block(this, i, j);
        this.grid[i][j] = {
          'block': blankBlock,
          'hasPeople': false,
        }
      }
    }

    this.update = function(){
      this.updateCount ++;
      if(this.updateCount != this.interval){
        return
      }
      this.updateCount = 0;
      this.date ++;
      for(var i=0;i<this.gridMaxX; i++){

        for(var j=0; j<this.gridMaxY; j++){
          var targetGrid = this.grid[i][j];
          targetGrid.block.update();
          if(targetGrid.hasPeople){
            targetGrid.people.update();
          }
        }
      }
    }
    
  }

  function Block(world, posX, posY){

    this.allowPeople = true;

    this.durability = 100;
    this.growStatus = 0;

    this.growth = 0;
    this.tear = 0;
    this.collectRate = 0;
    this.growRate = 0;

    this.type = "blank";
    this.background = "";
    this.degradeBlock = Block;
    this.growBlock = Block;

    this.world = world;
    this.date = 0;
    this.posX = posX;
    this.posY = posY;

    world.grid[posX][posY].block = this;

    this.update = function(){
      if(this.date == this.world.date)return; // already updated
      this.date = this.world.date;
      // draw block image
      if(this.type == "blank"){
        // draw white
        var context = this.world.context;
        context.beginPath();
        context.rect(this.posX*20+10+2, this.posY*20 +10 +2, 16, 16);
        context.fillStyle = '#FFFFFF';
        context.fill();
        return;
      }

      var mimg = new Image();
      var that = this;
      mimg.onload = function(){
        // clear previous block
        var context = that.world.context;
        context.beginPath();
        context.rect(that.posX*20+10+2, that.posY*20 +10 +2, 16, 16);
        context.fillStyle = '#FFFFFF';
        context.fill();
        context.drawImage(mimg, that.posX*20+10+2, that.posY*20 +10 +2, 16, 16); // padding 2px;
      }
      mimg.src = this.background;

      // check durability
      this.durability -= this.tear;
      if(this.durability <= 0){
        // this block is broken, if broken replace it with a degrade block
        mblock = new this.degradeBlock(this.world, this.posX, this.posY);
        return;
      }

      // check grow
      this.growStatus += this.growth;
      if(this.growStatus >= 100){
        this.growStatus = 0;
        // find a place to grow
        var targetPlace = [];
        for(var i=0; i<3; i++){
          for(var j=0; j<3;j++){
            if(i+this.posX-1 < 0 || i+this.posX-1 >= this.world.gridMaxX ||
              j+this.posY-1 < 0 || j+this.posY-1 >= this.world.gridMaxY){
              continue;
            }
            if(this.world.grid[i+this.posX-1][j+this.posY-1].block.type == 'blank' && this.world.grid[i+this.posX-1][j+this.posY-1].hasPeople == false){
              targetPlace.push({
                'posX': i,
                'posY': j,
              })
            }
          }
        }
        if(targetPlace.length != 0){
          var randomsPos = targetPlace[parseInt(Math.random()*targetPlace.length)];
          new this.growBlock(this.world, randomsPos.posX + this.posX -1, randomsPos.posY + this.posY -1);
        }
      }

      // 

    }
  }


  function Stone(world, posX, posY){

    Block.apply(this, arguments);
    this.allowPeople = false;

    this.collectRate = 50;

    this.type = "stone";
    this.background = "../img/block.svg";

  }


  function Wood(world, posX, posY){

    Block.apply(this, arguments);

    this.allowPeople = false;

    this.tear = 1;
    this.collectRate = 100;
    this.growth = 2.5;

    this.type = "wood";
    this.background = "../img/wood.jpg";
    this.growBlock = Wood;

  }

  function Rash(){

    Block.apply(this, arguments);

    this.allowPeople = false;

    this.collectRate = 100;

    this.type = "rash";
  }


  function Farm(){

    Block.apply(this, arguments);

    this.allowPeople = false;

    this.collectRate = 100; // 1/action
    this.productRate = 400; // 4/day
    this.product = "bread";

  }

  function Door(){

    this.allowPeople = true;

    this.collectRate = 100;
  }

  return {
    'World': World,
    'Block': Block,
    'Stone': Stone,
    'Wood': Wood,
    'Rash': Rash,
    'Farm': Farm,
    'Door': Door,
  }

})