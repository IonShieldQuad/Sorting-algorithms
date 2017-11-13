
//Declare variables
var i;
var mainArr = new Array();
var arrLen = 0;
var canvas = document.getElementById('canvas');
var sorting = 0;
var timeLimit = 10;
var stertTime;

//Styles
var fStyle1 = '#ddd';
var fStyle2 = '#f69';

//Get random int from range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Shuffle array
function shuffle (arr){
	var temp;
	var j;
	for (i=0; i<=arr.length-2; i++){
		j = getRandomInt(i, arr.length-1);
		temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

//Generare randomized array
function makeArr(){
	mainArr.length = 0;
	for (i = 0; i < Math.max(Math.min(document.getElementById('arrLen', 1000000).value, ), 0); i++){
		mainArr[i] = i + 1;
	}
	shuffle(mainArr);
	arrLen = mainArr.length;
	update();
}

//Updates canvas
function update(){
	var size = Math.min(canvas.width, canvas.height);
	var delta = size / arrLen;
	var ctx = canvas.getContext("2d");
	
	ctx.clearRect(0, 0, size, size); //Clears canvas
	
	for (i = 0; i < arrLen; i++){ //Draws a column
		ctx.fillStyle = fStyle1;
		ctx.fillRect(i * delta, size, delta, - (delta * (mainArr[i]) - 1));
		ctx.stroke();
		ctx.fillStyle = fStyle2;
		ctx.fillRect(i * delta, size - (delta * (mainArr[i])), delta, delta);
		ctx.stroke();
	}
}

//Toggles sorting
function toggle(){
	sorting = !sorting;
	if (sorting){
		startTime = (new Date).getTime();
		timeLimit = Math.max(Math.min((document.getElementById('limit').value), 60), 0);
		sort(document.getElementById('type').value);
	}
}

//Check if time is over limit
function checkTime(){
	if ((startTime + (1000 * timeLimit) - (new Date).getTime()) < 0){
		return false;
	}
	return true;
}

//Checks if sorted
function isSorted(arr){
	for(i = 1; i < arr.length; i++){
		if (arr[i] > arr[i-1]){
			continue;
		}
		else {
			return false;
		}
	}
	return true;
}

//Activates sort based on value
function sort(type){
	switch(type){
	case 'bogoSort':
	bogoSort(mainArr);
	break;
	}
}

//Activates on sort finish
function sortFinish(){
	sorting = false;
}

//Bogosort
function bogoSort(arr){
	while (!isSorted(arr)){
		shuffle(arr);
		update();
		if (!sorting){
			sortFinish();
			break;
		}
		if (!checkTime()){
			alert('Time limit exceeded!');
			sortFinish();
			break;
		}
	}
	sortFinish();
}