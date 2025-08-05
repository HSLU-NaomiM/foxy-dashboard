from faker import Faker
import random
import uuid
from datetime import datetime, timedelta
import os

# ---------- KONFIGURATION ----------
# 🔧 Trage hier deine echte machine_id und deinen user_id aus Supabase ein:
MACHINE_ID = "c3998b67-9779-4d2c-9b45-6d6f8fda6079"
CREATED_BY = "277b571a-d4f8-40cc-a043-dc1c9f91299b"
# -----------------------------------

fake = Faker()

# Produkte-Tabelle gemäss deiner Datenbank
PRODUCTS = [
    (1, "Wasser", 1.00, 365),
    (2, "Cola", 1.50, 180),
    (3, "Apfel", 0.80, 30),
    (4, "Schokoriegel", 1.20, 90),
    (5, "Sandwich", 3.00, 5),
    (6, "Kaffee", 2.50, 180),
    (7, "Tee", 2.00, 365),
    (8, "Saft", 1.80, 60),
    (9, "Energydrink", 2.20, 180),
    (10, "Chips", 1.30, 180),
    (21, "Task Snack", 3.97, 120),
    (22, "Show Snack", 3.27, 120),
    (23, "Gun Snack", 1.04, 240),
    (24, "Hotel Snack", 2.94, 90),
    (25, "Of Snack", 3.16, 180)
]

# Auswahl von 10 zufälligen Produkten
selected_products = random.sample(PRODUCTS, 10)

# Datei vorbereiten
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
filename = f"seed_inventory_for_machine_{timestamp}.sql"
filepath = os.path.join(os.getcwd(), filename)

with open(filepath, mode="w") as file:
    file.write(f"-- Faker Seed für Maschine {MACHINE_ID}\n\n")

    # 🚚 DELIVERIES + 🧺 INVENTORY
    file.write("-- DELIVERIES & INVENTORY\n")
    for i, (product_id, name, price, shelf_life) in enumerate(selected_products, start=1):
        batch_id = uuid.uuid4()
        inventory_id = uuid.uuid4()
        delivery_date = fake.date_time_this_year().replace(microsecond=0)
        best_before = delivery_date + timedelta(days=shelf_life)
        quantity = random.randint(50, 200)
        current_stock = random.randint(10, min(50, quantity))
        capacity = current_stock + random.randint(10, 30)
        restocked_at = delivery_date
        status = random.choice(["ok", "low", "expired"])

        file.write(f"-- Produkt: {name}\n")
        file.write(f"INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES (\n")
        file.write(f"  '{batch_id}', {product_id}, '{delivery_date}', '{best_before}', {quantity});\n")

        file.write(f"INSERT INTO inventory (\n")
        file.write(f"  inventory_id, machine_id, product_id, batch_id,\n")
        file.write(f"  current_stock, capacity, restocked_at, best_before_date,\n")
        file.write(f"  status, position_id, created_at, updated_at, created_by,\n")
        file.write(f"  shelf_row, shelf_column\n")
        file.write(f") VALUES (\n")
        file.write(f"  '{inventory_id}', '{MACHINE_ID}', {product_id}, '{batch_id}',\n")
        file.write(f"  {current_stock}, {capacity}, '{restocked_at}', '{best_before}',\n")
        file.write(f"  '{status}', {100+i}, now(), now(), '{CREATED_BY}',\n")
        file.write(f"  {i // 5 + 1}, {i % 5 + 1}\n")
        file.write(f");\n\n")

    # 💬 FEEDBACK
    file.write("-- FEEDBACK\n")
    for _ in range(5):
        feedback_id = uuid.uuid4()
        user_id = uuid.uuid4()
        feedback_text = fake.sentence(nb_words=6)
        submitted = fake.date_time_this_year().replace(microsecond=0)
        resolved = random.choice(['true', 'false'])

        file.write(f"INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES (\n")
        file.write(f"  '{feedback_id}', '{user_id}', '{MACHINE_ID}', '{feedback_text}', '{submitted}', {resolved});\n")

print(f"✅ SQL-Datei erfolgreich erstellt: {filepath}")
