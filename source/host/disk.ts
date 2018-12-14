///<reference path="../globals.ts" />

/* ------------
     disk.ts

     Requires global.ts.
------------ */

module TSOS {

    export class Disk {
        public tracks: number = 4;
        public sectors: number = 8;
        public blocks: number = 8;
        public data: number = 60;
        public formatted: boolean;
        public storage = sessionStorage;
        
        constructor() {
            //if (this.storage.length > 0) {
            //    this.formatted = true;
            //}
            //else {
            //    this.formatted = false;
            //}
        }

        public init() {
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        let val = t + ":" + s + ":" + b;
                        let getZs = new Array<String>();
                        for (var l = 0; l < this.data; l++) {
                            getZs.push("00");
                        }
                        let block = {
                                    availableBit: "0",
                                    pointer: "0:0:0",
                                    data: getZs
                        }
                        sessionStorage.setItem(val, JSON.stringify(block));
                    }
                }
            }
            //this.formatted = true;
            //Control.hostDisk();
        }
    }
}
