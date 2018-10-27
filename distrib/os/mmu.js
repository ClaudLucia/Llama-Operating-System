//
// Memory Management Unit
///<reference path="../globals.ts" />
///<reference path="kernel.ts" />
///<reference path="interrupt.ts" />
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
        function MMU() {
        }
        //Properties
        MMU.isValid = function (logAddr, size, base, limit) {
            if ((logAddr < 0x0 ||
                logAddr >= limit) ||
                (logAddr + size > limit)) {
                return false;
            }
        };
        MMU.getAddr = function (logAddr, base) {
            return base + logAddr;
        };
        MMU.createProcess = function (priority, program) {
            var pid = this.createPID;
            var base = this.findBase(pid);
            this.createPID += 1;
            var limit = base !== -1 ? _MemorySegmentSize : -1;
            _Scheduler.residentList.push(new TSOS.PCB(pid, base, limit, priority));
            _Scheduler.sortResidentList();
            var storeProgram = program.map(function (x) { return TSOS.Utils.fHex(x); });
            if (base !== -1) {
                this.zeroBytesBaseLimit(base, limit);
                this.setBsLogicalAddr(0, prog, base, limit);
            }
            else {
                TSOS.Devices.hostStoreProgramOnDisk(pid, prog);
            }
            TSOS.Control.updateDisplay();
            return pid;
        };
        MMU.prototype.createPID = function () {
            return 0;
        };
        MMU.prototype.zeroBytesBaseLimit = function (base, limit) {
            return _Memory.zeroBytes(base, limit);
        };
        MMU.prototype.setBLogicalAddr = function (logAddr, bytes, base, limit) {
            return this.setBsLogicalAddr(logAddr, [bytes], base, limit);
        };
        MMU.prototype.setBsLogicalAddr = function (logAddr, bytes, base, limit) {
            if (this.isValid(logAddr, bytes.length, base, limit) === false) {
                return;
            }
            _Memory.setBytes(this.getAddr(logAddr, base), bytes);
        };
        MMU.prototype.findBase = function (pid) {
            for (var i = 0; i < this.status.length; i++) {
                if (this.status[i] === -1) {
                    this.status[i] = pid;
                    return i * _MemorySegmentSize;
                }
            }
            return -1;
        };
        MMU.prototype.status = function () {
            return -1;
        };
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
