
/* ------------
 *
 * The Memory Management Unit
 * manages the memory for the OS
 *
 *
 *
 ------------ */

module TSOS {

    export class MMU {

        public partitions: Array<any>;

        public totalLimit: number = 256;

        constructor() {
            this.partitions = [
                { "base": 0, "limit": this.totalLimit, "isEmpty": true },
                { "base": 256, "limit": this.totalLimit, "isEmpty": true },
                { "base": 512, "limit": this.totalLimit, "isEmpty": true }
                ];
        }


        public loadMemory(opCodes, partition): void {
            var loadCount = this.partitions[partition].base;
            for (var opCode of opCodes) {
                _Memory.memArr[loadCount] = opCode;
                loadCount++;
            }
            for (var i = loadCount; i < this.partitions[partition].limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = false;
        }


        public checkMemory(opCodesLength): boolean {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty &&
                    this.partitions[i].limit > opCodesLength) {
                    return true;
                }
            }
            return false;
        }

        public getPartitions(opCodesLength): any {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return i;
                }
            }
            return null;
        }

        public clearPartitions(partition): any {
            var base = this.partitions[partition].base;
            var limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (var i = base; i < limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = true;
        }


        public clearAll(): any {
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
        }

        
    }
}