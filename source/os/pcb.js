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
        function PCB(processId) {
            this.processId = processId;
            this.PID = processId;
        }
        PCB.prototype.init = function (partition) {
            this.State = "Ready";
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.Partition = partition;
            this.turnaroundTime = 0;
            this.waitTime = 0;
            this.Priority = 1;
            this.swapBlock = "0:0:0";
            this.ifSwapped = false;
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map