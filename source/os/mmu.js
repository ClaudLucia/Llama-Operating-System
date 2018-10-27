//
// Memory Management Unit
///<reference path="../globals.ts" />
//<reference path="../cpu.ts" />
///<reference path="kernel.ts" />
///<reference path="interrupt.ts" />
//<reference path="../memory.ts" />
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
        function MMU() {
        }
        //Properties
        MMU.isValid = function (logAddr, size, base, limit) {
            if ((logAddr < 0x0 ||
                logAddr >= limit) ||
                (logAddr + size > limit)) {
                return false;
            }
        };
        MMU.getAddr = function (logAddr, base) {
            return base + logAddr;
        };
        return MMU;
    }());
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=mmu.js.map