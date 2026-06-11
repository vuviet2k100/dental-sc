-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "staffId" INTEGER;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
