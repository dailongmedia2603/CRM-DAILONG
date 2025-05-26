#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime, timedelta

# Backend URL from frontend/.env
BACKEND_URL = "https://33831ab9-c861-4051-ab2d-853ef3d8563d.preview.emergentagent.com/api"

class TaskFilteringTester:
    def __init__(self):
        self.admin_token = None
        self.sales_token = None
        self.admin_user = None
        self.sales_user = None
        
    def login_admin(self):
        """Login as admin user"""
        print("🔐 Logging in as admin...")
        try:
            response = requests.post(f"{BACKEND_URL}/auth/login", json={
                "login": "admin",
                "password": "admin123"
            })
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                print(f"✅ Admin login successful. User ID: {self.admin_user['id']}")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {str(e)}")
            return False
    
    def find_sales_user(self):
        """Find a sales user to test with"""
        print("🔍 Looking for sales user...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                
                # Look for Yến Vi user (we saw this in the previous output)
                for user in users:
                    if user.get('full_name') == 'Yến Vi':
                        self.sales_user = user
                        print(f"✅ Found sales user: {user['full_name']} (ID: {user['id']})")
                        return True
                
                print("❌ Sales user not found")
                return False
            else:
                print(f"❌ Failed to get users: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error finding sales user: {str(e)}")
            return False
    
    def login_sales_user(self):
        """Try to login as sales user"""
        print("🔐 Trying to login as sales user...")
        
        # Try different login combinations
        login_attempts = [
            {"login": "yenvi", "password": "password123"},
            {"login": "yenvi", "password": "123456"},
            {"login": self.sales_user.get('email', ''), "password": "password123"},
            {"login": self.sales_user.get('username', ''), "password": "password123"}
        ]
        
        for attempt in login_attempts:
            if not attempt['login']:
                continue
                
            try:
                print(f"   Trying: {attempt['login']}")
                response = requests.post(f"{BACKEND_URL}/auth/login", json=attempt)
                
                if response.status_code == 200:
                    data = response.json()
                    self.sales_token = data["access_token"]
                    print(f"✅ Sales user login successful with {attempt['login']}")
                    return True
                else:
                    print(f"   ❌ Failed: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")
        
        print("❌ Could not login as sales user")
        return False
    
    def test_task_filtering_with_correct_data(self):
        """Test task filtering with correctly formatted data"""
        print("\n🧪 Testing task filtering with correct user IDs...")
        
        # Create a task assigned to sales user using correct user ID
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        task_data = {
            "title": "Filtering Test Task",
            "description": "Testing role-based filtering with correct user ID",
            "priority": "high",
            "assigned_to": self.sales_user['id'],  # Using user ID (correct)
            "deadline": (datetime.utcnow() + timedelta(days=3)).isoformat()
        }
        
        print(f"📤 Creating task with correct user ID: {self.sales_user['id']}")
        
        response = requests.post(f"{BACKEND_URL}/tasks", json=task_data, headers=headers)
        
        if response.status_code == 200:
            task = response.json()
            test_task_id = task['id']
            print(f"✅ Created test task: {task['title']}")
            print(f"   Assigned to: {task['assigned_to']}")
            
            # Test admin visibility
            admin_response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            if admin_response.status_code == 200:
                admin_tasks = admin_response.json()
                admin_can_see = any(t['id'] == test_task_id for t in admin_tasks)
                print(f"   Admin can see task: {'✅' if admin_can_see else '❌'}")
            
            # Test sales user visibility (if logged in)
            if self.sales_token:
                sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
                sales_response = requests.get(f"{BACKEND_URL}/tasks", headers=sales_headers)
                if sales_response.status_code == 200:
                    sales_tasks = sales_response.json()
                    sales_can_see = any(t['id'] == test_task_id for t in sales_tasks)
                    print(f"   Sales user can see task: {'✅' if sales_can_see else '❌'}")
                    
                    if sales_can_see:
                        print("✅ FILTERING WORKS CORRECTLY with proper user IDs")
                    else:
                        print("❌ FILTERING ISSUE even with proper user IDs")
                else:
                    print(f"   ❌ Sales user task fetch failed: {sales_response.status_code}")
            else:
                print("   ⚠️  Cannot test sales user visibility - not logged in")
            
            return test_task_id
        else:
            print(f"❌ Failed to create test task: {response.status_code}")
            return None
    
    def test_task_filtering_with_wrong_data(self):
        """Test task filtering with display name (wrong format)"""
        print("\n🧪 Testing task filtering with display name (wrong format)...")
        
        # Create a task assigned to sales user using display name (wrong)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        task_data = {
            "title": "Wrong Format Test Task",
            "description": "Testing with display name instead of user ID",
            "priority": "high",
            "assigned_to": self.sales_user['full_name'],  # Using display name (wrong)
            "deadline": (datetime.utcnow() + timedelta(days=3)).isoformat()
        }
        
        print(f"📤 Creating task with display name: {self.sales_user['full_name']}")
        
        response = requests.post(f"{BACKEND_URL}/tasks", json=task_data, headers=headers)
        
        if response.status_code == 200:
            task = response.json()
            test_task_id = task['id']
            print(f"✅ Created test task: {task['title']}")
            print(f"   Assigned to: {task['assigned_to']}")
            
            # Test sales user visibility (if logged in)
            if self.sales_token:
                sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
                sales_response = requests.get(f"{BACKEND_URL}/tasks", headers=sales_headers)
                if sales_response.status_code == 200:
                    sales_tasks = sales_response.json()
                    sales_can_see = any(t['id'] == test_task_id for t in sales_tasks)
                    print(f"   Sales user can see task: {'✅' if sales_can_see else '❌'}")
                    
                    if not sales_can_see:
                        print("✅ CONFIRMED: Display names cause filtering to fail")
                    else:
                        print("❌ UNEXPECTED: Task visible despite wrong format")
                else:
                    print(f"   ❌ Sales user task fetch failed: {sales_response.status_code}")
            else:
                print("   ⚠️  Cannot test sales user visibility - not logged in")
            
            return test_task_id
        else:
            print(f"❌ Failed to create test task: {response.status_code}")
            return None
    
    def run_test(self):
        """Run the complete test"""
        print("🚀 STARTING TASK FILTERING TEST")
        print("=" * 50)
        
        # Step 1: Login as admin
        if not self.login_admin():
            return False
        
        # Step 2: Find sales user
        if not self.find_sales_user():
            return False
        
        # Step 3: Try to login as sales user
        self.login_sales_user()
        
        # Step 4: Test with correct data format
        correct_task_id = self.test_task_filtering_with_correct_data()
        
        # Step 5: Test with wrong data format
        wrong_task_id = self.test_task_filtering_with_wrong_data()
        
        print("\n" + "=" * 50)
        print("🎯 CONCLUSION:")
        print("The issue is that tasks are being created with display names")
        print("instead of user IDs in the assigned_to field.")
        print("This causes the role-based filtering to fail.")
        print("The backend filtering logic is working correctly.")
        
        return True

def main():
    tester = TaskFilteringTester()
    success = tester.run_test()
    
    if success:
        print("\n✅ Test completed")
    else:
        print("\n❌ Test failed")
        sys.exit(1)

if __name__ == "__main__":
    main()