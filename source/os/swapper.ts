/* ------------
   swapper.ts
------------ */
module TSOS {
    export class Swapper {
        constructor() {
        }

        private checkQ(partition) {
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
        }
        
        public rollIn(PCB) {
            let filename = "swapID" + PCB.Pid;
            let data = _krnDiskDriveFile.krnDiskRead(filename).data;
            let extraData = Math.ceil(_MMU.globalLimit / _Disk.data) * _Disk.data;
            for (var i = 0; i < extraData - _MMU.globalLimit; i++) {
                data.pop();
            }
            if (_MMU.checkMemory(data.length)) {
                var partition = _MMU.getFreePartition(data.length);
                _MMU.loadIntoMemory(data, partition);
                PCB.Partition = partition;
                _krnDiskDriveFile.krnDiskDelete(filename);
                Control.hostDisk();
                Control.hostMemory();
            }
            else {
                this.rollOut(PCB);
            }
        }
        
        public rollOut(PCB) {
            let filename = "swapID" + PCB.Pid;
            let unluckyPartition = Math.floor(Math.random() * _MMU.partitions.length);
            let unluckyPCB = this.checkQ(unluckyPartition);
            if (unluckyPCB != null) {
                let memoryData = _MMU.getMemoryPartitionData(unluckyPartition);
                _MMU.clearMemoryPartition(unluckyPartition);
                let data = _krnDiskDriveFile.krnDiskRead(filename).data;
                let extraData = Math.ceil(_MMU.globalLimit / _Disk.data) * _Disk.data;
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
                    Control.hostDisk();
                }
                else {
                    return;
                }
                let memoryToDiskTSB = this.putProcessToDisk(memoryData, unluckyPCB.Pid);
                if (memoryToDiskTSB != null) {
                   unluckyPCB.Partition = DISK_ITEM;
                    unluckyPCB.Swapped = true;
                    unluckyPCB.State = "Swapped";
                    unluckyPCB.TSB = memoryToDiskTSB;
                    Control.hostLog("Performed roll out and roll in", "os");
                    Control.hostProcess();
                    return;
                }
                else {
                    Control.hostLog("Not enough space", "os");
                    _MMU.clearAllMemory();
                    _CPU.eXecute = false;
                    _StdOut.putText("Not enough space. Reformat the disk");
                }
            }
        }

        public putProcessToDisk(opcodes, pid): String {
            let filename = "swapID" + pid;
            _krnDiskDriveFile.krnDiskCreate(filename);
            let length = opcodes.length;
            while (length < _MMU.globalLimit) {
                opcodes.push("00");
                length++;
            }
            _krnDiskDriveFile.krnDiskWriteSwap(filename, opcodes);
            return filename;
        }
    }
}