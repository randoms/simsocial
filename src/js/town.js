define(['world'], function(World){

  function Town(world, posX, posY, name){

    this.name = name;
    this.people = [];
    this.income = 0;
    this.outcome = 0;
    this.houses = [];
    this.farms = [];
    this.breads = 0;
    this.averageMoney = 0;
    this.unemploymentRate = 0;
    this.meanness = Math.random(); // this variable discribe how mean the town is.
    this.friendNess = Math.random(); // this describe friendness to other towns
    this.braveNess = Math.random(); // this describe if the town is willing to take risk
    
    this.rentingPrice = 0; // renting money of the house
    this.neighbor = []; // the info about nearby town

    // town info
    this.info = []; // map info the town has collected

    // update related
    this.date = 0; // the date of the town

    // world related
    this.world = world;
    this.posX = posX;
    this.posY = posY;


    for(var i=0;i<6;i++){
      for(var j=0;j<6;j++){
        new World.Stone(this.world, posX+i,posY + j);
      }
    }

    this.update = function(){
      // this function update the status of the town, including income, outcome, people, working people,
      // update after all people in it updated
    }

    this.makeDecision = function(){
      // this function give a list of jobs
      // return new Patrol(this, 1, {'left': 12, 'top':8, 'width': 6, 'height': 6}, 50);
      // evalute current status
      
      // generate current work list
    }
  }

  function Job(from, income, type){

    this.type = type;
    this.income = income;
    this.from = from;
    this.status = "unassigned";

    this.assignTo = function(people){
      this.to = people;
      this.status = "assigned";
    }

  }

  function Patrol(from, income, area, updateInterval){
    Job.apply(this, from, income, "patrol");

    this.patrolArea = area;
    this.patrolRecord = [];
    this.updateInterval = updateInterval;

    for(var i=0;i<area.width;i++){
      for(var j=0;j<area.height; j++){
        this.patrolRecord.push({
          'updateTime': 0,
          'posX': area.left + i,
          'posY': area.top + j,
        });
      }
    }

    

    this.work = function(){

      // statistic target location
      
      var targetCount = {
        'up': 0,
        'right': 0,
        'down': 0,
        'left': 0,
      };

      for(var i=0,length=this.patrolRecord.length; i<length; i++){
        var updateTime = this.patrolRecord[i].updateTime;
        if(updateTime < this.to.date - this.updateInterval || updateTime === 0){
          // need to update
          var posX = this.patrolRecord[i].posX;
          var posY = this.patrolRecord[i].posY;
          var relativePosX = posX - this.to.posX;
          var relativePosY = -(posY - this.to.posY); // Y axis is down

          if(relativePosY - relativePosX >= 0 && relativePosX + relativePosY >= 0){
            targetCount.up ++;
          }

          if(relativePosX - relativePosY >= 0 && relativePosX + relativePosY >= 0){
            targetCount.right ++;
          }
          if(relativePosX - relativePosY >= 0 && relativePosX + relativePosY <= 0){
            targetCount.down ++;
          }
          if(relativePosY - relativePosX >= 0 && relativePosX + relativePosY <= 0){
            targetCount.left ++;
          }
        }
      }

      // consider personality effect
      // 个性如何影响任务


      var total = targetCount.up + targetCount.right + targetCount.down + targetCount.left;
      if(total === 0){
        return;
      }
      var upPosibility = targetCount.up/total;
      var rightPosibility = targetCount.right/total;
      var downPosibility = targetCount.down/total;
      var leftPosibility = targetCount.left/total;
      var choice = Math.random();
      if(choice < upPosibility){
        this.to.move('up');
      }else if(choice < upPosibility + rightPosibility){
        this.to.move('right');
      }else if(choice < upPosibility + rightPosibility + downPosibility){
        this.to.move('down');
      }else{
        this.to.move('left');
      }
      
      // update neightbour info
      for(var i =-1; i<2; i++){
        for(var j=-1; j<2; j++){
          if(!isTargetArea(this.to.posX + i, this.to.posY + j, area))continue;
          for(var k=0,length=this.patrolRecord.length; k<length; k++){
            if(this.patrolRecord[k].posX == this.to.posX + i && this.patrolRecord[k].posY == this.to.posY + j){
              this.patrolRecord[k].updateTime = this.to.date;
              this.patrolRecord[k].record = this.to.world.grid[this.patrolRecord[k].posX][this.patrolRecord[k].posY].block.getRecord();
            }
          }
        }
      }
    }


    function isTargetArea(posX, posY, area){
      if(posX >= area.left && posX <= area.left + area.width && posY >= area.top && posY <= area.top + area.height){
        return true;
      }else{
        return false;
      }
    }

    this.cancel = function(){

    }
  }

  return {
    'Town': Town,
  }
})


