-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "accumulated" DECIMAL(10,2),
ADD COLUMN     "code" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gateway" TEXT,
ADD COLUMN     "reference_code" TEXT,
ADD COLUMN     "sepay_id" INTEGER,
ADD COLUMN     "sub_account" TEXT,
ADD COLUMN     "transaction_date" TIMESTAMP(3),
ADD COLUMN     "transfer_amount" DECIMAL(10,2),
ADD COLUMN     "transfer_type" TEXT;
