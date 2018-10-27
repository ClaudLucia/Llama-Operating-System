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

            _Scheduler.residentList.push(new TSOS.PCB(pid, base, limit, priority));
            _Scheduler.sortResidentList();
            var storeProgram = program.map(x => TSOS.Utils.fHex(x));
            if (base !== -1) {
                this.zeroBytesBaseLimit(base, limit);
                this.setBsLogicalAddr(0, prog, base, limit);
            }
            else {
                TSOS.Devices.hostStoreProgramOnDisk(pid, prog);
            }
            TSOS.Control.updateDisplay();
            return pid;
        }



        public createPID(): any {
            return 0;
        }

        public zeroBytesBaseLimit(base, limit) {
            return _Memory.zeroBytes(base, limit);
        }

        public setBLogicalAddr(logAddr, bytes, base, limit) {
            return this.setBsLogicalAddr(logAddr, [bytes], base, limit);
        }
        
        public setBsLogicalAddr(logAddr, bytes, base, limit) {
            if (this.isValid(logAddr, bytes.length, base, limit) === false) {
                return;
            }
            _Memory.setBytes(this.getAddr(logAddr, base), bytes);
        }

        public findBase(pid): any {
            for (var i = 0; i < this.status.length; i++) {
                if (this.status[i] === -1) {
                    this.status[i] = pid;
                    return i * _MemorySegmentSize;
                }
            }
            return -1;
        }

        public status() {
            return -1;
        }
    }
}