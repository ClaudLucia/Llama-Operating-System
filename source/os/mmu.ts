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

module TSOS {

    export class MMU {
        public static totalLimit: number = 256;
        public static partitions = [
            { "base": 0, "limit": MMU.totalLimit, "isEmpty": true },
            { "base": 256, "limit": MMU.totalLimit, "isEmpty": true },
            { "base": 512, "limit": MMU.totalLimit, "isEmpty": true }
        ];
        


        public static loadMemory(opCodes, partition): any {
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
        }


        public static checkMemory(opCodesLength): any {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return true;
                }
            }
            return false;
        }

        public static getPartitions(opCodesLength): any {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty && this.partitions[i].limit > opCodesLength) {
                    return i;
                }
            }
            return null;
        }

        public static clearPartitions(partition): any {
            var base = this.partitions[partition].base;
            var limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (var i = base; i < limit; i++) {
                _Memory.memArr[i] = "00";
            }
            this.partitions[partition].isEmpty = true;
        }


        public static clearAll(): any {
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




















































        //Properties
        //static isValid(logAddr, size, base, limit) {
        //    if ((logAddr < 0x0 ||
        //        logAddr >= limit) ||
        //        (logAddr + size > limit)) {
        //        return false;
        //    }
        //}
        //public static getAddr(logAddr, base) {
        //    return base + logAddr;
        //}


        //public static createProcess(priority, program): any {
        //    var pid = this.createPID;
        //    var base = this.findBase(pid);
        //    this.createPID += 1;

        //    var limit = base !== -1 ? _MemorySegmentSize : -1;
            
        //    var storeProgram = program.map(x => TSOS.Utils.fHex(x));
        //    if (base !== -1) {
        //        this.zeroBytesBaseLimit(base, limit);
        //        this.setBsLogicalAddr(0, storeProgram, base, limit);
        //    }
        //    //else {
        //    //    TSOS.Devices.storeProgram(pid, prog);
        //    //}
        //    //TSOS.Control.hUpdateDisplay();
        //    return pid;
        //}

        //static createPID = 0;
        

        //public static zeroBytesBaseLimit(base, limit) {
        //    return _Memory.zeroBytes(base, limit);
        //}
        //public static getBLogicalAddress(logAddr, base, limit) {
        //    return this.getBsLogicalAddress(logAddr, 1, base, limit)[0];
        //}

        //public static getBsLogicalAddress(logAddr, size, base, limit) {
        //    if (this.isValid(logAddr, size, base, limit) === false) {
        //        return [0];
        //    }
        //    return _Memory.getBytes(this.getAddr(logAddr, base), size);
        //}
        //public static setBLogicalAddr(logAddr, byte, base, limit) {
        //    return this.setBsLogicalAddr(logAddr, [byte], base, limit);
        //}
        
        //public static setBsLogicalAddr(logAddr, bytes, base, limit) {
        //    if (this.isValid(logAddr, bytes.length, base, limit) === false) {
        //        return;
        //    }
        //    _Memory.setBytes(this.getAddr(logAddr, base), bytes);
        //}

        //public static findBase(pid): any {
        //    for (var i = 0; i < this.status.length; i++) {
        //        if (this.status[i] === -1) {
        //            this.status[i] = pid;
        //            return i * _MemorySegmentSize;
        //        }
        //    }
        //    return -1;
        //}

        //static status = Array(_MemorySegmentCount)
        
    }
}