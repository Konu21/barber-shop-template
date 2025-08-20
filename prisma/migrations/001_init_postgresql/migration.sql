-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED');
-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'OUT_OF_SYNC');
-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(65, 30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "googleCalendarId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "public"."services"("name");
-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "public"."bookings"("date");
-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "public"."bookings"("status");
-- CreateIndex
CREATE INDEX "bookings_clientId_idx" ON "public"."bookings"("clientId");
-- CreateIndex
CREATE INDEX "bookings_googleCalendarId_idx" ON "public"."bookings"("googleCalendarId");
-- AddForeignKey
ALTER TABLE "public"."bookings"
ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."bookings"
ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;