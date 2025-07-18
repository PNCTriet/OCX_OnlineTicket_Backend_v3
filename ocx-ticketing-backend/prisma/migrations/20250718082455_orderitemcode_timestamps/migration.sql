/*
  Warnings:

  - You are about to drop the column `qr_code` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "qr_code";

-- CreateTable
CREATE TABLE "order_item_codes" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "order_item_codes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_item_codes" ADD CONSTRAINT "order_item_codes_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
