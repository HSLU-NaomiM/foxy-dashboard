from faker import Faker
import random
import uuid
from datetime import datetime, timedelta
import os

# Initialisiere Faker
fake = Faker()

# Zeitstempel für Dateinamen
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
filename = f"faker_seed_{timestamp}.sql"
filepath = os.path.join(os.getcwd(), filename)  # gleiche Ordner wie das Skript

# Reale Supabase-IDs einsetzen
real_machine_id = 'c3998b67-9779-4d2c-9b45-6d6f8fda6079'
real_user_id = '277b571a-d4f8-40cc-a043-dc1c9f91299b'

# Für spätere Verknüpfung
deliveries = []

# Schreibe SQL-Datei
with open(filepath, mode="w") as file:

    # 🔹 PRODUCTS
    file.write("-- PRODUCTS\n")
    for i in range(1, 6):
        name = fake.word().capitalize() + " Snack"
        price = round(random.uniform(1.00, 4.00), 2)
        shelf_life_days = random.choice([90, 120, 180, 240])
        sql = f"INSERT INTO products (product_id, name, price, shelf_life_days) VALUES ({i}, '{name}', {price}, {shelf_life_days});\n"
        file.write(sql)

    # 🔹 MACHINES
    file.write("\n-- MACHINES\n")
    for i in range(3):
        machine_id = uuid.uuid4()
        name = f"Maschine {fake.city()}"
        location = fake.address().replace("\n", ", ")
        sql = f"INSERT INTO machines (machine_id, machine_name, machine_location) VALUES ('{machine_id}', '{name}', '{location}');\n"
        file.write(sql)

    # 🔹 DELIVERIES
    file.write("\n-- DELIVERIES\n")
    for i in range(3):
        batch_id = uuid.uuid4()
        product_id = random.randint(1, 5)
        delivery_date = fake.date_time_this_year().replace(microsecond=0).isoformat()
        best_before = (datetime.fromisoformat(delivery_date) + timedelta(days=random.randint(90, 240))).isoformat()
        quantity = random.randint(50, 150)
        deliveries.append((batch_id, product_id))
        sql = f"INSERT INTO deliveries (batch_id, product_id, delivery_date, best_before_date, quantity) VALUES ('{batch_id}', {product_id}, '{delivery_date}', '{best_before}', {quantity});\n"
        file.write(sql)

    # 🔹 INVENTORY
    file.write("\n-- INVENTORY\n")
    for i in range(3):
        inventory_id = uuid.uuid4()
        batch_id, product_id = deliveries[i]
        stock = random.randint(10, 50)
        capacity = random.randint(stock, 80)
        restock = fake.date_time_this_year().replace(microsecond=0).isoformat()
        best_before = (datetime.fromisoformat(restock) + timedelta(days=180)).isoformat()
        status = random.choice(["ok", "low", "expired"])
        sql = f"""INSERT INTO inventory (
  inventory_id, machine_id, product_id, batch_id,
  current_stock, capacity, restocked_at, best_before_date,
  status, position_id, created_at, updated_at, created_by,
  shelf_row, shelf_column
) VALUES (
  '{inventory_id}', '{real_machine_id}', {product_id}, '{batch_id}',
  {stock}, {capacity}, '{restock}', '{best_before}',
  '{status}', {i+1}, now(), now(), '{real_user_id}',
  1, {i+1}
);\n"""
        file.write(sql)

    # 🔹 FEEDBACK
    file.write("\n-- FEEDBACK\n")
    for _ in range(5):
        feedback_id = uuid.uuid4()
        user_id = uuid.uuid4()
        text = fake.sentence(nb_words=6)
        submitted = fake.date_time_this_year().replace(microsecond=0).isoformat()
        resolved = random.choice(['true', 'false'])
        sql = f"INSERT INTO feedback (feedback_id, user_id, machine_id, feedback_text, submitted_at, resolved) VALUES ('{feedback_id}', '{user_id}', '{real_machine_id}', '{text}', '{submitted}', {resolved});\n"
        file.write(sql)

print(f"✅ SQL-Datei erfolgreich erstellt: {filepath}")
