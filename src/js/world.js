define(['jquery'], function($){
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

    // 人为的增加涨落
    // 找到最偏离平均值的地方， 在这个点周围人为的再增加偏离值
    for(var i=0; i<3; i++){
      for(var j=0; j<3;j++){
        if(i+maxGrid.posX-1 < 0 || i+maxGrid.posX-1 >= this.gridMaxX ||
          j+maxGrid.posY-1 < 0 || j+maxGrid.posY-1 >= this.gridMaxY){
          continue;
        }
        this.grid[i+maxGrid.posX-1][j+maxGrid.posY-1].growth += (1 - this.flatness);
        if(this.grid[i+maxGrid.posX-1][j+maxGrid.posY-1].growth > 1)
          this.grid[i+maxGrid.posX-1][j+maxGrid.posY-1].growth = 1;
      }
    }

    for(var i=0; i<3; i++){
      for(var j=0; j<3;j++){
        if(i+minGrid.posX-1 < 0 || i+minGrid.posX-1 >= this.gridMaxX ||
          j+minGrid.posY-1 < 0 || j+minGrid.posY-1 >= this.gridMaxY){
          continue;
        }
        this.grid[i+minGrid.posX-1][j+minGrid.posY-1].growth -= (1 - this.flatness);
        if(this.grid[i+minGrid.posX-1][j+minGrid.posY-1].growth < 0)
          this.grid[i+minGrid.posX-1][j+minGrid.posY-1].growth = 0;
      }
    }

    // 高斯滤镜

    // 还是应该先生成随机地图，然后人为的添加大型地貌
    // 应该考虑生物对环境的影响，经常生长植物就会使土地增肥， 反之如果一直没有植物生长就会使土地流失



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

      // world change
      // change landscape
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
    this.allowPeople = false;

    this.collectRate = 50;

    this.type = "stone";
    this.background = "../img/block.svg";

  }


  function Tree(world, posX, posY, parent){

    Block.apply(this, arguments);
    if(typeof parent == "undefined")this.gene = new Gene();
    else this.gene = parent.gene.getNext();
    this.allowPeople = false;


    this.genelife = this.gene.getPhenotype("tear")*100;
    this.geneEnvironment = 0.6 + 0.4*this.gene.getPhenotype("environment"); // 环境影响率 0.6 -1
    this.geneGrowth = 4 + 5*this.gene.getPhenotype("geneGrowth");
    this.geneImproveRate = -0.002 + 0.01*this.gene.getPhenotype("improveRate");

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


  function Farm(world, posX, posY){

    Block.apply(this, arguments);

    this.allowPeople = false;


    this.collectRate = 1;
    this.variationRate = 0.2;
    this.tear = 0.1;
    this.product = "bread";
    this.productNum = 0;
    this.repaircost = 1;
    this.upgradeCost = 2;
    this.productRate = this.world.grid[posX][posY].growth/100;

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

    this.getSeed

    this.update = function(){
      this.prototype.update();

    }

  }


  function Gene(parents){
    this.mutationRate = 0.02;
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