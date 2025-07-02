
-- Add missing bulk email service
INSERT INTO services_catalog (service_name, service_type, description, is_premium, is_active, provider)
VALUES ('Bulk Email', 'email', 'Email marketing and campaign management service', false, true, 'mspace');

-- Remove duplicate USSD services, keeping only one
DELETE FROM services_catalog 
WHERE service_name IN ('USSD Shared', 'USSD Dedicated');

-- Update the remaining USSD service to be generic
UPDATE services_catalog 
SET service_name = 'USSD Service', 
    description = 'USSD application development and hosting service'
WHERE service_name = 'USSD Test-Bed';

-- Remove duplicate Short Code services, keeping only one
DELETE FROM services_catalog 
WHERE service_name = 'Short Code Dedicated';

-- Update the remaining Short Code service to be generic
UPDATE services_catalog 
SET service_name = 'Short Code Service',
    description = 'Short code messaging service across all networks'
WHERE service_name = 'Short Code Shared';

-- Remove duplicate M-Pesa services, keeping only one
DELETE FROM services_catalog 
WHERE service_name = 'M-Pesa Flat Fee';

-- Update the remaining M-Pesa service to be generic
UPDATE services_catalog 
SET service_name = 'M-Pesa Integration',
    description = 'Mobile payment integration service'
WHERE service_name = 'M-Pesa Integration';
