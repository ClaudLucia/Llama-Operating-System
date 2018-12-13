///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFS extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnFSDriverEntry;
            // this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnFSDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        // Creates a file
        public krnDiskCreate(filename: String) {
            // Check for existing filename
            if (this.checkFileName(filename)) {
                return FILE_NAME_ALREADY_EXISTS;
            }
            // Look for first free block in directory data structure (first track)
            // Leave out the first block, which is the MBR
            // Firefox doesn't order session storage, so have to generate appropriate tsbID
            // for(var i=1; i<_Disk.numOfSectors*_Disk.numOfBlocks; i++){
            for (var sectorNum = 0; sectorNum < _Disk.numOfSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.numOfBlocks; blockNum++) {
                    if (sectorNum == 0 && blockNum == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var tsbID = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbID));
                    // If the block is available...
                    if (dirBlock.availableBit == "0") {
                        // Now look for first free block in data structure so we actually have a "place" to put the file
                        let datBlockTSB = this.findFreeDataBlock();
                        if (datBlockTSB != null) {
                            let datBlock = JSON.parse(sessionStorage.getItem(datBlockTSB));
                            dirBlock.availableBit = "1";
                            datBlock.availableBit = "1";
                            // Clear out any data previously in datBlock
                            datBlock = this.clearData(datBlock);
                            dirBlock.pointer = datBlockTSB; // set pointer to space in memory
                            // Convert filename to ASCII/hex and store in data
                            let hexArr = this.stringToASCII(filename);
                            // Clear the directory block's data first a.k.a the filename if it was there before
                            dirBlock = this.clearData(dirBlock);
                            // Get the date and convert it to hex
                            let today = new Date();
                            let month = (today.getMonth() + 1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month; // pad with zero
                            }
                            let day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day; // pad with zero
                            }
                            let year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year; // pad with zero
                            }
                            // Store date in first 4 bytes
                            dirBlock.data[0] = month;
                            dirBlock.data[1] = day;
                            dirBlock.data[2] = year.substring(0, 2);
                            dirBlock.data[3] = year.substring(2);
                            // We only replace the bytes needed, not the entire data array
                            for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                                dirBlock.data[k] = hexArr[j];
                            }
                            sessionStorage.setItem(tsbID, JSON.stringify(dirBlock));
                            sessionStorage.setItem(datBlockTSB, JSON.stringify(datBlock));
                            // Update the disk display and return success
                            Control.hostDisk();
                            return FILE_CREATED;
                        }
                        return DISK_FULL; // We ran through the data structure but there were no free blocks, meaning no more space on disk :(((((((
                    }
                }
            }
            return DISK_FULL; // We ran through the directory data structure but there were no free blocks, meaning no more space on disk :(
        }

        private checkFileName(filename: String): boolean {
            let hexArr = this.stringToASCII(filename);
            for (var sectorNum = 0; sectorNum < _Disk.numOfSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.numOfBlocks; blockNum++) {
                    if (sectorNum == 0 && blockNum == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var tsbID = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbID));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArr.length; k++ , j++) {
                            if (hexArr[j] != dirBlock.data[k]) {
                                matchingFileName = false
                            }
                        }
                        // If reach end of hexArr but dirBlock data still more?
                        if (dirBlock.data[hexArr.length + DATE_LENGTH] != "00") {
                            matchingFileName = false;
                        }
                        // We found the filename
                        if (matchingFileName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }
}
