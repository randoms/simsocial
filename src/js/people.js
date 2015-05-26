define(['world'], function(World){

  function People(world, posX, posY, name, gene){

    // basic property
    this.name = name;
    this.gene = gene|| new World.Gene();
    this.geneGender = this.gene.getPhenotype("gender");
    if(this.geneGender >= 0.5){
      this.gender = "male";
      this.background = '../img/male.svg';
    }else{
      this.gender = "female";
      this.background = '../img/female.svg';
    }

    this.age = 0;

    // world related
    this.world = world;
    this.posX = posX;
    this.posY = posY;
    this.direction = 0; // 0 up 1 right 2 down 3 left
    world.grid[posX][posY].people = this;
    world.grid[posX][posY].hasPeople = true;

    // money related
    this.income = 0;
    this.outcome = 0;
    this.incomeItems = [];
    this.outcomeItems = [];
    this.breads = 0;
    this.jobs = [];
    this.town = {};


    // personality
    this.geneMeanNess = this.gene.getPhenotype("meanness");
    this.geneBraveNess = this.gene.getPhenotype("braveness");
    this.geneFriendNess = this.gene.getPhenotype("friendness");
    this.geneAffectNess = this.gene.getPhenotype("affectness"); // the ablity to affect others, just like environment improvement
    this.geneCleverNess = this.gene.getPhenotype("cleverness");
    this.geneEnvironment = this.gene.getPhenotype("environment");

    //this.cleverness = 

    // relation related
    this.friends = [] // enemy also in this list
    this.chatwith = function(friend){
      // get the info form a friend
    }

    // update related
    this.date = 0;

    // nearby
    this.nearby = []; // the 8 near blocks

    this.drawImage = function(){

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
    }

    this.drawImage();

    this.update = function(){
      if(this.date == this.world.date)return;
      this.date = this.world.date;
      if(this.jobs.length != 0)this.jobs[0].work();
    }

    // update neighbor
    this.nearby = [];
    for(var i=0; i<3; i++){
      for(var j=0; j<3;j++){
        var targetPlace = this.world.grid[i+this.posX-1][j+this.posY-1];
        if(i==1 && j==1)continue; // it's himself
        this.nearby.push(targetPlace);
      }
    }

    // update personal info



    // action related
    this.move = function(pos){
      var currentPos = this.world.grid[this.posX][this.posY];
      switch(pos){
        case "up":{
          if(this.posY <= 0)break;
          var targetPos = this.world.grid[this.posX][this.posY-1];
          moveToTarget(targetPos,currentPos);
          break;
        }
        case "right":{
          if(this.posX >= this.world.gridMaxX-1)break;
          var targetPos = this.world.grid[this.posX+1][this.posY];
          moveToTarget(targetPos,currentPos);
          break;
        }
        case "down":{
          if(this.posY >= this.world.gridMaxY+1)break;
          var targetPos = this.world.grid[this.posX][this.posY+1];
          moveToTarget(targetPos,currentPos);
          break;
        }
        case "left":{
          if(this.posX <= 0)break;
          var targetPos = this.world.grid[this.posX-1][this.posY];
          moveToTarget(targetPos,currentPos);
          break;
        }
      }

      this.drawImage();

      function moveToTarget(target,current){
        if(target.block.allowPeople && !target.hasPeople){
          target.people = current.people;
          current.people.posX = target.block.posX;
          current.people.posY = target.block.posY;
          target.hasPeople = true;
          current.people = "";
          current.hasPeople = false;
          current.block.drawImage();
        }
      }
    }

    this.makeDecision = function(){

    }
    
    this.workOnFarm = function(farm){

    }

    this.workOnHouse = function(house){

    }

    this.attack = function(people){

    }

    this.takeJob = function(job){
      if(typeof job.length != "undefined" && job.length == 0){
        console.log("no job avaliable");
        return;
      }
      console.log("takeJob");
      job.assignTo(this);
      this.jobs.push(job);
    }

  }

  return {
    'People': People,
  }
})

