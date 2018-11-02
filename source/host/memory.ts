///<reference path="../globals.ts" />
/* ------------
     memory.ts

     Requires global.ts.

     ------------ */

module TSOS {

    export class Memory {
        bytes: any[];
        zeroBytes: any;
        //public static memArr: any;
        public memArr: any[];
        constructor(bytes = new Array(_MemorySegmentSize * _MemorySegmentCount)) {
            this.bytes = bytes;
            this.zeroBytes(0, bytes.length);
        }



        public init() {
            _Memory.memArr = new Array(768);
            for (var i = 0; i < this.memArr.length; i++) {
                this.memArr[i] = "00";
            }
        }


        public getBytes(loc, size: number = 1) {
            if (size < 0) {
                return [];
            }
            return this.bytes.slice(loc, loc + size);
        }

       


    }
}