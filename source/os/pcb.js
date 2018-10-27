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
        function PCB(pid, base, limit, priority, PC, xReg, yReg, zFlag, Acc, swap, turnTime, waitTime, burstTime, memInd, IR, location) {
            if (PC === void 0) { PC = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (swap === void 0) { swap = false; }
            if (turnTime === void 0) { turnTime = 0; }
            if (waitTime === void 0) { waitTime = 0; }
            if (burstTime === void 0) { burstTime = 0; }
            if (memInd === void 0) { memInd = null; }
            if (IR === void 0) { IR = -1; }
            if (location === void 0) { location = null; }
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.priority = priority;
            this.PC = PC;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.Acc = Acc;
            this.swap = swap;
            this.turnTime = turnTime;
            this.waitTime = waitTime;
            this.burstTime = burstTime;
            this.memInd = memInd;
            this.IR = IR;
            this.location = location;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map