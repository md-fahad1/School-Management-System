-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "students_name_surname_idx" ON "students" USING GIN ("name" gin_trgm_ops, "surname" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "teachers_name_surname_idx" ON "teachers" USING GIN ("name" gin_trgm_ops, "surname" gin_trgm_ops);
