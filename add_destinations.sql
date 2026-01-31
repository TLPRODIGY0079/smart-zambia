-- Add new destinations
INSERT INTO destinations (name, province, category, rating, description, image_url, entry_fee_foreign, entry_fee_local, featured, lat, lng, secrets) VALUES

-- Victoria Falls area
('Mosi-oa-Tunya National Park', 'Southern Province', 'Wildlife', 4.6, 'A wildlife reserve with diverse species, including rare rhinos and spectacular views of Victoria Falls.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/03/1b/a3/caption.jpg?w=600&h=600&s=1', 15, 40, true, -17.9167, 25.8667, '["Rare rhino sanctuary", "Falls viewpoint"]'),

('Gorge Swing', 'Southern Province', 'Adventure', 4.8, 'A thrilling adventure that offers a spectacular view of the falls with an adrenaline-pumping swing experience.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/79/29/a7/rainbow-in-the-mist.jpg?w=1400&h=-1&s=1', 85, 250, true, -17.9300, 25.8600, '["Adrenaline rush", "Best falls view"]'),

('Livingstone Crocodile Park', 'Southern Province', 'Wildlife', 4.2, 'A park dedicated to the conservation of crocodiles and other reptiles with educational tours.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/9b/c1/90/victoria-falls-mosi-oa.jpg?w=1200&h=900&s=1', 12, 30, false, -17.8500, 25.8700, '["Crocodile feeding", "Reptile sanctuary"]'),

('David Livingstone Memorial', 'Southern Province', 'Heritage', 4.1, 'A tribute to the famous explorer, offering insights into his life and legacy in African exploration.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/83/48/bf/the-edge-of-the-world.jpg?w=1400&h=800&s=1', 8, 20, false, -17.8400, 25.8500, '["Explorer history", "Memorial site"]'),

-- Northern Province
('Kalambo Falls', 'Northern Province', 'Nature', 4.7, 'The second highest waterfall in Africa, offering stunning views and a unique archaeological experience.', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 18, 45, true, -8.6000, 31.2333, '["Second highest in Africa", "Archaeological site"]'),

('Lake Tanganyika', 'Northern Province', 'Nature', 4.5, 'A beautiful lake home to diverse wildlife, perfect for relaxation and nature exploration.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 10, 25, false, -8.8000, 31.0000, '["Deepest lake", "Endemic fish species"]'),

('Moto Moto Museum', 'Northern Province', 'Heritage', 4.0, 'Learn about language concentration, tribal customs, and ethnographic heritage of Northern Zambia.', 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7', 6, 15, false, -8.7667, 31.1833, '["Tribal customs", "Language heritage"]'),

('Mwela Rock Paintings', 'Northern Province', 'Heritage', 4.3, 'Historic site with well-preserved rock paintings offering glimpses into ancient regional culture.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 8, 20, false, -9.1000, 31.3000, '["Ancient art", "Rock paintings"]'),

('Chishimba Falls', 'Northern Province', 'Nature', 4.4, 'Known for breathtaking views and scenic surroundings, a must-see natural wonder.', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 12, 30, false, -10.7500, 29.1333, '["Three-tier falls", "Sacred site"]'),

-- Eastern Province  
('Kulamba Ceremony', 'Eastern Province', 'Heritage', 4.6, 'Annual event celebrating Chewa culture with colorful dances and traditional rites.', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65', 5, 10, false, -14.2000, 32.6500, '["Chewa culture", "Annual ceremony"]'),

('Nyika Plateau', 'Eastern Province', 'Nature', 4.5, 'Known for stunning views, perfect for hiking and enjoying Zambias natural beauty.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 15, 35, true, -10.5000, 33.7500, '["Highland plateau", "Hiking trails"]'),

('Luangwa Valley', 'Eastern Province', 'Nature', 4.3, 'Offers tranquil setting for relaxation and bird-watching in serene natural environment.', 'https://images.unsplash.com/photo-1549366021-9f761d450615', 12, 28, false, -13.1000, 31.8000, '["Bird paradise", "Tranquil valley"]'),

('Chipata', 'Eastern Province', 'Heritage', 3.9, 'Capital city known for urban experiences and local culture, including the annual Ncwala ceremony.', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df', 0, 0, false, -13.6333, 32.6500, '["Urban culture", "Ncwala ceremony"]'),

-- Central Province
('Kundalila Falls', 'Central Province', 'Nature', 4.4, 'Stunning waterfall offering breathtaking views across the Luangwa valley.', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 10, 25, false, -14.7000, 28.7500, '["Valley views", "Hiking destination"]'),

('Mulungushi Dam', 'Central Province', 'Nature', 4.1, 'Picturesque dam perfect for fishing and exploring hidden falls and gorges.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 8, 20, false, -14.5000, 28.4500, '["Fishing spot", "Hidden gorges"]'),

('Prayer Mountain', 'Central Province', 'Heritage', 4.0, 'Significant landmark for visitors seeking spiritual and scenic experiences.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 5, 12, false, -15.4000, 28.3000, '["Spiritual site", "Mountain views"]'),

('Mukuyu Tree National Monument', 'Central Province', 'Heritage', 3.8, 'Home to the famous Mukuyu Tree, a symbol of the regions natural heritage.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 3, 8, false, -15.2000, 28.2000, '["Ancient tree", "Natural monument"]'),

-- Western Province
('Liuwa Plains National Park', 'Western Province', 'Wildlife', 4.7, 'Witness the second-largest wildebeest migration in Africa and diverse wildlife.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801', 25, 70, true, -14.5000, 22.7000, '["Wildebeest migration", "Open plains"]'),

('Ngonye Falls', 'Western Province', 'Nature', 4.3, 'Thundering waterfall located near Sioma, offering an exciting day trip experience.', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 12, 30, false, -16.1000, 23.1000, '["Thundering falls", "Day trip destination"]'),

('Sioma Ngwezi National Park', 'Western Province', 'Wildlife', 4.2, 'Beautiful park with river surrounded by forests and villages, perfect for experienced safari-goers.', 'https://images.unsplash.com/photo-1549366021-9f761d450615', 20, 55, false, -17.0000, 23.5000, '["River safari", "Forest wildlife"]'),

('Kuomboka Ceremony', 'Western Province', 'Heritage', 4.8, 'Experience the Lozi Kings majestic barge gliding through the Zambezi floodplains.', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65', 0, 0, true, -15.2500, 23.1500, '["Royal ceremony", "Zambezi tradition"]'),

('Zambezi River', 'Western Province', 'Adventure', 4.6, 'Engage in water sports and fishing while enjoying breathtaking river views.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 15, 40, false, -15.5000, 23.0000, '["Water sports", "Fishing paradise"]');