ALTER TABLE intake_submissions ALTER COLUMN business_name DROP NOT NULL;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS consent_review_call BOOLEAN NOT NULL DEFAULT FALSE;
