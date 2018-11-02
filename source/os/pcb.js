//
// Process Control Block
//
/* ------------
 *
 * The Process Control Block
 * manages the processes for the OS
 *
 *
 *
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(processID) {
            this.processID = processID,
                this.PID = processID;
        }
        //public PCB(processID) {
        //    let PCB = (processID) => {
        //        processID = processID;
        //        var PID = processID;
        //    }
        //Properties
        PCB.prototype.init = function (partition) {
            var State = "Ready";
            var PC = 0;
            var IR = "00";
            var Acc = 0;
            var Xreg = 0;
            var Yreg = 0;
            var Zflag = 0;
            var Partition = partition;
            var turnAroundTime = 0;
            var waitTime = 0;
            var Priority = 1;
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map