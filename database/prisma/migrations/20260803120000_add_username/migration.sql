-- AlterTable: add username (nullable first to backfill)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill from existing email (prefix before @), deduplicated
UPDATE "User" SET "username" = split_part("email", '@', 1)
WHERE "username" IS NULL;

-- Ensure no duplicates before adding unique constraint
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "username" ORDER BY id) AS rn
  FROM "User"
)
UPDATE "User" SET "username" = "username" || '-' || numbered.rn
FROM numbered
WHERE "User".id = numbered.id AND numbered.rn > 1;

-- Make NOT NULL and unique
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Drop old email column (its unique index is dropped automatically)
ALTER TABLE "User" DROP COLUMN "email";
