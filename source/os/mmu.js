//
// Memory Management Unit
///<reference path="../globals.ts" />
/* ------------
 *
 * The Memory Management Unit
 * manages the memory for the OS
 *
 *
 *
 ------------ */
var TSOS;
(function (TSOS) {
    var MMU = /** @class */ (function () {
        //Properties
        function MMU(partitions) {
            this.partitions = partitions;
        }
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=mmu.js.map