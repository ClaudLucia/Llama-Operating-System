/* ------------
   swapper.ts
------------ */
var TSOS;
(function (TSOS) {
    var Swapper = /** @class */ (function () {
        function Swapper() {
        }
        Swapper.prototype.checkQ = function (partition) {
            for (var i = 0; i < _ProcessManager.readyQueue.q.length; i++) {
                if (_ProcessManager.readyQueue.q[i].Partition == partition) {
                    return _ProcessManager.readyQueue.q[i];
                }
            }
            for (var i = 0; i < _ProcessManager.residentQueue.q.length; i++) {
                if (_ProcessManager.residentQueue.q[i].Partition == partition) {
                    return _ProcessManager.residentQueue.q[i];
                }
            }
        };
        Swapper.prototype.rollIn = function (PCB) {
            var filename = "swapID" + PCB.Pid;
            var data = _krnDiskDriveFile.krnDiskRead(filename).data;
            var extraData = Math.ceil(_MMU.globalLimit / _Disk.data) * _Disk.data;
            for (var i = 0; i < extraData - _MMU.globalLimit; i++) {
                data.pop();
            }
            if (_MMU.checkMemory(data.length)) {
                var partition = _MMU.getFreePartition(data.length);
                _MMU.loadIntoMemory(data, partition);
                PCB.Partition = partition;
                _krnDiskDriveFile.krnDiskDelete(filename);
                TSOS.Control.hostDisk();
                TSOS.Control.hostMemory();
            }
            else {
                this.rollOut(PCB);
            }
        };
        Swapper.prototype.rollOut = function (PCB) {
            var filename = "swapID" + PCB.Pid;
            var unluckyPartition = Math.floor(Math.random() * _MMU.partitions.length);
            var unluckyPCB = this.checkQ(unluckyPartition);
            if (unluckyPCB != null) {
                var memoryData = _MMU.getMemoryPartitionData(unluckyPartition);
                _MMU.clearMemoryPartition(unluckyPartition);
                var data = _krnDiskDriveFile.krnDiskRead(filename).data;
                var extraData = Math.ceil(_MMU.globalLimit / _Disk.data) * _Disk.data;
                for (var i = 0; i < extraData - _MMU.globalLimit; i++) {
                    data.pop();
                }
                if (_MMU.checkMemory(data.length)) {
                    var partition = _MMU.getFreePartition(data.length);
                    _MMU.loadIntoMemory(data, partition);
                    PCB.Partition = partition;
                    PCB.Swapped = false;
                    PCB.State = "Ready";
                    _krnDiskDriveFile.krnDiskDelete(filename);
                    TSOS.Control.hostDisk();
                }
                else {
                    return;
                }
                var memoryToDiskTSB = this.putProcessToDisk(memoryData, unluckyPCB.Pid);
                if (memoryToDiskTSB != null) {
                    unluckyPCB.Partition = DISK_ITEM;
                    unluckyPCB.Swapped = true;
                    unluckyPCB.State = "Swapped";
                    unluckyPCB.TSB = memoryToDiskTSB;
                    TSOS.Control.hostLog("Performed roll out and roll in", "os");
                    TSOS.Control.hostProcess();
                    return;
                }
                else {
                    TSOS.Control.hostLog("Not enough space", "os");
                    _MMU.clearAllMemory();
                    _CPU.eXecute = false;
                    _StdOut.putText("Not enough space. Reformat the disk");
                }
            }
        };
        Swapper.prototype.putProcessToDisk = function (opcodes, pid) {
            var filename = "swapID" + pid;
            _krnDiskDriveFile.krnDiskCreate(filename);
            var length = opcodes.length;
            while (length < _MMU.globalLimit) {
                opcodes.push("00");
                length++;
            }
            _krnDiskDriveFile.krnDiskWriteSwap(filename, opcodes);
            return filename;
        };
        return Swapper;
    }());
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
