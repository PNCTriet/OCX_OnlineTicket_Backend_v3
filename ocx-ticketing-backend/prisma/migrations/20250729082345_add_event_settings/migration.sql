-- CreateTable
CREATE TABLE "event_settings" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_settings_event_id_setting_key_key" ON "event_settings"("event_id", "setting_key");

-- AddForeignKey
ALTER TABLE "event_settings" ADD CONSTRAINT "event_settings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
