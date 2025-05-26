#!/usr/bin/env python3
"""
Test different password patterns for existing users
"""

import requests

# Backend URL from environment
BACKEND_URL = "https://33831ab9-c861-4051-ab2d-853ef3d8563d.preview.emergentagent.com/api"

def test_passwords():
    """Test different password patterns"""
    print("🔐 TESTING PASSWORD PATTERNS...")
    
    users_to_test = ["yenvi", "nhitrinh", "minhthu", "honggam", "quangtruong"]
    password_patterns = [
        "{username}123",
        "{username}",
        "123456",
        "password",
        "admin123",
        "dailong123",
        "test123"
    ]
    
    for username in users_to_test:
        print(f"\n👤 Testing {username}:")
        for pattern in password_patterns:
            password = pattern.format(username=username)
            try:
                response = requests.post(f"{BACKEND_URL}/auth/login", json={
                    "login": username,
                    "password": password
                })
                
                if response.status_code == 200:
                    user_data = response.json()
                    print(f"✅ {username} / {password} - Role: {user_data['user']['role']}")
                    break
                else:
                    print(f"❌ {username} / {password} - Status: {response.status_code}")
            except Exception as e:
                print(f"❌ {username} / {password} - Error: {str(e)}")

if __name__ == "__main__":
    test_passwords()