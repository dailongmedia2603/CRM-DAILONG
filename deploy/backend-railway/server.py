import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import uuid
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CRM System API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
DATABASE_NAME = "crm_system"

# Database connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "sales"

class UserLogin(BaseModel):
    email: str
    password: str

class Customer(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str = "new"
    assigned_sales: Optional[str] = None
    notes: Optional[str] = None

class Interaction(BaseModel):
    customer_id: str
    type: str  # call, email, meeting
    description: str
    outcome: Optional[str] = None
    next_action: Optional[str] = None
    revenue_potential: Optional[float] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_doc["id"],
            "email": user_doc["email"],
            "full_name": user_doc["full_name"],
            "role": user_doc["role"]
        }
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "full_name": db_user["full_name"],
            "role": db_user["role"]
        }
    }

@app.get("/api/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"]
    }

@app.get("/api/customers")
async def get_customers(current_user: dict = Depends(get_current_user)):
    customers = []
    async for customer in db.customers.find():
        customer["_id"] = str(customer["_id"])
        customers.append(customer)
    return customers

@app.post("/api/customers")
async def create_customer(customer: Customer, current_user: dict = Depends(get_current_user)):
    customer_doc = customer.dict()
    customer_doc["id"] = str(uuid.uuid4())
    customer_doc["created_at"] = datetime.utcnow()
    customer_doc["created_by"] = current_user["id"]
    
    result = await db.customers.insert_one(customer_doc)
    customer_doc["_id"] = str(result.inserted_id)
    
    return customer_doc

@app.get("/api/customers/{customer_id}")
async def get_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer["_id"] = str(customer["_id"])
    return customer

@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: Customer, current_user: dict = Depends(get_current_user)):
    update_doc = customer.dict()
    update_doc["updated_at"] = datetime.utcnow()
    
    result = await db.customers.update_one(
        {"id": customer_id},
        {"$set": update_doc}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer updated successfully"}

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

@app.get("/api/interactions")
async def get_interactions(current_user: dict = Depends(get_current_user)):
    interactions = []
    async for interaction in db.interactions.find():
        interaction["_id"] = str(interaction["_id"])
        interactions.append(interaction)
    return interactions

@app.post("/api/interactions")
async def create_interaction(interaction: Interaction, current_user: dict = Depends(get_current_user)):
    interaction_doc = interaction.dict()
    interaction_doc["id"] = str(uuid.uuid4())
    interaction_doc["created_at"] = datetime.utcnow()
    interaction_doc["created_by"] = current_user["id"]
    
    result = await db.interactions.insert_one(interaction_doc)
    interaction_doc["_id"] = str(result.inserted_id)
    
    return interaction_doc

@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    # Get basic counts
    total_customers = await db.customers.count_documents({})
    total_interactions = await db.interactions.count_documents({})
    
    # Get revenue data (mock for now)
    revenue_data = {
        "total_revenue": 250000,
        "monthly_revenue": 45000,
        "revenue_growth": 12.5
    }
    
    # Get customer status distribution
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_distribution = []
    async for doc in db.customers.aggregate(pipeline):
        status_distribution.append({"status": doc["_id"], "count": doc["count"]})
    
    return {
        "total_customers": total_customers,
        "total_interactions": total_interactions,
        "revenue": revenue_data,
        "customer_status_distribution": status_distribution
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))