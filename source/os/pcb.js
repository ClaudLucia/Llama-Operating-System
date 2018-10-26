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
        function PCB(PC, IR, xReg, yReg, zFlag, base, limit, state, isTerm, rediOutput, preTime) {
            if (PC === void 0) { PC = ">"; }
            if (isTerm === void 0) { isTerm = false; }
            if (rediOutput === void 0) { rediOutput = ""; }
            if (preTime === void 0) { preTime = 0; }
            this.PC = PC;
            this.IR = IR;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.isTerm = isTerm;
            this.rediOutput = rediOutput;
            this.preTime = preTime;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map