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
    this.publishedJobs = []; // jobs has been published, but still not been applied


    this.getUnfressness = function(posX, posY){
      if(this.info.length == 0)
        return 1;
      var res = "";
      _(this.info).each(function(item){
        if(item.posX == posX && item.posY == posY){
          res = item.unfreshness;
        }
      })
      if(res == "")
        return 1;
      return res;
    }

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
      if(this.date == this.world.date)
        return;
      this.date = this.world.date;
      this.makeDecision();
    }

    this.makeDecision = function(){
      // this function give a list of jobs
      //return new Patrol(this, 1, {'left': 12, 'top':8, 'width': 6, 'height': 6}, 50);
      // evalute current status
      calculateUnfreshness();
      console.log('unfreshness', this.infoUnfreshness);
      // TODO: personality related
      // calculate infomation freshness
      // generate current work list
      if(this.infoUnfreshness > 0.8){
        // need someone to gather infomation
        if(this.publishedJobs.length == 0)
          this.publishedJobs = [new Patrol(this, 1, {'left': this.posX - 1, 'top': this.posY - 1, 'width': 8, 'height': 8}, 0.8)];
      }else {
        this.publishedJobs = [];
      }
      return this.publishedJobs;
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
              continue;
            }
            that.info.push({
              'updateTime': 0,
              'record': {},
              'pos':{
                'posX': that.posX + i - 1,
                'posY': that.posY + j - 1,
              },
              'unfreshness': 1,
            })
          }
        }
      }

      // start calculation
      var unfreshness = _(that.info).map(function(item){
        var timeDiff = that.date - item.updateTime;
        timeDiff = timeDiff / 20;
        var blockUnfreshness = 1 - 2/(Math.exp(timeDiff) + Math.exp(-timeDiff));
        return blockUnfreshness;
      })
      for(var i=0,length=that.info.length;i<length;i++){
        that.info[i].unfreshness = unfreshness[i];
      }
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

  function Patrol(from, income, area, unfreshness){
    Job.apply(this, [from, income, "patrol"]);
    this.patrolArea = area;
    this.patrolRecord = [];
    this.unfreshness = unfreshness;

    for(var i=0;i<area.width;i++){
      for(var j=0;j<area.height; j++){
        this.patrolRecord.push({
          'updateTime': 0,
          'posX': area.left + i,
          'posY': area.top + j,
          'unfreshness': 1,
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
        var unfreshness = this.patrolRecord[i].unfreshness;
        if(unfreshness > this.unfreshness){
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
        this.lastMove = "up";
      }else if(choice < upPosibility + rightPosibility){
        this.to.move('right');
        this.lastMove = "right";
      }else if(choice < upPosibility + rightPosibility + downPosibility){
        this.to.move('down');
        this.lastMove = "down";
      }else{
        this.to.move('left');
        this.lastMove = "left";
      }

      var that = this;
      
      // update neightbour info
      for(var i =-1; i<2; i++){
        for(var j=-1; j<2; j++){
          if(!isTargetArea(this.to.posX + i, this.to.posY + j, area))continue;
          for(var k=0,length=this.patrolRecord.length; k<length; k++){
            if(this.patrolRecord[k].posX == this.to.posX + i && this.patrolRecord[k].posY == this.to.posY + j){
              this.patrolRecord[k].updateTime = this.to.date;
              this.patrolRecord[k].record = this.to.world.grid[this.patrolRecord[k].posX][this.patrolRecord[k].posY].block.getRecord();
              // update unfreshness from towm
              this.patrolRecord[k].unfreshness = this.from.getUnfressness(this.patrolRecord[k].posX, this.patrolRecord[k].posY);
            }
          }

          // update town record
          for(var k=0,length=this.from.info.length;k<length;k++){
            if(this.from.info[k].pos.posX == this.to.posX + i && this.from.info[k].pos.posY == this.to.posY + j){
              this.from.info[k].updateTime = this.to.date;
              this.from.info[k].record = this.to.world.grid[this.from.info[k].pos.posX][this.from.info[k].pos.posY].block.getRecord();
            }
          }
          // update people record
          // is this needed?
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


