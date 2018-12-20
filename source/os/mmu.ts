///<reference path="../globals.ts" />


/* ------------
  mmu.ts
  
  The Memory Management Unit
  manages the memory for the OS
 
 
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

        public getBase(partition): number {
            return this.partitions[partition].base;
        }
        public getLimit(partition): number {
            return this.partitions[partition].limit;
        }


        public getMyPartition(): number {
            return _ProcessManager.running.Partition;
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

        public loadMemory(opCodes, partition): void {
            var count = this.partitions[partition].base;
            for (var opCode of opCodes) {
                _Memory.memArr[count] = opCode;
                count++;
            }
            for (var i = count; i < this.partitions[partition].limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = false;
        }

        public getMemPartition(partition) {
            let data = [];
            let base = this.partitions[partition].base;
            let limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (var i = base; i < limit; i++) {
                data.push(_Memory.memArr[i]);
            }
            return data;
        }


        public getPartitions(opCodesLength): number {
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
            Control.hostMemory();
            return true;
        }


    }
}