///<reference path="../globals.ts" />
///<reference path="../os/interrupt.ts" />
/* ------------
     memoryAccessor.ts

     Requires global.ts.

 ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.BnLloop = function (pc, branch) {
            return (pc + branch + 2) % _MMU.getLimit(_ProcessManager.running.Partition);
        };
        //reads Memory based on the memory address and returns a hex string
        MemoryAccessor.prototype.readMem = function (addr) {
            if (this.withinBounds(addr)) {
                var partition = _ProcessManager.running.Partition;
                return _Memory.memArr[_MMU.partitions[partition].base + addr].toString();
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ERR_BOUND, 0));
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, false));
            }
        };
        MemoryAccessor.prototype.writeMem = function (addr, val) {
            if (this.withinBounds(addr)) {
                if (parseInt(val, 16) < 16) {
                    val = val + "0";
                }
                var partition = _ProcessManager.running.Partition;
                _Memory.memArr[_MMU.partitions[partition].base + addr] = val;
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ERR_BOUND, 0));
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, false));
            }
        };
        MemoryAccessor.prototype.withinBounds = function (addr) {
            var partition = _ProcessManager.running.Partition;
            if (addr + _MMU.partitions[partition].base <
                _MMU.partitions[partition].base +
                    _MMU.partitions[partition].limit && addr +
                _MMU.partitions[partition].base >=
                _MMU.partitions[partition].base) {
                return true;
            }
            else {
                return false;
            }
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map