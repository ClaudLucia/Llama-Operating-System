///<reference path="../globals.ts" />


/* ------------
     memory.ts

     Requires global.ts.

     ------------ */

module TSOS {

    export class Memory {
        public memArr: Array<String>;
        constructor() {
        }
        
        public init(): void {
            this.memArr = new Array<String>(768);
            for (var i = 0; i < this.memArr.length; i++) {
                this.memArr[i] = "00";
            }
        }
        
    }
}