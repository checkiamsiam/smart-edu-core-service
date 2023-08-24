/*
  Warnings:

  - A unique constraint covering the columns `[roomNumber,buildingId]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "rooms_roomNumber_buildingId_key" ON "rooms"("roomNumber", "buildingId");
