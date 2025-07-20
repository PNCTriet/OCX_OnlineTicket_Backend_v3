-- CreateEnum
CREATE TYPE "SendingStatus" AS ENUM ('NOT_SENT', 'SENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "sending_status" "SendingStatus" NOT NULL DEFAULT 'NOT_SENT';
