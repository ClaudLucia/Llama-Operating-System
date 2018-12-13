///<reference path="../globals.ts" />
/* ------------
     disk.ts

     Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk() {
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.data = 60;
            this.storage = sessionStorage;
            if (this.storage.length > 0) {
                this.formatted = true;
            }
            else {
                this.formatted = false;
            }
        }
        Disk.prototype.init = function () {
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var val = t + ":" + s + ":" + b;
                        var getZs = new Array();
                        for (var l = 0; l < this.data; l++) {
                            getZs.push("00");
                        }
                        var block = {
                            availableBit: "0",
                            pointer: "0:0:0",
                            data: getZs
                        };
                        sessionStorage.setItem(val, JSON.stringify(block));
                    }
                }
            }
            this.formatted = true;
            TSOS.Control.hostDisk();
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map