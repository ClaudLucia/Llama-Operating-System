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
        //Properties
        static isValid(logAddr, size, base, limit) {
            if ((logAddr < 0x0 ||
                logAddr >= limit) ||
                (logAddr + size > limit)) {
                return false;
            }
        }
        public static getAddr(logAddr, base) {
            return base + logAddr;
        }


        public static createProcess(priority, program): any {
            var pid = this.createPID;
            var base = this.findBase(pid);
            this.createPID += 1;

            var limit = base !== -1 ? _MemorySegmentSize : -1;
            
            var storeProgram = program.map(x => TSOS.Utils.fHex(x));
            if (base !== -1) {
                this.zeroBytesBaseLimit(base, limit);
                this.setBsLogicalAddr(0, storeProgram, base, limit);
            }
            //else {
            //    TSOS.Devices.storeProgram(pid, prog);
            //}
            //TSOS.Control.hUpdateDisplay();
            return pid;
        }

        static createPID = 0;
        

        public static zeroBytesBaseLimit(base, limit) {
            return _Memory.zeroBytes(base, limit);
        }
        public static getBLogicalAddress(logAddr, base, limit) {
            return this.getBsLogicalAddress(logAddr, 1, base, limit)[0];
        }

        public static getBsLogicalAddress(logAddr, size, base, limit) {
            if (this.isValid(logAddr, size, base, limit) === false) {
                return [0];
            }
            return _Memory.getBytes(this.getAddr(logAddr, base), size);
        }
        public static setBLogicalAddr(logAddr, byte, base, limit) {
            return this.setBsLogicalAddr(logAddr, [byte], base, limit);
        }
        
        public static setBsLogicalAddr(logAddr, bytes, base, limit) {
            if (this.isValid(logAddr, bytes.length, base, limit) === false) {
                return;
            }
            _Memory.setBytes(this.getAddr(logAddr, base), bytes);
        }

        public static findBase(pid): any {
            for (var i = 0; i < this.status.length; i++) {
                if (this.status[i] === -1) {
                    this.status[i] = pid;
                    return i * _MemorySegmentSize;
                }
            }
            return -1;
        }

        static status = Array(_MemorySegmentCount)
        
    }
}