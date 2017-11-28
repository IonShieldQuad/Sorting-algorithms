
//Declare variables
var mainArr = new Array();						//Main array
var arrLen = 0;									//Length of main array
var canvas = document.getElementById('canvas');	//Canvas element
var sorting = false;							//Is sorting algorithm on?
var timeLimit = 60;								//Time limit before termination
var startTime;									//Time at the statr of sorting
var delay;										//Delay between updates
var animHdl;									//Animation timer handle
var animOffset = 0;								//Offset, used for animation
var dim;										//Nomber of dimensions, 1d or 2d
var nLine2d;									//Number of sorting line in 2d	
var hl = new Array();							//Array of indexes to highlight
var hlp = new Array();							//Array of indexes to highlight - alternate
var hls = new Array();							//Array of indexes to highlight - special
var cCorr = 2;									//Color correction factor
var fastDraw = true;							//Use faster drawing mode?

//Styles
var fStyle0 = '#444'; 		//Background
var fStyle1 = '#ddd'; 		//Bars
var fStyle2 = '#f69'; 		//Dots
var fStyle3 = '#f44'; 		//Highlight
var fStyle4 = '#4f4'; 		//Highlight alt
var fStyle5 = '#f4f'; 		//Highlight special
var fStyle00 = '#000000';	//Bottom left
var fStyle10 = '#000000';	//Bottom right
var fStyle01 = '#ffffff';	//Top left
var fStyle11 = '#ff6699';	//Top right


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
		fStyle00 = document.getElementById('color00').value;
		fStyle10 = document.getElementById('color10').value;
		fStyle01 = document.getElementById('color01').value;
		fStyle11 = document.getElementById('color11').value;
		colorMenu.style.visibility = 'collapse';
		update();
	}
	else {
		colorMenu.style.visibility = 'visible';
	}
}

//Interpolates between 2 colors
function cLerp(c0, c1, a, corr){
	var r0 = parseInt(c0[1].concat(c0[2]), 16);
	var g0 = parseInt(c0[3].concat(c0[4]), 16);
	var b0 = parseInt(c0[5].concat(c0[6]), 16);
	
	var r1 = parseInt(c1[1].concat(c1[2]), 16);
	var g1 = parseInt(c1[3].concat(c1[4]), 16);
	var b1 = parseInt(c1[5].concat(c1[6]), 16);
	
	if (corr != null){
		var r = Math.pow((1 - a) * Math.pow(r0, corr) + a * Math.pow(r1, corr), 1 / corr);
		var g = Math.pow((1 - a) * Math.pow(g0, corr) + a * Math.pow(g1, corr), 1 / corr);
		var b = Math.pow((1 - a) * Math.pow(b0, corr) + a * Math.pow(b1, corr), 1 / corr);
	}
	else {
		var r = (1 - a) * r0 + a * r1;
		var g = (1 - a) * g0 + a * g1;
		var b = (1 - a) * b0 + a * b1;
	}
	var c = '#';
	if (Math.round(r) < 16){
		c += '0';
	}
	c += Math.round(r).toString(16);
	if (Math.round(g) < 16){
		c += '0';
	}
	c += Math.round(g).toString(16);
	if (Math.round(b) < 16){
		c += '0';
	}
	c += Math.round(b).toString(16);
	return c;
}

//Switches between 1d and 2d
function updateDim(){
	var radioVal = document.querySelector('input[name="dimensions"]:checked').value;
	var selector = document.getElementById('arrMethod');
	var option = document.querySelector('option[value="random"]');
	switch (radioVal){
		case '1d':
		dim = 1;
		option.disabled = false;
		break;
		
		case '2d':
		dim = 2;
		option.disabled = true;
		if (selector.value == 'random'){
			selector.value = 'linear';
		}
		break;
	}
}

//Updates status box
function updateStat(key, str){
	var statBar = document.getElementById('statBar');
	var statText = document.getElementById('status');
	var barStyle0 = '#232'; //Idle
	var barStyle1 = '#2f2'; //Finished
	var barStyle2 = '#f42'; //Error
	var barStyle3 = '#888'; //Running 0
	var barStyle4 = '#8f2'; //Running 1
	if (key != 3){
		animOffset = -1;
		clearInterval(animHdl);
	}
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
		statText.innerHTML = 'Sorting using: ' + str;
		animHdl = setInterval(function(){animTick(statBar, barStyle3, barStyle4)}, 20);
		animOffset = 0;
		break;
	}
}

//Animation refresh
function animTick(ref, s0, s1){
	if (animOffset < 0){
		clearInterval(animHdl);
	}
	else {
		ref.style.background = ('linear-gradient(to right, '+s0+' '+(animOffset-100)%200+'%,'+s1+' '+(animOffset-50)%200+'%,'+s0+' '+animOffset%200+'%,'+s1+' '+(animOffset+50)%200+'%,'+s0+' '+(animOffset+100)%200+'%)');
		animOffset += 8;
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
	for (var i=0; i<=arr.length-2; i++){
		j = getRandomInt(i, arr.length-1);
		swap(arr, i, j);
	}
}

//Transponates 2d array
function transArr(arr){
	tempArr = new Array();
		for (var i = 0; i < arr.length; i++){
			tempArr[i] = new Array();
			for (var j = 0; j < arr[i].length; j++){
				tempArr[i][j] = arr[j][i];
			}
		}
	return tempArr;
}

//Sets to highlight an index
function highlight (val, p){
	if (p != null){
		switch (p){
			case 1:
			hlp[hlp.length] = [val, 1];
			break;
			
			case 2:
			hls[hls.length] = [val, 1];
			break;
			
			default:
			hl[hl.length] = [val, 1];
		}
	}
	else {
		hl[hl.length] = [val, 1];
	}
}

//Sets to highlight an index in 2d
function highlight2d (valX, valY, p){
	if (p != null){
		switch (p){
			case 1:
			hlp[hlp.length] = [valX, valY, 1];
			break;
			
			case 2:
			hls[hls.length] = [valX, valY, 1];
			break;
			
			default:
			hl[hl.length] = [valX, valY, 1];
		}
	}
	else {
		hl[hl.length] = [valX, valY, 1];
	}
}

//Handles "Generate" button
function makeArr(){
	sorting = false;
	mainArr.length = 0;
	arrLen = Math.max(Math.min(document.getElementById('arrLen').value, 10000), 0);
	document.getElementById('arrLen').value = arrLen;
	var arrMethod = document.getElementById('arrMethod').value;
	
	switch (dim){
		case 1:
		mainArr = genArr(arrLen, arrMethod);
		break;
		
		case 2:
		for (var i = 0; i < arrLen; i++){
			mainArr[i] = new Array();
			var arrLine = new Array();
			arrLine = genArr(arrLen, arrMethod);
			for (var j = 0; j < arrLine.length; j++){
				mainArr[i][j] = [i, arrLine[j]-1];
			}
		}
		if ((arrMethod != 'sorted') && (arrMethod != 'reverse')){
			mainArr = transArr(mainArr);
			for (var i = 0; i < arrLen; i++){
				shuffle(mainArr[i]);
			}
			mainArr = transArr(mainArr);
		}
		break;
	}
	update();
	updateStat(0);
}

//Generates randomized array
function genArr(len, method){
	var i;
	var arr = new Array();
	switch(method){
		case 'linear':
		for (i = 0; i < len; i++){
			arr[i] = i + 1;
		}
		shuffle(arr);
		break;
		
		case 'random':
		for (i = 0; i < len; i++){
			arr[i] = getRandomInt(1, arrLen);
		}
		shuffle(arr);
		break;
		
		case 'sorted':
		for (i = 0; i < len; i++){
			arr[i] = i + 1;
		}
		break;
		
		case 'reverse':
		for (i = 0; i < len; i++){
			arr[i] = arrLen - i;
		}
		break;
	}
	return arr;
}

//Handles updating
function update(arr){
	switch(dim){
		case 1:
		update1d(arr);
		break;
		
		case 2:
		update2d(arr);
		break;
	}
}

//Updates canvas
function update1d(arr){
	var i;
	var size = Math.min(canvas.width, canvas.height);
	var delta = size / arrLen;
	var ctx = canvas.getContext("2d");
	
	if (arr == null){
		indexes = mainArr;
	}
	else {
		indexes = arr;
	}
	
	if (arr == null || !fastDraw){
		ctx.fillStyle = fStyle0;
		ctx.fillRect(0, 0, size, size); //Clears canvas
		
		for (i = 0; i < arrLen; i++){ //Draws a column
			ctx.fillStyle = fStyle1;
			ctx.fillRect(i * delta, size, delta, - (delta * (mainArr[i]) - 1));
			ctx.fillStyle = fStyle2;
			ctx.fillRect(i * delta, size - (delta * (mainArr[i])), delta, delta);
		}
	}
	else {
		for (i = 0; i < arr.length; i++){
			ctx.fillStyle = fStyle0;
			ctx.fillRect(arr[i] * delta, 0, delta, size); //Clears column
			
			ctx.fillStyle = fStyle1;
			ctx.fillRect(arr[i] * delta, size, delta, - (delta * (mainArr[arr[i]]) - 1));
			ctx.fillStyle = fStyle2;
			ctx.fillRect(arr[i] * delta, size - (delta * (mainArr[arr[i]])), delta, delta);
		}	
	}	
		
	//Highlights selected indexes
	for (i = 0; i < hl.length; i++) {
		if (hl[i][1] == 1){
			ctx.fillStyle = fStyle3;
			ctx.fillRect(hl[i][0] * delta, size, delta, - (delta * mainArr[hl[i][0]]));
			hl[i][1] = 0;
		}
		else {
			ctx.fillStyle = fStyle1;
			ctx.fillRect(hl[i][0] * delta, size, delta, - (delta * (mainArr[hl[i][0]]) - 1));
			ctx.fillStyle = fStyle2;
			ctx.fillRect(hl[i][0] * delta, size - (delta * (mainArr[hl[i][0]])), delta, delta);
			hl.splice(i--, 1);
		}
	}
	for (i = 0; i < hlp.length; i++) {
		if (hlp[i][1] == 1){
			ctx.fillStyle = fStyle4;
			ctx.fillRect(hlp[i][0] * delta, size, delta, - (delta * mainArr[hlp[i][0]]));
			hlp[i][1] = 0;
		}
		else {
			ctx.fillStyle = fStyle1;
			ctx.fillRect(hlp[i][0] * delta, size, delta, - (delta * (mainArr[hlp[i][0]]) - 1));
			ctx.fillStyle = fStyle2;
			ctx.fillRect(hlp[i][0] * delta, size - (delta * (mainArr[hlp[i][0]])), delta, delta);
			hlp.splice(i--, 1);
		}
	}
	for (i = 0; i < hls.length; i++) {
		if (hls[i][1] == 1){
			ctx.fillStyle = fStyle5;
			ctx.fillRect(hls[i][0] * delta, size, delta, - (delta * mainArr[hls[i][0]]));
			hls[i][1] = 0;
		}
		else {
			ctx.fillStyle = fStyle1;
			ctx.fillRect(hls[i][0] * delta, size, delta, - (delta * (mainArr[hls[i][0]]) - 1));
			ctx.fillStyle = fStyle2;
			ctx.fillRect(hls[i][0] * delta, size - (delta * (mainArr[hls[i][0]])), delta, delta);
			hls.splice(i--, 1);
		}
	}
	ctx.stroke();
	//Resets highlight
	//hl.length = 0;
	//hlp.length = 0;
	//hls.length = 0;
}

//Updates canvas 2d
function update2d(arr){
	var i;
	var j;
	var size = Math.min(canvas.width, canvas.height);
	var delta = size / arrLen;
	var ctx = canvas.getContext("2d");
	cCorr = document.getElementById('cCorr').value;
	
	if (arr == null || !fastDraw){
		ctx.fillStyle = fStyle0;
		ctx.fillRect(0, 0, size, size); //Clears canvas
		
		
		for (i = 0; i < arrLen; i++){ //Draws a box
			for (j = 0; j < arrLen; j++){
				ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[i][j][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[i][j][0]) / (arrLen-1), cCorr), (mainArr[i][j][1]) / (arrLen-1), cCorr);
				ctx.fillRect(i * delta, size - j * delta, delta, -delta);
			}
		}
	}
	else {
		ctx.fillStyle = fStyle0;
		ctx.fillRect(arr[i][0] * delta, arr[i][1] * delta, delta, delta); //Clears canvas
		
		for (i = 0; i < arr.length; i++){ //Draws a box
			ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[arr[i][0]][arr[i][1]][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[arr[i][0]][arr[i][1]][0]) / (arrLen-1), cCorr), (mainArr[arr[i][0]][arr[i][1]][1]) / (arrLen-1), cCorr);
			ctx.fillRect(arr[i][0] * delta, size - arr[i][1] * delta, delta, -delta);
		}
	}
	
	//Highlights selected indexes
	for (i = 0; i < hl.length; i++) {
		ctx.fillStyle = fStyle3;
		ctx.fillRect(hl[i][0] * delta, size - hl[i][1] * delta, delta, - (delta * mainArr[hl[i]]));
	}
	for (i = 0; i < hlp.length; i++) {
		ctx.fillStyle = fStyle4;
		ctx.fillRect(hlp[i][0] * delta, size - hlp[i][1] * delta, delta, - (delta * mainArr[hlp[i]]));
	}
	for (i = 0; i < hls.length; i++) {
		ctx.fillStyle = fStyle5;
		ctx.fillRect(hls[i][0] * delta, size - hls[i][1] * delta, delta, - (delta * mainArr[hls[i]]));
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
			
			fastDraw = document.getElementById('fastDraw').checked;
			
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
	switch(dim){
		case 1:
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
		break;
	}
}

//Activates on sort finish
function sortFinish(code, str){
	sorting = false;
	update();
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
function bogoSort(arr, s, end){
	if (!(end && s == 0)){
		var end0 = end;
		//Shuffle
		var j = getRandomInt(s, arr.length-1);
		swap(arr, s, j);
		highlight(s);
		highlight(j);
		update(s-1, s, s+1, j-1, j, j+1);
		if (arr[s] < arr[s-1]){
			end0 = false;
		}
		if (s == 0) {
			end0 = true;
		}
		if (sortCheck()){
			setTimeout(function(){bogoSort(arr, (s + 1) % (arr.length), end0);}, delay);
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
		if (sortCheck([s-1 ,s, s+1, s+2])){
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
		update([s-1 ,s, s+1, s+g-1, s+g, s+g+1]);
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
		update([s, s+1]);
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
		update([s-1 ,s, s+1, s+2]);
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
		update([s-1, s, s+1, s+2]);
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
		update([s-1, s, s+1]);
		if (sortCheck()){
			setTimeout(function(){radixLSDSort(arr, (s + 1) % (arr.length), r0, queue0, numLen0);}, delay);
		}
	}
	else {sortFinish(0);}
}

updateDim();