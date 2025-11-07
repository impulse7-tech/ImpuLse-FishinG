from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone

from .models import ( # Корекция: Относителен импорт
    User, UserCreate, UserLogin, UserInDB, Token,
    Product, ProductCreate,
    Order, OrderCreate, OrderItem,
    ChatMessage, ChatMessageCreate
)
from .auth import ( # Корекция: Относителен импорт
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_admin
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# Уверете се, че MONGO_URL е URL-кодиран в Render Environment Variables
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title='ImpuLse FishinG API') # Корекция: Използвани са единични кавички

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ HELPER FUNCTIONS ============
def serialize_datetime(obj):
    """Convert datetime to ISO string for MongoDB storage"""
    if isinstance(obj, dict):
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in obj.items()}
    return obj

def deserialize_datetime(obj):
    """Convert ISO string back to datetime"""
    if isinstance(obj, dict):
        for key in ['created_at', 'timestamp']:
            if key in obj and isinstance(obj[key], str):
                obj[key] = datetime.fromisoformat(obj[key])
    return obj


# ============ AUTH ROUTES ============
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump(exclude={"password"})
    user = User(**user_dict)
    user_in_db = UserInDB(**user.model_dump(), password_hash=get_password_hash(user_data.password))
    
    doc = serialize_datetime(user_in_db.model_dump())
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return Token(access_token=access_token, user=user)


@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_in_db = UserInDB(**deserialize_datetime(user_doc))
    if not verify_password(credentials.password, user_in_db.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_in_db.model_dump(exclude={"password_hash"}))
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return Token(access_token=access_token, user=user)


@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user["sub"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**deserialize_datetime(user_doc))


# ============ PRODUCT ROUTES ============
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    discount_only: bool = False
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if discount_only:
        query["discount_percentage"] = {"$gt": 0}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return [Product(**deserialize_datetime(p)) for p in products]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**deserialize_datetime(product))


@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_admin)):
    product = Product(**product_data.model_dump())
    doc = serialize_datetime(product.model_dump())
    await db.products.insert_one(doc)
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin)
):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = Product(**{**existing, **product_data.model_dump()})
    doc = serialize_datetime(updated.model_dump())
    await db.products.replace_one({"id": product_id}, doc)
    return updated


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ============ ORDER ROUTES ============
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    # Calculate total
    total = sum(item.product_price * item.quantity for item in order_data.items)
    
    order = Order(
        user_id=current_user["sub"],
        **order_data.model_dump(),
        total=total
    )
    
    doc = serialize_datetime(order.model_dump())
    await db.orders.insert_one(doc)
    return order


@api_router.post("/orders/guest", response_model=Order)
async def create_guest_order(order_data: OrderCreate):
    """Create order without authentication"""
    total = sum(item.product_price * item.quantity for item in order_data.items)
    
    order = Order(
        user_id=None,
        **order_data.model_dump(),
        total=total
    )
    
    doc = serialize_datetime(order.model_dump())
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "admin":
        # Admin sees all orders
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    else:
        # User sees only their orders
        orders = await db.orders.find({"user_id": current_user["sub"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    return [Order(**deserialize_datetime(o)) for o in orders]


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions
    if current_user["role"] != "admin" and order["user_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return Order(**deserialize_datetime(order))


@api_router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_admin)
):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Status updated"}


# ============ CHAT ROUTES ============
@api_router.get("/chat/messages", response_model=List[ChatMessage])
async def get_chat_messages(limit: int = 100):
    messages = await db.chat_messages.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    messages.reverse()  # Show oldest first
    return [ChatMessage(**deserialize_datetime(m)) for m in messages]


@api_router.post("/chat/messages", response_model=ChatMessage)
async def send_chat_message(message_data: ChatMessageCreate):
    message = ChatMessage(**message_data.model_dump())
    doc = serialize_datetime(message.model_dump())
    await db.chat_messages.insert_one(doc)
    return message


# ============ CATEGORIES ROUTE ============
@api_router.get("/categories")
async def get_categories():
    """Get all unique categories"""
    categories = await db.products.distinct("category")
    return categories


# ============ ROOT ROUTE ============
@api_router.get("/")
async def root():
    return {"message": "ImpuLse FishinG API", "status": "running"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():

    client.close()
