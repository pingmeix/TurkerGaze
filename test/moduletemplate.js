var CalcModule = (function(){
    //private variable
    var mem = new Array(); 
    // private function
    var storeInMemory = function(val) { 
        mem.push(val);
    };
    // constructor
    var CalcModule = function(){
    };

    // prototype
    CalcModule.prototype = {
        constructor: CalcModule,
        add : function(a, b) { 
                    var result = a + b;
                    storeInMemory(result); //call to private function
                    return result;
        },
        sub : function(a, b) {
                    var result = a - b;
                    storeInMemory(result); //call to private function
                    return result;
        },
        retrieveFromMemory : function() {
                    return mem.pop();
        },
    }
    return CalcModule;
})();


