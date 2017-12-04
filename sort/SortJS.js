
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
var currStat = 0;								//Current displayed status
var dim;										//Nomber of dimensions, 1d or 2d
var nLine2d;									//Number of sorting line in 2d	
var nIter2d;									//Number of times sorted all lines in 2d
var sortType2d;									//Current sort type in 2d
var hl = new Array();							//Array of indexes to highlight
var hlp = new Array();							//Array of indexes to highlight - alternate
var hls = new Array();							//Array of indexes to highlight - special
var cCorr = 2.2;								//Color correction factor
var fastDraw = true;							//Use faster drawing mode?
var noise2d = false;							//Sort 2d with noise?

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
function cLerp(c0, c1, a, gamma){
	var r0 = parseInt(c0[1].concat(c0[2]), 16);
	var g0 = parseInt(c0[3].concat(c0[4]), 16);
	var b0 = parseInt(c0[5].concat(c0[6]), 16);
	
	var r1 = parseInt(c1[1].concat(c1[2]), 16);
	var g1 = parseInt(c1[3].concat(c1[4]), 16);
	var b1 = parseInt(c1[5].concat(c1[6]), 16);
	
	if (gamma != null){
		var r = Math.pow((1 - a) * Math.pow(r0, gamma) + a * Math.pow(r1, gamma), 1 / gamma);
		var g = Math.pow((1 - a) * Math.pow(g0, gamma) + a * Math.pow(g1, gamma), 1 / gamma);
		var b = Math.pow((1 - a) * Math.pow(b0, gamma) + a * Math.pow(b1, gamma), 1 / gamma);
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
	currStat = key;
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

//Select output value based on dim
function dimSel(val1, val2){
	switch (dim){
		case 1:
		return val1;
		break;
		
		case 2:
		return val2;
		break;
	}
	return null;
}

//Swaps 2 elements in array
function swap(arr, i1, i2){
	var temp = arr[i1];
	arr[i1] = arr[i2];
	arr[i2] = temp;
}

//Swaps 2 elements in 2d array
function swap2d(arr, i1, i2){
	var temp = arr[i1[0]][i1[1]];
	arr[i1[0]][i1[1]] = arr[i2[0]][i2[1]];
	arr[i2[0]][i2[1]] = temp;
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
			//shuffle(mainArr);
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
			if (mainArr[i] == null || mainArr[i][j] == null){
				continue;
			}
				ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[i][j][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[i][j][0]) / (arrLen-1), cCorr), (mainArr[i][j][1]) / (arrLen-1), cCorr);
				ctx.fillRect(i * delta, size - j * delta, delta, -delta);
			}
		}
	}
	else {
		for (i = 0; i < arr.length; i++){ //Draws a box
			if (mainArr[arr[i][0]] == null || mainArr[arr[i][0]][arr[i][1]] == null){
				continue;
			}
			ctx.fillStyle = fStyle0;
			ctx.fillRect(arr[i][0] * delta, size - (arr[i][1]) * delta, delta, -delta);
			ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[arr[i][0]][arr[i][1]][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[arr[i][0]][arr[i][1]][0]) / (arrLen-1), cCorr), (mainArr[arr[i][0]][arr[i][1]][1]) / (arrLen-1), cCorr);
			ctx.fillRect(arr[i][0] * delta, size - (arr[i][1]) * delta, delta, -delta);
		}
	}
	
	//Highlights selected indexes
	for (i = 0; i < hl.length; i++) {
		if (hl[i][2] == 1){
			if (mainArr[hl[i][0]] != null && mainArr[hl[i][0]][hl[i][1]] != null){
				ctx.fillStyle = fStyle3;
				ctx.fillRect(hl[i][0] * delta, size - hl[i][1] * delta, delta, -delta);
			}
			hl[i][2] = 0;
		}
		else {
			if (mainArr[hl[i][0]] != null && mainArr[hl[i][0]][hl[i][1]] != null){
				ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[hl[i][0]][hl[i][1]][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[hl[i][0]][hl[i][1]][0]) / (arrLen-1), cCorr), (mainArr[hl[i][0]][hl[i][1]][1]) / (arrLen-1), cCorr);
				ctx.fillRect(hl[i][0] * delta, size - hl[i][1] * delta, delta, -delta);
			}
			hl.splice(i--, 1);
		}
	}
	for (i = 0; i < hlp.length; i++) {
		if (hlp[i][2] == 1){
			if (mainArr[hlp[i][0]] != null && mainArr[hlp[i][0]][hlp[i][1]] != null){
				ctx.fillStyle = fStyle4;
				ctx.fillRect(hlp[i][0] * delta, size - hlp[i][1] * delta, delta, -delta);
			}
			hlp[i][2] = 0;
		}
		else {
			if (mainArr[hlp[i][0]] != null && mainArr[hlp[i][0]][hlp[i][1]] != null){
				ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[hlp[i][0]][hlp[i][1]][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[hlp[i][0]][hlp[i][1]][0]) / (arrLen-1), cCorr), (mainArr[hlp[i][0]][hlp[i][1]][1]) / (arrLen-1), cCorr);
				ctx.fillRect(hlp[i][0] * delta, size - hlp[i][1] * delta, delta, -delta);
			}
			hlp.splice(i--, 1);
		}
	}
	for (i = 0; i < hls.length; i++) {
		if (hls[i][2] == 1){
			if (mainArr[hls[i][0]] != null && mainArr[hls[i][0]][hls[i][1]] != null){
				ctx.fillStyle = fStyle5;
				ctx.fillRect(hls[i][0] * delta, size - hls[i][1] * delta, delta, -delta);
			}
			hls[i][2] = 0;
		}
		else {
			if (mainArr[hls[i][0]] != null && mainArr[hls[i][0]][hls[i][1]] != null){
				ctx.fillStyle = cLerp(cLerp(fStyle00, fStyle10, (mainArr[hls[i][0]][hls[i][1]][0]) / (arrLen-1), cCorr), cLerp(fStyle01, fStyle11, (mainArr[hls[i][0]][hls[i][1]][0]) / (arrLen-1), cCorr), (mainArr[hls[i][0]][hls[i][1]][1]) / (arrLen-1), cCorr);
				ctx.fillRect(hls[i][0] * delta, size - hls[i][1] * delta, delta, -delta);
			}
			hls.splice(i--, 1);
		}
	}
	ctx.stroke();
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
			noise2d = document.getElementById('noise2d').checked;
			
			if (dim == 2){
				nLine2d = 0;
				nIter2d = 0;
				sortType2d = document.getElementById('type').value;
			}
			
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
			
			case 'shellSort':
			shellSort(mainArr, 0, 0, 0);
			updateStat(3, 'Shell sort');
			break;
			
			case 'selectionSort':
			selectionSort(mainArr, 0, 0, 0);
			updateStat(3, 'Selection sort');
			break;
			
			case 'biSelectionSort':
			biSelectionSort(mainArr, 0, 0, 0, 0);
			updateStat(3, 'Biselection sort');
			break;
		
			case 'radixLSDSort':
			radixLSDSort(mainArr, 0, 0, 0, 0);
			updateStat(3, 'Radix LSD sort');
			break;
		}
		break;
		
		case 2:
		if (nLine2d > arrLen-1){
			nLine2d = 0;
			nIter2d++;
			mainArr = transArr(mainArr);
			update();
		}
		if (nIter2d != 0 || noise2d){
			switch(type){
				case 'bogoSort':
				bogoSort(mainArr[nLine2d], 0);
				if (currStat != 3){
				updateStat(3, 'Bogosort');
				}
				break;
	
				case 'bubbleSort':
				bubbleSort(mainArr[nLine2d], 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Bubble sort');
				}
				break;
	
				case 'combSort':
				combSort(mainArr[nLine2d], 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Comb sort');
				}
				break;
	
				case 'cocktailSort':
				cocktailSort(mainArr[nLine2d], 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Cocktail sort');
				}
				break;
		
				case 'insertionSort':
				insertionSort(mainArr[nLine2d], 0, 0);
				if (currStat != 3){
					updateStat(3, 'Insertion sort');
				}
				break;
		
				case 'gnomeSort':
				gnomeSort(mainArr[nLine2d], 0);
				if (currStat != 3){
					updateStat(3, 'Gnome sort');
				}
				break;
		
				case 'shellSort':
				shellSort(mainArr[nLine2d], 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Shell sort');
				}
				break;
				
				case 'selectionSort':
				selectionSort(mainArr[nLine2d], 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Selection sort');
				}
				break;
				
				case 'biSelectionSort':
				biSelectionSort(mainArr[nLine2d], 0, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Biselection sort');
				}
				break;
		
				case 'radixLSDSort':
				radixLSDSort(mainArr[nLine2d], 0, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Radix LSD sort');
				}
				break;
			}
		}
		else {
			switch(type){
				case 'bogoSort':
				bogoSort2d(mainArr, 0);
				if (currStat != 3){
				updateStat(3, 'Bogosort');
				}
				break;
	
				case 'bubbleSort':
				bubbleSort2d(mainArr, 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Bubble sort');
				}
				break;
	
				case 'combSort':
				combSort2d(mainArr, 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Comb sort');
				}
				break;
	
				case 'cocktailSort':
				cocktailSort2d(mainArr, 0, 0, false);
				if (currStat != 3){
					updateStat(3, 'Cocktail sort');
				}
				break;
		
				case 'insertionSort':
				insertionSort2d(mainArr, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Insertion sort');
				}
				break;
		
				case 'gnomeSort':
				gnomeSort2d(mainArr, 0);
				if (currStat != 3){
					updateStat(3, 'Gnome sort');
				}
				break;
		
				case 'shellSort':
				shellSort2d(mainArr, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Shell sort');
				}
				break;
				
				case 'selectionSort':
				selectionSort2d(mainArr, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Selection sort');
				}
				break;
				
				case 'biSelectionSort':
				biSelectionSort2d(mainArr, 0, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Biselection sort');
				}
				break;
		
				case 'radixLSDSort':
				radixLSDSort2d(mainArr, 0, 0, 0, 0);
				if (currStat != 3){
					updateStat(3, 'Radix LSD sort');
				}
				break;
			}
		}
		break;
	}
}

//Activates on sort finish
function sortFinish(code, str){
	switch (dim){
		case 1:
		sorting = false;
		update();
		break;
		
		case 2:
		if (nIter2d >= 1 && nLine2d >= arrLen-1){
			sorting = false;
			mainArr = transArr(mainArr);
			update();
			updateStat(1);
			return 0;
		}
		else {
			if (code == 0){
				if (nIter2d == 0 && !noise2d){
					nIter2d++;
					sort(sortType2d);
				}
				else {
					nLine2d++;
					sort(sortType2d);
				}
			}
		}
		break;
	}
	
	if (code != 0){
		sorting = false;
		update();
	}
	
	switch (code){
		case 0:
		if (dim != 2){ 
			updateStat(1);
		}
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

//Finds i from index
function findI(ind, len){
	return Math.floor(ind / len);
}

//Finds j from index
function findJ(ind, len){
	return ind % len;
}

//Bogosort
function bogoSort(arr, s, end){
	if (!(end && s == 0)){
		var end0 = end;
		//Shuffle
		var j = getRandomInt(s, arr.length-1);
		swap(arr, s, j);
		switch (dim){
			case 1:
			highlight(s);
			highlight(j);
			update(s, j);
			break;
			
			case 2:
			highlight2d(nLine2d, s);
			highlight2d(nLine2d, j);
			update([nLine2d, s], [nLine2d, j]);
			break;
		}
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

//Bogosort with 2d array
function bogoSort2d(arr, s, end){
	if (!(end && s == 0)){
		var end0 = end;
		var len = arr[0].length;
		//Shuffle
		var j = getRandomInt(s, Math.pow(arr.length, 2)-1);
		swap2d(arr, [findI(s, len), findJ(s, len)], [findI(j, len), findJ(j, len)]);
		highlight2d(findI(s, len), findJ(s, len));
		highlight2d(findI(j, len), findJ(j, len));
		update([findI(s, len), findJ(s, len)], [findI(j, len), findJ(j, len)]);
		if (s > 0){
			if (arr[findI(s, len)][findJ(s, len)] < arr[findI(s-1, len)][findJ(s-1, len)]){
			end0 = false;
			}
		}
		if (s == 0) {
			end0 = true;
		}
		if (sortCheck()){
			setTimeout(function(){bogoSort2d(arr, (s + 1) % (Math.pow(arr.length, 2)), end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Bubble sort
function bubbleSort(arr, s, r, end){
	if (!(end && s == 0)){
		var end0 = end;
		if (dimSel(arr[s], arr[s][1-nIter2d]) > dimSel(arr[s+1], arr[s+1][1-nIter2d])){
			swap(arr, s, s+1);
			switch (dim){
				case 1:
				highlight(s, 1);
				highlight(s+1, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				highlight2d(nLine2d, s+1, 1);
				break;
			}
			end0 = false;
		}
		switch (dim){
			case 1:
			highlight(s);
			highlight(s+1);
			highlight(arr.length + 1 - r, 2);
			update([s, s+1]);
			break;
			
			case 2:
			highlight2d(nLine2d, s);
			highlight2d(nLine2d, s+1);
			highlight2d(nLine2d, arr.length + 1 - r, 2);
			update([[nLine2d, s], [nLine2d, s+1]]);
			break;
		}
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

//Bubble sort with 2d array
function bubbleSort2d(arr, s, r, end){
	try{
	if (!(end && s == 0)){
		var end0 = end;
		var len = arr[0].length;
		if (arr[findI(s, len)][findJ(s, len)][1-nIter2d] > arr[findI(s+1, len)][findJ(s+1, len)][1-nIter2d]){
			swap2d(arr, [findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]);
			highlight2d(findI(s, len), findJ(s, len), 1);
			highlight2d(findI(s+1, len), findJ(s+1, len), 1);
			end0 = false;
		}
		highlight2d(findI(s, len), findJ(s, len));
		highlight2d(findI(s+1, len), findJ(s+1, len));
		highlight2d(findI(Math.pow(len, 2) + 1 - r, len), findJ(Math.pow(len, 2) + 1 - r, len), 2);
		update([[findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]]);
		var r0 = r;
		if (s == 0) {
			r0++;
			end0 = true;
		}
		if (sortCheck()){
			setTimeout(function(){bubbleSort2d(arr, (s + 1) % (Math.pow(arr.length, 2) - r), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
	}
	catch (e){console.log(e);}
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
		if (dimSel(arr[s], arr[s][1-nIter2d]) > dimSel(arr[s + g], arr[s + g][1-nIter2d])){
			swap(arr, s, s + g);
			switch (dim){
				case 1:
				highlight(s, 1);
				highlight(s + g, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				highlight2d(nLine2d, s + g, 1);
				break;
			}
			end0 = false;
		}
		switch (dim){
			case 1:
			highlight(s);
			highlight(s + g);
			update([s, s+g]);
			break;
			
			case 2:
			highlight2d(nLine2d, s);
			highlight2d(nLine2d, s + g);
			update([[nLine2d, s], [nLine2d, s+g]]);
			break;
		}
		if (sortCheck()){
			setTimeout(function(){combSort(arr, (s + 1) % (arr.length - g), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Comb sort with 2d array
function combSort2d(arr, s, r, end){
	if (!(end && s == 0  && Math.ceil(Math.pow(arr.length, 2) / Math.pow(1.3, r + 1)) <= 1)){
		var end0 = end;
		var r0 = r;
		var len = arr[0].length;
		if (s == 0) {
			r0++;
			end0 = true;
		}
		var g = Math.ceil(Math.pow(arr.length, 2) / Math.pow(1.3, r0 + 1));
		if (arr[findI(s, len)][findJ(s, len)][1-nIter2d] > arr[findI(s + g, len)][findJ(s + g, len)][1-nIter2d]){
			swap2d(arr, [findI(s, len), findJ(s, len)], [findI(s + g, len), findJ(s + g, len)]);
			highlight2d(findI(s, len), findJ(s, len), 1);
			highlight2d(findI(s + g, len), findJ(s + g, len), 1);
			end0 = false;
		}
		highlight2d(findI(s, len), findJ(s, len));
		highlight2d(findI(s + g, len), findJ(s + g, len));
		update([[findI(s, len), findJ(s, len)], [findI(s + g, len), findJ(s + g, len)]]);
		if (sortCheck()){
			setTimeout(function(){combSort2d(arr, (s + 1) % (Math.pow(arr.length, 2) - g), r0, end0);}, delay);
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
		if (dimSel(arr[s], arr[s][1-nIter2d]) > dimSel(arr[s+1], arr[s+1][1-nIter2d])){
			swap(arr, s, s+1);
			switch (dim){
				case 1:
				highlight(s, 1);
				highlight(s+1, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				highlight2d(nLine2d, s+1, 1);
				break;
			}
			end0 = false;
		}
		switch (dim){
			case 1:
			highlight(s);
			highlight(s+1);
			highlight(Math.floor(r/2)-1, 2);
			highlight(arr.length - Math.ceil(r/2), 2);
			update([s, s+1]);
			break;
			
			case 2:
			highlight2d(nLine2d, s);
			highlight2d(nLine2d, s+1);
			highlight2d(nLine2d, Math.floor(r/2)-1, 2);
			highlight2d(nLine2d, arr.length - Math.ceil(r/2), 2);
			update([[nLine2d, s], [nLine2d, s+1]]);
			break;
		}
		if (sortCheck()){
			setTimeout(function(){cocktailSort(arr, (s + signAlt(r)) % (arr.length - 1), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Cocktail sort with 2d array
function cocktailSort2d(arr, s, r, end){
	if (r < Math.pow(arr.length, 2) && !(end && (s == Math.floor((Math.pow(arr.length, 2) - 1) / 2))&&((signAlt(r) > 0)))){
		var end0 = end;
		var r0 = r;
		var len = arr[0].length;
		if (((s <= Math.floor(r/2) + 1)&&(signAlt(r) < 0))||((s >= Math.pow(arr.length, 2) - Math.ceil(r/2) - 3)&&(signAlt(r) > 0))) {
			r0++;
		}
		if ((s == Math.floor((Math.pow(arr.length, 2) - 1) / 2))&&((signAlt(r) > 0))){
			end0 = true;
		}
		if (arr[findI(s, len)][findJ(s, len)][1-nIter2d] > arr[findI(s+1, len)][findJ(s+1, len)][1-nIter2d]){
			swap2d(arr, [findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]);
			highlight2d(findI(s, len), findJ(s, len), 1);
			highlight2d(findI(s+1, len), findJ(s+1, len), 1);
			end0 = false;
		}
		highlight2d(findI(s, len), findJ(s, len));
		highlight2d(findI(s+1, len), findJ(s+1, len));
		highlight2d(findI(Math.floor(r/2)-1, len), findJ(Math.floor(r/2)-1, len), 2);
		highlight2d(findI(Math.pow(arr.length, 2) - Math.ceil(r/2), len), findJ(Math.pow(arr.length, 2) - Math.ceil(r/2), len), 2);
		update([[findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]]);
		if (sortCheck()){
			setTimeout(function(){cocktailSort2d(arr, (s + signAlt(r)) % (Math.pow(arr.length, 2) - 1), r0, end0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Gnome sort
function gnomeSort(arr, s){
	if (s < arr.length - 1){
		var b = false;
		if (dimSel(arr[s], arr[s][1-nIter2d]) > dimSel(arr[s+1], arr[s+1][1-nIter2d])){
			swap(arr, s, s+1);
			switch (dim){
				case 1:
				highlight(s, 1);
				highlight(s+1, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				highlight2d(nLine2d, s+1, 1);
				break;
			}
			if (s > 0){
				b = true;
			}
		}
		switch (dim){
			case 1:
			highlight(s);
			highlight(s+1);
			update([s, s+1]);
			break;
			
			case 2:
			highlight2d(nLine2d, s);
			highlight2d(nLine2d, s+1);
			update([[nLine2d, s], [nLine2d, s+1]]);
			break;
		}
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

//Gnome sort with 2d array
function gnomeSort2d(arr, s){
	if (s < Math.pow(arr.length, 2) - 1){
		var b = false;
		var len = arr[0].length;
		if (arr[findI(s, len)][findJ(s, len)][1-nIter2d] > arr[findI(s+1, len)][findJ(s+1, len)][1-nIter2d]){
			swap2d(arr, [findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]);
			highlight2d(findI(s, len), findJ(s, len), 1);
			highlight2d(findI(s+1, len), findJ(s+1, len), 1);
			if (s > 0){
				b = true;
			}
		}
		highlight2d(findI(s, len), findJ(s, len));
		highlight2d(findI(s+1, len), findJ(s+1, len));
		update([[findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]]);
		if (sortCheck()){
			if (!b){
				setTimeout(function(){gnomeSort2d(arr, (s + 1) % (Math.pow(arr.length, 2)));}, delay);
			}
			else {
				setTimeout(function(){gnomeSort2d(arr, (s - 1) % (Math.pow(arr.length, 2) - 1));}, delay);
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
		if (arr[s] != null && dimSel(arr[s+1], arr[s+1][1-nIter2d]) < dimSel(arr[s], arr[s][1-nIter2d])){
			swap(arr, s+1, s);
			switch (dim){
				case 1:
				highlight(s);
				highlight(s+1);
				break;
				
				case 2:
				highlight2d(nLine2d, s);
				highlight2d(nLine2d, s+1);
				break;
			}
		}
		else {
			n = true;
			r0++;
			switch (dim){
				case 1:
				highlight(s+1, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s+1, 1);
				break;
			}
		}
		switch (dim){
			case 1:
			highlight(r+1, 2);
			update([s, s+1]);
			break;
			
			case 2:
			highlight2d(nLine2d, r+1, 2);
			update([[nLine2d, s], [nLine2d, s+1]]);
			break;
		}
		if (sortCheck()){
			if (!n){
				setTimeout(function(){insertionSort(arr, (s - 1) % (arr.length - 1), r0);}, delay);
			}
			else {
				setTimeout(function(){insertionSort(arr, (r0 - 1) % (arr.length - 1), r0);}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Insertion sort with 2d
function insertionSort2d(arr, s, r){
	if (r < Math.pow(arr.length, 2)){
		var r0 = r;
		var n = false;
		var len = arr[0].length;
		if (arr[findI(s, len)] != null && arr[findI(s, len)][findJ(s, len)] != null && arr[findI(s+1, len)][findJ(s+1, len)][1-nIter2d] < arr[findI(s, len)][findJ(s, len)][1-nIter2d]){
			swap2d(arr, [findI(s+1, len), findJ(s+1, len)], [findI(s, len), findJ(s, len)]);
			highlight2d(findI(s, len), findJ(s, len));
			highlight2d(findI(s+1, len), findJ(s+1, len));
		}
		else {
			n = true;
			r0++;
			highlight2d(findI(s+1, len), findJ(s+1, len), 1);
		}
		highlight2d(findI(r+1, len), findJ(r+1, len), 2);
		update([[findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]]);
		if (sortCheck()){
			if (!n){
				setTimeout(function(){insertionSort2d(arr, (s - 1) % (Math.pow(arr.length, 2) - 1), r0);}, delay);
			}
			else {
				setTimeout(function(){insertionSort2d(arr, (r0 - 1) % (Math.pow(arr.length, 2) - 1), r0);}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Shell sort
function shellSort(arr, s, r, iter){
	var r0 = r;
	var iter0 = iter;
	if (r0 > arr.length){
			iter0++;
		}
	var g = 1;
	var i;
	for (i = 0; g < arr.length; i++){
		g = Math.pow(2, i) - 1;
	}
	g = Math.pow(2, i-iter0-2) - 1;
	
	if (g >= 1){
		r0 = Math.max(r0, g);
		var n = false;
		if (r0 > arr.length){
			r0 = g;
			n = true;
		}
		if (arr[s] != null && dimSel(arr[s+g], arr[s+g][1-nIter2d]) < dimSel(arr[s], arr[s][1-nIter2d])){
			swap(arr, s+g, s);
			switch (dim){
				case 1:
				highlight(s);
				highlight(s+g);
				break;
				
				case 2:
				highlight2d(nLine2d, s);
				highlight2d(nLine2d, s+g);
				break;
			}
		}
		else {
			n = true;
			r0++;
			switch (dim){
				case 1:
				highlight(s+g, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s+g, 1);
				break;
			}
		}
		switch (dim){
			case 1:
			highlight(r, 2);
			update([s, s+g]);
			break;
			
			case 2:
			highlight2d(nLine2d, r, 2);
			update([[nLine2d, s], [nLine2d, s+g]]);
			break;
		}
		if (sortCheck()){
			if (n){
				setTimeout(function(){shellSort(arr, (r0 - g - 1) % (arr.length - 1), r0, iter0);}, delay);
			}
			else {
				setTimeout(function(){shellSort(arr, (s - g) % (arr.length - 1), r0, iter0);}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Shell sort with 2d array
function shellSort2d(arr, s, r, iter){
	var r0 = r;
	var iter0 = iter;
	if (r0 > Math.pow(arr.length, 2)){
			iter0++;
		}
	var g = 1;
	var i;
	for (i = 0; g < Math.pow(arr.length, 2); i++){
		g = Math.pow(2, i) - 1;
	}
	g = Math.pow(2, i - iter0 - 2) - 1;
	if (g >= 1){
		r0 = Math.max(r0, g);
		var len = arr[0].length;
		var n = false;
		if (r0 > Math.pow(arr.length, 2)){
			r0 = g;
			n = true;
		}
		if (arr[findI(s, len)] != null && arr[findI(s+g, len)][findJ(s+g, len)][1-nIter2d] < arr[findI(s, len)][findJ(s, len)][1-nIter2d]){
			swap2d(arr, [findI(s+g, len), findJ(s+g, len)], [findI(s, len), findJ(s, len)]);
			highlight2d(findI(s, len), findJ(s, len));
			highlight2d(findI(s+g, len), findJ(s+g, len));
		}
		else {
			n = true;
			r0++;
			highlight2d(findI(s+g, len), findJ(s+g, len), 1);
		}
		highlight2d(findI(r, len), findJ(r, len), 2);
		update([[findI(s, len), findJ(s, len)], [findI(s+g, len), findJ(s+g, len)]]);
		if (sortCheck()){
			if (n){
				setTimeout(function(){shellSort2d(arr, (r0 - g - 1) % (Math.pow(arr.length, 2) - 1), r0, iter0);}, delay);
			}
			else {
				setTimeout(function(){shellSort2d(arr, (s - g) % (Math.pow(arr.length, 2) - 1), r0, iter0);}, delay);
			}
		}
	}
	else {sortFinish(0);}
}

//Selection sort
function selectionSort(arr, s, r, min){
	if (r < arr.length - 1){
		var r0 = r;
		var min0 = min;
		if (arr[s] != null && dimSel(arr[s], arr[s][1-nIter2d]) < dimSel(arr[min0], arr[min0][1-nIter2d])){
			min0 = s;
			switch (dim){
				case 1:
				highlight(s, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				break;
			}
		}
		else {
			switch (dim){
				case 1:
				highlight(s);
				break;
				
				case 2:
				highlight2d(nLine2d, s);
				break;
			}
		}
		if (s >= arr.length - 1){
			swap(arr, r0, min0);
			switch (dim){
				case 1:
				highlight(min0, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, min0, 1);
				break;
			}
			r0++;
			min0 = r0;
		}
		switch (dim){
			case 1:
			highlight(r, 2);
			update([s, r]);
			break;
			
			case 2:
			highlight2d(nLine2d, r, 2);
			update([[nLine2d, s], [nLine2d, r]]);
			break;
		}
		if (sortCheck()){
			setTimeout(function(){selectionSort(arr, Math.max(r0, (s + 1) % (arr.length)), r0, min0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Selection sort with 2d array
function selectionSort2d(arr, s, r, min){
	if (r < Math.pow(arr.length, 2) - 1){
		var len = arr[0].length;
		var r0 = r;
		var min0 = min;
		if (arr[findI(s, len)] != null && arr[findI(s, len)][findJ(s, len)][1-nIter2d] < arr[findI(min0, len)][findJ(min0, len)][1-nIter2d]){
			min0 = s;
			highlight2d(findI(s, len), findJ(s, len), 1);
		}
		else {
			highlight2d(findI(s, len), findJ(s, len));
		}
		if (s >= Math.pow(arr.length, 2) - 1){
			swap2d(arr, [findI(r0, len), findJ(r0, len)], [findI(min0, len), findJ(min0, len)]);
			highlight2d(findI(min0, len), findJ(min0, len), 1)
			r0++;
			min0 = r0;
		}
		highlight2d(findI(r, len), findJ(r, len), 2);
		update([[findI(s, len), findJ(s, len)], [findI(r, len), findJ(r, len)]]);
		if (sortCheck()){
			setTimeout(function(){selectionSort2d(arr, Math.max(r0, (s + 1) % Math.pow(arr.length, 2)), r0, min0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Biselection sort
function biSelectionSort(arr, s, r, min, max){
	if (r <= (arr.length) / 2){
		var r0 = r;
		var min0 = min;
		var max0 = max;
		if (arr[s] != null && dimSel(arr[s], arr[s][1-nIter2d]) <= dimSel(arr[min0], arr[min0][1-nIter2d])){
			min0 = s;
			switch (dim){
				case 1:
				highlight(s, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				break;
			}
		}
		//else {
			if (arr[s] != null && dimSel(arr[s], arr[s][1-nIter2d]) >= dimSel(arr[max0], arr[max0][1-nIter2d])){
				max0 = s;
				switch (dim){
				case 1:
				highlight(s, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, s, 1);
				break;
			}
			}
			else {
				switch (dim){
				case 1:
				highlight(s);
				break;
				
				case 2:
				highlight2d(nLine2d, s);
				break;
				}
			}
		//}
		if (s >= arr.length - r - 1){
			console.log(min0+' '+max0+' '+arr[min0]+' '+arr[max0]);
			swap(arr, r, min0);
			if (min0 != max0){
				swap(arr, arr.length - r - 1, max0);
			}
			switch (dim){
				case 1:
				highlight(min0, 1);
				highlight(max0, 1);
				break;
				
				case 2:
				highlight2d(nLine2d, min0, 1);
				highlight2d(nLine2d, max0, 1);
				break;
			}
			r0++;
			min0 = r0;
			max0 = arr.length - r0 - 1;
		}
		switch (dim){
			case 1:
			highlight(r, 2);
			highlight(arr.length - r - 1, 2);
			update([s, r, arr.length - r - 1]);
			break;
			
			case 2:
			highlight2d(nLine2d, r, 2);
			highlight2d(nLine2d, arr.length - r - 1, 2);
			update([[nLine2d, s], [nLine2d, r], [nLine2d, arr.length - r - 1]]);
			break;
		}
		if (sortCheck()){
			setTimeout(function(){biSelectionSort(arr, Math.max(r0, (s + 1) % (arr.length - r0)), r0, min0, max0);}, delay);
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
						switch (dim){
							case 1:
							numLen0 = Math.ceil(Math.max(Math.log(queue0[q][qq] + 1) / Math.LN10, numLen0));
							break;
							
							case 2:
							numLen0 = Math.ceil(Math.max(Math.log(queue0[q][qq][1-nIter2d] + 1) / Math.LN10, numLen0));
							break;
						}
					}
				}
			}
		}
		if ((r0 == 1)&&(s == 0)){
		queue0 = [ [],[],[],[],[],[],[],[],[],[] ];
		}
		var digit = dimSel(Math.floor((arr[s] % Math.pow(10, Math.ceil(r0/2))) / Math.pow(10, Math.ceil(r0/2)-1)), Math.floor((arr[s][1-nIter2d] % Math.pow(10, Math.ceil(r0/2))) / Math.pow(10, Math.ceil(r0/2)-1)));
		if (r0 % 2){
			if (queue0[digit] != null){
				queue0[digit].push(arr[s]);
				switch (dim){
					case 1:
					highlight(s);
					break;
				
					case 2:
					highlight2d(nLine2d, s);
					break;
				}
			}
		}
		else {
			for (q = 0; q < 10; q++){
				if (queue0[q].length > 0){
					arr[s] = queue0[q][0];
					switch (dim){
						case 1:
						highlight(s, 1);
						break;
						
						case 2:
						highlight2d(nLine2d, s, 1);
						break;
					}
					queue0[q].shift();
					break;
				}
			}
		}
		switch (dim) {
			case 1:
			update([s-1, s, s+1]);
			break;
			
			case 2:
			update([[nLine2d, s-1], [nLine2d, s], [nLine2d, s+1]]);
			break;
		}
		if (sortCheck()){
			setTimeout(function(){radixLSDSort(arr, (s + 1) % (arr.length), r0, queue0, numLen0);}, delay);
		}
	}
	else {sortFinish(0);}
}

//Radix LSD sort with 2d array
function radixLSDSort2d(arr, s, r, queue, numLen){
	if (!(r > 1 && s == 0 && Math.floor(r/2) > numLen - 1)){
		var r0 = r;
		var queue0 = queue;
		var q = 0;
		var numLen0 = numLen;
		var len = arr[0].length;
		if (s == 0){
			r0++;
		}
		if (r0 == 1 && s == arr.length - 1){
			for (q = 0; q < 10; q++){
				if (queue0[q].length > 0){
					var qq;
					for (qq = 0; qq < queue0[q].length; qq++){
						numLen0 = Math.ceil(Math.max(Math.log(queue0[q][qq][1-nIter2d] + 1) / Math.LN10, numLen0));
					}
				}
			}
		}
		if ((r0 == 1)&&(s == 0)){
		queue0 = [ [],[],[],[],[],[],[],[],[],[] ];
		}
		var digit = Math.floor((arr[findI(s, len)][findJ(s, len)][1-nIter2d] % Math.pow(10, Math.ceil(r0/2))) / Math.pow(10, Math.ceil(r0/2)-1));
		if (r0 % 2){
			if (queue0[digit] != null){
				queue0[digit].push(arr[findI(s, len)][findJ(s, len)]);
				highlight2d(findI(s, len), findJ(s, len));
			}
		}
		else {
			for (q = 0; q < 10; q++){
				if (queue0[q].length > 0){
					arr[findI(s, len)][findJ(s, len)] = queue0[q][0];
					highlight2d(findI(s, len), findJ(s, len), 1);
					queue0[q].shift();
					break;
				}
			}
		}
			update([[findI(s-1, len), findJ(s-1, len)], [findI(s, len), findJ(s, len)], [findI(s+1, len), findJ(s+1, len)]]);
		if (sortCheck()){
			setTimeout(function(){radixLSDSort2d(arr, (s + 1) % (Math.pow(arr.length, 2)), r0, queue0, numLen0);}, delay);
		}
	}
	else {sortFinish(0);}
}

updateDim();