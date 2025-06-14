#!/usr/bin/env python3
"""
Task Module API Testing
Tests the Task module API endpoints with focus on new fields and status values
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class TaskAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_user = None
        self.test_task_id = None
        
    def test_login(self):
        """Test login to get authentication token"""
        print("\n=== Testing Login ===")
        
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                print(f"✅ Admin login successful: {self.admin_user['username']}")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {e}")
            return False
    
    def test_get_tasks(self):
        """Test getting tasks list with new fields"""
        print("\n=== Testing Get Tasks List ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = self.session.get(f"{API_BASE}/tasks", headers=headers)
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ GET /api/tasks successful: {len(tasks)} tasks found")
                
                # Check if tasks have the new fields
                if tasks:
                    task = tasks[0]
                    print("\nTask fields verification:")
                    
                    # Check post_count field
                    if "post_count" in task:
                        print(f"✅ post_count field exists: {task['post_count']}")
                    else:
                        print("❌ post_count field is missing")
                        return False
                    
                    # Check comment_count field
                    if "comment_count" in task:
                        print(f"✅ comment_count field exists: {task['comment_count']}")
                    else:
                        print("❌ comment_count field is missing")
                        return False
                    
                    # Check work_file_link field
                    if "work_file_link" in task:
                        print(f"✅ work_file_link field exists: {task['work_file_link']}")
                    else:
                        print("❌ work_file_link field is missing")
                        return False
                    
                    return True
                else:
                    print("⚠️ No tasks found to verify fields")
                    return True  # Not a failure, just no data to test
            else:
                print(f"❌ GET /api/tasks failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ GET /api/tasks error: {e}")
            return False
    
    def test_create_task(self):
        """Test creating a task with new fields"""
        print("\n=== Testing Create Task ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a task with all fields including new ones
        task_data = {
            "title": f"Test Task {uuid.uuid4().hex[:8]}",
            "description": "This is a test task with new fields",
            "priority": "normal",
            "deadline": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "assigned_to": self.admin_user["id"],
            "status": "pending",  # New status value
            "post_count": 5,  # New field
            "comment_count": 10,  # New field
            "work_file_link": "https://example.com/work_file.docx"  # New field
        }
        
        try:
            response = self.session.post(f"{API_BASE}/tasks", json=task_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_task_id = data["id"]
                print(f"✅ Task creation successful: {data['title']} (ID: {data['id']})")
                
                # Verify fields are set correctly
                print("\nTask creation fields verification:")
                
                # Check status field
                if data["status"] == "todo":  # Status is always set to "todo" on creation as per server.py
                    print(f"✅ status field set correctly: {data['status']}")
                else:
                    print(f"❌ status field incorrect: {data['status']}")
                    return False
                
                return True
            else:
                print(f"❌ Task creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Task creation error: {e}")
            return False
    
    def test_get_task_detail(self):
        """Test getting task detail with new fields"""
        print("\n=== Testing Get Task Detail ===")
        
        if not self.test_task_id:
            print("❌ No test task available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = self.session.get(f"{API_BASE}/tasks/{self.test_task_id}", headers=headers)
            if response.status_code == 200:
                task = response.json()
                print(f"✅ GET /api/tasks/{self.test_task_id} successful")
                
                # Check if task has the new fields
                print("\nTask detail fields verification:")
                
                # Check post_count field
                if "post_count" in task:
                    print(f"✅ post_count field exists: {task['post_count']}")
                else:
                    print("❌ post_count field is missing")
                    return False
                
                # Check comment_count field
                if "comment_count" in task:
                    print(f"✅ comment_count field exists: {task['comment_count']}")
                else:
                    print("❌ comment_count field is missing")
                    return False
                
                # Check work_file_link field
                if "work_file_link" in task:
                    print(f"✅ work_file_link field exists: {task['work_file_link']}")
                else:
                    print("❌ work_file_link field is missing")
                    return False
                
                return True
            else:
                print(f"❌ GET /api/tasks/{self.test_task_id} failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ GET /api/tasks/{self.test_task_id} error: {e}")
            return False
    
    def test_update_task_status(self):
        """Test updating task with new status values"""
        print("\n=== Testing Update Task Status ===")
        
        if not self.test_task_id:
            print("❌ No test task available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test all new status values
        status_values = ["pending", "in_progress", "completed"]
        all_passed = True
        
        for status in status_values:
            update_data = {
                "status": status
            }
            
            try:
                response = self.session.put(f"{API_BASE}/tasks/{self.test_task_id}", json=update_data, headers=headers)
                if response.status_code == 200:
                    print(f"✅ Task status update to '{status}' successful")
                    
                    # Verify the update by getting the task
                    get_response = self.session.get(f"{API_BASE}/tasks/{self.test_task_id}", headers=headers)
                    if get_response.status_code == 200:
                        task = get_response.json()
                        if task["status"] == status:
                            print(f"✅ Task status verification successful: {task['status']}")
                        else:
                            print(f"❌ Task status verification failed: expected '{status}', got '{task['status']}'")
                            all_passed = False
                    else:
                        print(f"❌ Could not verify task status update")
                        all_passed = False
                else:
                    print(f"❌ Task status update to '{status}' failed: {response.status_code} - {response.text}")
                    all_passed = False
            except Exception as e:
                print(f"❌ Task status update to '{status}' error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_update_task_fields(self):
        """Test updating task with new fields"""
        print("\n=== Testing Update Task Fields ===")
        
        if not self.test_task_id:
            print("❌ No test task available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Update task with new field values
        update_data = {
            "post_count": 15,
            "comment_count": 25,
            "work_file_link": "https://example.com/updated_work_file.docx"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/tasks/{self.test_task_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print(f"✅ Task fields update successful")
                
                # Verify the update by getting the task
                get_response = self.session.get(f"{API_BASE}/tasks/{self.test_task_id}", headers=headers)
                if get_response.status_code == 200:
                    task = get_response.json()
                    
                    # Check if fields were updated correctly
                    fields_updated = True
                    
                    if task.get("post_count") != update_data["post_count"]:
                        print(f"❌ post_count not updated correctly: expected {update_data['post_count']}, got {task.get('post_count')}")
                        fields_updated = False
                    else:
                        print(f"✅ post_count updated correctly: {task.get('post_count')}")
                    
                    if task.get("comment_count") != update_data["comment_count"]:
                        print(f"❌ comment_count not updated correctly: expected {update_data['comment_count']}, got {task.get('comment_count')}")
                        fields_updated = False
                    else:
                        print(f"✅ comment_count updated correctly: {task.get('comment_count')}")
                    
                    if task.get("work_file_link") != update_data["work_file_link"]:
                        print(f"❌ work_file_link not updated correctly: expected {update_data['work_file_link']}, got {task.get('work_file_link')}")
                        fields_updated = False
                    else:
                        print(f"✅ work_file_link updated correctly: {task.get('work_file_link')}")
                    
                    return fields_updated
                else:
                    print(f"❌ Could not verify task fields update")
                    return False
            else:
                print(f"❌ Task fields update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Task fields update error: {e}")
            return False
    
    def test_task_comment_count(self):
        """Test task comment count endpoint"""
        print("\n=== Testing Task Comment Count ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = self.session.get(f"{API_BASE}/tasks/comment-counts", headers=headers)
            if response.status_code == 200:
                comment_counts = response.json()
                print(f"✅ GET /api/tasks/comment-counts successful")
                print(f"   - Comment counts for {len(comment_counts)} tasks retrieved")
                
                # If we have a test task, check if it's in the comment counts
                if self.test_task_id and self.test_task_id in comment_counts:
                    print(f"✅ Test task comment count: {comment_counts[self.test_task_id]}")
                
                return True
            else:
                print(f"❌ GET /api/tasks/comment-counts failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ GET /api/tasks/comment-counts error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all task module tests"""
        print("🚀 Starting Task Module API Testing...")
        
        test_results = []
        
        # Login first
        login_result = self.test_login()
        test_results.append(("Login", login_result))
        
        if login_result:
            # Run all other tests
            test_results.append(("Get Tasks List", self.test_get_tasks()))
            test_results.append(("Create Task", self.test_create_task()))
            test_results.append(("Get Task Detail", self.test_get_task_detail()))
            test_results.append(("Update Task Status", self.test_update_task_status()))
            test_results.append(("Update Task Fields", self.test_update_task_fields()))
            test_results.append(("Task Comment Count", self.test_task_comment_count()))
        
        # Print summary
        print("\n" + "="*60)
        print("🏁 TASK MODULE TEST SUMMARY")
        print("="*60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<30} {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Task module is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    tester = TaskAPITester()
    tester.run_all_tests()