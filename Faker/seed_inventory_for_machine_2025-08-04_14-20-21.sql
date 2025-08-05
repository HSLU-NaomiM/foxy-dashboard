-- Faker Seed für Maschine c3998b67-9779-4d2c-9b45-6d6f8fda6079

-- DELIVERIES & INVENTORY
-- Produkt: Saft
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  '04ccc222-b924-4c46-a696-be798df7f3f0', 8, '2025-07-07 22:04:00', '2025-09-05 22:04:00', 197);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '27325cce-819a-4f07-af5d-c86b8c2135c6', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 8, '04ccc222-b924-4c46-a696-be798df7f3f0',
  49, 65, '2025-07-07 22:04:00', '2025-09-05 22:04:00',
  'expired', 101, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 2
);

-- Produkt: Wasser
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  '1e44faaf-7865-4b5d-807a-3210f004e1ee', 1, '2025-06-24 23:50:52', '2026-06-24 23:50:52', 90);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  'ce163194-75a1-4f54-8c17-c1ad610dc056', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 1, '1e44faaf-7865-4b5d-807a-3210f004e1ee',
  36, 53, '2025-06-24 23:50:52', '2026-06-24 23:50:52',
  'expired', 102, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 3
);

-- Produkt: Gun Snack
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  '28f9406f-a62d-450e-8307-8bb83be29b45', 23, '2025-02-05 05:42:47', '2025-10-03 05:42:47', 58);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '67250598-42ee-45fa-a440-ec333779b2fd', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 23, '28f9406f-a62d-450e-8307-8bb83be29b45',
  46, 68, '2025-02-05 05:42:47', '2025-10-03 05:42:47',
  'low', 103, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 4
);

-- Produkt: Hotel Snack
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  '95ef244d-314f-49f1-89a8-ad902d3625b0', 24, '2025-04-11 03:06:23', '2025-07-10 03:06:23', 193);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '35e96c6d-f830-4275-a797-756dda8e82e4', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 24, '95ef244d-314f-49f1-89a8-ad902d3625b0',
  43, 62, '2025-04-11 03:06:23', '2025-07-10 03:06:23',
  'expired', 104, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 5
);

-- Produkt: Chips
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  'c2c45045-9a6b-4146-98df-d42c4f7ce79e', 10, '2025-03-04 20:17:38', '2025-08-31 20:17:38', 150);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '6621272e-f6b7-4751-b6e3-348f8ea3e77e', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 10, 'c2c45045-9a6b-4146-98df-d42c4f7ce79e',
  39, 60, '2025-03-04 20:17:38', '2025-08-31 20:17:38',
  'low', 105, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  2, 1
);

-- Produkt: Sandwich
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  '3612b429-b167-47c4-b7fa-59585e9b8acb', 5, '2025-01-07 14:25:54', '2025-01-12 14:25:54', 52);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '155cb53a-c2c9-4294-823c-6e606eac72c4', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 5, '3612b429-b167-47c4-b7fa-59585e9b8acb',
  28, 53, '2025-01-07 14:25:54', '2025-01-12 14:25:54',
  'expired', 106, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  2, 2
);

-- Produkt: Task Snack
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  'fb5c25cd-576e-47f0-9665-0d4d01e76eca', 21, '2025-06-11 22:18:28', '2025-10-09 22:18:28', 178);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '37c235f8-1689-4dd8-9eec-d91bac6cc8fb', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 21, 'fb5c25cd-576e-47f0-9665-0d4d01e76eca',
  18, 42, '2025-06-11 22:18:28', '2025-10-09 22:18:28',
  'expired', 107, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  2, 3
);

-- Produkt: Tee
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  'e76fa4ab-ff58-485e-8821-3f6de75a3194', 7, '2025-07-14 15:53:03', '2026-07-14 15:53:03', 125);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '9fb99b25-ad3a-4168-873b-0081c4a9232f', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 7, 'e76fa4ab-ff58-485e-8821-3f6de75a3194',
  34, 63, '2025-07-14 15:53:03', '2026-07-14 15:53:03',
  'expired', 108, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  2, 4
);

-- Produkt: Kaffee
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  'e88cb89f-d806-4e9a-a1de-e12581936b59', 6, '2025-03-16 15:03:48', '2025-09-12 15:03:48', 198);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '9fbe009c-d6c6-4699-8277-a12f6d7e31c8', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 6, 'e88cb89f-d806-4e9a-a1de-e12581936b59',
  17, 43, '2025-03-16 15:03:48', '2025-09-12 15:03:48',
  'ok', 109, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  2, 5
);

-- Produkt: Of Snack
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (
  'f3f7e2b7-3457-4c75-b75d-6e5679921aba', 25, '2025-03-25 04:32:53', '2025-09-21 04:32:53', 106);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '6e2e447c-0ec9-4f56-9fce-4c5491e18b04', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 25, 'f3f7e2b7-3457-4c75-b75d-6e5679921aba',
  22, 45, '2025-03-25 04:32:53', '2025-09-21 04:32:53',
  'ok', 110, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  3, 1
);

-- FEEDBACK
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (
  '51c172fe-3ca5-4825-b773-40a2f68c086f', 'b6b24d30-c3dd-4660-ba13-83d48b0b0f38', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Set remain recently you everyone anyone.', '2025-04-22 23:40:24', false);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (
  '7bd904d3-e168-4353-b492-4c0ced3d08dc', '71c0485d-4b8e-4d7c-8fef-46715741855f', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Right young born among need middle get ball.', '2025-02-13 21:35:17', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (
  '6a9c3c0e-07b9-4890-8fe6-90a453540429', '4c028f41-4734-4882-a105-1133dd5d6a42', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Daughter much four room manager within.', '2025-02-15 20:04:53', false);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (
  '0da3f9e4-c690-4d54-a795-64788a3c1e1e', '3eb5e37f-5aeb-490e-806f-2d11d4ad1e98', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Career particularly nor factor.', '2025-01-27 10:59:56', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (
  'cabb09ce-2bf3-4847-b160-218b850e9545', 'cd4c0963-dae9-468e-92d6-f95fe46852c0', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Among its final nation sound.', '2025-04-16 15:16:08', false);
