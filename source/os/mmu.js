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
        MMU.loadMemory = function (opCodes, partition) {
            var loadCount = this.partitions[partition].base;
            for (var _i = 0, opCodes1 = opCodes; _i < opCodes1.length; _i++) {
                var opCode = opCodes[i];
                _Memory.memArr[loadCount] = opCode;
                loadCount++;
            }
            for (var i = loadCount; i < this.partitions[partition].limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = false;
        };
        MMU.checkMemory = function (opCodesLength) {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return true;
                }
            }
            return false;
        };
        MMU.getPartitions = function (opCodesLength) {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return i;
                }
            }
            return null;
        };
        MMU.clearPartitions = function (partition) {
            var base = this.partitions[partition].base;
            var limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (var i = base; i < limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = true;
        };
        MMU.clearAll = function () {
            if (_CPU.isExecuting) {
                return false;
            }
            if (_ProcessManager.readyQueue.length > 0) {
                return false;
            }
            if (_ProcessManager.running != null) {
                return false;
            }
            for (var j = 0; j < this.partitions.length; j++) {
                var base = this.partitions[j].base;
                var limit = this.partitions[j].limit + this.partitions[j].base;
                for (var i = base; i < limit; i++) {
                    _Memory.memArr[i] = "00";
                }
                this.partitions[j].isEmpty = true;
            }
            // Also, clear out the resident queue, for we don't have any programs in memory anymore
            while (_ProcessManager.residentQueue.getSize() > 0) {
                _ProcessManager.residentQueue.dequeue();
            }
            TSOS.Control.hostMemory();
            return true;
        };
        MMU.totalLimit = 256;
        MMU.partitions = [
            { "base": 0, "limit": MMU.totalLimit, "isEmpty": true },
            { "base": 256, "limit": MMU.totalLimit, "isEmpty": true },
            { "base": 512, "limit": MMU.totalLimit, "isEmpty": true }
        ];
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=mmu.js.map