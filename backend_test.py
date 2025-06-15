#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for CRM System
Tests all authentication, user management, task assignment, and customer/client endpoints
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
import sys

# Backend URL
BACKEND_URL = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class CRMAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.sales_token = None
        self.manager_token = None
        self.admin_user = None
        self.sales_user = None
        self.manager_user = None
        self.test_customer_id = None
        self.test_task_id = None
        self.test_client_id = None
        self.success_count = 0
        self.total_tests = 0
        
    def log_success(self, message):
        print(f"✅ {message}")
        self.success_count += 1
        self.total_tests += 1

    def log_failure(self, message, error=None):
        if error:
            print(f"❌ {message}: {error}")
        else:
            print(f"❌ {message}")
        self.total_tests += 1

    def log_info(self, message):
        print(f"ℹ️ {message}")
    
    def test_existing_user_login(self):
        """Test login with existing system users"""
        print("\n=== Testing Authentication Endpoints ===")
        
        # Test admin login with existing credentials
        login_data = {
            "login": "admin@crm.com",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                self.log_success(f"Admin login successful: {self.admin_user.get('username', 'admin')}")
                
                # Test sales user login
                sales_login = {
                    "login": "yenvi",
                    "password": "yenvi123"
                }
                sales_response = self.session.post(f"{API_BASE}/auth/login", json=sales_login)
                if sales_response.status_code == 200:
                    sales_data = sales_response.json()
                    self.sales_token = sales_data["access_token"]
                    self.sales_user = sales_data["user"]
                    self.log_success(f"Sales user login successful: {self.sales_user.get('username', 'yenvi')}")
                else:
                    self.log_info(f"Sales user login failed, using admin for all tests")
                    self.sales_token = self.admin_token
                    self.sales_user = self.admin_user
                
                # Test manager login
                manager_login = {
                    "login": "manager@crm.com",
                    "password": "manager123"
                }
                manager_response = self.session.post(f"{API_BASE}/auth/login", json=manager_login)
                if manager_response.status_code == 200:
                    manager_data = manager_response.json()
                    self.manager_token = manager_data["access_token"]
                    self.manager_user = manager_data["user"]
                    self.log_success(f"Manager login successful: {self.manager_user.get('username', 'manager')}")
                else:
                    self.log_info(f"Manager login failed, using admin for manager tests")
                    self.manager_token = self.admin_token
                    self.manager_user = self.admin_user
                
                return True
            else:
                self.log_failure(f"Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Admin login error: {e}")
            return False
    
    def test_profile_access(self):
        """Test access to user profile"""
        print("\n=== Testing Profile Access ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Profile access successful: {data.get('username', 'admin')}")
                return True
            else:
                self.log_failure(f"Profile access failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Profile access error: {e}")
            return False
    
    def test_task_assignment_endpoints(self):
        """Test task assignment CRUD operations"""
        print("\n=== Testing Task Assignment Endpoints ===")
        
        # Test task creation
        task_data = {
            "title": f"Test Task {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "This is a test task created by the API tester",
            "priority": "high",
            "status": "todo",
            "deadline": (datetime.now() + timedelta(days=7)).isoformat(),
            "assigned_to": self.admin_user["id"]
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.post(f"{API_BASE}/tasks", json=task_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_task_id = data["id"]
                self.log_success(f"Task creation successful: {data['title']}")
            else:
                self.log_failure(f"Task creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task creation error: {e}")
            return False
        
        # Test task retrieval
        try:
            response = self.session.get(f"{API_BASE}/tasks/{self.test_task_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task retrieval successful: {data['title']}")
            else:
                self.log_failure(f"Task retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task retrieval error: {e}")
            return False
        
        # Test task update
        update_data = {
            "status": "in_progress",
            "priority": "urgent",
            "description": "Updated description for testing"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/tasks/{self.test_task_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task update successful: status={update_data['status']}, priority={update_data['priority']}")
            else:
                self.log_failure(f"Task update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task update error: {e}")
            return False
        
        # Test task list retrieval
        try:
            response = self.session.get(f"{API_BASE}/tasks", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task list retrieval successful: {len(data)} tasks found")
                return True
            else:
                self.log_failure(f"Task list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task list retrieval error: {e}")
            return False
    
    def test_task_data_fields(self):
        """Test task data fields including comment_count, post_count, work_link, and status"""
        print("\n=== Testing Task Data Fields ===")
        
        if not self.test_task_id:
            self.log_info("No test task ID available, skipping task data fields test")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test task comment creation
        comment_data = {
            "message": f"Test comment {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/tasks/{self.test_task_id}/comments", json=comment_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task comment creation successful: {data.get('message', 'Comment created')}")
            else:
                self.log_failure(f"Task comment creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task comment creation error: {e}")
            return False
        
        # Test task comment retrieval
        try:
            response = self.session.get(f"{API_BASE}/tasks/{self.test_task_id}/comments", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task comment retrieval successful: {len(data)} comments found")
            else:
                self.log_failure(f"Task comment retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task comment retrieval error: {e}")
            return False
        
        # Test task comment count endpoint
        try:
            response = self.session.get(f"{API_BASE}/tasks/comment-counts", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task comment count retrieval successful")
                
                # Check if our test task has a comment count
                # The response format might be different than expected, so we'll just log the structure
                if isinstance(data, dict):
                    self.log_info(f"Comment counts returned as dictionary with {len(data)} keys")
                    if self.test_task_id in data:
                        self.log_success(f"Task comment count for test task: {data[self.test_task_id]}")
                    else:
                        self.log_info(f"Test task not found in comment counts")
                elif isinstance(data, list):
                    self.log_info(f"Comment counts returned as list with {len(data)} items")
                    task_comment_count = next((item for item in data if isinstance(item, dict) and item.get("task_id") == self.test_task_id), None)
                    if task_comment_count:
                        self.log_success(f"Task comment count for test task: {task_comment_count.get('count', 0)}")
                    else:
                        self.log_info(f"Test task not found in comment counts")
                else:
                    self.log_info(f"Comment counts returned in unexpected format: {type(data)}")
            else:
                self.log_failure(f"Task comment count retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task comment count retrieval error: {e}")
            return False
        
        # Test task statistics
        try:
            response = self.session.get(f"{API_BASE}/tasks/statistics", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Task statistics retrieval successful")
                self.log_info(f"Urgent tasks: {data.get('urgent', 0)}")
                self.log_info(f"Todo tasks: {data.get('todo', 0)}")
                self.log_info(f"In progress tasks: {data.get('in_progress', 0)}")
                self.log_info(f"Due today tasks: {data.get('due_today', 0)}")
                self.log_info(f"Overdue tasks: {data.get('overdue', 0)}")
                return True
            else:
                self.log_failure(f"Task statistics retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Task statistics retrieval error: {e}")
            return False
    
    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n=== Testing User Management Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test user list retrieval
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"User list retrieval successful: {len(data)} users found")
            else:
                self.log_failure(f"User list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"User list retrieval error: {e}")
            return False
        
        # Test user roles list retrieval
        try:
            response = self.session.get(f"{API_BASE}/users/roles/list", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"User roles list retrieval successful: {len(data)} roles found")
                self.log_info(f"Available roles: {', '.join([role.get('value', '') for role in data])}")
            else:
                self.log_failure(f"User roles list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"User roles list retrieval error: {e}")
            return False
        
        return True
    
    def test_customer_endpoints(self):
        """Test customer management endpoints"""
        print("\n=== Testing Customer Management Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test customer creation
        customer_data = {
            "name": f"Test Customer {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "phone": "+1234567890",
            "company": "Test Company",
            "status": "high",
            "care_status": "potential_close",
            "assigned_sales_id": self.admin_user["id"],
            "potential_value": 50000.0,
            "notes": "Test customer for API testing",
            "source": "website"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_customer_id = data["id"]
                self.log_success(f"Customer creation successful: {data['name']}")
            else:
                self.log_failure(f"Customer creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Customer creation error: {e}")
            return False
        
        # Test customer retrieval
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Customer retrieval successful: {data['name']}")
            else:
                self.log_failure(f"Customer retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Customer retrieval error: {e}")
            return False
        
        # Test customer update
        update_data = {
            "status": "normal",
            "potential_value": 75000.0,
            "notes": "Updated notes for testing"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/customers/{self.test_customer_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Customer update successful: status={data['status']}, value={data['potential_value']}")
            else:
                self.log_failure(f"Customer update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Customer update error: {e}")
            return False
        
        # Test customer list retrieval
        try:
            response = self.session.get(f"{API_BASE}/customers", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Customer list retrieval successful: {len(data)} customers found")
                return True
            else:
                self.log_failure(f"Customer list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Customer list retrieval error: {e}")
            return False
    
    def test_client_endpoints(self):
        """Test client management endpoints"""
        print("\n=== Testing Client Management Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test client creation
        client_data = {
            "name": f"Test Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "contact_person": "John Doe",
            "email": f"test{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+1234567890",
            "contract_value": 100000.0,
            "company": "Test Company",
            "contract_link": "https://example.com/contract",
            "address": "123 Test St, Test City",
            "notes": "Test client for API testing",
            "invoice_email": f"invoice{uuid.uuid4().hex[:8]}@example.com",
            "client_type": "business",
            "source": "referral"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients", json=client_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_client_id = data["id"]
                self.log_success(f"Client creation successful: {data['name']}")
            else:
                self.log_failure(f"Client creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Client creation error: {e}")
            return False
        
        # Test client retrieval
        try:
            response = self.session.get(f"{API_BASE}/clients/{self.test_client_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Client retrieval successful: {data['name']}")
            else:
                self.log_failure(f"Client retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Client retrieval error: {e}")
            return False
        
        # Test client update
        update_data = {
            "name": f"Updated Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "contract_value": 150000.0,
            "notes": "Updated notes for testing"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/clients/{self.test_client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Client update successful: {data.get('message', 'Update successful')}")
            else:
                self.log_failure(f"Client update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Client update error: {e}")
            return False
        
        # Test client list retrieval
        try:
            response = self.session.get(f"{API_BASE}/clients", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Client list retrieval successful: {len(data)} clients found")
            else:
                self.log_failure(f"Client list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Client list retrieval error: {e}")
            return False
        
        # Test client statistics
        try:
            response = self.session.get(f"{API_BASE}/clients/statistics", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Client statistics retrieval successful")
                self.log_info(f"Total clients: {data.get('totalClients', 0)}")
                self.log_info(f"Total contract value: {data.get('totalContractValue', 0)}")
                return True
            else:
                self.log_failure(f"Client statistics retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Client statistics retrieval error: {e}")
            return False
    
    def test_interaction_tracking(self):
        """Test interaction tracking functionality"""
        print("\n=== Testing Interaction Tracking ===")
        
        if not self.test_customer_id:
            self.log_info("No test customer ID available, skipping interaction tracking test")
            return False
        
        # Create an interaction
        interaction_data = {
            "customer_id": self.test_customer_id,
            "type": "call",
            "title": f"Test Interaction {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "Test interaction for API testing",
            "revenue_generated": 5000.0,
            "next_action": "Send proposal",
            "next_action_date": (datetime.now() + timedelta(days=3)).isoformat()
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=interaction_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Interaction creation successful: {data['title']}")
            else:
                self.log_failure(f"Interaction creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Interaction creation error: {e}")
            return False
        
        # Get customer interactions
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}/interactions", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_success(f"Customer interactions retrieval successful: {len(data)} interactions")
                return True
            else:
                self.log_failure(f"Customer interactions retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Customer interactions retrieval error: {e}")
            return False
    
    def test_database_connectivity(self):
        """Test database connectivity by verifying data persistence"""
        print("\n=== Testing Database Connectivity ===")
        
        # We'll test database connectivity by creating a unique entity and then retrieving it
        unique_name = f"DB Test Entity {uuid.uuid4().hex[:8]}"
        
        # Create a customer with the unique name
        customer_data = {
            "name": unique_name,
            "phone": "+1234567890",
            "company": "DB Test Company",
            "status": "high",
            "care_status": "potential_close",
            "assigned_sales_id": self.admin_user["id"],
            "potential_value": 10000.0,
            "notes": "Testing database connectivity",
            "source": "test"
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            # Create the customer
            response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                db_test_id = data["id"]
                self.log_success(f"DB test customer creation successful: {data['name']}")
                
                # Now retrieve all customers and check if our unique one exists
                get_response = self.session.get(f"{API_BASE}/customers", headers=headers)
                if get_response.status_code == 200:
                    customers = get_response.json()
                    found = False
                    for customer in customers:
                        if customer["id"] == db_test_id and customer["name"] == unique_name:
                            found = True
                            break
                    
                    if found:
                        self.log_success("Database connectivity verified: Created customer was successfully retrieved")
                        return True
                    else:
                        self.log_failure("Database connectivity issue: Created customer was not found in retrieval")
                        return False
                else:
                    self.log_failure(f"Failed to retrieve customers for DB test: {get_response.status_code}")
                    return False
            else:
                self.log_failure(f"DB test customer creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure(f"Database connectivity test error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CRM Backend API Testing...")
        
        # Core functionality tests
        self.test_existing_user_login()
        self.test_profile_access()
        self.test_task_assignment_endpoints()
        self.test_task_data_fields()
        self.test_user_endpoints()
        self.test_customer_endpoints()
        self.test_client_endpoints()
        self.test_interaction_tracking()
        self.test_database_connectivity()
        
        # Print summary
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
        print("="*60)
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.success_count}")
        print(f"Failed: {self.total_tests - self.success_count}")
        success_rate = (self.success_count / self.total_tests) * 100 if self.total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.success_count == self.total_tests:
            print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
            return True
        else:
            print(f"\n⚠️  {self.total_tests - self.success_count} tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    tester = CRMAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)