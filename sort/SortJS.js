
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
var hlp = new Array();
var hls = new Array();

//Styles
var fStyle1 = '#ddd';
var fStyle2 = '#f69';
var fStyle3 = '#f44';
var fStyle4 = '#4f4';
var fStyle5 = '#f4f';

//Gets random int from range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Sign alternator
function signAlt(val){
	if (val % 2) {
		return -1;
	}
	return 1;
}

//Swaps 2 elements in array
function swap(arr, i1, i2){
	var temp = arr[i1];
	arr[i1] = arr[i2];
	arr[i2] = temp;
}

//Inserts element into array
function insert(arr, i1, val){
	var i2;
	for (i2 = arr.length; i2 > i1; i2--){
		arr[i2] = arr[i2-1];
	}
	arr[i1] = val;
}

//Removes element from array
function remove(arr, i1){
	var i2;
	for (i2 = i1; i2 < arr.length - 1; i2++){
		arr[i2] = arr[i2+1];
	}
}

//Moves element in array with shifting
function move(arr, i1, i2){
	var l;
	if (i1 > i2){
		var temp = arr[i1];
		for (l = i1; l > i2; l--){
			arr[l] = arr[l-1];
		}
		arr[i2] = temp;
	}
	else {
		var temp = arr[i1];
		for (l = i1; l < i2; l++){
			arr[l] = arr[l+1];
		}
		arr[i2] = temp;
	}
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
function highlight (val, p){
	if (p != null){
		switch (p){
			case 1:
			hlp[hlp.length] = val;
			break;
			
			case 2:
			hls[hls.length] = val;
			break;
			
			default:
			hl[hl.length] = val;
		}
	}
	else {
		hl[hl.length] = val;
	}
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
	for (i = 0; i < hlp.length; i++) {
		ctx.fillStyle = fStyle4;
		ctx.fillRect(hlp[i] * delta, size, delta, - (delta * mainArr[hlp[i]]));
		ctx.stroke();
	}
	for (i = 0; i < hls.length; i++) {
		ctx.fillStyle = fStyle5;
		ctx.fillRect(hls[i] * delta, size, delta, - (delta * mainArr[hls[i]]));
		ctx.stroke();
	}
	//Resets highlight
	hl.length = 0;
	hlp.length = 0;
	hls.length = 0;
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
		break;
	
		case 'combSort':
		combSort(mainArr, 0, 0);
		break;
	
		case 'cocktailSort':
		cocktailSort(mainArr, 0, 0);
		break;
		
		case 'insertionSort':
		insertionSort(mainArr, 0, 0);
		break;
		
		case 'gnomeSort':
		gnomeSort(mainArr, 0);
		break;
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
			highlight(s, 1);
			highlight(s+1, 1);
		}
		highlight(s);
		highlight(s+1);
		highlight(arr.length + 1 - r, 2);
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

//Comb sort
function combSort(arr, s, r){
	if (!isSorted(arr)){
		var r1 = r;
		if (s == 0) {
			r1++;
		}
		var g = Math.ceil(arr.length / Math.pow(1.3, r1 + 1));
		if (arr[s] > arr[s + g]){
			swap(arr, s, s + g);
			highlight(s, 1);
			highlight(s + g, 1);
		}
		highlight(s);
		highlight(s + g);
		update();
		if (sortCheck()){
			setTimeout(function(){combSort(arr, (s + 1) % (arr.length - g), r1);}, delay);
		}
	}
	else {sortFinish();}
}

//Cocktail sort
function cocktailSort(arr, s, r){
	if (!isSorted(arr)){
		if (arr[s] > arr[s+1]){
		swap(arr, s, s+1);
		highlight(s, 1);
		highlight(s+1, 1);
		}
		highlight(s);
		highlight(s+1);
		highlight(Math.floor(r/2)-1, 2);
		highlight(arr.length - Math.ceil(r/2), 2);
		update();
		var r1 = r;
		if (((s <= r/2 + 1)&&(signAlt(r) < 0))||((s >= arr.length - r/2 - 3)&&(signAlt(r) > 0))) {
			r1++;
		}
		if (sortCheck()){
			setTimeout(function(){cocktailSort(arr, (s + signAlt(r)) % (arr.length - 1), r1);}, delay);
		}
	}
	else {sortFinish();}
}

//Gnome sort
function gnomeSort(arr, s){
	if (!isSorted(arr)){
		var b = false;
		if (arr[s] > arr[s+1]){
			swap(arr, s, s+1);
			highlight(s, 1);
			highlight(s+1, 1);
			b = true;
		}
		highlight(s);
		highlight(s+1);
		update();
		if (sortCheck()){
			if (!b){
				setTimeout(function(){gnomeSort(arr, (s + 1) % (arr.length - 1));}, delay);
			}
			else {
				setTimeout(function(){gnomeSort(arr, (s - 1) % (arr.length - 1));}, delay);
			}
		}
	}
	else {sortFinish();}
}

//Insertion sort
function insertionSort(arr, s, r){
	if (!isSorted(arr)){
		var r1 = r;
		var n = false;
		if (arr[s+1] < arr[s]){
			swap(arr, s+1, s);
			highlight(s);
			highlight(s+1);
		}
		else {
			n = true;
			r1++;
			highlight(s+1, 1);
		}
		highlight(r+1, 2);
		update();
		if (sortCheck()){
			if (!n){
				setTimeout(function(){insertionSort(arr, (s - 1) % (arr.length - 1), r1);}, delay);
			}
			else {
				setTimeout(function(){insertionSort(arr, (r1-1) % (arr.length - 1), r1);}, delay);
			}
		}
	}
	else {sortFinish();}
}