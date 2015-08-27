// data transmitter
// e.g. var rawcarrier = new transmitdata.DataTransmitter('abc.txt', dqueue,'#', 10, 500);
var transmitdata = {
	DataTransmitter : function(dir, filename, dataqueue, delimiter, bsize, interval){
		var fname = filename;
		var queue = dataqueue; // pointer to queue
		var delim = delimiter;

		var batchsize = bsize;
		var sendinterval = interval;

		var START = false;
		var MORE = true; // whehther it's the last batch
		var curpos = -1; // current position 
		var OVERWRITE = true; // overwrite/append
		var TERMINATE = false;
		
		this.start = function(oneshot){ // start send data
			if(START) return; // already started
			START = true;
			if(!oneshot){
				MORE = true;
			}else{
				MORE = false;
			}
			OVERWRITE = true;
			TERMINATE = false;

			curpos = 0;
			senddata(); // start loop
		}

		this.lastbatch = function(){
			MORE = false;
		}

		this.terminate = function(){
			TERMINATE = true;
			START = false;
		}

		this.progress = function(){ // report progress
			var status = '', percent = 0;
			if(TERMINATE){
				status = "Terminated"
			}else if(!START){
				status = "Not started yet";
			}else if(MORE){
				status = "Waiting for more data";
				percent = Math.round(curpos/queue.length*100);
			}else{
				if(curpos >= queue.length){
					percent = 100;
					status = "Finished";
				}else{
					percent = Math.round(curpos/queue.length*100);
					status = "In progress";	
				}
			}
			return {"status":status, "percent":percent};
		}

		// data transfer loop
		var senddata = function(){
			if(TERMINATE){
				return;
			}
			if(curpos < queue.length){
				// create a small batch
				var data_item = ''; // data to be sent
				for(var k = 0; k < batchsize; k++){
					if(curpos >= queue.length) break;
					data_item += delim;
					data_item += JSON.stringify(queue[curpos]);
					curpos++;
				}
				if(OVERWRITE){
					mode = 'w';
					OVERWRITE = false;
				}else{
					mode = 'a';
				}
				$.post("http://isun.cs.princeton.edu/server/savedata.cgi?",
				{ 	
					folder: dir,
					file: fname,
					mode: mode,
					data: data_item
				},function(data){
					try{
						if(data == 'success'){
							if(!MORE && curpos>=queue.length){
								return; // finished
							}else{ // continue sending
								setTimeout(function(){senddata();},sendinterval); 
							}
						}
					}catch(err){
					}
				});
			}else if(MORE){ // monitor
				setTimeout(function(){senddata();},sendinterval);
			}
		}
		return true;
	}
}