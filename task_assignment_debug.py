#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime, timedelta

# Backend URL from frontend/.env
BACKEND_URL = "https://33831ab9-c861-4051-ab2d-853ef3d8563d.preview.emergentagent.com/api"

class TaskAssignmentDebugger:
    def __init__(self):
        self.admin_token = None
        self.nhi_token = None
        self.admin_user = None
        self.nhi_user = None
        self.test_task_id = None
        
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
    
    def find_nhi_user(self):
        """Find Nhi Trinh user in the system"""
        print("🔍 Looking for 'Nhi Trinh' user...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                print(f"📊 Found {len(users)} total users")
                
                # Look for Nhi Trinh user
                nhi_user = None
                for user in users:
                    print(f"   - User: {user.get('full_name', 'N/A')} | Username: {user.get('username', 'N/A')} | ID: {user['id']}")
                    if user.get('full_name') == 'Nhi Trinh' or user.get('username') == 'Nhi Trinh':
                        nhi_user = user
                        break
                
                if nhi_user:
                    self.nhi_user = nhi_user
                    print(f"✅ Found Nhi Trinh user: ID={nhi_user['id']}, Username={nhi_user.get('username')}")
                    return True
                else:
                    print("❌ Nhi Trinh user not found in system")
                    return False
            else:
                print(f"❌ Failed to get users: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error finding Nhi user: {str(e)}")
            return False
    
    def create_nhi_user_if_not_exists(self):
        """Create Nhi Trinh user if it doesn't exist"""
        print("👤 Creating Nhi Trinh user...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            user_data = {
                "username": "nhi.trinh",
                "password": "password123",
                "full_name": "Nhi Trinh",
                "email": "nhi.trinh@example.com",
                "role": "sales",
                "position": "Sales Executive"
            }
            
            response = requests.post(f"{BACKEND_URL}/users", json=user_data, headers=headers)
            
            if response.status_code == 200:
                self.nhi_user = response.json()
                print(f"✅ Created Nhi Trinh user: ID={self.nhi_user['id']}")
                return True
            else:
                print(f"❌ Failed to create Nhi user: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error creating Nhi user: {str(e)}")
            return False
    
    def reset_nhi_password(self):
        """Reset Nhi's password as admin"""
        print("🔑 Resetting Nhi's password...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {
                "password": "password123"
            }
            
            response = requests.put(f"{BACKEND_URL}/users/{self.nhi_user['id']}", 
                                  json=update_data, headers=headers)
            
            if response.status_code == 200:
                print("✅ Password reset successful")
                return True
            else:
                print(f"❌ Password reset failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Password reset error: {str(e)}")
            return False

    def login_nhi(self):
        """Login as Nhi Trinh user"""
        print("🔐 Logging in as Nhi Trinh...")
        
        # Try different possible passwords/usernames
        login_attempts = [
            {"login": "nhi.trinh", "password": "password123"},
            {"login": "nhitrinh", "password": "password123"},
            {"login": "nhitrinh", "password": "123456"},
            {"login": "Nhi Trinh", "password": "password123"},
            {"login": self.nhi_user.get('username', 'nhitrinh'), "password": "password123"}
        ]
        
        for attempt in login_attempts:
            try:
                print(f"   Trying login: {attempt['login']}")
                response = requests.post(f"{BACKEND_URL}/auth/login", json=attempt)
                
                if response.status_code == 200:
                    data = response.json()
                    self.nhi_token = data["access_token"]
                    print(f"✅ Nhi login successful with {attempt['login']}")
                    return True
                else:
                    print(f"   ❌ Failed with {attempt['login']}: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error with {attempt['login']}: {str(e)}")
        
        print("❌ All login attempts failed for Nhi")
        return False
    
    def check_existing_tasks(self):
        """Check existing tasks in database"""
        print("📋 Checking existing tasks...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"📊 Found {len(tasks)} total tasks")
                
                # Look for tasks with "nhi" in title
                nhi_tasks = []
                for task in tasks:
                    print(f"   - Task: '{task.get('title', 'N/A')}' | Assigned to: {task.get('assigned_to', 'N/A')} | Created by: {task.get('created_by', 'N/A')}")
                    if 'nhi' in task.get('title', '').lower():
                        nhi_tasks.append(task)
                
                if nhi_tasks:
                    print(f"🎯 Found {len(nhi_tasks)} tasks with 'nhi' in title:")
                    for task in nhi_tasks:
                        print(f"   - '{task['title']}' assigned to: {task.get('assigned_to')}")
                        print(f"     Expected user ID: {self.nhi_user['id'] if self.nhi_user else 'N/A'}")
                        print(f"     Match: {'✅' if task.get('assigned_to') == (self.nhi_user['id'] if self.nhi_user else None) else '❌'}")
                
                return tasks
            else:
                print(f"❌ Failed to get tasks: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"❌ Error checking tasks: {str(e)}")
            return []
    
    def create_test_task(self):
        """Create a test task assigned to Nhi Trinh"""
        print("📝 Creating test task assigned to Nhi Trinh...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            task_data = {
                "title": "Test Task for Nhi Trinh",
                "description": "This is a test task to debug assignment issue",
                "priority": "medium",
                "assigned_to": self.nhi_user['id'],  # Using user ID
                "deadline": (datetime.utcnow() + timedelta(days=7)).isoformat()
            }
            
            print(f"📤 Task data: {json.dumps(task_data, indent=2)}")
            
            response = requests.post(f"{BACKEND_URL}/tasks", json=task_data, headers=headers)
            
            if response.status_code == 200:
                task = response.json()
                self.test_task_id = task['id']
                print(f"✅ Created test task: ID={task['id']}")
                print(f"   Title: {task['title']}")
                print(f"   Assigned to: {task['assigned_to']}")
                print(f"   Created by: {task['created_by']}")
                return task
            else:
                print(f"❌ Failed to create task: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating task: {str(e)}")
            return None
    
    def test_nhi_task_visibility(self):
        """Test if Nhi can see tasks assigned to her"""
        print("👀 Testing Nhi's task visibility...")
        try:
            headers = {"Authorization": f"Bearer {self.nhi_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"📊 Nhi can see {len(tasks)} tasks")
                
                # Check if our test task is visible
                test_task_visible = False
                for task in tasks:
                    print(f"   - Task: '{task.get('title', 'N/A')}' | Assigned to: {task.get('assigned_to', 'N/A')}")
                    if task.get('id') == self.test_task_id:
                        test_task_visible = True
                        print(f"   ✅ Test task is visible to Nhi")
                
                if not test_task_visible and self.test_task_id:
                    print(f"   ❌ Test task {self.test_task_id} is NOT visible to Nhi")
                
                return tasks
            else:
                print(f"❌ Failed to get Nhi's tasks: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"❌ Error testing Nhi's visibility: {str(e)}")
            return []
    
    def test_admin_task_visibility(self):
        """Test admin's task visibility"""
        print("👑 Testing admin's task visibility...")
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"📊 Admin can see {len(tasks)} tasks")
                
                # Check if our test task is visible
                test_task_visible = False
                for task in tasks:
                    if task.get('id') == self.test_task_id:
                        test_task_visible = True
                        print(f"   ✅ Test task is visible to admin")
                        print(f"   Task details: {json.dumps(task, indent=4)}")
                
                if not test_task_visible and self.test_task_id:
                    print(f"   ❌ Test task {self.test_task_id} is NOT visible to admin")
                
                return tasks
            else:
                print(f"❌ Failed to get admin's tasks: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"❌ Error testing admin's visibility: {str(e)}")
            return []
    
    def analyze_issue(self):
        """Analyze the root cause of the issue"""
        print("\n🔍 ANALYSIS:")
        print("=" * 50)
        
        if not self.nhi_user:
            print("❌ ISSUE: Nhi Trinh user doesn't exist in the system")
            return
        
        if not self.test_task_id:
            print("❌ ISSUE: Could not create test task")
            return
        
        # Get task details as admin
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks/{self.test_task_id}", headers=headers)
            
            if response.status_code == 200:
                task = response.json()
                print(f"📋 Task Details:")
                print(f"   ID: {task['id']}")
                print(f"   Title: {task['title']}")
                print(f"   Assigned to: {task['assigned_to']}")
                print(f"   Created by: {task['created_by']}")
                print(f"   Nhi's user ID: {self.nhi_user['id']}")
                
                if task['assigned_to'] == self.nhi_user['id']:
                    print("✅ Task is correctly assigned to Nhi's user ID")
                else:
                    print("❌ Task assignment mismatch!")
                    print(f"   Expected: {self.nhi_user['id']}")
                    print(f"   Actual: {task['assigned_to']}")
                
                # Test Nhi's visibility again
                nhi_headers = {"Authorization": f"Bearer {self.nhi_token}"}
                nhi_response = requests.get(f"{BACKEND_URL}/tasks", headers=nhi_headers)
                
                if nhi_response.status_code == 200:
                    nhi_tasks = nhi_response.json()
                    task_visible = any(t['id'] == self.test_task_id for t in nhi_tasks)
                    
                    if task_visible:
                        print("✅ Task IS visible to Nhi - assignment working correctly")
                    else:
                        print("❌ Task is NOT visible to Nhi despite correct assignment")
                        print("   This indicates a filtering logic issue")
                        
                        # Debug the filtering logic
                        print("\n🔧 DEBUGGING FILTERING LOGIC:")
                        print(f"   Nhi's user ID: {self.nhi_user['id']}")
                        print(f"   Task assigned_to: {task['assigned_to']}")
                        print(f"   Task created_by: {task['created_by']}")
                        print(f"   Admin user ID: {self.admin_user['id']}")
                        
                        # The filtering logic should include tasks where:
                        # - assigned_to == current_user.id OR
                        # - created_by == current_user.id
                        
                        if task['assigned_to'] == self.nhi_user['id']:
                            print("   ✅ assigned_to matches Nhi's ID")
                        else:
                            print("   ❌ assigned_to does NOT match Nhi's ID")
                        
                        if task['created_by'] == self.nhi_user['id']:
                            print("   ✅ created_by matches Nhi's ID")
                        else:
                            print("   ❌ created_by does NOT match Nhi's ID")
                        
                        print("\n   🎯 CONCLUSION: The filtering logic appears to be working correctly")
                        print("   but there might be an issue with the query execution or data types")
                
            else:
                print(f"❌ Could not get task details: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error in analysis: {str(e)}")
    
    def run_debug(self):
        """Run the complete debugging process"""
        print("🚀 STARTING TASK ASSIGNMENT DEBUG")
        print("=" * 50)
        
        # Step 1: Login as admin
        if not self.login_admin():
            return False
        
        # Step 2: Find or create Nhi user
        if not self.find_nhi_user():
            if not self.create_nhi_user_if_not_exists():
                return False
        
        # Step 3: Login as Nhi
        if not self.login_nhi():
            return False
        
        # Step 4: Check existing tasks
        existing_tasks = self.check_existing_tasks()
        
        # Step 5: Create test task
        test_task = self.create_test_task()
        
        # Step 6: Test visibility
        print("\n" + "=" * 50)
        nhi_tasks = self.test_nhi_task_visibility()
        admin_tasks = self.test_admin_task_visibility()
        
        # Step 7: Analyze
        self.analyze_issue()
        
        return True

def main():
    debugger = TaskAssignmentDebugger()
    success = debugger.run_debug()
    
    if success:
        print("\n✅ Debug process completed")
    else:
        print("\n❌ Debug process failed")
        sys.exit(1)

if __name__ == "__main__":
    main()