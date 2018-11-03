///<reference path="../globals.ts" />
/* ------------
     memory.ts

     Requires global.ts.

     ------------ */

module TSOS {

    export class Memory {
        public bytes: any[];
        public zeroBytes: any;
        public memArr: Array<String>;
        constructor(bytes = new Array(_MemorySegmentSize * _MemorySegmentCount)) {
            this.bytes = bytes;
            this.zeroBytes(0, bytes.length);
        }



        public init(): void {
            this.memArr = new Array<String>(768);
            for (var i = 0; i < this.memArr.length; i++) {
                this.memArr[i] = "00";
            }
        }

        //For display purposes
        public getBytes(loc, size: number = 1) {
            if (size < 0) {
                return [];
            }
            return this.bytes.slice(loc, loc + size);
        }

       


    }
}