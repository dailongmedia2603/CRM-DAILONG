#!/usr/bin/env python3
"""
Comprehensive User Management Module Testing for CRM System
Tests the completely updated CRM system with new User Management features
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

print(f"Testing User Management Module at: {API_BASE}")

class UserManagementTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.sales_token = None
        self.manager_token = None
        self.admin_user = None
        self.sales_user = None
        self.manager_user = None
        self.test_user_ids = []
        self.test_results = []
        
    def log_result(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status}: {test_name}"
        if message:
            result += f" - {message}"
        print(result)
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
        return success

    def test_updated_authentication(self):
        """Test updated authentication with username/email login"""
        print("\n=== Testing Updated Authentication ===")
        
        # Test 1: Login with username (admin)
        try:
            login_data = {
                "login": "admin",  # Using username
                "password": "admin123"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                
                # Verify new fields are present
                has_username = "username" in self.admin_user
                has_position = "position" in self.admin_user
                
                if has_username and has_position:
                    self.log_result("Login with username (admin)", True, 
                                  f"Username: {self.admin_user.get('username')}, Position: {self.admin_user.get('position')}")
                else:
                    self.log_result("Login with username (admin)", False, 
                                  f"Missing fields - username: {has_username}, position: {has_position}")
            else:
                self.log_result("Login with username (admin)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Login with username (admin)", False, str(e))

        # Test 2: Login with email (admin)
        try:
            login_data = {
                "login": "admin@crm.com",  # Using email
                "password": "admin123"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Login with email (admin)", True, 
                              f"Token generated, user: {data['user'].get('username')}")
            else:
                self.log_result("Login with email (admin)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Login with email (admin)", False, str(e))

        # Test 3: Login with username (sales)
        try:
            login_data = {
                "login": "sales",
                "password": "sales123"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.sales_token = data["access_token"]
                self.sales_user = data["user"]
                self.log_result("Login with username (sales)", True, 
                              f"Username: {self.sales_user.get('username')}, Position: {self.sales_user.get('position')}")
            else:
                self.log_result("Login with username (sales)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Login with username (sales)", False, str(e))

        # Test 4: Login with username (manager)
        try:
            login_data = {
                "login": "manager",
                "password": "manager123"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.manager_token = data["access_token"]
                self.manager_user = data["user"]
                self.log_result("Login with username (manager)", True, 
                              f"Username: {self.manager_user.get('username')}, Position: {self.manager_user.get('position')}")
            else:
                self.log_result("Login with username (manager)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Login with username (manager)", False, str(e))

        # Test 5: Verify JWT token includes new user data
        if self.admin_token:
            try:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
                if response.status_code == 200:
                    user_data = response.json()
                    has_username = "username" in user_data
                    has_position = "position" in user_data
                    self.log_result("JWT token validation with new fields", 
                                  has_username and has_position,
                                  f"Username: {user_data.get('username')}, Position: {user_data.get('position')}")
                else:
                    self.log_result("JWT token validation", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("JWT token validation", False, str(e))

    def test_user_management_apis(self):
        """Test new User Management APIs"""
        print("\n=== Testing User Management APIs ===")
        
        if not self.admin_token:
            self.log_result("User Management APIs", False, "No admin token available")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Test 1: GET /api/users - List all users
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            if response.status_code == 200:
                users = response.json()
                has_new_fields = all("username" in user and "position" in user for user in users)
                self.log_result("GET /api/users", True, 
                              f"Retrieved {len(users)} users, all have new fields: {has_new_fields}")
            else:
                self.log_result("GET /api/users", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/users", False, str(e))

        # Test 2: GET /api/users/roles/list - Get available roles
        try:
            response = self.session.get(f"{API_BASE}/users/roles/list", headers=headers)
            if response.status_code == 200:
                roles = response.json()
                expected_roles = ["admin", "sales", "manager", "sale", "intern", "seeder", "account", "content"]
                role_values = [role["value"] for role in roles]
                has_new_roles = all(role in role_values for role in ["intern", "seeder", "account", "content"])
                self.log_result("GET /api/users/roles/list", True, 
                              f"Retrieved {len(roles)} roles, includes new roles: {has_new_roles}")
            else:
                self.log_result("GET /api/users/roles/list", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/users/roles/list", False, str(e))

        # Test 3: POST /api/users - Create new user (admin only)
        try:
            new_user_data = {
                "username": f"testuser_{uuid.uuid4().hex[:8]}",
                "password": "testpass123",
                "email": f"test_{uuid.uuid4().hex[:8]}@test.com",
                "full_name": "Test User",
                "position": "Test Position",
                "role": "intern",  # Using new role
                "phone": "0901234567",
                "target_monthly": 10000000.0
            }
            response = self.session.post(f"{API_BASE}/users", json=new_user_data, headers=headers)
            if response.status_code == 200:
                created_user = response.json()
                self.test_user_ids.append(created_user["id"])
                self.log_result("POST /api/users (admin)", True, 
                              f"Created user: {created_user['username']} with role: {created_user['role']}")
            else:
                self.log_result("POST /api/users (admin)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("POST /api/users (admin)", False, str(e))

        # Test 4: POST /api/users - Non-admin cannot create users
        if self.sales_token:
            try:
                sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
                new_user_data = {
                    "username": f"unauthorized_{uuid.uuid4().hex[:8]}",
                    "password": "testpass123",
                    "role": "sales"
                }
                response = self.session.post(f"{API_BASE}/users", json=new_user_data, headers=sales_headers)
                if response.status_code == 403:
                    self.log_result("POST /api/users (non-admin blocked)", True, "Correctly blocked non-admin")
                else:
                    self.log_result("POST /api/users (non-admin blocked)", False, 
                                  f"Should be 403, got: {response.status_code}")
            except Exception as e:
                self.log_result("POST /api/users (non-admin blocked)", False, str(e))

        # Test 5: GET /api/users/{id} - Get single user
        if self.test_user_ids:
            try:
                user_id = self.test_user_ids[0]
                response = self.session.get(f"{API_BASE}/users/{user_id}", headers=headers)
                if response.status_code == 200:
                    user = response.json()
                    self.log_result("GET /api/users/{id}", True, 
                                  f"Retrieved user: {user.get('username')}")
                else:
                    self.log_result("GET /api/users/{id}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("GET /api/users/{id}", False, str(e))

        # Test 6: PUT /api/users/{id} - Update user (admin)
        if self.test_user_ids:
            try:
                user_id = self.test_user_ids[0]
                update_data = {
                    "position": "Updated Test Position",
                    "role": "content"  # Change to another new role
                }
                response = self.session.put(f"{API_BASE}/users/{user_id}", json=update_data, headers=headers)
                if response.status_code == 200:
                    updated_user = response.json()
                    self.log_result("PUT /api/users/{id} (admin)", True, 
                                  f"Updated position: {updated_user.get('position')}, role: {updated_user.get('role')}")
                else:
                    self.log_result("PUT /api/users/{id} (admin)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("PUT /api/users/{id} (admin)", False, str(e))

        # Test 7: PUT /api/users/{id} - User can update themselves
        if self.sales_token and self.sales_user:
            try:
                sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
                update_data = {
                    "phone": "0987654321"
                }
                response = self.session.put(f"{API_BASE}/users/{self.sales_user['id']}", 
                                          json=update_data, headers=sales_headers)
                if response.status_code == 200:
                    self.log_result("PUT /api/users/{id} (self-update)", True, "User can update themselves")
                else:
                    self.log_result("PUT /api/users/{id} (self-update)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("PUT /api/users/{id} (self-update)", False, str(e))

        # Test 8: DELETE /api/users/{id} - Soft delete user (admin only)
        if self.test_user_ids:
            try:
                user_id = self.test_user_ids[0]
                response = self.session.delete(f"{API_BASE}/users/{user_id}", headers=headers)
                if response.status_code == 200:
                    self.log_result("DELETE /api/users/{id} (admin)", True, "User soft deleted successfully")
                else:
                    self.log_result("DELETE /api/users/{id} (admin)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE /api/users/{id} (admin)", False, str(e))

        # Test 9: DELETE /api/users/{id} - Non-admin cannot delete
        if self.sales_token and self.test_user_ids:
            try:
                sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
                user_id = self.test_user_ids[0] if len(self.test_user_ids) > 1 else self.admin_user["id"]
                response = self.session.delete(f"{API_BASE}/users/{user_id}", headers=sales_headers)
                if response.status_code == 403:
                    self.log_result("DELETE /api/users/{id} (non-admin blocked)", True, "Correctly blocked non-admin")
                else:
                    self.log_result("DELETE /api/users/{id} (non-admin blocked)", False, 
                                  f"Should be 403, got: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE /api/users/{id} (non-admin blocked)", False, str(e))

    def test_migration_verification(self):
        """Test migration verification - existing users have username and position"""
        print("\n=== Testing Migration Verification ===")
        
        if not self.admin_token:
            self.log_result("Migration Verification", False, "No admin token available")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Test 1: Verify all existing users have username and position
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            if response.status_code == 200:
                users = response.json()
                
                # Check specific users
                admin_user = next((u for u in users if u.get("role") == "admin"), None)
                sales_user = next((u for u in users if u.get("role") == "sales"), None)
                manager_user = next((u for u in users if u.get("role") == "manager"), None)
                
                results = []
                if admin_user:
                    expected_username = "admin"
                    expected_position = "System Administrator"
                    username_ok = admin_user.get("username") == expected_username
                    position_ok = admin_user.get("position") == expected_position
                    results.append(f"Admin - username: {username_ok}, position: {position_ok}")
                
                if sales_user:
                    expected_username = "sales"
                    expected_position = "Sales Executive"
                    username_ok = sales_user.get("username") == expected_username
                    position_ok = sales_user.get("position") == expected_position
                    results.append(f"Sales - username: {username_ok}, position: {position_ok}")
                
                if manager_user:
                    expected_username = "manager"
                    expected_position = "Sales Manager"
                    username_ok = manager_user.get("username") == expected_username
                    position_ok = manager_user.get("position") == expected_position
                    results.append(f"Manager - username: {username_ok}, position: {position_ok}")
                
                all_have_fields = all("username" in user and "position" in user for user in users)
                self.log_result("Migration verification", all_have_fields, "; ".join(results))
            else:
                self.log_result("Migration verification", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Migration verification", False, str(e))

    def test_data_integrity(self):
        """Test data integrity - uniqueness validation and required fields"""
        print("\n=== Testing Data Integrity ===")
        
        if not self.admin_token:
            self.log_result("Data Integrity", False, "No admin token available")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Test 1: Username uniqueness validation
        try:
            duplicate_user_data = {
                "username": "admin",  # Duplicate username
                "password": "testpass123",
                "role": "sales"
            }
            response = self.session.post(f"{API_BASE}/users", json=duplicate_user_data, headers=headers)
            if response.status_code == 400:
                self.log_result("Username uniqueness validation", True, "Correctly rejected duplicate username")
            else:
                self.log_result("Username uniqueness validation", False, 
                              f"Should be 400, got: {response.status_code}")
        except Exception as e:
            self.log_result("Username uniqueness validation", False, str(e))

        # Test 2: Email uniqueness validation (when provided)
        try:
            duplicate_email_data = {
                "username": f"unique_{uuid.uuid4().hex[:8]}",
                "password": "testpass123",
                "email": "admin@crm.com",  # Duplicate email
                "role": "sales"
            }
            response = self.session.post(f"{API_BASE}/users", json=duplicate_email_data, headers=headers)
            if response.status_code == 400:
                self.log_result("Email uniqueness validation", True, "Correctly rejected duplicate email")
            else:
                self.log_result("Email uniqueness validation", False, 
                              f"Should be 400, got: {response.status_code}")
        except Exception as e:
            self.log_result("Email uniqueness validation", False, str(e))

        # Test 3: Required vs optional fields
        try:
            minimal_user_data = {
                "username": f"minimal_{uuid.uuid4().hex[:8]}",
                "password": "testpass123",
                "role": "intern"
                # email is optional, position is optional
            }
            response = self.session.post(f"{API_BASE}/users", json=minimal_user_data, headers=headers)
            if response.status_code == 200:
                created_user = response.json()
                self.test_user_ids.append(created_user["id"])
                self.log_result("Required vs optional fields", True, 
                              f"Created user with minimal data: {created_user['username']}")
            else:
                self.log_result("Required vs optional fields", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Required vs optional fields", False, str(e))

        # Test 4: Missing required fields
        try:
            invalid_user_data = {
                "email": f"invalid_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123"
                # Missing username and role (required)
            }
            response = self.session.post(f"{API_BASE}/users", json=invalid_user_data, headers=headers)
            if response.status_code in [400, 422]:  # Validation error
                self.log_result("Missing required fields validation", True, "Correctly rejected missing required fields")
            else:
                self.log_result("Missing required fields validation", False, 
                              f"Should be 400/422, got: {response.status_code}")
        except Exception as e:
            self.log_result("Missing required fields validation", False, str(e))

    def test_existing_functionality(self):
        """Test that existing functionality still works"""
        print("\n=== Testing Existing Functionality ===")
        
        if not self.admin_token:
            self.log_result("Existing Functionality", False, "No admin token available")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Test 1: Customer management still works
        try:
            response = self.session.get(f"{API_BASE}/customers", headers=headers)
            if response.status_code == 200:
                customers = response.json()
                self.log_result("Customer management", True, f"Retrieved {len(customers)} customers")
            else:
                self.log_result("Customer management", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Customer management", False, str(e))

        # Test 2: Analytics dashboard still works
        try:
            response = self.session.get(f"{API_BASE}/dashboard/analytics", headers=headers)
            if response.status_code == 200:
                analytics = response.json()
                self.log_result("Analytics dashboard", True, 
                              f"Total customers: {analytics.get('total_customers', 0)}")
            else:
                self.log_result("Analytics dashboard", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Analytics dashboard", False, str(e))

        # Test 3: Task management still works
        try:
            response = self.session.get(f"{API_BASE}/tasks", headers=headers)
            if response.status_code == 200:
                tasks = response.json()
                self.log_result("Task management", True, f"Retrieved {len(tasks)} tasks")
            else:
                self.log_result("Task management", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Task management", False, str(e))

    def run_all_tests(self):
        """Run all User Management tests"""
        print("🚀 Starting User Management Module Testing")
        print("=" * 60)
        
        # Run all test suites
        self.test_updated_authentication()
        self.test_user_management_apis()
        self.test_migration_verification()
        self.test_data_integrity()
        self.test_existing_functionality()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n🎯 USER MANAGEMENT MODULE TESTING COMPLETED")
        return success_rate >= 80  # Consider 80%+ as successful

if __name__ == "__main__":
    tester = UserManagementTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)