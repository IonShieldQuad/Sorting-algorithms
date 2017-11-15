
//Declare variables
var i;
var mainArr = new Array();
var arrLen = 0;
var canvas = document.getElementById('canvas');
var sorting = 0;
var timeLimit = 60;
var startTime;
var delay;
var hl = new Array();

//Styles
var fStyle1 = '#ddd';
var fStyle2 = '#f69';
var fStyle3 = '#f44';

//Gets random int from range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Swaps 2 elements in array
function swap(arr, i1, i2){
	var temp = arr[i1];
	arr[i1] = arr[i2];
	arr[i2] = temp;
}

//Shuffles array
function shuffle (arr){
	var j;
	for (i=0; i<=arr.length-2; i++){
		j = getRandomInt(i, arr.length-1);
		swap(arr, i, j);
	}
}

//Sets to highlight an index
function highlight (val){
	hl[hl.length] = val;
}

//Generates randomized array
function makeArr(){
	mainArr.length = 0;
	for (i = 0; i < Math.max(Math.min(document.getElementById('arrLen', 1000000).value, ), 0); i++){
		mainArr[i] = i + 1;
	}
	shuffle(mainArr);
	arrLen = mainArr.length;
	update();
	sorting = false;
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
	//Highlights selected indexes
	for (i = 0; i < hl.length; i++) {
		ctx.fillStyle = fStyle3;
		ctx.fillRect(hl[i] * delta, size, delta, - (delta * mainArr[hl[i]]));
		ctx.stroke();
	}
	//Resets highlight
	hl.length = 0;
}

//Toggles sorting
function toggle(){
	sorting = !sorting;
	if (sorting){
		startTime = (new Date).getTime();
		delay = Math.max(Math.min((document.getElementById('delay').value), 10000), 0);
		timeLimit = Math.max(Math.min((document.getElementById('limit').value), 3600), 0);
		sort(document.getElementById('type').value);
	}
}

//Checks if time is over limit
function checkTime(){
	if ((startTime + (1000 * timeLimit) - (new Date).getTime()) < 0){
		return false;
	}
	return true;
}

//Checks if sorted
function isSorted(arr){
	for(i = 0; i < arr.length - 1; i++){
		if (arr[i] > arr[i+1]){
			return false;
		}
	}
	return true;
}

//Activates sort based on value
function sort(type){
	switch(type){
	case 'bogoSort':
	bogoSort(mainArr, 0);
	break;
	case 'bubbleSort':
	bubbleSort(mainArr, 0, 0);
	}
}

//Activates on sort finish
function sortFinish(str){
	sorting = false;
	update();
	if (str != null){
		alert(str);
	}
}

//Checks when to terminate sort
function sortCheck(){
	if (!sorting){
			sortFinish();
			return false;
		}
		else if (!checkTime()){
			sortFinish('Time limit exceeded!');
			return false;
		}
		return true
}

//Bogosort
function bogoSort(arr, s){
	if (!isSorted(arr)){
		//Shuffle
		var j = getRandomInt(s, arr.length-1);
		swap(arr, s, j);
		highlight(s);
		highlight(j);
		update();
		if (sortCheck()){
			setTimeout(function(){bogoSort(arr, (s + 1) % (arr.length - 1));}, delay);
		}
	}
	else {sortFinish();}
}

//Bubble sort
function bubbleSort(arr, s, r){
	if (!isSorted(arr)){
		if (arr[s] > arr[s+1]){
			swap(arr, s, s+1);
		}
		highlight(s);
		highlight(s+1);
		update();
		var r1 = r;
		if (s == 0) {
			r1++;
		}
		if (sortCheck()){
			setTimeout(function(){bubbleSort(arr, (s + 1) % (arr.length - r), r1);}, delay);
		}
	}
	else {sortFinish();}
}