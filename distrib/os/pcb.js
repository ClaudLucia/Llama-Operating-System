//
// Process COntrol Block
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
        //Properties
        function PCB(PC, xReg, yReg, zFlag, Acc, state, swap, turnTime, waitTime, burstTime, memInd, priority, pid, inst, exec, hDD, loc) {
            if (PC === void 0) { PC = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (state === void 0) { state = "Ready"; }
            if (swap === void 0) { swap = false; }
            if (turnTime === void 0) { turnTime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            if (burstTime === void 0) { burstTime = 0; }
            if (memInd === void 0) { memInd = null; }
            if (priority === void 0) { priority = -1; }
            if (pid === void 0) { pid = _ProcessCount; }
            if (inst === void 0) { inst = null; }
            if (exec === void 0) { exec = false; }
            if (hDD === void 0) { hDD = null; }
            if (loc === void 0) { loc = null; }
            this.PC = PC;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.Acc = Acc;
            this.state = state;
            this.swap = swap;
            this.turnTime = turnTime;
            this.waitTime = waitTime;
            this.burstTime = burstTime;
            this.memInd = memInd;
            this.priority = priority;
            this.pid = pid;
            this.inst = inst;
            this.exec = exec;
            this.hDD = hDD;
            this.loc = loc;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
