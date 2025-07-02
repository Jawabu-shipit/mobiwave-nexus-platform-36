
-- Remove the extra WhatsApp services, keeping only WhatsApp Business API
DELETE FROM services_catalog 
WHERE service_name IN ('WhatsApp Cloud API', 'WhatsApp Premium');

-- Also remove airtime and data rewards services since they're showing up incorrectly
DELETE FROM services_catalog 
WHERE service_name IN ('Airtime Rewards', 'Data Rewards');
