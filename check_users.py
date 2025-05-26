#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def login_admin():
    """Login as admin user"""
    try:
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            return data["access_token"]
        else:
            print(f"Failed to login as admin: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception during admin login: {str(e)}")
        return None

def get_users(token):
    """Get all users"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/users", headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            print(f"Found {len(users)} users:")
            for user in users:
                print(f"  - ID: {user['id']}")
                print(f"    Username: {user['username']}")
                print(f"    Full Name: {user.get('full_name', 'N/A')}")
                print(f"    Role: {user['role']}")
                print(f"    Active: {user['is_active']}")
                print()
            return users
        else:
            print(f"Failed to get users: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception getting users: {str(e)}")
        return None

def create_test_user(token):
    """Create a test user for testing"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        user_data = {
            "username": "nhi.trinh",
            "password": "password123",
            "full_name": "Nhi Trinh",
            "email": "nhi.trinh@example.com",
            "role": "sales",
            "position": "Sales Executive"
        }
        
        response = requests.post(f"{API_BASE}/users", json=user_data, headers=headers)
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Created test user: {user['username']} (Role: {user['role']})")
            return user
        else:
            print(f"❌ Failed to create test user: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception creating test user: {str(e)}")
        return None

def main():
    print("🔍 CHECKING EXISTING USERS")
    print("=" * 40)
    
    # Login as admin
    token = login_admin()
    if not token:
        print("❌ Cannot proceed without admin login")
        return
    
    # Get existing users
    users = get_users(token)
    
    # Check if Nhi Trinh exists
    nhi_user = None
    if users:
        for user in users:
            if user['username'] == 'nhi.trinh' or 'nhi' in user.get('full_name', '').lower():
                nhi_user = user
                break
    
    if nhi_user:
        print(f"✅ Found user that might be Nhi Trinh: {nhi_user['username']} - {nhi_user.get('full_name', 'N/A')}")
    else:
        print("❌ No user found matching 'Nhi Trinh'")
        print("🔧 Creating test user...")
        create_test_user(token)

if __name__ == "__main__":
    main()