//
// Memory Management Unit
///<reference path="../globals.ts" />
/* ------------
 *
 * The Memory Management Unit
 * manages the memory for the OS
 *
 *
 *
 ------------ */
var TSOS;
(function (TSOS) {
    var MMU = /** @class */ (function () {
        //Properties
        function MMU(partitions) {
            this.partitions = partitions;
        }
        MMU.prototype.init = function () {
            this.cleanStart();
        };
        MMU.prototype.load = function (pcb, program) {
            var fPart = this.check();
            if (fPart.isFree !== undefined) {
                fPart.isFree = false;
                pcb.memInd = fPart.memInd;
                pcb.inst = _MemoryAcc.readmem(pcb.memInd, pcb.PC).toUpperCase();
                pcb.loc = _ProcessMan.processLoc.memory;
                pcb.predictBurst = _Scheduler.removeZeros(program).length + _Scheduler.addWeight(program);
                _ProcessMan.processlist.push(pcb);
                TSOS.Control.updateMem(fPart.memInd);
                TSOS.Control.initProcess(pcb);
                _StdOut.putText("Program " + pcb.programID + " loaded");
            }
            else if (_HDD.isFormatted) {
                pcb.inst = program[0];
                pcb.loc = _ProcessMan.processLoc.hdd;
                pcb.predictBurst = _Scheduler.removeZeros(program).length + _Scheduler.addWeight(program);
                _ProcessMan.processList.push(pcb);
                TSOS.Control.initProcess(pcb);
                _krnSysFile.rollOut(pcb.programID, program);
                _StdOut.putText("Program " + pcb.programID + " loaded");
            }
            else {
                _StdOut.putText("Unable to Load. Memory is full");
            }
        };
        MMU.prototype.loadHDD = function () {
            var fPart;
        };
        MMU.prototype.cleanStart = function () {
            for (var i = 0; i < _Memory.memSize; i++) {
                _Memory.memArray[0][i] = "00";
                _Memory.memArray[1][i] = "00";
                _Memory.memArray[2][i] = "00";
            }
            for (var i = 0; i < _ProcessMan.processList.length; i++) {
                TSOS.Control.removeProcess(_ProcessMan.processList[i].programID);
            }
        };
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
