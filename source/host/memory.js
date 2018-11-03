///<reference path="../globals.ts" />
/* ------------
     memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(bytes) {
            if (bytes === void 0) { bytes = new Array(_MemorySegmentSize * _MemorySegmentCount); }
            this.bytes = bytes;
            this.zeroBytes(0, bytes.length);
        }
        Memory.prototype.init = function () {
            this.memArr = new Array(768);
            for (var i = 0; i < this.memArr.length; i++) {
                this.memArr[i] = "00";
            }
        };
        //For display purposes
        Memory.prototype.getBytes = function (loc, size) {
            if (size === void 0) { size = 1; }
            if (size < 0) {
                return [];
            }
            return this.bytes.slice(loc, loc + size);
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map