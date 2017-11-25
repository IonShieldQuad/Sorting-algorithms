
//Declare variables
var i;
var mainArr = new Array();
var arrLen = 0;
var canvas = document.getElementById('canvas');
var sorting = 0;
var timeLimit = 60;
var startTime;
var delay;
var animHdl;
var animOffset = 0;
var hl = new Array();
var hlp = new Array();
var hls = new Array();

//Styles
var fStyle0 = '#444'; //Background
var fStyle1 = '#ddd'; //Bars
var fStyle2 = '#f69'; //Dots
var fStyle3 = '#f44'; //Highlight
var fStyle4 = '#4f4'; //Highlight alt
var fStyle5 = '#f4f'; //Highlight special

//Updates colors from menu
function colorsUpdate(){
	var colorMenu = document.getElementById('colorMenu');
	if (colorMenu.style.visibility == 'visible'){
		fStyle0 = document.getElementById('colorBG').value;
		fStyle1 = document.getElementById('colorBars').value;
		fStyle2 = document.getElementById('colorDots').value;
		fStyle3 = document.getElementById('colorHL').value;
		fStyle4 = document.getElementById('colorHLP').value;
		fStyle5 = document.getElementById('colorHLS').value;
		colorMenu.style.visibility = 'collapse';
		update();
	}
	else {
		colorMenu.style.visibility = 'visible';
	}
}

//Updates status box
function updateStat(key, str){
	var statBar = document.getElementById('statBar');
	var statText = document.getElementById('status');
	var barStyle0 = '#232'; //Idle
	var barStyle1 = '#2fd'; //Finished
	var barStyle2 = '#f42'; //Error
	var barStyle3 = '#222'; //Running 0
	var barStyle4 = '#2f2'; //Running 1
	switch (key){
		case 0:
		statBar.style.background = barStyle0;
		statText.innerHTML = 'Idling';
		break;
		
		case 1:
		statBar.style.background = barStyle1;
		statText.innerHTML = 'Finished sorting in ' + ((new Date).getTime() - startTime) / 1000 + ' seconds';
		break;
		
		case 2:
		statBar.style.background = barStyle2;
		statText.innerHTML = 'Error: ' + str;
		break;
		
		case 3:
		statBar.style.background = ('linear-gradient(to right, '+ barStyle3 +'0%,'+ barStyle4 +'50%,'+ barStyle3 +'100%)');
		statText.innerHTML = 'Sorting with ' + str;
		animHdl = setInterval(function(){animTick(statBar, barStyle3, barStyle4)}, 100);
		animOffset = 0;
		break;
	}
	if (key != 3){
		animOffset = -1;
	}
}

//Animation refresh
function animTick(ref, s0, s1){
	if (animOffset < 0){
		clearInterval(animHdl);
	}
	else {
		ref.style.background = ('linear-gradient(to right, '+s0+' '+(animOffset-100)%200+'%,'+s1+' '+(animOffset-50)%200+'%,'+s0+' '+animOffset%200+'%,'+s1+' '+(animOffset+50)%200+'%,'+s0+' '+(animOffset+100)%200+'%)');
		animOffset += 10;
		animOffset %= 100;
	}
}

//Gets random int from range
function getRandomInt(min, max){
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
	sorting = false;
	mainArr.length = 0;
	arrLen = Math.max(Math.min(document.getElementById('arrLen').value, 10000), 0);
	document.getElementById('arrLen').value = arrLen;
	switch(document.getElementById('arrMethod').value){
		case 'linear':
		for (i = 0; i < arrLen; i++){
			mainArr[i] = i + 1;
		}
		shuffle(mainArr);
		break;
		
		case 'random':
		for (i = 0; i < arrLen; i++){
			mainArr[i] = getRandomInt(1, arrLen);
		}
		shuffle(mainArr);
		break;
		
		case 'sorted':
		for (i = 0; i < arrLen; i++){
			mainArr[i] = i + 1;
		}
		break;
		
		case 'reverse':
		for (i = 0; i < arrLen; i++){
			mainArr[i] = arrLen - i;
		}
		break;
	}
	update();
	updateStat(0);
}

//Updates canvas
function update(){
	var size = Math.min(canvas.width, canvas.height);
	var delta = size / arrLen;
	var ctx = canvas.getContext("2d");
	
	ctx.fillStyle = fStyle0;
	ctx.fillRect(0, 0, size, size); //Clears canvas
	
	for (i = 0; i < arrLen; i++){ //Draws a column
		ctx.fillStyle = fStyle1;
		ctx.fillRect(i * delta, size, delta, - (delta * (mainArr[i]) - 1));
		ctx.fillStyle = fStyle2;
		ctx.fillRect(i * delta, size - (delta * (mainArr[i])), delta, delta);
	}
	//Highlights selected indexes
	for (i = 0; i < hl.length; i++) {
		ctx.fillStyle = fStyle3;
		ctx.fillRect(hl[i] * delta, size, delta, - (delta * mainArr[hl[i]]));
	}
	for (i = 0; i < hlp.length; i++) {
		ctx.fillStyle = fStyle4;
		ctx.fillRect(hlp[i] * delta, size, delta, - (delta * mainArr[hlp[i]]));
	}
	for (i = 0; i < hls.length; i++) {
		ctx.fillStyle = fStyle5;
		ctx.fillRect(hls[i] * delta, size, delta, - (delta * mainArr[hls[i]]));
	}
	ctx.stroke();
	//Resets highlight
	hl.length = 0;
	hlp.length = 0;
	hls.length = 0;
}

//Toggles sorting
function toggle(){
	if (mainArr.length > 0){
		sorting = !sorting;
		if (sorting){
			startTime = (new Date).getTime();
			delay = Math.max(Math.min((document.getElementById('delay').value), 10000), 0);
			document.getElementById('delay').value = delay;
			timeLimit = Math.max(Math.min((document.getElementById('limit').value), 3600), 0);
			document.getElementById('limit').value = timeLimit;
			sort(document.getElementById('type').value);
		}
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
		updateStat(3, 'Bogosort');
		break;
	
		case 'bubbleSort':
		bubbleSort(mainArr, 0, 0, false);
		updateStat(3, 'Bubble sort');
		break;
	
		case 'combSort':
		combSort(mainArr, 0, 0, false);
		updateStat(3, 'Comb sort');
		break;
	
		case 'cocktailSort':
		cocktailSort(mainArr, 0, 0, false);
		updateStat(3, 'Cocktail sort');
		break;
		
		case 'insertionSort':
		insertionSort(mainArr, 0, 0);
		updateStat(3, 'Insertion sort');
		break;
		
		case 'gnomeSort':
		gnomeSort(mainArr, 0);
		updateStat(3, 'Gnome sort');
		break;
		
		case 'radixLSDSort':
		radixLSDSort(mainArr, 0, 0, 0, 0);
		updateStat(3, 'Radix LSD sort');
		break;
	}
}

//Activates on sort finish
function sortFinish(code, str){
	sorting = false;
	update();
	/*if (str != null && code != 0){
		alert(str);
	}*/
	switch (code){
		case 0:
		updateStat(1);
		break;
		
		case 1:
		updateStat(2, str);
		break;
		
		case 2:
		updateStat(2, str);
		break;
		
		default:
		updateStat(2, 'Unknown error');
	}
}

//Checks when to terminate sort
function sortCheck(){
	if (!sorting){
			sortFinish(1, 'Stopped by user');
			return false;
		}
		else if (!checkTime()){
			sortFinish(2, 'Time limit exceeded');
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
	else {sortFinish(0);}
}

//Bubble sort
function bubbleSort(arr, s, r, end){
	if (!(end && s == 0)){
		var end0 = end;
		if (arr[s] > arr[s+1]){
			swap(arr, s, s+1);
			highlight(s, 1);
			highlight(s+1, 1);
			end0 = false;
		}
		highlight(s);
		highlight(s+1);
		highlight(arr.length + 1 - r, 2);
		update();
		var r0 = r;
		if (s == 0) {
			r0++;
			end0 = true;
		}
		if (sortCheck()){
			setTimeout(function(){bubbleSort(arr, (s + 1) % (arr.length - r), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Comb sort
function combSort(arr, s, r, end){
	if (!(end && s == 0  && Math.ceil(arr.length / Math.pow(1.3, r + 1)) <= 1)){
		var end0 = end;
		var r0 = r;
		if (s == 0) {
			r0++;
			end0 = true;
		}
		var g = Math.ceil(arr.length / Math.pow(1.3, r0 + 1));
		if (arr[s] > arr[s + g]){
			swap(arr, s, s + g);
			highlight(s, 1);
			highlight(s + g, 1);
			end0 = false;
		}
		highlight(s);
		highlight(s + g);
		update();
		if (sortCheck()){
			setTimeout(function(){combSort(arr, (s + 1) % (arr.length - g), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Cocktail sort
function cocktailSort(arr, s, r, end){
	if (r < arr.length && !(end && (s == Math.floor((arr.length - 1) / 2))&&((signAlt(r) > 0)))){
		var end0 = end;
		var r0 = r;
		if (((s <= Math.floor(r/2) + 1)&&(signAlt(r) < 0))||((s >= arr.length - Math.ceil(r/2) - 3)&&(signAlt(r) > 0))) {
			r0++;
		}
		if ((s == Math.floor((arr.length - 1) / 2))&&((signAlt(r) > 0))){
			end0 = true;
		}
		if (arr[s] > arr[s+1]){
			swap(arr, s, s+1);
			highlight(s, 1);
			highlight(s+1, 1);
			end0 = false;
		}
		highlight(s);
		highlight(s+1);
		highlight(Math.floor(r/2)-1, 2);
		highlight(arr.length - Math.ceil(r/2), 2);
		update();
		if (sortCheck()){
			setTimeout(function(){cocktailSort(arr, (s + signAlt(r)) % (arr.length - 1), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Gnome sort
function gnomeSort(arr, s){
	if (s < arr.length - 1){
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
				setTimeout(function(){gnomeSort(arr, (s + 1) % (arr.length));}, delay);
			}
			else {
				setTimeout(function(){gnomeSort(arr, (s - 1) % (arr.length - 1));}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Insertion sort
function insertionSort(arr, s, r){
	if (r < arr.length){
		var r0 = r;
		var n = false;
		if (arr[s+1] < arr[s]){
			swap(arr, s+1, s);
			highlight(s);
			highlight(s+1);
		}
		else {
			n = true;
			r0++;
			highlight(s+1, 1);
		}
		highlight(r+1, 2);
		update();
		if (sortCheck()){
			if (!n){
				setTimeout(function(){insertionSort(arr, (s - 1) % (arr.length - 1), r0);}, delay);
			}
			else {
				setTimeout(function(){insertionSort(arr, (r0-1) % (arr.length - 1), r0);}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Radix LSD sort
function radixLSDSort(arr, s, r, queue, numLen){
	if (!(r > 1 && s == 0 && Math.floor(r/2) > numLen - 1)){
		var r0 = r;
		var queue0 = queue;
		var q = 0;
		var numLen0 = numLen;
		if (s == 0){
			r0++;
		}
		if (r0 == 1 && s == arr.length - 1){
			for (q = 0; q < 10; q++){
				if (queue0[q].length > 0){
					var qq;
					for (qq = 0; qq < queue0[q].length; qq++){
						numLen0 = Math.ceil(Math.max(Math.log(queue0[q][qq] + 1) / Math.LN10, numLen0));
					}
				}
			}
		}
		if ((r0 == 1)&&(s == 0)){
		queue0 = [ [],[],[],[],[],[],[],[],[],[] ];
		}
		var digit = Math.floor((arr[s] % Math.pow(10, Math.ceil(r0/2))) / Math.pow(10, Math.ceil(r0/2)-1));
		if (r0 % 2){
			queue0[digit].push(arr[s]);
			highlight(s);
		}
		else {
			for (q = 0; q < 10; q++){
				if (queue0[q].length > 0){
					arr[s] = queue0[q][0];
					highlight(s, 1);
					queue0[q].shift();
					break;
				}
			}
		}
		update();
		if (sortCheck()){
			setTimeout(function(){radixLSDSort(arr, (s + 1) % (arr.length), r0, queue0, numLen0);}, delay);
		}
	}
	else {sortFinish(0);}
}