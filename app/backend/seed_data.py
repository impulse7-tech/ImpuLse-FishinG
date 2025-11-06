"\"\"\"
Seed data script to populate initial products and admin user
Run: python seed_data.py
\"\"\"
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
from auth import get_password_hash
from datetime import datetime, timezone
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']


async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(\"🌱 Seeding database...\")
    
    # Create admin user
    admin_user = {
        \"id\": str(uuid.uuid4()),
        \"email\": \"admin@impulsefishing.bg\",
        \"name\": \"Admin\",
        \"phone\": \"+359888123456\",
        \"address\": \"София, България\",
        \"role\": \"admin\",
        \"password_hash\": get_password_hash(\"admin123\"),
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    
    existing_admin = await db.users.find_one({\"email\": \"admin@impulsefishing.bg\"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print(\"✅ Admin user created: admin@impulsefishing.bg / admin123\")
    else:
        print(\"ℹ️  Admin user already exists\")
    
    # Sample products
    products = [
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Макара Tica Perf Pursuit PS 3000\",
            \"description\": \"Висококачествена риболовна макара за спининг. Плавно действие, издръжлива конструкция.\",
            \"price\": 109.90,
            \"price_eur\": 56.19,
            \"category\": \"Макари\",
            \"image_url\": \"https://images.unsplash.com/photo-1533745848184-3db07256e163?w=400\",
            \"stock\": 15,
            \"discount_percentage\": 20,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Детски комплект за спининг Kinetic Ramasjang CC Pink\",
            \"description\": \"Перфектен комплект за начинаещи и деца. Дължина 1.65m, тест 5-24g. Включва въдица и макара.\",
            \"price\": 69.00,
            \"price_eur\": 35.28,
            \"category\": \"Комплекти\",
            \"image_url\": \"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400\",
            \"stock\": 8,
            \"discount_percentage\": 15,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Плетено влакно PowerPro 150м\",
            \"description\": \"4-жилно плетено влакно с високa издръжливост. Налично в различни дебелини.\",
            \"price\": 45.00,
            \"price_eur\": 23.01,
            \"category\": \"Влакна\",
            \"image_url\": \"https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400\",
            \"stock\": 25,
            \"discount_percentage\": 0,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Силиконови примамки комплект 10бр\",
            \"description\": \"Разнообразни силиконови примамки за хищна риба. Различни цветове и размери.\",
            \"price\": 29.90,
            \"price_eur\": 15.29,
            \"category\": \"Примамки\",
            \"image_url\": \"https://images.unsplash.com/photo-1515444744559-7be63e1600de?w=400\",
            \"stock\": 50,
            \"discount_percentage\": 10,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Въдица за спининг Carbon Master 2.4м\",
            \"description\": \"Лека карбонова въдица. Тест 10-40g, идеална за речен и морски риболов.\",
            \"price\": 139.00,
            \"price_eur\": 71.08,
            \"category\": \"Въдици\",
            \"image_url\": \"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400\",
            \"stock\": 12,
            \"discount_percentage\": 0,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Риболовна чанта Pro Tackle Bag\",
            \"description\": \"Просторна чанта с множество джобове за организация на екипировката.\",
            \"price\": 85.00,
            \"price_eur\": 43.46,
            \"category\": \"Аксесоари\",
            \"image_url\": \"https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400\",
            \"stock\": 10,
            \"discount_percentage\": 25,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Воблери комплект Premium 5бр\",
            \"description\": \"Професионални воблери за различни условия. Реалистична анимация.\",
            \"price\": 55.00,
            \"price_eur\": 28.12,
            \"category\": \"Примамки\",
            \"image_url\": \"https://images.unsplash.com/photo-1515444744559-7be63e1600de?w=400\",
            \"stock\": 18,
            \"discount_percentage\": 0,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        },
        {
            \"id\": str(uuid.uuid4()),
            \"name\": \"Макара Shimano Ultegra 4000\",
            \"description\": \"Първокласна макара от Shimano. Гладко завъртане, дълготрайност.\",
            \"price\": 189.00,
            \"price_eur\": 96.64,
            \"category\": \"Макари\",
            \"image_url\": \"https://images.unsplash.com/photo-1533745848184-3db07256e163?w=400\",
            \"stock\": 7,
            \"discount_percentage\": 0,
            \"created_at\": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Clear existing products (optional - remove in production)
    existing_count = await db.products.count_documents({})
    if existing_count == 0:
        await db.products.insert_many(products)
        print(f\"✅ Created {len(products)} sample products\")
    else:
        print(f\"ℹ️  {existing_count} products already exist\")
    
    client.close()
    print(\"✨ Database seeding complete!\")


if __name__ == \"__main__\":
    asyncio.run(seed_database())
"