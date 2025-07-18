/*
  Warnings:

  - You are about to drop the column `checked_in_at` on the `checkin_logs` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `checkin_logs` table. All the data in the column will be lost.
  - Added the required column `event_id` to the `checkin_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_item_id` to the `checkin_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticket_id` to the `checkin_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verified_by` to the `checkin_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkin_logs" DROP COLUMN "checked_in_at",
DROP COLUMN "qr_code",
ADD COLUMN     "checkin_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "order_item_id" TEXT NOT NULL,
ADD COLUMN     "ticket_id" TEXT NOT NULL,
ADD COLUMN     "verified_by" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
