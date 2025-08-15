-- PRODUCTS
INSERT INTO products (product_id, name, price, shelf_life_days) VALUES (1, 'Task Snack', 3.97, 120);
INSERT INTO products (product_id, name, price, shelf_life_days) VALUES (2, 'Show Snack', 3.27, 120);
INSERT INTO products (product_id, name, price, shelf_life_days) VALUES (3, 'Gun Snack', 1.04, 240);
INSERT INTO products (product_id, name, price, shelf_life_days) VALUES (4, 'Hotel Snack', 2.94, 90);
INSERT INTO products (product_id, name, price, shelf_life_days) VALUES (5, 'Of Snack', 3.16, 180);

-- MACHINES
INSERT INTO machines (machine_id, machine_name, machine_location) VALUES ('1e5857d4-2e9d-4d2b-9faf-0739c99dc01d', 'Maschine Harrisonmouth', '796 Daugherty Vista, Christopherburgh, UT 93965');
INSERT INTO machines (machine_id, machine_name, machine_location) VALUES ('ceb33768-bd41-451a-a900-42f253d91ff7', 'Maschine Katieton', '99329 Mcdonald Lodge, West Bobbyhaven, DC 80947');
INSERT INTO machines (machine_id, machine_name, machine_location) VALUES ('e913623d-423a-46a5-9723-4948c7fa69ab', 'Maschine Martinezport', '161 Robert Cove Suite 857, Johnsonfurt, KS 49446');

-- DELIVERIES
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES ('c3267678-1fc9-4f2f-882e-73920e743d7d', 1, '2025-04-05T03:00:14', '2025-07-11T03:00:14', 71);
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES ('74f4c043-d233-45e3-a194-dabc2b61238e', 3, '2025-03-27T05:41:00', '2025-08-16T05:41:00', 132);
INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES ('68438d3e-e8b5-452c-b6c0-e3f2ad6cbed2', 5, '2025-03-20T01:17:12', '2025-11-07T01:17:12', 89);

-- INVENTORY
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '2e086ec3-bda2-4292-88b8-2dd8b518923c', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 1, 'c3267678-1fc9-4f2f-882e-73920e743d7d',
  41, 71, '2025-06-01T00:02:18', '2025-11-28T00:02:18',
  'expired', 1, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 1
);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  'd3adffeb-6396-42d9-8d37-9bb9cc66c120', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 3, '74f4c043-d233-45e3-a194-dabc2b61238e',
  34, 57, '2025-04-20T09:40:17', '2025-10-17T09:40:17',
  'expired', 2, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 2
);
INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  'aedcd17e-19f3-4fe1-a49c-e51a4568028f', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 5, '68438d3e-e8b5-452c-b6c0-e3f2ad6cbed2',
  24, 26, '2025-04-14T22:46:00', '2025-10-11T22:46:00',
  'low', 3, now(), now(), '277b571a-d4f8-40cc-a043-dc1c9f91299b',
  1, 3
);

-- FEEDBACK
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('2eeda5fa-0199-4abb-b892-601b8b46f37e', '8b53d1d6-e660-4936-b713-0f8280b47ba2', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Difficult machine general throw various high.', '2025-04-08T13:50:22', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('465568dc-0001-420f-a5e9-d1d92ddd1f0c', '5a5a59a8-ddf9-4801-ac57-7d2459754fdb', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Hit our think quickly lawyer conference.', '2025-05-24T15:31:27', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('212211df-1fe4-478d-b3b4-c6c67843c05d', '37ef2c35-da29-439f-8397-a6f59e17ce37', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Mean why memory involve kitchen.', '2025-02-02T01:36:39', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('998b10bc-8acd-4a6b-a76b-843b55ac9f1b', 'cc0894cc-b1a1-45fe-8466-3c1d13cef6cd', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Cost crime claim strategy anything different.', '2025-06-18T18:38:46', true);
INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('0c9dd59a-8fd3-48e6-b388-ee3d40e9a82f', '4ca3bbe4-fff6-47da-8f04-d8c3c60d5705', 'c3998b67-9779-4d2c-9b45-6d6f8fda6079', 'Cause put approach follow.', '2025-04-21T14:12:03', true);
