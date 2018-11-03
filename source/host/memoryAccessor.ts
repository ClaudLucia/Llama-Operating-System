///<reference path="../globals.ts" />
///<reference path="../os/interrupt.ts" />


/* ------------
     memoryAccessor.ts

     Requires global.ts.

     ------------ */

module TSOS{

    export class MemoryAccessor {

        constructor() {
        }

        //reads Memory based on the memory address and returns a hex string
        public readMem(addr): any {
            if (this.withinBounds(addr)) {
                var partition = _ProcessManager.running.Partition;
                return _Memory.memArr[_MMU.partitions[partition].base + addr].toString();
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ERR_BOUND, 0));
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXIT, false));

            }
        }

        public writeMem(addr, val): any {
            if (this.withinBounds(addr)) {
                if (parseInt(val, 16) < 16) {
                    val += "0";
                }

            }
        }

        public withinBounds(addr): any {
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
        }



    }
}