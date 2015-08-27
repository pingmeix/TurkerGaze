// -------------------- experiment parameter settings -------------------- 
function countdownMsg(idx){
	return "<span style='color: #3399FF; font-size: 65px'>" + idx.toString() + "</span>";
}
// 
var typeset = ["point", "image", "cross", "message", "cntdown", "abtest", "video", "whacamole"]; 
//{"point":0, "image":1, "cross":2, "message":3, "cntdown":4, "abtest":5, "video": 6, "whacamole":7}
var tagset = ["train", "test", "blank"]; // {"train":0, "test":1, "blank":2}
var maxscore = 0; 

var imgpaths = [];
var numimg = 0;
var numpart = 0;

// the displaying sequence  
var sequenceType = [], sequenceTag = [], ExprMsgs = [], expsequence = [];
function setupexperiment(){
	var cntpt = 0, cntimg = 0, cntmsg = 0, cntabtest = 0, cntvideo = 0, cntlevel = 0;
	var cntdownidx;
	if (imagehit){
		cntdownidx = numimg;
		hitimgs = new Array(imgpaths.length);
	}
	if (videohit){
		cntdownidx = clipidx.length;	
	}
	if (whachit){
		hitimgs = new Array(imgpaths.length);	
	}
	 
	expsequence = new Array(sequenceType.length);
	for(var i = 0; i < sequenceType.length; i++){
		switch(typeset[sequenceType[i]]){
			case "point":
				if(tagset[sequenceTag[i]] == "train"){
					expsequence[i] = {"type":"point", "location": points[cntpt], "duration":busyLen, "tag":"train"};
				}else if(tagset[sequenceTag[i]] == "blank"){
					expsequence[i] = {"type":"point", "location": points[cntpt], "duration":idleLen, "tag":"blank"};
				}else if(tagset[sequenceTag[i]] == "test"){
					expsequence[i] = {"type":"point", "location": points[cntpt], "duration":testLen, "tag":"test"};
				}
				cntpt++;
				break;
			case "image":
				imgpath = imgpaths[cntimg];
				expsequence[i] = {"type":"image", "path":imgpath,"duration":imgLen, "tag":tagset[sequenceTag[i]]};
				cntimg++;
				break;
			case "cross":
				expsequence[i] = {"type":"cross", "duration":transLen, "tag":tagset[sequenceTag[i]]};
				break;
			case "message":
				var t = Math.floor(((numpnt-cntpt/2)*(idleLen+busyLen)+(numimg-cntimg)*(imgLen+cntdownLen)+(numabtest-cntabtest)*abtestLen)/1000); // remaining time
				for(var j = 0; j < 3; j++){
					var s = t-j;
					var sec = (t-j)%60;
					if(sec<10) sec = '0' + sec.toString();
					var min = ((t-j)-sec)/60;
					if(min<10) min = '0' + min.toString();
					// msg = ExprMsgs[cntmsg] + "</br></br><span style='color: #3399FF; font-size:75px; font-family:lcd'>"+ '00:' + min + ':' + sec + "</span>";
					msg = "<span style='font-size:40px;'>" + ExprMsgs[cntmsg] + "</span>";
					expsequence[i+j] = {"type":"message", "content":msg, "duration":msgLen, "tag":tagset[sequenceTag[i+j]]};	
				}
				cntmsg += 3;
				i += 2;
				break;
			case "cntdown":
				expsequence[i] = {"type":"crosshair", "content": countdownMsg(cntdownidx), "duration":cntdownLen, "tag":tagset[sequenceTag[i]]};
				cntdownidx--;
				break;
			case "abtest":
				expsequence[i] = {"type":"abtest", "duration":abtestLen, "tag":tagset[sequenceTag[i]]};
				cntabtest++;
				break;
			case "video":
				var b = clipidx[cntvideo][0], c = clipidx[cntvideo][1];
				expsequence[i] = {"type":"video", "index":clipidx[cntvideo], "duration":videolist[b][c].playlen, "tag":tagset[sequenceTag[i]]};
				cntvideo++;
				break;
			case "whacamole":
				expsequence[i] = {"type":"whacamole", "level":cntlevel, "duration":whacamoleLen, "tag":tagset[sequenceTag[i]]};
				cntlevel++;
				break;
		}
	}
	OKLoad = true;
}

// check the status of preloading videos
function checkVideoPreload(){
	checkVideoPreloadRequest = requestAnimationFrame(checkVideoPreload);
	var loadcomplete = true;
	for (var b = 0; b < videoobjs.length; b++){
		for(var c = 0; c < videoobjs[b].length; c++){
			if (videoobjs[b][c] != null && videoobjs[b][c].readyState != 4){
				loadcomplete = false;
				break;
			}
		}
	}
	if (loadcomplete){
		cancelAnimationFrame(checkVideoPreloadRequest);
		VIDEOLOADED = true;
	}
}

// display video on fullscreen canvas
function drawclipframe(){
	var b = livevideo[0], c = livevideo[1];
	var vw = videoobjs[b][c].width;
	var vh = videoobjs[b][c].height;
	if(videoobjs[b][c].paused || videoobjs[b][c].ended) return;
	var t = new Date().getTime();
	if ((t - livevideopara[1]) > livevideopara[0]){
		videoobjs[b][c].pause();
		return;
	}
	ctx.drawImage(videoobjs[b][c], (sW-vw)/2, (sH-vh)/2, vw, vh);
	setTimeout(drawclipframe, 20);
}


function playvideos(b, c){
	console.log('Play video!');
	// stop any video in progress
	if (livevideo != null && videoobjs[livevideo[0]][livevideo[1]] != null){
		videoobjs[livevideo[0]][livevideo[1]].pause();
	}
	ctx.fillStyle = "#000";
	ctx.fillRect(0,0,sW,sH);

	livevideo = [b, c];
	var t = new Date().getTime();
	livevideopara = [videolist[b][c].playlen, t];
	if(livevideo != null && videoobjs[b][c] != undefined){
		videoobjs[b][c].play();
	}
}

// -------------------- load HIT settings -------------------- 
var numimg = 0, numpnt = 0, numabtest = 0;
function grabimgs(){
	// grab multimedia data
	$.getJSON(imglisturl, function(data) {
		gazeimglist = data.gaze;
		memoryimglist = data.memory;
		videolist = data.video;
		hitmode = data.hitmode;

		// calibration settings
		numpts = eval(getURLParameter('numpts', null)); // calibration
		if (numpts == null){
			if (hitmode == 'whacamole'){
				numpts = 9;
			}else{
				numpts = 13;
			}
		}
		CalbrPoints = CalbrPointsPos[numpts.toString()];
		points = new Array(CalbrPoints.length*2);
		for(var i = 0; i < CalbrPoints.length; i++){
			points[2*i] = CalbrPoints[i]; // idle
			points[2*i+1] = CalbrPoints[i]; // busy
		}

		// image viewing settings
		if (hitmode == 'whacamole'){
			idleLen = 600; 
			busyLen = 300;
		}else{
			idleLen = 800; 
			busyLen = 300;
		}

		if (hitmode == "angrybirddot"){
			imgLen = 1500;
			hitmode = null;
		}

		// preload video stimulus
		if (videolist != undefined){
			if (videolist.length > 0 && videolist[0].length > 0){
				console.log('Preloading videos...')
				videoobjs = new Array(videolist.length);
				videoload = new Array(videolist.length);
				for (var b = 0; b < videolist.length; b++){ // batch
					videoobjs[b] = new Array(videolist[b]);
					videoload[b] = new Array(videolist[b]);
					for (var c = 0; c < videolist[b].length; c++){ // clips in a batch
						videoobjs[b][c] = null;
						videoload[b][c] = 0;

						playable = false;
						for (var t = 0; t < videolist[b][c].source.type.length; t++){
							if (videotypes[videolist[b][c].source.type[t]] == 1){
								console.log('Can play: ' + videolist[b][c].source.url[t]);
								videoobjs[b][c] = document.createElement('video');
								videoobjs[b][c].autoplay = false;
								videoobjs[b][c].src = videolist[b][c].source.url[t];
								videoobjs[b][c].addEventListener('loadeddata', function() {
									var s = Math.min(sW/this.videoWidth, sH/this.videoHeight);
									this.width = this.videoWidth*s;
									this.height = this.videoHeight*s;
									console.log('Video is loaded and can be played. Resized:' + this.width + '*' + this.height);
							 	}, false);
								videoobjs[b][c].onplay = function(){
									console.log('Playing: ' + this.src);
									console.log('Video resolution: ' + this.videoWidth + '*' + this.videoHeight);
									drawclipframe();
								}
								videoobjs[b][c].load();
								playable = true;
								console.log(videoobjs[0][1])
								break;
							}
						}
						if (!playable){ // no playable format
							console.log('Video cannot be played: ' + JSON.stringify(videolist[b][c].source));
							noHITinDB = true; 
							return;
						}
					}
				}
				// counting and idxing
				for (var b = 0; b < videolist.length; b++){ // batch
					for (var c = 0; c < videolist[b].length; c++){
						clipidx.push([b,c]);
					}
				}
				// start monitoring the progress of video preloading
				videohit = true;
				checkVideoPreload();
			}
		}else{
			if (hitmode != null && hitmode == 'whacamole'){
				whachit = true;
			}else{
				imagehit = true;	
			}

			// image stimulus
			batchconfig = new Array(gazeimglist.length); // number of images in each batch
			numimg = 0;
			for(var i = 0; i < gazeimglist.length; i++){
				batchconfig[i] = gazeimglist[i].length;
				numimg += gazeimglist[i].length;
			}

			if(numimg == 0){
				alert('Image list missing.');
				noHITinDB = true; 
				return;
			}
			
			if(memoryimglist == undefined || memoryimglist.length < numgrids[0]*numgrids[1] - numshown){
				MemTest = false;
				imgpaths = new Array(numimg);
			}else{
				imgpaths = new Array(numimg+numgrids[0]*numgrids[1] - numshown);
			}		
			
			var cnt = 0;
			for(var i = 0; i < gazeimglist.length; i++){
				for(var j = 0; j < gazeimglist[i].length; j++){
					imgpaths[cnt++] = gazeimglist[i][j];
				}
			}
			if(MemTest){
				for(var i = 0; i < memoryimglist.length; i++){
					imgpaths[cnt++] = memoryimglist[i];
				}	
			}


			
		}
		if (videohit || whachit) MemTest = false;
		
		if (!videohit && !imagehit && !whachit){
			noHITinDB = true;
			return;
		}

		// create procedure
		subp1 = ['msg', 'calibration', 'point', numpts+1, 'msg', 'abtest', 'abtest'];
		subp2 = ['msg', 'image', 'img'];
		subp3 = ['msg', 'video', 'clip'];
		if (imagehit){
			numbatch = gazeimglist.length;
			procedure = new Array((numbatch+1)*subp1.length + numbatch*(subp2.length+1));
			var cnt = 0;
			for(var i = 0; i <= numbatch; i++){
				for(var j = 0; j < subp1.length; j++){
					procedure[cnt++] = subp1[j];
				}
				if(i < numbatch){
					for(var j = 0; j < subp2.length; j++){
						procedure[cnt++] = subp2[j];
					}
					procedure[cnt++] = gazeimglist[i].length;
				}
			}
		}else if(videohit){
			numbatch = videolist.length;
			procedure = new Array((numbatch+1)*subp1.length + numbatch*(subp3.length+1));
			var cnt = 0;
			for(var i = 0; i <= numbatch; i++){
				for(var j = 0; j < subp1.length; j++){
					procedure[cnt++] = subp1[j];
				}
				if(i < numbatch){
					for(var j = 0; j < subp3.length; j++){
						procedure[cnt++] = subp3[j];
					}
					procedure[cnt++] = videolist[i].length;
				}
			}
		}else if(whachit){
			procedure = [];
			procedure.push('msg');
			procedure.push('calib_mole');
			procedure.push('point');
			procedure.push(numpts+1);
			for(var i = 0; i < gazeimglist[0].length; i++){
				procedure.push('level');
				procedure.push(i+1);
				procedure.push('bgimg');
				procedure.push('moletest');
			}
		}
		if(imagehit){
			numpart = 1;
		}else if(videohit){
			numpart = 0;
		}
		
		for( var i = 0; i < procedure.length; i++){
			var m = procedure[i];
			if(m == 'calibration' || m == 'img' || m == 'clip') numpart++;
		}
		var cntpart = 1;
		for(var i = 0; i < procedure.length; i++){
			switch (procedure[i]){
				case 'msg':
					msgtype = procedure[++i];
					for(var j = 0; j < 3; j++){ // 3 seconds counting down
						sequenceType.push(3); // instruction message
						sequenceTag.push(2);
						switch (msgtype){
							case 'image':	
								// ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!!</span> </br> <span style='font-size: 120%'>Look closely at each image.</span>");
								ExprMsgs.push("Part " + cntpart + "/" + numpart + ": <span style='font-size: 120%'>Remember photos</span>");
								break;
							case 'video':
								ExprMsgs.push("Part " + cntpart + "/" + numpart + ": <span style='font-size: 120%'>Watch videos</span>");
								break;
							case 'calibration':
								// ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!! NO BLINK!!</span> </br> <span style='font-size: 120%'>Gaze at each bird until the dot disappears.</span>");
								ExprMsgs.push("Part " + cntpart + "/" + numpart + ": Stare at birds");
								break;
							case 'abtest':
								// ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!!</span> </br> <span style='font-size: 120%'>Stare at the evil pig to kill it.</span>");
								ExprMsgs.push("Kill the pig");
								break;
							case 'calib_mole':
								ExprMsgs.push("Stare at birds");
								break;
						}
					}
					if(msgtype == "image" || msgtype == "calibration" || msgtype == "video") cntpart++;
					break;
				case 'level':
					level = procedure[++i];
					for(var j = 0; j < 3; j++){ // 3 seconds counting down
						sequenceType.push(3); // instruction message
						sequenceTag.push(2);
						ExprMsgs.push("LEVEL " + level);
					}
					break;
				case 'point':
					var num = procedure[++i];
					for(var j = 0; j < num; j++){
						sequenceType.push(0); // blank
						sequenceTag.push(2);
						sequenceType.push(0); // point, training
						sequenceTag.push(0);
					}
					break;
				case 'img':
					var num = procedure[++i];
					for(var j = 0; j < num; j++){
						sequenceType.push(4); // count down, testing
						sequenceTag.push(1);
						sequenceType.push(1); // image, testing
						sequenceTag.push(1);
					}
					break;
				case 'bgimg':
					sequenceType.push(1); // image, testing
					sequenceTag.push(1);
					break;
				case 'abtest':
					sequenceType.push(5); // angry bird test, blank
					sequenceTag.push(2); 
					break;
				case 'moletest':
					sequenceType.push(7); // whac a mole test, blank
					sequenceTag.push(2); 
					break;
				case 'clip':
					var num = procedure[++i];
					for(var j = 0; j < num; j++){
						sequenceType.push(4); // count down, testing
						sequenceTag.push(1);
						sequenceType.push(6); // video, testing
						sequenceTag.push(1);
					}
					break;
				default:
				;
			}
		}
		
		for(var i = 0; i < sequenceType.length; i++){
			// if(sequenceType[i] == 1) numimg++; // image
			if(sequenceType[i] == 0 && sequenceTag[i] == 0) numpnt++; // point
			if(sequenceType[i] == 5) numabtest++; // image
		}
		var numcalipntset = 0;
		for(var i = 0; i < procedure.length; i++){
			if(procedure[i] == 'point') numcalipntset++;
		}
		if(numcalipntset > 1) kfold = numcalipntset; // number of folds for cross validation
		if (imagehit){
			maxscore = numshown*(basemark + Math.floor(memetesTimeLimit/1000)*stepmark_catch) + numcalipntset*numPig*basemarkpig + Math.floor(abtestLen/1000)*stepmark_kill;			
		}

		setupexperiment();
		noHITinDB = false;
	})
	.fail(function() {
		noHITinDB = true; 
	})
	.always(function() {	
	});
}

var time = new Date().getTime();
var tmpname = "anonymous"+time;
var workerid = getURLParameter('workerId', tmpname); // required
var assignmentid = getURLParameter('assignmentId', 'notAMturkHIT');

// load hitlist of the batch
var sunbatchid = getURLParameter('sunbatchid', 'batch20150410_WhacMIT1003_level2');
var hitlisturl = 'http://isun.cs.princeton.edu/mturkhit/' + sunbatchid  + '/hitlist.json';
var sunhitid = null;
var sunhitdir, imglisturl, hitname;

$.getJSON(hitlisturl, function(data) {
	var hitlist = data.hit;	
	sunhitid = hitlist[Math.floor((Math.random() * hitlist.length))];
	sunhitdir = "../mturkhit/" + sunbatchid + '/' + sunhitid + '/rawdata/';

	imglisturl = 'http://isun.cs.princeton.edu/mturkhit/' + sunbatchid  + '/' + sunhitid + '/imglist.json';

	var time = new Date().getTime();
	hitname = sunhitid + '_' + assignmentid + '_' + workerid + '_' + time.toString();

	$.get('http://jsonip.com/', function(r){ 
	  IPaddress = r.ip; 
	});
	grabimgs();

})
.fail(function() {
	$("#instrmsgP").html(instrMsg.nohit);
});






