from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="CRM System API", description="Professional CRM for Sales Management")
api_router = APIRouter(prefix="/api")

# Enums
class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class ProjectProgress(str, Enum):
    IN_PROGRESS = "in_progress"  # Đang chạy
    COMPLETED = "completed"      # Hoàn thành
    ACCEPTED = "accepted"        # Nghiệm thu

class UserRole(str, Enum):
    ADMIN = "admin"
    SALES = "sales" 
    MANAGER = "manager"
    SALE = "sale"
    INTERN = "intern"  # Thực tập sinh
    SEEDER = "seeder"
    ACCOUNT = "account"
    CONTENT = "content"

class CustomerStatus(str, Enum):
    HIGH = "high"          # Tiềm năng
    NORMAL = "normal"      # Bình thường  
    LOW = "low"            # Thấp

class CareStatus(str, Enum):
    POTENTIAL_CLOSE = "potential_close"  # Khả năng chốt
    THINKING = "thinking"                # Đang suy nghĩ
    WORKING = "working"                  # Đang làm việc
    SILENT = "silent"                    # Im ru
    REJECTED = "rejected"                # Từ chối

class SalesResult(str, Enum):
    SIGNED_CONTRACT = "signed_contract"  # Ký hợp đồng
    NOT_INTERESTED = "not_interested"    # Không quan tâm

class InteractionType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    FOLLOW_UP = "follow_up"
    SALE = "sale"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(str, Enum):
    PENDING = "pending"  # Chờ xử lý
    IN_PROGRESS = "in_progress"  # Đang làm
    COMPLETED = "completed"  # Hoàn thành

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[EmailStr] = None
    username: str  # Tài khoản đăng nhập
    full_name: Optional[str] = None  # Tên nhân sự
    position: Optional[str] = None  # Vị trí
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    avatar: Optional[str] = None
    phone: Optional[str] = None
    target_monthly: Optional[float] = 0.0

class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    username: str  # Tài khoản đăng nhập bắt buộc
    password: str  # Mật khẩu bắt buộc
    full_name: Optional[str] = None  # Tên nhân sự
    position: Optional[str] = None  # Vị trí
    role: UserRole  # Quyền hạn bắt buộc
    phone: Optional[str] = None
    target_monthly: Optional[float] = 0.0

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    position: Optional[str] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    target_monthly: Optional[float] = None
    is_active: Optional[bool] = None

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: Optional[str] = None  # Kết nối với Client module
    name: str  # Tên dự án
    work_file_link: Optional[str] = None  # File làm việc (link)
    start_date: Optional[datetime] = None  # Ngày bắt đầu
    end_date: Optional[datetime] = None    # Ngày kết thúc
    contract_value: Optional[float] = 0.0  # Giá trị hợp đồng
    debt: Optional[float] = 0.0            # Công nợ
    account_id: Optional[str] = None       # Account person
    content_id: Optional[str] = None       # Content person  
    seeder_id: Optional[str] = None        # Seeder person
    progress: ProjectProgress = ProjectProgress.IN_PROGRESS  # Tiến độ
    status: ProjectStatus = ProjectStatus.ACTIVE             # Trạng thái
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None       # User who created the project
    notes: Optional[str] = None

class ProjectCreate(BaseModel):
    client_id: Optional[str] = None
    name: str
    work_file_link: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    contract_value: Optional[float] = 0.0
    debt: Optional[float] = 0.0
    account_id: Optional[str] = None
    content_id: Optional[str] = None
    seeder_id: Optional[str] = None
    progress: Optional[ProjectProgress] = ProjectProgress.IN_PROGRESS
    status: Optional[ProjectStatus] = ProjectStatus.ACTIVE
    notes: Optional[str] = None

class ProjectUpdate(BaseModel):
    client_id: Optional[str] = None
    name: Optional[str] = None
    work_file_link: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    contract_value: Optional[float] = None
    debt: Optional[float] = None
    account_id: Optional[str] = None
    content_id: Optional[str] = None
    seeder_id: Optional[str] = None
    progress: Optional[ProjectProgress] = None
    status: Optional[ProjectStatus] = None
    notes: Optional[str] = None

class UserLogin(BaseModel):
    login: str  # Có thể là email hoặc username
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Tên khách hàng (Tên Zalo/Facebook)
    phone: Optional[str] = None
    company: Optional[str] = None  # Sản phẩm
    status: CustomerStatus = CustomerStatus.HIGH  # Tiềm năng
    care_status: CareStatus = CareStatus.POTENTIAL_CLOSE  # Trạng thái chăm sóc
    sales_result: Optional[SalesResult] = None  # Kết quả bán hàng
    assigned_sales_id: str
    total_revenue: float = 0.0
    potential_value: float = 0.0  # Giá trị hợp đồng
    last_contact: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None  # Ghi chú
    source: Optional[str] = None  # Nguồn

class CustomerCreate(BaseModel):
    name: str  # Tên khách hàng (Tên Zalo/Facebook)
    phone: Optional[str] = None
    company: Optional[str] = None  # Sản phẩm
    status: CustomerStatus = CustomerStatus.HIGH  # Tiềm năng
    care_status: CareStatus = CareStatus.POTENTIAL_CLOSE  # Trạng thái chăm sóc
    sales_result: Optional[SalesResult] = None  # Kết quả bán hàng
    assigned_sales_id: str
    potential_value: Optional[float] = 0.0  # Giá trị hợp đồng
    notes: Optional[str] = None  # Ghi chú
    source: Optional[str] = None  # Nguồn

class CustomerUpdate(BaseModel):
    name: Optional[str] = None  # Tên khách hàng (Tên Zalo/Facebook)
    phone: Optional[str] = None
    company: Optional[str] = None  # Sản phẩm
    status: Optional[CustomerStatus] = None  # Tiềm năng
    care_status: Optional[CareStatus] = None  # Trạng thái chăm sóc
    sales_result: Optional[SalesResult] = None  # Kết quả bán hàng
    potential_value: Optional[float] = None  # Giá trị hợp đồng
    notes: Optional[str] = None  # Ghi chú
    source: Optional[str] = None  # Nguồn

class Interaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    sales_id: str
    type: InteractionType
    title: str
    description: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    revenue_generated: Optional[float] = 0.0
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None

class InteractionCreate(BaseModel):
    customer_id: str
    type: InteractionType
    title: str
    description: Optional[str] = None
    revenue_generated: Optional[float] = 0.0
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    assigned_to: str
    priority: TaskPriority
    status: TaskStatus
    deadline: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    post_count: int = 0  # Số lượng post
    comment_count: int = 0  # Số lượng comment
    work_file_link: Optional[str] = None  # Link file làm việc

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    address: str
    business_type: str
    contract_value: float
    contract_start_date: datetime
    contract_end_date: datetime
    payment_terms: str
    status: str = "active"
    assigned_sales_id: Optional[str] = None  # Sales person assigned to this client
    created_by: Optional[str] = None         # User who created this client
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Task feedback/comment model
class TaskComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    user_name: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCommentCreate(BaseModel):
    message: str

# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Support both bcrypt direct and passlib
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        # Fallback to direct bcrypt check
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists (if provided)
    if user_data.email:
        existing_email = await db.users.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_obj = User(**user_dict)
    
    # Store user with hashed password
    user_with_password = user_obj.dict()
    user_with_password["password"] = hashed_password
    
    await db.users.insert_one(user_with_password)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    # Find user by email or username
    user_data = await db.users.find_one({
        "$or": [
            {"email": user_credentials.login},
            {"username": user_credentials.login}
        ]
    })
    if not user_data:
        raise HTTPException(status_code=400, detail="Invalid login credentials")
    
    # Verify password
    if not verify_password(user_credentials.password, user_data["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid login credentials")
    
    # Create token
    user_obj = User(**{k: v for k, v in user_data.items() if k != "hashed_password"})
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# User Management Routes
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_active_user)):
    try:
        users = await db.users.find().to_list(1000)
        return [User(**{k: v for k, v in user.items() if k != "password"}) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_current_active_user)):
    # Only admin can create users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can create users")
    
    try:
        # Check if username already exists
        existing_user = await db.users.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email already exists (if provided)
        if user_data.email:
            existing_email = await db.users.find_one({"email": user_data.email})
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create user
        hashed_password = get_password_hash(user_data.password)
        user_dict = user_data.dict()
        user_dict.pop("password")
        user_obj = User(**user_dict)
        
        # Store user with hashed password
        user_with_password = user_obj.dict()
        user_with_password["password"] = hashed_password
        
        await db.users.insert_one(user_with_password)
        return user_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**{k: v for k, v in user.items() if k != "password"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate, current_user: User = Depends(get_current_active_user)):
    # Only admin can update users or user can update themselves
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    try:
        # Get existing user
        existing_user = await db.users.find_one({"id": user_id})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update data
        update_data = {}
        for field, value in user_data.dict(exclude_unset=True).items():
            if value is not None:
                # Check username uniqueness if updating username
                if field == "username" and value != existing_user.get("username"):
                    username_exists = await db.users.find_one({"username": value, "id": {"$ne": user_id}})
                    if username_exists:
                        raise HTTPException(status_code=400, detail="Username already exists")
                
                # Check email uniqueness if updating email
                if field == "email" and value != existing_user.get("email"):
                    email_exists = await db.users.find_one({"email": value, "id": {"$ne": user_id}})
                    if email_exists:
                        raise HTTPException(status_code=400, detail="Email already exists")
                
                update_data[field] = value
        
        if update_data:
            await db.users.update_one({"id": user_id}, {"$set": update_data})
        
        # Return updated user
        updated_user = await db.users.find_one({"id": user_id})
        return User(**{k: v for k, v in updated_user.items() if k != "password"})
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_active_user)):
    # Only admin can delete users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete users")
    
    # Cannot delete self
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Soft delete by setting is_active to False
        await db.users.update_one({"id": user_id}, {"$set": {"is_active": False}})
        return {"message": "User deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

@api_router.post("/users/bulk-delete")
async def bulk_delete_users(user_ids: List[str], current_user: User = Depends(get_current_active_user)):
    """Bulk delete users (admin only)"""
    # Only admin can delete users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete users")
    
    if not user_ids:
        raise HTTPException(status_code=400, detail="No user IDs provided")
    
    # Cannot delete self
    if current_user.id in user_ids:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    try:
        success_count = 0
        error_count = 0
        errors = []
        
        for user_id in user_ids:
            try:
                user = await db.users.find_one({"id": user_id})
                if not user:
                    errors.append(f"User {user_id}: Not found")
                    error_count += 1
                    continue
                
                # Soft delete by setting is_active to False
                await db.users.update_one({"id": user_id}, {"$set": {"is_active": False}})
                success_count += 1
                
            except Exception as e:
                errors.append(f"User {user_id}: {str(e)}")
                error_count += 1
        
        return {
            "message": f"Bulk delete completed",
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk delete: {str(e)}")

@api_router.post("/migrate/fix-users")
async def migrate_fix_users():
    """Fix existing users without authentication (one-time migration)"""
    try:
        users = await db.users.find().to_list(1000)
        updated_count = 0
        
        for user in users:
            update_fields = {}
            
            # Add username if missing
            if not user.get("username"):
                email = user.get("email", "")
                if email:
                    username = email.split("@")[0]
                else:
                    username = f"user_{user['id'][:8]}"
                update_fields["username"] = username
            
            # Add position if missing
            if not user.get("position"):
                if user.get("role") == "admin":
                    position = "System Administrator"
                elif user.get("role") == "sales":
                    position = "Sales Executive"
                elif user.get("role") == "manager":
                    position = "Sales Manager"
                else:
                    position = "Staff"
                update_fields["position"] = position
            
            # Update user if there are fields to update
            if update_fields:
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": update_fields}
                )
                updated_count += 1
        
        return {"message": f"Migration completed. Updated {updated_count} users."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")

@api_router.post("/migrate/add-usernames")
async def migrate_add_usernames(current_user: User = Depends(get_current_active_user)):
    """Migrate existing users to add username field"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can run migrations")
    
    try:
        # Update existing users to add username field based on email
        users = await db.users.find().to_list(1000)
        updated_count = 0
        
        for user in users:
            if not user.get("username"):
                # Generate username from email
                email = user.get("email", "")
                if email:
                    username = email.split("@")[0]  # Take part before @
                else:
                    username = f"user_{user['id'][:8]}"
                
                # Add position if missing
                position = user.get("position")
                if not position:
                    if user.get("role") == "admin":
                        position = "System Administrator"
                    elif user.get("role") == "sales":
                        position = "Sales Executive"
                    elif user.get("role") == "manager":
                        position = "Sales Manager"
                    else:
                        position = "Staff"
                
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"username": username, "position": position}}
                )
                updated_count += 1
        
        return {"message": f"Migration completed. Updated {updated_count} users with username field."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")

@api_router.get("/users/roles/list")
async def get_user_roles(current_user: User = Depends(get_current_active_user)):
    """Get list of available user roles"""
    return [
        {"value": "admin", "label": "Admin"},
        {"value": "sales", "label": "Sales"},
        {"value": "manager", "label": "Manager"},
        {"value": "sale", "label": "Sale"},
        {"value": "intern", "label": "Thực tập sinh"},
        {"value": "seeder", "label": "Seeder"},
        {"value": "account", "label": "Account"},
        {"value": "content", "label": "Content"}
    ]

# Project Management Routes
@api_router.get("/projects", response_model=List[Project])
async def get_projects(
    time_filter: Optional[str] = None,    # week, month, quarter, year
    time_value: Optional[str] = None,     # specific time value
    status: Optional[str] = None,         # active, archived
    progress: Optional[str] = None,       # in_progress, completed, accepted
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get projects with filtering and role-based access control"""
    try:
        filter_query = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Các role khác chỉ xem được projects mà:
            # - Được assign cho họ (account_id, content_id, seeder_id)
            # - Hoặc do họ tạo (created_by)
            role_conditions = [
                {"created_by": current_user.id}  # Projects do họ tạo
            ]
            
            # Thêm filter theo role cụ thể
            if current_user.role == UserRole.ACCOUNT:
                role_conditions.append({"account_id": current_user.id})
            elif current_user.role == UserRole.CONTENT:
                role_conditions.append({"content_id": current_user.id})
            elif current_user.role == UserRole.SEEDER:
                role_conditions.append({"seeder_id": current_user.id})
            elif current_user.role in [UserRole.SALES, UserRole.SALE, UserRole.INTERN]:
                # Sales roles có thể xem projects do họ tạo hoặc được assign
                role_conditions.append({"account_id": current_user.id})
                role_conditions.append({"content_id": current_user.id})
                role_conditions.append({"seeder_id": current_user.id})
            
            if role_conditions:
                filter_query["$or"] = role_conditions
        
        # Apply time filter
        if time_filter and time_value:
            time_range = get_time_range(time_filter, time_value)
            if time_range:
                filter_query["created_at"] = {
                    "$gte": time_range["start"],
                    "$lte": time_range["end"]
                }
        
        # Apply status filter
        if status:
            filter_query["status"] = status
            
        # Apply progress filter
        if progress:
            filter_query["progress"] = progress
            
        # Apply search (combine with role-based filter nếu có)
        if search:
            search_conditions = [
                {"name": {"$regex": search, "$options": "i"}}
            ]
            
            # Nếu đã có role filter, combine với search
            if "$or" in filter_query:
                filter_query = {
                    "$and": [
                        {"$or": filter_query["$or"]},  # Role filter
                        {"$or": search_conditions}     # Search filter
                    ]
                }
            else:
                filter_query["$or"] = search_conditions
        
        projects = await db.projects.find(filter_query).to_list(1000)
        return [Project(**{k: v for k, v in project.items()}) for project in projects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_active_user)):
    """Create new project"""
    try:
        project_dict = project_data.dict()
        project_dict["created_by"] = current_user.id  # Set creator
        project = Project(**project_dict)
        
        await db.projects.insert_one(project.dict())
        return project
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")

# IMPORTANT: Specific routes must come BEFORE parameterized routes to avoid conflicts
@api_router.get("/projects/statistics")
async def get_project_statistics(
    time_filter: Optional[str] = None,
    time_value: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get project statistics for widgets with role-based filtering"""
    try:
        filter_query = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Tạo role-based filter giống như endpoint /projects
            role_conditions = [
                {"created_by": current_user.id}  # Projects do họ tạo
            ]
            
            # Thêm filter theo role cụ thể
            if current_user.role == UserRole.ACCOUNT:
                role_conditions.append({"account_id": current_user.id})
            elif current_user.role == UserRole.CONTENT:
                role_conditions.append({"content_id": current_user.id})
            elif current_user.role == UserRole.SEEDER:
                role_conditions.append({"seeder_id": current_user.id})
            elif current_user.role in [UserRole.SALES, UserRole.SALE, UserRole.INTERN]:
                # Sales roles có thể xem projects do họ tạo hoặc được assign
                role_conditions.append({"account_id": current_user.id})
                role_conditions.append({"content_id": current_user.id})
                role_conditions.append({"seeder_id": current_user.id})
            
            if role_conditions:
                filter_query["$or"] = role_conditions
        
        # Apply time filter
        if time_filter and time_value:
            time_range = get_time_range(time_filter, time_value)
            if time_range:
                # Combine với role filter nếu có
                time_condition = {
                    "created_at": {
                        "$gte": time_range["start"],
                        "$lte": time_range["end"]
                    }
                }
                
                if "$or" in filter_query:
                    filter_query = {
                        "$and": [
                            {"$or": filter_query["$or"]},  # Role filter
                            time_condition                 # Time filter
                        ]
                    }
                else:
                    filter_query.update(time_condition)
        
        # Total projects (excluding archived)
        total_query = {
            **filter_query,
            "status": {"$ne": ProjectStatus.ARCHIVED}
        }
        total_projects = await db.projects.count_documents(total_query)
        
        # In progress projects
        in_progress_query = {
            **filter_query,
            "status": {"$ne": ProjectStatus.ARCHIVED},
            "progress": ProjectProgress.IN_PROGRESS
        }
        in_progress_projects = await db.projects.count_documents(in_progress_query)
        
        # Completed projects
        completed_query = {
            **filter_query,
            "status": {"$ne": ProjectStatus.ARCHIVED},
            "progress": {"$in": [ProjectProgress.COMPLETED, ProjectProgress.ACCEPTED]}
        }
        completed_projects = await db.projects.count_documents(completed_query)
        
        # Calculate contract value and debt
        pipeline = [
            {"$match": {
                **filter_query,
                "status": {"$ne": ProjectStatus.ARCHIVED}
            }},
            {"$group": {
                "_id": None,
                "total_contract_value": {"$sum": "$contract_value"},
                "total_debt": {"$sum": "$debt"}
            }}
        ]
        
        financial_stats = await db.projects.aggregate(pipeline).to_list(1)
        total_contract_value = financial_stats[0]["total_contract_value"] if financial_stats else 0
        total_debt = financial_stats[0]["total_debt"] if financial_stats else 0
        
        return {
            "total_projects": total_projects,
            "in_progress": in_progress_projects,
            "completed": completed_projects,
            "contract_value": total_contract_value,
            "debt": total_debt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project statistics: {str(e)}")

@api_router.get("/projects/progress-options")
async def get_project_progress_options(current_user: User = Depends(get_current_active_user)):
    """Get project progress options"""
    return [
        {"value": "in_progress", "label": "Đang chạy"},
        {"value": "completed", "label": "Hoàn thành"},
        {"value": "accepted", "label": "Nghiệm thu"}
    ]

@api_router.get("/projects/status-options")
async def get_project_status_options(current_user: User = Depends(get_current_active_user)):
    """Get project status options"""
    return [
        {"value": "active", "label": "Đang hoạt động"},
        {"value": "archived", "label": "Lưu trữ"}
    ]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_current_active_user)):
    """Get single project by ID"""
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project: {str(e)}")

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str, 
    project_data: ProjectUpdate, 
    current_user: User = Depends(get_current_active_user)
):
    """Update project"""
    try:
        # Get existing project
        existing_project = await db.projects.find_one({"id": project_id})
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Prepare update data
        update_data = {}
        for field, value in project_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await db.projects.update_one({"id": project_id}, {"$set": update_data})
        
        # Return updated project
        updated_project = await db.projects.find_one({"id": project_id})
        return Project(**updated_project)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating project: {str(e)}")

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_active_user)):
    """Delete project (soft delete by setting status to archived)"""
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Soft delete by archiving
        await db.projects.update_one(
            {"id": project_id}, 
            {"$set": {"status": ProjectStatus.ARCHIVED, "updated_at": datetime.utcnow()}}
        )
        return {"message": "Project archived successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")

def get_time_range(time_filter: str, time_value: str):
    """Helper function to calculate time range based on filter"""
    try:
        if time_filter == "week":
            # time_value format: "2024-W01" (year-week)
            year, week = time_value.split("-W")
            year = int(year)
            week = int(week)
            
            # Get first day of the year
            jan_1 = datetime(year, 1, 1)
            # Calculate the start of the specific week
            week_start = jan_1 + timedelta(weeks=week-1)
            week_start = week_start - timedelta(days=week_start.weekday())  # Monday
            week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
            
            return {"start": week_start, "end": week_end}
            
        elif time_filter == "month":
            # time_value format: "2024-01"
            year, month = time_value.split("-")
            year, month = int(year), int(month)
            
            month_start = datetime(year, month, 1)
            if month == 12:
                month_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                month_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
                
            return {"start": month_start, "end": month_end}
            
        elif time_filter == "quarter":
            # time_value format: "2024-Q1"
            year, quarter = time_value.split("-Q")
            year, quarter = int(year), int(quarter)
            
            quarter_months = {
                1: (1, 3),   # Q1: Jan-Mar
                2: (4, 6),   # Q2: Apr-Jun
                3: (7, 9),   # Q3: Jul-Sep
                4: (10, 12)  # Q4: Oct-Dec
            }
            
            start_month, end_month = quarter_months[quarter]
            quarter_start = datetime(year, start_month, 1)
            
            if end_month == 12:
                quarter_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                quarter_end = datetime(year, end_month + 1, 1) - timedelta(seconds=1)
                
            return {"start": quarter_start, "end": quarter_end}
            
        elif time_filter == "year":
            # time_value format: "2024"
            year = int(time_value)
            year_start = datetime(year, 1, 1)
            year_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            
            return {"start": year_start, "end": year_end}
            
    except Exception:
        return None
    
    return None

# Sales Management Routes
@api_router.get("/sales", response_model=List[User])
async def get_sales_team(current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sales_users = await db.users.find({"role": "sales", "is_active": True}).to_list(1000)
    return [User(**{k: v for k, v in user.items() if k != "hashed_password"}) for user in sales_users]

@api_router.get("/sales/{sales_id}/analytics")
async def get_sales_analytics(sales_id: str, current_user: User = Depends(get_current_active_user)):
    # Get sales person
    sales_person = await db.users.find_one({"id": sales_id})
    if not sales_person:
        raise HTTPException(status_code=404, detail="Sales person not found")
    
    # Get customers assigned to this sales person
    customers = await db.customers.find({"assigned_sales_id": sales_id}).to_list(1000)
    
    # Get interactions for this sales person
    interactions = await db.interactions.find({"sales_id": sales_id}).to_list(1000)
    
    # Calculate analytics
    total_customers = len(customers)
    total_revenue = sum(customer.get("total_revenue", 0) for customer in customers)
    potential_revenue = sum(customer.get("potential_value", 0) for customer in customers)
    
    # Customer status distribution
    status_distribution = {}
    for customer in customers:
        status = customer.get("status", "lead")
        status_distribution[status] = status_distribution.get(status, 0) + 1
    
    # Monthly interactions
    monthly_interactions = {}
    for interaction in interactions:
        month = interaction.get("date", datetime.utcnow()).strftime("%Y-%m")
        monthly_interactions[month] = monthly_interactions.get(month, 0) + 1
    
    # Convert MongoDB documents to serializable format
    sales_person_data = {k: v for k, v in sales_person.items() if k not in ["_id", "hashed_password"]}
    recent_interactions_data = []
    for interaction in interactions[-10:] if interactions else []:
        interaction_data = {k: v for k, v in interaction.items() if k != "_id"}
        recent_interactions_data.append(interaction_data)
    
    return {
        "sales_person": sales_person_data,
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "potential_revenue": potential_revenue,
        "status_distribution": status_distribution,
        "monthly_interactions": monthly_interactions,
        "recent_interactions": recent_interactions_data
    }

# Customer Management Routes
@api_router.get("/customers", response_model=List[Customer])
async def get_customers(
    sales_id: Optional[str] = None,
    status: Optional[CustomerStatus] = None,
    current_user: User = Depends(get_current_active_user)
):
    query = {}
    
    # If user is sales, only show their customers
    if current_user.role == UserRole.SALES:
        query["assigned_sales_id"] = current_user.id
    elif sales_id:
        query["assigned_sales_id"] = sales_id
    
    if status:
        query["status"] = status
    
    customers = await db.customers.find(query).to_list(1000)
    return [Customer(**customer) for customer in customers]

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_active_user)):
    # If user is sales, assign to themselves
    if current_user.role == UserRole.SALES:
        customer_data.assigned_sales_id = current_user.id
    
    customer_obj = Customer(**customer_data.dict())
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_active_user)):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if user has access to this customer
    if current_user.role == UserRole.SALES and customer["assigned_sales_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Customer(**customer)

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str, 
    customer_update: CustomerUpdate, 
    current_user: User = Depends(get_current_active_user)
):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check access
    if current_user.role == UserRole.SALES and customer["assigned_sales_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update customer
    update_data = {k: v for k, v in customer_update.dict().items() if v is not None}
    if update_data:
        await db.customers.update_one({"id": customer_id}, {"$set": update_data})
        customer.update(update_data)
    
    return Customer(**customer)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# Interaction Management Routes
@api_router.get("/customers/{customer_id}/interactions", response_model=List[Interaction])
async def get_customer_interactions(customer_id: str, current_user: User = Depends(get_current_active_user)):
    # Check if customer exists and user has access
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if current_user.role == UserRole.SALES and customer["assigned_sales_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    interactions = await db.interactions.find({"customer_id": customer_id}).sort("date", -1).to_list(1000)
    return [Interaction(**interaction) for interaction in interactions]

@api_router.post("/interactions", response_model=Interaction)
async def create_interaction(interaction_data: InteractionCreate, current_user: User = Depends(get_current_active_user)):
    # Verify customer exists and user has access
    customer = await db.customers.find_one({"id": interaction_data.customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if current_user.role == UserRole.SALES and customer["assigned_sales_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create interaction
    interaction_dict = interaction_data.dict()
    interaction_dict["sales_id"] = current_user.id
    interaction_obj = Interaction(**interaction_dict)
    
    await db.interactions.insert_one(interaction_obj.dict())
    
    # Update customer's last contact and total revenue
    update_data = {"last_contact": interaction_obj.date}
    if interaction_obj.revenue_generated:
        current_revenue = customer.get("total_revenue", 0)
        update_data["total_revenue"] = current_revenue + interaction_obj.revenue_generated
    
    await db.customers.update_one({"id": interaction_data.customer_id}, {"$set": update_data})
    
    return interaction_obj

# Client Management Routes
@api_router.get("/clients")
async def get_clients(status: str = "all", current_user: User = Depends(get_current_active_user)):
    try:
        query = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Các role khác chỉ xem được clients mà:
            # - Được assign cho họ (assigned_sales_id)
            # - Hoặc do họ tạo (created_by)
            role_conditions = [
                {"created_by": current_user.id}  # Clients do họ tạo
            ]
            
            # Thêm filter cho sales role
            if current_user.role in [UserRole.SALES, UserRole.SALE]:
                role_conditions.append({"assigned_sales_id": current_user.id})
            
            if role_conditions:
                query["$or"] = role_conditions
        
        # Apply status filter
        if status != "all":
            # Combine với role filter nếu có
            if "$or" in query:
                query = {
                    "$and": [
                        {"$or": query["$or"]},  # Role filter
                        {"status": status}      # Status filter
                    ]
                }
            else:
                query["status"] = status
            
        clients = await db.clients.find(query).to_list(1000)
        
        # Convert to serializable format
        clients_data = []
        for client in clients:
            client_data = {k: v for k, v in client.items() if k != "_id"}
            clients_data.append(client_data)
            
        return clients_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clients: {str(e)}")

@api_router.get("/clients/statistics")
async def get_client_statistics(current_user: User = Depends(get_current_active_user)):
    try:
        # Get current month start
        now = datetime.utcnow()
        current_month_start = datetime(now.year, now.month, 1)
        
        # Build role-based filter query
        filter_query = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Các role khác chỉ xem được clients mà:
            # - Được assign cho họ (assigned_sales_id)
            # - Hoặc do họ tạo (created_by)
            role_conditions = [
                {"created_by": current_user.id}  # Clients do họ tạo
            ]
            
            # Thêm filter cho sales role
            if current_user.role in [UserRole.SALES, UserRole.SALE]:
                role_conditions.append({"assigned_sales_id": current_user.id})
            
            if role_conditions:
                filter_query["$or"] = role_conditions
        
        # Total clients
        total_clients = await db.clients.count_documents(filter_query)
        
        # Total contract value using aggregation
        pipeline = [
            {"$match": filter_query},
            {"$group": {"_id": None, "total": {"$sum": "$contract_value"}}}
        ]
        total_contract_result = list(await db.clients.aggregate(pipeline).to_list(1))
        total_contract_value = total_contract_result[0]["total"] if total_contract_result else 0
        
        # Clients this month - combine role filter with time filter
        month_filter = {
            **filter_query,
            "created_at": {"$gte": current_month_start}
        }
        clients_this_month = await db.clients.count_documents(month_filter)
        
        # Contract value this month using aggregation
        pipeline_month = [
            {"$match": month_filter},
            {"$group": {"_id": None, "total": {"$sum": "$contract_value"}}}
        ]
        contract_month_result = list(await db.clients.aggregate(pipeline_month).to_list(1))
        contract_value_this_month = contract_month_result[0]["total"] if contract_month_result else 0
        
        return {
            "totalClients": total_clients,
            "totalContractValue": total_contract_value,
            "clientsThisMonth": clients_this_month,
            "contractValueThisMonth": contract_value_this_month
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")

@api_router.post("/clients")
async def create_client(client_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        client = {
            "id": str(uuid.uuid4()),
            "name": client_data.get("name", ""),
            "company": client_data.get("company", ""),
            "contact_person": client_data.get("contact_person", ""),
            "email": client_data.get("email", ""),
            "phone": client_data.get("phone", ""),
            "contract_value": float(client_data.get("contract_value", 0)),
            "contract_link": client_data.get("contract_link", ""),
            "address": client_data.get("address", ""),
            "notes": client_data.get("notes", ""),
            "invoice_email": client_data.get("invoice_email", ""),
            "client_type": client_data.get("client_type", "individual"),  # individual or business
            "source": client_data.get("source", ""),
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": current_user.id
        }
        
        result = await db.clients.insert_one(client)
        
        if result.inserted_id:
            # Remove the _id field for response
            client_response = {k: v for k, v in client.items() if k != "_id"}
            return client_response
        else:
            raise HTTPException(status_code=500, detail="Failed to create client")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating client: {str(e)}")

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, client_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        # Build update data only for provided fields
        update_data = {"updated_at": datetime.utcnow()}
        
        # Only update fields that are provided in the request
        if "name" in client_data:
            update_data["name"] = client_data["name"]
        if "company" in client_data:
            update_data["company"] = client_data["company"]
        if "contact_person" in client_data:
            update_data["contact_person"] = client_data["contact_person"]
        if "email" in client_data:
            update_data["email"] = client_data["email"]
        if "phone" in client_data:
            update_data["phone"] = client_data["phone"]
        if "contract_value" in client_data:
            update_data["contract_value"] = float(client_data["contract_value"])
        if "contract_link" in client_data:
            update_data["contract_link"] = client_data["contract_link"]
        if "address" in client_data:
            update_data["address"] = client_data["address"]
        if "notes" in client_data:
            update_data["notes"] = client_data["notes"]
        if "invoice_email" in client_data:
            update_data["invoice_email"] = client_data["invoice_email"]
        if "client_type" in client_data:
            update_data["client_type"] = client_data["client_type"]
        if "source" in client_data:
            update_data["source"] = client_data["source"]
        
        result = await db.clients.update_one(
            {"id": client_id},
            {"$set": update_data}
        )
        
        if result.matched_count:
            return {"message": "Client updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Client not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating client: {str(e)}")

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        result = await db.clients.delete_one({"id": client_id})
        
        if result.deleted_count:
            return {"message": "Client deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Client not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting client: {str(e)}")

@api_router.post("/clients/bulk-action")
async def bulk_action_clients(request_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        action = request_data.get("action")
        client_ids = request_data.get("client_ids", [])
        
        if not client_ids:
            raise HTTPException(status_code=400, detail="No client IDs provided")
        
        if action == "delete":
            result = await db.clients.delete_many({"id": {"$in": client_ids}})
            return {"message": f"Deleted {result.deleted_count} clients"}
        elif action == "archive":
            result = await db.clients.update_many(
                {"id": {"$in": client_ids}},
                {"$set": {"status": "archived", "updated_at": datetime.utcnow()}}
            )
            return {"message": f"Archived {result.modified_count} clients"}
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing bulk action: {str(e)}")

@api_router.get("/clients/{client_id}")
async def get_client_detail(client_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        client = await db.clients.find_one({"id": client_id})
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Remove _id field for response
        client_data = {k: v for k, v in client.items() if k != "_id"}
        return client_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching client detail: {str(e)}")

@api_router.get("/clients/{client_id}/documents")
async def get_client_documents(client_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        documents = await db.client_documents.find({"client_id": client_id}).to_list(1000)
        
        # Convert to serializable format
        documents_data = []
        for doc in documents:
            doc_data = {k: v for k, v in doc.items() if k != "_id"}
            documents_data.append(doc_data)
            
        return documents_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching client documents: {str(e)}")

@api_router.post("/clients/{client_id}/documents")
async def create_client_document(client_id: str, document_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        # Verify client exists
        client = await db.clients.find_one({"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        document = {
            "id": str(uuid.uuid4()),
            "client_id": client_id,
            "name": document_data.get("name"),
            "link": document_data.get("link", ""),
            "status": document_data.get("status", "pending"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": current_user.id
        }
        
        result = await db.client_documents.insert_one(document)
        
        if result.inserted_id:
            # Remove the _id field for response
            document_response = {k: v for k, v in document.items() if k != "_id"}
            return document_response
        else:
            raise HTTPException(status_code=500, detail="Failed to create document")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating document: {str(e)}")

@api_router.put("/clients/{client_id}/documents/{document_id}")
async def update_client_document(client_id: str, document_id: str, document_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        update_data = {
            "name": document_data.get("name"),
            "link": document_data.get("link", ""),
            "status": document_data.get("status", "pending"),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.client_documents.update_one(
            {"id": document_id, "client_id": client_id},
            {"$set": update_data}
        )
        
        if result.matched_count:
            return {"message": "Document updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating document: {str(e)}")

@api_router.delete("/clients/{client_id}/documents/{document_id}")
async def delete_client_document(client_id: str, document_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        result = await db.client_documents.delete_one({"id": document_id, "client_id": client_id})
        
        if result.deleted_count:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@api_router.get("/clients/{client_id}/projects")
async def get_client_projects(client_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        # For now, return empty array since projects module will be developed later
        # This endpoint will be updated when projects module is implemented
        return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching client projects: {str(e)}")

# Task Management Routes
@api_router.get("/tasks")
async def get_tasks(
    status: str = "active", 
    priority: str = None, 
    deadline_filter: str = None,
    date_filter: str = None,  # today, yesterday, last_7_days, custom
    date_from: str = None,    # for custom date range
    date_to: str = None,      # for custom date range
    current_user: User = Depends(get_current_active_user)
):
    try:
        query = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Các role khác chỉ xem được tasks mà:
            # - Được assign cho họ (assigned_to)
            # - Hoặc do họ tạo (created_by)
            role_conditions = [
                {"created_by": current_user.id},    # Tasks do họ tạo
                {"assigned_to": current_user.id}    # Tasks được assign cho họ
            ]
            
            query["$or"] = role_conditions
        
        # Filter by status
        status_conditions = []
        if status == "active":
            status_conditions = [{"status": {"$in": ["pending", "in_progress"]}}]
        elif status == "completed":
            status_conditions = [{"status": "completed"}]
        
        # Filter by priority
        priority_conditions = []
        if priority:
            priority_conditions = [{"priority": priority}]
            
        # Filter by deadline
        deadline_conditions = []
        if deadline_filter:
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow = today + timedelta(days=1)
            
            if deadline_filter == "today":
                deadline_conditions = [{"deadline": {"$gte": today, "$lt": tomorrow}}]
            elif deadline_filter == "overdue":
                deadline_conditions = [
                    {"deadline": {"$lt": today}}, 
                    {"status": {"$ne": "completed"}}
                ]
        
        # Date filtering (based on created_at)
        date_conditions = []
        if date_filter:
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            if date_filter == "today":
                tomorrow = today + timedelta(days=1)
                date_conditions = [{"created_at": {"$gte": today, "$lt": tomorrow}}]
            elif date_filter == "yesterday":
                yesterday = today - timedelta(days=1)
                date_conditions = [{"created_at": {"$gte": yesterday, "$lt": today}}]
            elif date_filter == "last_7_days":
                seven_days_ago = today - timedelta(days=7)
                date_conditions = [{"created_at": {"$gte": seven_days_ago, "$lt": today + timedelta(days=1)}}]
            elif date_filter == "custom" and date_from and date_to:
                try:
                    from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00')).replace(hour=0, minute=0, second=0, microsecond=0)
                    to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00')).replace(hour=23, minute=59, second=59, microsecond=999999)
                    date_conditions = [{"created_at": {"$gte": from_date, "$lte": to_date}}]
                except Exception as e:
                    # If date parsing fails, ignore custom filter
                    pass
        
        # Combine all conditions
        all_conditions = []
        
        # Role filter (if not admin)
        if "$or" in query:
            all_conditions.append({"$or": query["$or"]})
        
        # Other filters
        if status_conditions:
            all_conditions.extend(status_conditions)
        if priority_conditions:
            all_conditions.extend(priority_conditions)
        if deadline_conditions:
            all_conditions.extend(deadline_conditions)
        
        # Build final query
        if all_conditions:
            query = {"$and": all_conditions} if len(all_conditions) > 1 else all_conditions[0]
        
        tasks = await db.tasks.find(query).to_list(1000)
        
        # Convert to serializable format
        tasks_data = []
        for task in tasks:
            task_data = {k: v for k, v in task.items() if k != "_id"}
            tasks_data.append(task_data)
            
        return tasks_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tasks: {str(e)}")

@api_router.get("/tasks/statistics")
async def get_task_statistics(current_user: User = Depends(get_current_active_user)):
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        # Build role-based filter query
        role_filter = {}
        
        # Apply role-based filtering (không áp dụng với admin)
        if current_user.role != UserRole.ADMIN:
            # Các role khác chỉ xem được tasks mà:
            # - Được assign cho họ (assigned_to)
            # - Hoặc do họ tạo (created_by)
            role_conditions = [
                {"created_by": current_user.id},    # Tasks do họ tạo
                {"assigned_to": current_user.id}    # Tasks được assign cho họ
            ]
            
            role_filter["$or"] = role_conditions
        
        # Urgent tasks
        urgent_filter = {
            **role_filter,
            "priority": "urgent",
            "status": {"$ne": "completed"}
        }
        urgent_count = await db.tasks.count_documents(urgent_filter)
        
        # Pending tasks (replacing Todo tasks)
        pending_filter = {
            **role_filter,
            "status": "pending"
        }
        pending_count = await db.tasks.count_documents(pending_filter)
        
        # In progress tasks
        in_progress_filter = {
            **role_filter,
            "status": "in_progress"
        }
        in_progress_count = await db.tasks.count_documents(in_progress_filter)
        
        # Due today
        due_today_filter = {
            **role_filter,
            "deadline": {"$gte": today, "$lt": tomorrow},
            "status": {"$ne": "completed"}
        }
        due_today_count = await db.tasks.count_documents(due_today_filter)
        
        # Overdue
        overdue_filter = {
            **role_filter,
            "deadline": {"$lt": today},
            "status": {"$ne": "completed"}
        }
        overdue_count = await db.tasks.count_documents(overdue_filter)
        
        return {
            "urgent": urgent_count,
            "pending": pending_count,
            "inProgress": in_progress_count,
            "dueToday": due_today_count,
            "overdue": overdue_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching task statistics: {str(e)}")

@api_router.get("/tasks/comment-counts")
async def get_task_comment_counts(current_user: User = Depends(get_current_active_user)):
    try:
        # Aggregate comment counts for all tasks
        pipeline = [
            {
                "$group": {
                    "_id": "$task_id",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        comment_counts = {}
        async for result in db.task_comments.aggregate(pipeline):
            comment_counts[result["_id"]] = result["count"]
        
        return comment_counts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comment counts: {str(e)}")

@api_router.post("/tasks")
async def create_task(task_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        task = {
            "id": str(uuid.uuid4()),
            "title": task_data.get("title"),
            "description": task_data.get("description", ""),
            "priority": task_data.get("priority", "normal"),
            "deadline": datetime.fromisoformat(task_data["deadline"]) if task_data.get("deadline") else None,
            "status": "pending",  # Start with pending status
            "assigned_to": task_data.get("assigned_to", ""),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": current_user.id,
            "post_count": task_data.get("post_count", 0),  # Số lượng post
            "comment_count": task_data.get("comment_count", 0),  # Số lượng comment
            "work_file_link": task_data.get("work_file_link")  # Link file làm việc
        }
        
        result = await db.tasks.insert_one(task)
        
        if result.inserted_id:
            # Remove the _id field for response
            task_response = {k: v for k, v in task.items() if k != "_id"}
            return task_response
        else:
            raise HTTPException(status_code=500, detail="Failed to create task")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")

@api_router.get("/tasks/{task_id}")
async def get_task_detail(task_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        task = await db.tasks.find_one({"id": task_id})
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Remove _id field for response
        task_data = {k: v for k, v in task.items() if k != "_id"}
        return task_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching task detail: {str(e)}")

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, task_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        # Build update data only for provided fields
        update_data = {"updated_at": datetime.utcnow()}
        
        # Only update fields that are provided in the request
        if "title" in task_data:
            update_data["title"] = task_data["title"]
        if "description" in task_data:
            update_data["description"] = task_data["description"]
        if "priority" in task_data:
            update_data["priority"] = task_data["priority"]
        if "deadline" in task_data:
            if task_data["deadline"]:
                update_data["deadline"] = datetime.fromisoformat(task_data["deadline"])
            else:
                update_data["deadline"] = None
        if "status" in task_data:
            update_data["status"] = task_data["status"]
        if "assigned_to" in task_data:
            update_data["assigned_to"] = task_data["assigned_to"]
        # Update new fields
        if "post_count" in task_data:
            update_data["post_count"] = task_data["post_count"]
        if "comment_count" in task_data:
            update_data["comment_count"] = task_data["comment_count"]
        if "work_file_link" in task_data:
            update_data["work_file_link"] = task_data["work_file_link"]
        
        result = await db.tasks.update_one(
            {"id": task_id},
            {"$set": update_data}
        )
        
        if result.matched_count:
            return {"message": "Task updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Task not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating task: {str(e)}")

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        result = await db.tasks.delete_one({"id": task_id})
        
        if result.deleted_count:
            return {"message": "Task deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Task not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting task: {str(e)}")

@api_router.post("/tasks/bulk-delete")
async def bulk_delete_tasks(request_data: dict, current_user: User = Depends(get_current_active_user)):
    try:
        task_ids = request_data.get("task_ids", [])
        
        if not task_ids:
            raise HTTPException(status_code=400, detail="No task IDs provided")
        
        result = await db.tasks.delete_many({"id": {"$in": task_ids}})
        return {"message": f"Deleted {result.deleted_count} tasks"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing bulk delete: {str(e)}")

# Task Comments/Feedback Routes
@api_router.get("/tasks/{task_id}/comments")
async def get_task_comments(task_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        comments = await db.task_comments.find({"task_id": task_id}).sort("created_at", 1).to_list(1000)
        
        # Convert to serializable format
        comments_data = []
        for comment in comments:
            comment_data = {k: v for k, v in comment.items() if k != "_id"}
            comments_data.append(comment_data)
            
        return comments_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comments: {str(e)}")

@api_router.post("/tasks/{task_id}/comments")
async def create_task_comment(task_id: str, comment_data: TaskCommentCreate, current_user: User = Depends(get_current_active_user)):
    try:
        # Verify task exists
        task = await db.tasks.find_one({"id": task_id})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        comment = {
            "id": str(uuid.uuid4()),
            "task_id": task_id,
            "user_id": current_user.id,
            "user_name": current_user.full_name,
            "message": comment_data.message,
            "created_at": datetime.utcnow()
        }
        
        result = await db.task_comments.insert_one(comment)
        
        if result.inserted_id:
            # Remove the _id field for response
            comment_response = {k: v for k, v in comment.items() if k != "_id"}
            return comment_response
        else:
            raise HTTPException(status_code=500, detail="Failed to create comment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating comment: {str(e)}")

@api_router.delete("/tasks/{task_id}/comments/{comment_id}")
async def delete_task_comment(task_id: str, comment_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        # Only allow user to delete their own comments or admin/manager
        query = {"id": comment_id, "task_id": task_id}
        if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
            query["user_id"] = current_user.id
        
        result = await db.task_comments.delete_one(query)
        
        if result.deleted_count:
            return {"message": "Comment deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Comment not found or access denied")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting comment: {str(e)}")

# Dashboard Analytics
@api_router.get("/dashboard/analytics")
async def get_dashboard_analytics(current_user: User = Depends(get_current_active_user)):
    if current_user.role == UserRole.SALES:
        # Sales person sees only their data
        customers = await db.customers.find({"assigned_sales_id": current_user.id}).to_list(1000)
        interactions = await db.interactions.find({"sales_id": current_user.id}).to_list(1000)
        
        # Convert recent customers to serializable format
        recent_customers_data = []
        for customer in customers[-5:] if customers else []:
            customer_data = {k: v for k, v in customer.items() if k != "_id"}
            recent_customers_data.append(customer_data)
        
        return {
            "total_customers": len(customers),
            "total_revenue": sum(c.get("total_revenue", 0) for c in customers),
            "potential_revenue": sum(c.get("potential_value", 0) for c in customers),
            "total_interactions": len(interactions),
            "customers_by_status": _group_by_status(customers),
            "monthly_revenue": _group_by_month(interactions, "revenue_generated"),
            "recent_customers": recent_customers_data
        }
    else:
        # Admin/Manager sees all data
        all_customers = await db.customers.find().to_list(1000)
        all_interactions = await db.interactions.find().to_list(1000)
        sales_team = await db.users.find({"role": "sales", "is_active": True}).to_list(1000)
        
        # Convert recent customers to serializable format
        recent_customers_data = []
        for customer in all_customers[-10:] if all_customers else []:
            customer_data = {k: v for k, v in customer.items() if k != "_id"}
            recent_customers_data.append(customer_data)
        
        # Convert sales team to serializable format
        sales_team_data = []
        for sales in sales_team:
            sales_data = {k: v for k, v in sales.items() if k not in ["_id", "hashed_password"]}
            sales_team_data.append(sales_data)
        
        return {
            "total_customers": len(all_customers),
            "total_revenue": sum(c.get("total_revenue", 0) for c in all_customers),
            "potential_revenue": sum(c.get("potential_value", 0) for c in all_customers),
            "total_interactions": len(all_interactions),
            "total_sales_people": len(sales_team),
            "customers_by_status": _group_by_status(all_customers),
            "monthly_revenue": _group_by_month(all_interactions, "revenue_generated"),
            "recent_customers": recent_customers_data,
            "sales_team_performance": _calculate_sales_performance(all_customers, sales_team_data)
        }

def _group_by_status(customers):
    """Helper function to group customers by status"""
    status_counts = {}
    for customer in customers:
        status = customer.get("status", "lead")
        status_counts[status] = status_counts.get(status, 0) + 1
    return status_counts

def _group_by_month(interactions, field):
    """Helper function to group interactions by month"""
    monthly_data = {}
    for interaction in interactions:
        if field in interaction and interaction[field]:
            month = interaction.get("date", datetime.utcnow()).strftime("%Y-%m")
            monthly_data[month] = monthly_data.get(month, 0) + interaction[field]
    return monthly_data

def _calculate_sales_performance(customers, sales_team):
    """Helper function to calculate sales performance"""
    performance = []
    for sales_person in sales_team:
        sales_id = sales_person["id"]
        sales_customers = [c for c in customers if c.get("assigned_sales_id") == sales_id]
        total_revenue = sum(c.get("total_revenue", 0) for c in sales_customers)
        
        performance.append({
            "sales_person": sales_person["full_name"],
            "total_customers": len(sales_customers),
            "total_revenue": total_revenue,
            "target_monthly": sales_person.get("target_monthly", 0),
            "achievement_rate": (total_revenue / sales_person.get("target_monthly", 1)) * 100 if sales_person.get("target_monthly", 0) > 0 else 0
        })
    
    return sorted(performance, key=lambda x: x["total_revenue"], reverse=True)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialization functions
async def create_default_users():
    """Create default users if they don't exist"""
    default_users = [
        {
            "email": "admin@crm.com",
            "username": "admin",
            "password": "admin123",
            "full_name": "Administrator",
            "position": "System Administrator",
            "role": UserRole.ADMIN,
            "phone": "0901234567",
            "target_monthly": 0.0
        },
        {
            "email": "sales@crm.com", 
            "username": "sales",
            "password": "sales123",
            "full_name": "Sales Representative",
            "position": "Sales Executive",
            "role": UserRole.SALES,
            "phone": "0901234568",
            "target_monthly": 50000000.0
        },
        {
            "email": "manager@crm.com",
            "username": "manager",
            "password": "manager123", 
            "full_name": "Sales Manager",
            "position": "Sales Manager",
            "role": UserRole.MANAGER,
            "phone": "0901234569",
            "target_monthly": 100000000.0
        }
    ]
    
    created_users = []
    for user_data in default_users:
        # Check if user already exists by username or email
        existing_user = await db.users.find_one({
            "$or": [
                {"email": user_data["email"]},
                {"username": user_data["username"]}
            ]
        })
        if not existing_user:
            # Create new user
            hashed_password = pwd_context.hash(user_data["password"])
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                position=user_data["position"],
                role=user_data["role"],
                phone=user_data["phone"],
                target_monthly=user_data["target_monthly"]
            )
            user_dict = user.dict()
            user_dict["password"] = hashed_password
            
            await db.users.insert_one(user_dict)
            created_users.append(user_dict)
            
    return created_users

async def create_sample_data():
    """Create sample customers, clients, tasks and interactions"""
    
    # Get users for assignments
    users = await db.users.find().to_list(length=None)
    sales_users = [u for u in users if u.get("role") == "sales"]
    admin_users = [u for u in users if u.get("role") == "admin"]
    
    if not sales_users:
        return {"error": "No sales users found"}
    
    sales_user = sales_users[0]
    admin_user = admin_users[0] if admin_users else sales_user
    
    # Sample customers
    sample_customers = [
        {
            "name": "Nguyễn Văn An",
            "email": "nguyen.an@example.com",
            "phone": "0912345678",
            "company": "Công ty ABC",
            "position": "Giám đốc",
            "status": CustomerStatus.LEAD,
            "assigned_sales_id": sales_user["id"],
            "potential_value": 50000000.0,
            "notes": "Khách hàng tiềm năng cao, quan tâm đến sản phẩm"
        },
        {
            "name": "Trần Thị Bình",
            "email": "tran.binh@company.com", 
            "phone": "0923456789",
            "company": "Doanh nghiệp XYZ",
            "position": "Trưởng phòng",
            "status": CustomerStatus.PROSPECT,
            "assigned_sales_id": sales_user["id"],
            "potential_value": 30000000.0,
            "notes": "Đã gặp mặt, đang xem xét hợp đồng"
        },
        {
            "name": "Lê Hoàng Nam",
            "email": "le.nam@business.com",
            "phone": "0934567890", 
            "company": "Tập đoàn DEF",
            "position": "CEO",
            "status": CustomerStatus.ACTIVE,
            "assigned_sales_id": sales_user["id"],
            "total_revenue": 75000000.0,
            "potential_value": 100000000.0,
            "notes": "Khách hàng thân thiết, hợp tác lâu dài"
        }
    ]
    
    created_customers = []
    for customer_data in sample_customers:
        customer = Customer(**customer_data)
        customer_dict = customer.dict()
        existing_customer = await db.customers.find_one({"email": customer_data["email"]})
        if not existing_customer:
            await db.customers.insert_one(customer_dict)
            created_customers.append(customer_dict)
    
    # Sample clients
    sample_clients = [
        {
            "name": "Công ty TNHH Công nghệ Số",
            "contact_person": "Phạm Văn Đức",
            "email": "duc@congnghe.com",
            "phone": "0945678901",
            "address": "123 Đường Lê Lợi, Q1, TP.HCM",
            "business_type": "Công nghệ thông tin",
            "contract_value": 200000000.0,
            "contract_start_date": datetime.utcnow(),
            "contract_end_date": datetime.utcnow() + timedelta(days=365),
            "payment_terms": "Thanh toán 30% trước, 70% sau khi hoàn thành",
            "status": "active",
            "notes": "Dự án phát triển website và app mobile"
        },
        {
            "name": "Tập đoàn Bất động sản Vinhomes",
            "contact_person": "Ngô Thị Lan",
            "email": "lan@vinhomes.com", 
            "phone": "0956789012",
            "address": "456 Nguyễn Huệ, Q1, TP.HCM",
            "business_type": "Bất động sản",
            "contract_value": 500000000.0,
            "contract_start_date": datetime.utcnow() - timedelta(days=30),
            "contract_end_date": datetime.utcnow() + timedelta(days=335),
            "payment_terms": "Thanh toán hàng tháng",
            "status": "active",
            "notes": "Hệ thống CRM cho quản lý khách hàng bất động sản"
        }
    ]
    
    created_clients = []
    for client_data in sample_clients:
        client = Client(**client_data)
        client_dict = client.dict()
        existing_client = await db.clients.find_one({"email": client_data["email"]})
        if not existing_client:
            await db.clients.insert_one(client_dict)
            created_clients.append(client_dict)
    
    # Sample tasks
    sample_tasks = [
        {
            "title": "Gọi điện tư vấn khách hàng ABC",
            "description": "Liên hệ với khách hàng để tư vấn về sản phẩm CRM mới",
            "assigned_to": sales_user["id"],
            "priority": TaskPriority.HIGH,
            "status": TaskStatus.TODO,
            "deadline": datetime.utcnow() + timedelta(days=1),
            "created_by": admin_user["id"]
        },
        {
            "title": "Chuẩn bị báo cáo doanh số tháng",
            "description": "Tổng hợp báo cáo doanh số và phân tích kết quả kinh doanh tháng vừa qua",
            "assigned_to": sales_user["id"],
            "priority": TaskPriority.MEDIUM,
            "status": TaskStatus.IN_PROGRESS,
            "deadline": datetime.utcnow() + timedelta(days=3),
            "created_by": admin_user["id"]
        },
        {
            "title": "Họp với đội ngũ phát triển",
            "description": "Thảo luận về tính năng mới cho hệ thống CRM",
            "assigned_to": admin_user["id"],
            "priority": TaskPriority.LOW,
            "status": TaskStatus.COMPLETED,
            "deadline": datetime.utcnow() - timedelta(days=1),
            "created_by": admin_user["id"],
            "completed_at": datetime.utcnow() - timedelta(hours=2)
        }
    ]
    
    created_tasks = []
    for task_data in sample_tasks:
        task = Task(**task_data)
        task_dict = task.dict()
        # Don't check for duplicates for tasks, just create them
        await db.tasks.insert_one(task_dict)
        created_tasks.append(task_dict)
    
    # Sample interactions - Always create if we have customers in database
    customers_in_db = await db.customers.find().to_list(length=2)
    if customers_in_db and len(customers_in_db) >= 2:
        sample_interactions = [
            {
                "customer_id": customers_in_db[0]["id"],
                "sales_id": sales_user["id"],
                "type": InteractionType.CALL,
                "title": "Cuộc gọi tư vấn ban đầu",
                "description": "Tư vấn về sản phẩm CRM, khách hàng tỏ ra quan tâm",
                "next_action": "Gửi báo giá chi tiết",
                "next_action_date": datetime.utcnow() + timedelta(days=3)
            },
            {
                "customer_id": customers_in_db[1]["id"],
                "sales_id": sales_user["id"],
                "type": InteractionType.MEETING,
                "title": "Họp mặt thảo luận hợp đồng",
                "description": "Gặp gỡ trực tiếp để thảo luận điều khoản hợp đồng",
                "next_action": "Xem xét lại giá cả và điều khoản",
                "next_action_date": datetime.utcnow() + timedelta(days=7)
            }
        ]
        
        created_interactions = []
        for interaction_data in sample_interactions:
            # Check if interaction already exists for this customer
            existing_interaction = await db.interactions.find_one({
                "customer_id": interaction_data["customer_id"],
                "title": interaction_data["title"]
            })
            if not existing_interaction:
                interaction = Interaction(**interaction_data)
                interaction_dict = interaction.dict()
                await db.interactions.insert_one(interaction_dict)
                created_interactions.append(interaction_dict)
    else:
        created_interactions = []
    
    return {
        "users": 0,  # We don't track created users here
        "customers": len(created_customers),
        "clients": len(created_clients), 
        "tasks": len(created_tasks),
        "interactions": len(created_interactions)
    }

@api_router.post("/initialize")
async def initialize_system():
    """Initialize system with default users and sample data"""
    try:
        # Create default users
        created_users = await create_default_users()
        
        # Create sample data
        sample_data_result = await create_sample_data()
        
        return {
            "success": True,
            "message": "System initialized successfully",
            "created_users": len(created_users),
            "sample_data": sample_data_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Initialization failed: {str(e)}")

@api_router.get("/system/status")
async def system_status():
    """Get system status and data counts"""
    try:
        users_count = await db.users.count_documents({})
        customers_count = await db.customers.count_documents({})
        clients_count = await db.clients.count_documents({})
        tasks_count = await db.tasks.count_documents({})
        interactions_count = await db.interactions.count_documents({})
        
        return {
            "users": users_count,
            "customers": customers_count,
            "clients": clients_count,
            "tasks": tasks_count,
            "interactions": interactions_count,
            "initialized": users_count > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

# Include API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "CRM API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
