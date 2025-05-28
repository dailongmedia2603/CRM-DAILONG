#!/usr/bin/env python3
"""
Check existing users in the system to understand authentication
"""

import requests
import json

# Backend URL from environment
BACKEND_URL = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"

def check_users():
    """Check what users exist in the system"""
    print("🔍 CHECKING EXISTING USERS IN SYSTEM...")
    
    # First, login as admin to get user list
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "login": "admin",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data["access_token"]
            print(f"✅ Admin login successful")
            
            # Get all users
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BACKEND_URL}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                print(f"\n📋 FOUND {len(users)} USERS IN SYSTEM:")
                
                for user in users:
                    print(f"- ID: {user.get('id')}")
                    print(f"  Username: {user.get('username')}")
                    print(f"  Email: {user.get('email')}")
                    print(f"  Role: {user.get('role')}")
                    print(f"  Full Name: {user.get('full_name')}")
                    print(f"  Active: {user.get('is_active')}")
                    print()
                
                # Try to login with different credentials
                print("🔐 TESTING LOGIN CREDENTIALS:")
                
                test_credentials = [
                    {"login": "admin", "password": "admin123"},
                    {"login": "admin@crm.com", "password": "admin123"},
                    {"login": "sales", "password": "sales123"},
                    {"login": "sales@crm.com", "password": "sales123"},
                    {"login": "manager", "password": "manager123"},
                    {"login": "manager@crm.com", "password": "manager123"},
                    {"login": "yenvi", "password": "yenvi123"},
                    {"login": "yenvi@crm.com", "password": "yenvi123"}
                ]
                
                for cred in test_credentials:
                    try:
                        response = requests.post(f"{BACKEND_URL}/auth/login", json=cred)
                        if response.status_code == 200:
                            user_data = response.json()
                            print(f"✅ {cred['login']} login successful - Role: {user_data['user']['role']}")
                        else:
                            print(f"❌ {cred['login']} login failed - Status: {response.status_code}")
                    except Exception as e:
                        print(f"❌ {cred['login']} login error: {str(e)}")
                
            else:
                print(f"❌ Failed to get users: {response.status_code}")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    check_users()