// collect data
var DataCollector = (function(){
	// private variable
	var dataQueue = [];
	// constructor
	var DataCollector = function(){};
	// prototype
	DataCollector.prototype = {
		constructor: DataCollector;
		add : function(item){
			dataQueue.push(item);
		}
		getSize : function(){
			return dataQueue.length;
		}
		getItem : function(){
			return dataQueue.shift();
		}
		putBackItem : function(item){
			dataQueue.unshift(item);
		}
	};
	return DataCollector;
})();