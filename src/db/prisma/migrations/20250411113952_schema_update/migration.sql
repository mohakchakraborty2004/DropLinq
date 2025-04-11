-- AlterTable
ALTER TABLE "file" ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_senderName_fkey" FOREIGN KEY ("senderName") REFERENCES "user"("username") ON DELETE SET NULL ON UPDATE CASCADE;
