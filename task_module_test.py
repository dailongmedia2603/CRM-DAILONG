#!/usr/bin/env python3
"""
Test script specifically for Task module changes
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
API_BASE = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"

class TaskModuleTest:
    def __init__(self):
        self.base_url = API_BASE
        self.token = None
        self.headers = {}
        self.test_task_id = None
        
    def authenticate(self):
        """Authenticate with admin user"""
        try:
            login_data = {
                "username": "admin@crm.com",
                "password": "admin123"
            }
            response = requests.post(f"{self.base_url}/login", data=login_data)
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.headers = {"Authorization": f"Bearer {self.token}"}
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_task_creation_with_new_fields(self):
        """Test creating a task with new fields"""
        print("\n=== Testing Task Creation with New Fields ===")
        
        try:
            # Create task with new fields
            task_data = {
                "title": "Test Task with New Fields",
                "description": "Testing post_count, comment_count, and work_file_link",
                "priority": "normal",
                "deadline": (datetime.now() + timedelta(days=7)).isoformat(),
                "assigned_to": "admin@crm.com",
                "post_count": 5,
                "comment_count": 3,
                "work_file_link": "https://example.com/file.pdf"
            }
            
            response = requests.post(
                f"{self.base_url}/tasks",
                json=task_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                task = response.json()
                self.test_task_id = task["id"]
                print(f"✅ Task created successfully: {task['title']}")
                print(f"   - ID: {task['id']}")
                print(f"   - Status: {task.get('status', 'Not set')}")
                print(f"   - Post count: {task.get('post_count', 'Not set')}")
                print(f"   - Comment count: {task.get('comment_count', 'Not set')}")
                print(f"   - Work file link: {task.get('work_file_link', 'Not set')}")
                
                # Verify default status is 'pending'
                if task.get('status') == 'pending':
                    print("✅ Default status 'pending' set correctly")
                else:
                    print(f"❌ Expected status 'pending', got: {task.get('status')}")
                
                # Verify new fields are set
                if task.get('post_count') == 5:
                    print("✅ Post count field set correctly")
                else:
                    print(f"❌ Expected post_count 5, got: {task.get('post_count')}")
                    
                if task.get('comment_count') == 3:
                    print("✅ Comment count field set correctly")
                else:
                    print(f"❌ Expected comment_count 3, got: {task.get('comment_count')}")
                    
                if task.get('work_file_link') == "https://example.com/file.pdf":
                    print("✅ Work file link field set correctly")
                else:
                    print(f"❌ Expected work_file_link URL, got: {task.get('work_file_link')}")
                    
                return True
            else:
                print(f"❌ Task creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Task creation error: {e}")
            return False
    
    def test_task_status_values(self):
        """Test the new task status values"""
        print("\n=== Testing Task Status Values ===")
        
        if not self.test_task_id:
            print("❌ No test task ID available")
            return False
            
        try:
            # Test each status value
            status_values = ['pending', 'in_progress', 'completed']
            
            for status in status_values:
                print(f"\n--- Testing status: {status} ---")
                
                update_data = {"status": status}
                response = requests.put(
                    f"{self.base_url}/tasks/{self.test_task_id}",
                    json=update_data,
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    print(f"✅ Successfully updated status to: {status}")
                    
                    # Verify the status was updated by fetching the task
                    get_response = requests.get(
                        f"{self.base_url}/tasks",
                        headers=self.headers
                    )
                    
                    if get_response.status_code == 200:
                        tasks = get_response.json()
                        updated_task = next((t for t in tasks if t['id'] == self.test_task_id), None)
                        
                        if updated_task and updated_task.get('status') == status:
                            print(f"✅ Status verification successful: {status}")
                        else:
                            print(f"❌ Status verification failed. Expected: {status}, Got: {updated_task.get('status') if updated_task else 'Task not found'}")
                    else:
                        print(f"❌ Failed to fetch task for verification: {get_response.status_code}")
                else:
                    print(f"❌ Failed to update status to {status}: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            return True
            
        except Exception as e:
            print(f"❌ Status testing error: {e}")
            return False
    
    def test_task_field_updates(self):
        """Test updating new fields"""
        print("\n=== Testing Task Field Updates ===")
        
        if not self.test_task_id:
            print("❌ No test task ID available")
            return False
            
        try:
            # Update the new fields
            update_data = {
                "post_count": 10,
                "comment_count": 7,
                "work_file_link": "https://updated.example.com/newfile.docx"
            }
            
            response = requests.put(
                f"{self.base_url}/tasks/{self.test_task_id}",
                json=update_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                print("✅ Task fields updated successfully")
                
                # Verify the updates by fetching the task
                get_response = requests.get(
                    f"{self.base_url}/tasks",
                    headers=self.headers
                )
                
                if get_response.status_code == 200:
                    tasks = get_response.json()
                    updated_task = next((t for t in tasks if t['id'] == self.test_task_id), None)
                    
                    if updated_task:
                        # Check each updated field
                        if updated_task.get('post_count') == 10:
                            print("✅ Post count update verified")
                        else:
                            print(f"❌ Post count update failed. Expected: 10, Got: {updated_task.get('post_count')}")
                            
                        if updated_task.get('comment_count') == 7:
                            print("✅ Comment count update verified")
                        else:
                            print(f"❌ Comment count update failed. Expected: 7, Got: {updated_task.get('comment_count')}")
                            
                        if updated_task.get('work_file_link') == "https://updated.example.com/newfile.docx":
                            print("✅ Work file link update verified")
                        else:
                            print(f"❌ Work file link update failed. Expected: https://updated.example.com/newfile.docx, Got: {updated_task.get('work_file_link')}")
                    else:
                        print("❌ Updated task not found")
                else:
                    print(f"❌ Failed to fetch task for verification: {get_response.status_code}")
                    
                return True
            else:
                print(f"❌ Task field update failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Field update error: {e}")
            return False
    
    def test_task_statistics(self):
        """Test task statistics with new status values"""
        print("\n=== Testing Task Statistics ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/tasks/statistics",
                headers=self.headers
            )
            
            if response.status_code == 200:
                stats = response.json()
                print("✅ Task statistics retrieved successfully")
                print(f"   - Urgent: {stats.get('urgent', 'Not set')}")
                print(f"   - Pending: {stats.get('pending', 'Not set')}")
                print(f"   - In Progress: {stats.get('inProgress', 'Not set')}")
                print(f"   - Due Today: {stats.get('dueToday', 'Not set')}")
                print(f"   - Overdue: {stats.get('overdue', 'Not set')}")
                
                # Check if 'pending' field exists (should replace 'todo')
                if 'pending' in stats:
                    print("✅ 'pending' field exists in statistics")
                else:
                    print("❌ 'pending' field missing from statistics")
                    
                # Check if 'todo' field still exists (should not)
                if 'todo' not in stats:
                    print("✅ 'todo' field correctly removed from statistics")
                else:
                    print("❌ 'todo' field still exists in statistics")
                    
                return True
            else:
                print(f"❌ Statistics retrieval failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Statistics error: {e}")
            return False
    
    def test_task_filtering(self):
        """Test task filtering with new status values"""
        print("\n=== Testing Task Filtering ===")
        
        try:
            # Test active filter (should include pending and in_progress)
            response = requests.get(
                f"{self.base_url}/tasks?status=active",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Active task filtering successful: {len(tasks)} tasks")
                
                # Check if active filter includes pending and in_progress
                active_statuses = set()
                for task in tasks:
                    status = task.get('status')
                    if status:
                        active_statuses.add(status)
                
                expected_active = {'pending', 'in_progress'}
                if active_statuses.issubset(expected_active):
                    print("✅ Active filter correctly includes pending and in_progress")
                else:
                    print(f"❌ Active filter includes unexpected statuses: {active_statuses}")
                    
            else:
                print(f"❌ Active filtering failed: {response.status_code}")
                
            # Test completed filter
            response = requests.get(
                f"{self.base_url}/tasks?status=completed",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Completed task filtering successful: {len(tasks)} tasks")
                
                # Check if all tasks have completed status
                all_completed = all(task.get('status') == 'completed' for task in tasks)
                if all_completed:
                    print("✅ Completed filter correctly shows only completed tasks")
                else:
                    print("❌ Completed filter includes non-completed tasks")
                    
            else:
                print(f"❌ Completed filtering failed: {response.status_code}")
                
            return True
            
        except Exception as e:
            print(f"❌ Filtering error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all task module tests"""
        print("🚀 Starting Task Module Testing...\n")
        
        if not self.authenticate():
            print("❌ Cannot proceed without authentication")
            return False
        
        tests = [
            self.test_task_creation_with_new_fields,
            self.test_task_status_values,
            self.test_task_field_updates,
            self.test_task_statistics,
            self.test_task_filtering
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
        
        print(f"\n🏁 TASK MODULE TEST SUMMARY")
        print(f"============================================================")
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {passed/total*100:.1f}%")
        
        if passed == total:
            print("✅ All task module tests passed!")
        else:
            print(f"⚠️  {total - passed} tests failed.")
        
        return passed == total

if __name__ == "__main__":
    tester = TaskModuleTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)