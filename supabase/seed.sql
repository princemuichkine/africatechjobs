-- =============================================
-- SEED DATA FOR AFRICAN COUNTRIES AND CITIES
-- =============================================

-- Insert all 54 African countries with regional and currency data
INSERT INTO countries (name, code, region, currency) VALUES
    ('Algeria', 'DZ', 'North', 'DZD'),
    ('Angola', 'AO', 'Central', 'AOA'),
    ('Benin', 'BJ', 'West', 'XOF'),
    ('Botswana', 'BW', 'Southern', 'BWP'),
    ('Burkina Faso', 'BF', 'West', 'XOF'),
    ('Burundi', 'BI', 'East', 'BIF'),
    ('Cameroon', 'CM', 'Central', 'XAF'),
    ('Cape Verde', 'CV', 'West', 'CVE'),
    ('Central African Republic', 'CF', 'Central', 'XAF'),
    ('Chad', 'TD', 'Central', 'XAF'),
    ('Comoros', 'KM', 'East', 'KMF'),
    ('Congo', 'CG', 'Central', 'XAF'),
    ('Democratic Republic of Congo', 'CD', 'Central', 'CDF'),
    ('Djibouti', 'DJ', 'East', 'DJF'),
    ('Egypt', 'EG', 'North', 'EGP'),
    ('Equatorial Guinea', 'GQ', 'Central', 'XAF'),
    ('Eritrea', 'ER', 'East', 'ERN'),
    ('Eswatini', 'SZ', 'Southern', 'SZL'),
    ('Ethiopia', 'ET', 'East', 'ETB'),
    ('Gabon', 'GA', 'Central', 'XAF'),
    ('Gambia', 'GM', 'West', 'GMD'),
    ('Ghana', 'GH', 'West', 'GHS'),
    ('Guinea', 'GN', 'West', 'GNF'),
    ('Guinea-Bissau', 'GW', 'West', 'XOF'),
    ('Ivory Coast', 'CI', 'West', 'XOF'),
    ('Kenya', 'KE', 'East', 'KES'),
    ('Lesotho', 'LS', 'Southern', 'LSL'),
    ('Liberia', 'LR', 'West', 'LRD'),
    ('Libya', 'LY', 'North', 'LYD'),
    ('Madagascar', 'MG', 'East', 'MGA'),
    ('Malawi', 'MW', 'Southern', 'MWK'),
    ('Mali', 'ML', 'West', 'XOF'),
    ('Mauritania', 'MR', 'West', 'MRU'),
    ('Mauritius', 'MU', 'East', 'MUR'),
    ('Morocco', 'MA', 'North', 'MAD'),
    ('Mozambique', 'MZ', 'Southern', 'MZN'),
    ('Namibia', 'NA', 'Southern', 'NAD'),
    ('Niger', 'NE', 'West', 'XOF'),
    ('Nigeria', 'NG', 'West', 'NGN'),
    ('Rwanda', 'RW', 'East', 'RWF'),
    ('Sao Tome and Principe', 'ST', 'Central', 'STN'),
    ('Senegal', 'SN', 'West', 'XOF'),
    ('Seychelles', 'SC', 'East', 'SCR'),
    ('Sierra Leone', 'SL', 'West', 'SLL'),
    ('Somalia', 'SO', 'East', 'SOS'),
    ('South Africa', 'ZA', 'Southern', 'ZAR'),
    ('South Sudan', 'SS', 'East', 'SSP'),
    ('Sudan', 'SD', 'North', 'SDG'),
    ('Tanzania', 'TZ', 'East', 'TZS'),
    ('Togo', 'TG', 'West', 'XOF'),
    ('Tunisia', 'TN', 'North', 'TND'),
    ('Uganda', 'UG', 'East', 'UGX'),
    ('Zambia', 'ZM', 'Southern', 'ZMW'),
    ('Zimbabwe', 'ZW', 'Southern', 'ZWL');

-- Insert major African tech hubs and cities
INSERT INTO cities (name, country_id, is_tech_hub) VALUES
    -- Nigeria (West Africa's tech powerhouse)
    ('Lagos', (SELECT id FROM countries WHERE code = 'NG'), true),
    ('Abuja', (SELECT id FROM countries WHERE code = 'NG'), true),
    ('Port Harcourt', (SELECT id FROM countries WHERE code = 'NG'), false),
    
    -- Kenya (East Africa's Silicon Savannah)
    ('Nairobi', (SELECT id FROM countries WHERE code = 'KE'), true),
    ('Mombasa', (SELECT id FROM countries WHERE code = 'KE'), false),
    
    -- South Africa (Southern Africa's tech hub)
    ('Cape Town', (SELECT id FROM countries WHERE code = 'ZA'), true),
    ('Johannesburg', (SELECT id FROM countries WHERE code = 'ZA'), true),
    ('Durban', (SELECT id FROM countries WHERE code = 'ZA'), false),
    ('Pretoria', (SELECT id FROM countries WHERE code = 'ZA'), false),
    
    -- Egypt (North Africa's tech center)
    ('Cairo', (SELECT id FROM countries WHERE code = 'EG'), true),
    ('Alexandria', (SELECT id FROM countries WHERE code = 'EG'), false),
    
    -- Morocco (North Africa's emerging hub)
    ('Casablanca', (SELECT id FROM countries WHERE code = 'MA'), true),
    ('Rabat', (SELECT id FROM countries WHERE code = 'MA'), false),
    
    -- Ghana (West Africa's growing market)
    ('Accra', (SELECT id FROM countries WHERE code = 'GH'), true),
    ('Kumasi', (SELECT id FROM countries WHERE code = 'GH'), false),
    
    -- Rwanda (East Africa's rising star)
    ('Kigali', (SELECT id FROM countries WHERE code = 'RW'), true),
    
    -- Uganda (East Africa's pearl)
    ('Kampala', (SELECT id FROM countries WHERE code = 'UG'), true),
    
    -- Senegal (West Africa's gateway)
    ('Dakar', (SELECT id FROM countries WHERE code = 'SN'), true),
    
    -- Tunisia (North Africa's startup hub)
    ('Tunis', (SELECT id FROM countries WHERE code = 'TN'), true),
    
    -- Ethiopia (East Africa's giant)
    ('Addis Ababa', (SELECT id FROM countries WHERE code = 'ET'), true),
    
    -- Tanzania (East Africa's potential)
    ('Dar es Salaam', (SELECT id FROM countries WHERE code = 'TZ'), false),
    
    -- Ivory Coast (West Africa's economic engine)
    ('Abidjan', (SELECT id FROM countries WHERE code = 'CI'), false),
    
    -- Angola (Central Africa's oil giant)
    ('Luanda', (SELECT id FROM countries WHERE code = 'AO'), false),
    
    -- Cameroon (Central Africa's crossroads)
    ('Douala', (SELECT id FROM countries WHERE code = 'CM'), false),
    ('Yaoundé', (SELECT id FROM countries WHERE code = 'CM'), false),
    
    -- Algeria (North Africa's largest country)
    ('Algiers', (SELECT id FROM countries WHERE code = 'DZ'), false),
    
    -- Libya (North Africa's strategic location)
    ('Tripoli', (SELECT id FROM countries WHERE code = 'LY'), false),
    
    -- Zambia (Southern Africa's copper belt)
    ('Lusaka', (SELECT id FROM countries WHERE code = 'ZM'), false),
    
    -- Zimbabwe (Southern Africa's potential)
    ('Harare', (SELECT id FROM countries WHERE code = 'ZW'), false),
    
    -- Botswana (Southern Africa's diamond)
    ('Gaborone', (SELECT id FROM countries WHERE code = 'BW'), false),
    
    -- Mauritius (Indian Ocean's financial hub)
    ('Port Louis', (SELECT id FROM countries WHERE code = 'MU'), false);

-- =============================================
-- SAMPLE COMPANIES (Optional - for testing)
-- =============================================

-- Insert some sample African tech companies
INSERT INTO companies (name, description, logo, website, industry, size, location, country) VALUES
    ('Flutterwave', 'Financial technology company providing payment infrastructure for global merchants and payment service providers', 'https://flutterwave.com/logo.png', 'https://flutterwave.com', 'FINANCE', '201_1000', 'Lagos', 'Nigeria'),
    ('Paystack', 'Online payment platform that helps businesses in Africa get paid by anyone, anywhere in the world', 'https://paystack.com/logo.png', 'https://paystack.com', 'FINANCE', '51_200', 'Lagos', 'Nigeria'),
    ('Andela', 'Global talent network that connects companies with vetted, remote engineers from Africa', 'https://andela.com/logo.png', 'https://andela.com', 'SOFTWARE', '1000_PLUS', 'Lagos', 'Nigeria'),
    ('M-Kopa', 'Connected asset financing platform providing smartphones, solar systems, and other products', 'https://m-kopa.com/logo.png', 'https://m-kopa.com', 'FINANCE', '201_1000', 'Nairobi', 'Kenya'),
    ('Twiga Foods', 'B2B marketplace that sources produce directly from farmers and delivers to urban retailers', 'https://twiga.com/logo.png', 'https://twiga.com', 'E_COMMERCE', '51_200', 'Nairobi', 'Kenya'),
    ('Yoco', 'Point-of-sale and business software solutions for small and medium businesses', 'https://yoco.co.za/logo.png', 'https://yoco.co.za', 'FINANCE', '51_200', 'Cape Town', 'South Africa'),
    ('Aerobotics', 'Artificial intelligence company that develops machine learning algorithms for drones and satellites', 'https://aerobotics.com/logo.png', 'https://aerobotics.com', 'AI', '11_50', 'Cape Town', 'South Africa'),
    ('Swvl', 'Mass transit technology platform that provides bus booking and route optimization', 'https://swvl.com/logo.png', 'https://swvl.com', 'TRANSPORTATION', '201_1000', 'Cairo', 'Egypt'),
    ('Vezeeta', 'Digital healthcare platform connecting patients with healthcare providers', 'https://vezeeta.com/logo.png', 'https://vezeeta.com', 'HEALTHCARE', '51_200', 'Cairo', 'Egypt'),
    ('Expensya', 'Expense management software for businesses', 'https://expensya.com/logo.png', 'https://expensya.com', 'SOFTWARE', '11_50', 'Tunis', 'Tunisia');
