function people(name){

	// basic property
	this.name = name;
	if(Math.random() > 0.5)this.gender = "male";
	else this.gender = "female";
	this.age = 0;

	// money related
	this.income = 0;
	this.outcome = 0;
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
	this.actions = 0;
	this.date = 0;
	this.update = function(){

	}


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