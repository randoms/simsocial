define(['world', 'utils'], function(World, Utils){

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

    // town info, including product rate, items, etc in each block
    this.info = []; // map info the town has collected
    this.infoUnfreshness = 1; // represent the unfreshness of info, in range [0,1]
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
    // add to world update list
    this.world.updateTargetList.push(this);

    this.update = function(){
      // this function update the status of the town, including income, outcome, people, working people,
      // update after all people in it updated
      console.log("updated");
      this.makeDecision();
      this.date ++;
    }

    this.makeDecision = function(){
      // this function give a list of jobs
      //return new Patrol(this, 1, {'left': 12, 'top':8, 'width': 6, 'height': 6}, 50);
      // evalute current status
      calculateUnfreshness();
      console.log('unfreshness', this.infoUnfreshness);
      // TODO: personality related
      if(this.infoUnfreshness > 0.8){
        // need someone to gather infomation
        return [new Patrol(this, 1, {'left': this.posX - 1, 'top': this.posY - 1, 'width': 8, 'height': 8}, 50)];
      }
      return [];
      // calculate infomation freshness
      // generate current work list
    }

    var that = this;
    function calculateUnfreshness(){
      // nearby blocks in the town
      if(that.info.length == 0){
        // first time to calculate
        // get target grids
        for(var i=0;i<8;i++){
          for(var j=0;j<8;j++){
            if(that.posX + i -1 < 0 || that.posX + i -1 > that.world.gridMaxX
              || that.posY + j -i < 0 || that.posY + j -1 > that.world.gridMaxY){
              // exceed the world limit
              break;
            }
            that.info.push({
              'lastUpdateTime': 0,
              'content': {},
              'pos':{
                'posX': 1,
                'posY': 1,
              }
            })
          }
        }
      }

      // start calculation
      var unfreshness = _(that.info).map(function(item){
        var timeDiff = that.date - item.lastUpdateTime;
        var blockUnfreshness = 1 - 2/(Math.exp(timeDiff) + Math.exp(-timeDiff));
        return blockUnfreshness;
      })
      that.infoUnfreshness =  Utils.average(unfreshness);
      return that.infoUnfreshness;
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


