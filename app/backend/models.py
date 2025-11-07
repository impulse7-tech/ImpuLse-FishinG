from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = \"user\"  # user or admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserInDB(User):
    password_hash: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Product Models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float  # BGN
    price_eur: float  # EUR
    category: str
    image_url: Optional[str] = None
    stock: int = 0
    discount_percentage: int = 0  # 0-100

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: Optional[str] = None
    notes: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Optional for guest orders
    items: List[OrderItem]
    total: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: Optional[str] = None
    notes: Optional[str] = None
    status: str = \"pending\"  # pending, confirmed, shipped, delivered, cancelled
    payment_method: str = \"cash_on_delivery\"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Chat Models
class ChatMessage(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nickname: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    nickname: str
    message: str


# Auth Token
class Token(BaseModel):
    access_token: str
    token_type: str = \"bearer\"
    user: User
