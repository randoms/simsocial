function town(name){

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
	this.neighbor = []; // the info about town nearby
	this.date = 0; // the date of the town

	this.update = function(){
		// this function update the status of thwe town, including income, outcome, people, working people,
		// update after all people in it updated
	}

	this.makeDecision = function(){
		// this function give a list of jobs
	}
}