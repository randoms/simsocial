define(['jquery', 'Chart'], function($, Chart){
  function World(context){

    this.interval = 60; // frame per update
    this.updateCount = 0;
    this.date = 0;
    this.gridMaxX = 31;
    this.gridMaxY = 23;
    this.grid =[];
    this.date = 0;
    this.context = context;
    this.flatness = 0.8;
    this.stablity = 0.98;

    var maxGrid = {
      'value': 0,
      'posX': -1,
      'posY': -1,
    };
    var minGrid = {
      'value': 1,
      'posX': -1,
      'posY': -1,
    };
    // init grid
    for(var i=0;i<this.gridMaxX;i++){
      for(var j=0;j<this.gridMaxY;j++){
        this.grid[i] = this.grid[i]||[];
        this.grid[i][j] = {
          'hasPeople': false,
          'growth': Math.random(),
        };
        this.grid[i][j].block =  new Block(this, i, j);

        if(this.grid[i][j].growth > maxGrid.value){
          maxGrid = {
            'value': maxGrid.value,
            'posX': i,
            'posY': j,
          }
        }

        if(this.grid[i][j].growth < minGrid.value){
          minGrid = {
            'value': minGrid.value,
            'posX': i,
            'posY': j,
          }
        }
      }
    }

    // 还是应该先生成随机地图，然后人为的添加大型地貌
    // 应该考虑生物对环境的影响，经常生长植物就会使土地增肥， 反之如果一直没有植物生长就会使土地流失
    // 随机生成大块无植物土地，作为城市起始
    // 生成四个边界
    var leftTopX = parseInt(Math.random()*(this.gridMaxX-6));
    var leftTopY = parseInt(Math.random()*(this.gridMaxY-6));
    for(var i=0;i<6;i++){
      for(var j=0;j<6;j++){
        new Stone(this, leftTopX+i,leftTopY + j);
      }
    }

    this.statisticRes = [];
    this.statisticRes[0] = [];
    this.statisticRes[1] = [];
    this.statisticRes[2] = [];
    this.statisticRes[3] = [];
    var myLineChart = 0;

    this.statistic = function(){
      var WetAndGood = 0;
      var WetAndBad = 0;
      var DryAndGood = 0;
      var DryAndBad = 0;

      for(var i=0;i<this.gridMaxX; i++){
        for(var j=0; j<this.gridMaxY; j++){
          if(this.grid[i][j].block.type == "tree"){
            var block = this.grid[i][j].block;
            // change image by different params
            if(block.improveRate > 0 && block.geneEnvironment > 0){
              WetAndGood ++;
            }
            if(block.improveRate < 0 && block.geneEnvironment > 0){
              WetAndBad ++;
            }
            if(block.improveRate > 0 && block.geneEnvironment < 0){
              DryAndGood ++;
            }
            if(block.improveRate < 0 && block.geneEnvironment < 0){
              DryAndBad ++;
            }
          }
        }
      }
      /*
      this.statisticRes[0].push(WetAndGood);
      this.statisticRes[1].push(WetAndBad);
      this.statisticRes[2].push(DryAndGood);
      this.statisticRes[3].push(DryAndBad);*/

      Chart.defaults.global.responsive = true;
      Chart.defaults.global.animation = false;
      Chart.defaults.global.scaleShowLabels = false;
      Chart.defaults.global.pointDot = false;

      // draw chart
      var labels = [];
      for(var i=0,length = this.statisticRes[0].length;i<length; i++){
        labels.push("");
      }
      var data = {
        'labels': labels,
        'datasets': [
          {
            label: "WetAndGood",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: this.statisticRes[0]
          },
          {
            label: "WetAndBad",
            fillColor: "rgba(180,180,180,0.2)",
            strokeColor: "rgba(180,180,180,1)",
            pointColor: "rgba(180,180,180,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(180,180,180,1)",
            data: this.statisticRes[1]
          },
          {
              label: "DryAndGood",
              fillColor: "rgba(151,187,205,0.2)",
              strokeColor: "rgba(151,187,205,1)",
              pointColor: "rgba(151,187,205,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(151,187,205,1)",
              data: this.statisticRes[2]
          },
          {
              label: "DryAndBad",
              fillColor: "rgba(121,157,175,0.2)",
              strokeColor: "rgba(121,157,175,1)",
              pointColor: "rgba(121,157,175,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(121,157,175,1)",
              data: this.statisticRes[3]
          }
        ]
      }
      this.chart = this.chart||new Chart($("#chart")[0].getContext("2d")).Line(data,{pointDot:false,scaleShowLabels:false});
      this.chart.addData([WetAndGood,WetAndBad,DryAndGood,DryAndBad], "");
      console.log(this.chart.datasets[0].points.length);
      if(this.chart.datasets[0].points.length > 100)this.chart.removeData();
      
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

      //this.statistic();
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
    this.improveRate = -0.001;


    this.type = "blank";
    this.background = "";
    this.degradeBlock = Block;
    this.growBlock = Block;

    this.world = world;
    this.date = 0;
    this.posX = posX;
    this.posY = posY;

    world.grid[posX][posY].block = this;

    this.drawImage = function(){
      // draw block image
      if(this.type == "blank"){
        // draw white
        var context = this.world.context;
        context.beginPath();
        context.rect(this.posX*20+10+2, this.posY*20 +10 +2, 16, 16);
        /*
        if(this.world.grid[posX][posY].growth > 0.9){
          var mcolor = parseInt(this.world.grid[posX][posY].growth*255);
          //console.log(this.world.grid[posX][posY]);
          context.fillStyle = "rgb(0,"+ mcolor +",0)";//rgb(0, this.world.grid[posX][posY].growth*255, 0);
        }else if(this.world.grid[posX][posY].growth < 0.1){
           context.fillStyle = "#212121";
        }else{
          context.fillStyle = "#FFFFFF";
        }*/
        context.fillStyle = "#FFFFFF";
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
    }

    this.drawImage();

    this.update = function(){
      if(this.date == this.world.date)return; // already updated
      this.date = this.world.date;
      this.world.grid[posX][posY].growth += this.improveRate;
      if(this.world.grid[posX][posY].growth < 0)this.world.grid[posX][posY].growth = 0;
      if(this.world.grid[posX][posY].growth > 1)this.world.grid[posX][posY].growth =1;

      if(this.growth<0)this.growth=0;
      if(this.type == "blank"){
        //this.drawImage();
        return;
      }
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
          new this.growBlock(this.world, randomsPos.posX + this.posX -1, randomsPos.posY + this.posY -1, this);
        }
      }

      // 

    }
  }


  function Stone(world, posX, posY){

    Block.apply(this, arguments);
    this.allowPeople = true;

    this.collectRate = 50;

    this.type = "stone";
    this.background = "../img/block.svg";
    this.drawImage();

  }


  function Tree(world, posX, posY, parent){

    Block.apply(this, arguments);
    if(typeof parent == "undefined")this.gene = new Gene();
    else this.gene = parent.gene.getNext();
    this.allowPeople = false;


    this.genelife = this.gene.getPhenotype("tear")*100;
    this.geneEnvironment = 2*(0.5 - this.gene.getPhenotype("environment")); // 环境影响率 -1 - 1
    this.geneGrowth = 4 + 5*this.gene.getPhenotype("geneGrowth");
    this.geneImproveRate = -0.005 + 0.01*this.gene.getPhenotype("improveRate");

    this.collectRate = 100;
    // 环境因素

    var envGrowth = this.world.grid[posX][posY].growth;
    this.geneTear = 100/this.genelife;
    this.tear += this.geneTear*(1 - 2*(envGrowth-0.5)*this.geneEnvironment);
    this.growth += this.geneGrowth*(1 + 2*(envGrowth-0.5)*this.geneEnvironment);
    this.improveRate = this.geneImproveRate;
    if(this.tear<0)this.tear=0;
    if(this.growth<0)this.growth=0;

    this.type = "tree";
    this.background = "../img/tree1.svg";
    this.growBlock = Tree;

    // change image by different params
    if(this.improveRate > 0 && this.geneEnvironment > 0){
      this.background = "../img/tree18.svg";
    }
    if(this.improveRate < 0 && this.geneEnvironment > 0){
      this.background = "../img/tree7.svg";
    }
    if(this.improveRate > 0 && this.geneEnvironment < 0){
      this.background = "../img/tree14.svg";
    }
    if(this.improveRate < 0 && this.geneEnvironment < 0){
      this.background = "../img/tree1.svg";
    }

    this.drawImage();

    console.log("*****");
    console.log("tear:" + this.tear);
    console.log("growth:" + this.growth);
    console.log("improveRate:" + this.improveRate);
    console.log("environment:" + this.geneEnvironment);

  }

  function TallTree(world, posX, posY, parentTear, parentGrowth, parentImproveRate){
    Tree.apply(this, arguments);
    this.background = "../img/tree7.svg";
    this.growBlock = TallTree;
    this.drawImage();
  }


  function Farm(world, posX, posY, gene){

    Block.apply(this, arguments);

    this.allowPeople = true;
    this.gene = gene|| new Gene();

    this.collectRate = 1;
    this.geneTear = 0.1*this.gene.getPhenotype("tear");
    this.geneProduceRate = 2*this.gene.getPhenotype("produceRate");
    this.product = "bread";
    this.productNum = 0;
    this.repaircost = 1;
    this.upgradeCost = 2;

    this.produceRate = 2*this.productRate*(this.world.grid[posX][posY].growth - 0.5);
    

    this.collect = function(){
      var mproductNum = this.productNum;
      this.productNum = 0;
      return mproductNum;
    }

    this.repair = function(){
      
    }

    this.upgrade = function(){
      this.productRate += 0.02;
    }

    this.getSeed = function(){

    }

    this.update = function(){
      this.prototype.update();
      this.productNum += this.productRate;
    }

  }


  function Gene(parents){
    this.mutationRate = 0.01;
    this.crossoverRate = 0.7;
    this.geneLength = 2000; // gene 20bit
    this.phenoLength = 10;
    this.phenoList = {};

    if(typeof parents != "undefined"){
      this.dna = parents;
    }else{
      this.dna = "";
      for(var i=0;i<this.geneLength;i++){
        if(Math.random() > 0.5)this.dna += "1";
        else this.dna += 0;
      }
    }

    this.mutation = function(){
      // 开始变异
      for(var i=0;i<this.geneLength;i++){
        if(Math.random() < this.mutationRate){
          if(this.dna.charAt(i) == "1"){
            this.dna = replacePos(this.dna, i, "0");
          }
          else this.dna = replacePos(this.dna, i, "1");
        }
      }
    }
    this.mutation();

    this.getPhenotype = function(name){
      // 输入一个0-1的数，返回一个0-1的数
      // 起始位置
      var code = Math.random();
      if(this.phenoList.hasOwnProperty(name)){
        code = this.phenoList[name];
      }else{
        this.phenoList[name] = code;
      }
      var start = parseInt(code*this.geneLength);
      var mnum = this.dna.substring(start, start + this.phenoLength);
      return parseInt(mnum, 2)/Math.pow(2, 10);
    }

    this.getNext = function(mate){
      var child = new Gene(this.dna);
      child.phenoList = this.phenoList;
      return child;
    }

    this.crossover = function(mateGene){
      // merge phenoList
      $.extend(this.phenoList, mateGene.phenoList);
      mateGene.phenoList = this.phenoList;

      // random start point
      var start = parseInt(Math.random()*this.geneLength);
      var tempDna = this.dna.substring(start);
      if(Math.random() < this.crossoverRate){
        this.dna = this.dna.substring(0,start) + mateGene.dna.substring(start);
        mateGene.dna = mateGene.dna.substring(0,start) + tempDna;
      }

    }

    this.matewith = function(mate){
      var mchild = this.getNext();
      var mateChild = mate.getNext();
      mchild.crossover(mateChild);
      if(Math.random() > 0.5){
        return mchild;
      }else{
        return mateChild;
      }
      
    }

    function replacePos(strObj, pos, replacetext){
       var str = strObj.substr(0, pos-1) + replacetext + strObj.substring(pos, strObj.length);
       return str;
    }
  }

  function Door(){

    this.allowPeople = true;

    this.collectRate = 100;
  }

  return {
    'World': World,
    'Block': Block,
    'Stone': Stone,
    'Tree': Tree,
    'TallTree': TallTree,
    'Farm': Farm,
    'Door': Door,
    'Gene': Gene,
  }

})