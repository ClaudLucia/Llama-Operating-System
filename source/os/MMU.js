///<reference path="../globals.ts" />
/* ------------
  mmu.ts
  
  The Memory Management Unit
  manages the memory for the OS
 
 
 ------------ */
var TSOS;
(function (TSOS) {
    var MMU = /** @class */ (function () {
        function MMU() {
            this.totalLimit = 256;
            this.partitions = [
                { "base": 0, "limit": this.totalLimit, "isEmpty": true },
                { "base": 256, "limit": this.totalLimit, "isEmpty": true },
                { "base": 512, "limit": this.totalLimit, "isEmpty": true }
            ];
        }
        MMU.prototype.loadMemory = function (opCodes, partition) {
            var loadCount = this.partitions[partition].base;
            for (var _i = 0, opCodes_1 = opCodes; _i < opCodes_1.length; _i++) {
                var opCode = opCodes_1[_i];
                _Memory.memArr[loadCount] = opCode;
                loadCount++;
            }
            for (var i = loadCount; i < this.partitions[partition].limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = false;
        };
        MMU.prototype.checkMemory = function (opCodesLength) {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty &&
                    this.partitions[i].limit > opCodesLength) {
                    return true;
                }
            }
            return false;
        };
        MMU.prototype.getPartitions = function (opCodesLength) {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return i;
                }
            }
            return null;
        };
        MMU.prototype.clearPartitions = function (partition) {
            var base = this.partitions[partition].base;
            var limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (var i = base; i < limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = true;
        };
        MMU.prototype.clearAll = function () {
            if (_CPU.eXecute) {
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
            while (_ProcessManager.residentQueue.getSize() > 0) {
                _ProcessManager.residentQueue.dequeue();
            }
            TSOS.Control.hostMemory();
            return true;
        };
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=mmu.js.map