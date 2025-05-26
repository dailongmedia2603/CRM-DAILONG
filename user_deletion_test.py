#!/usr/bin/env python3
"""
User Deletion Functionality Testing for CRM System
Tests all user deletion scenarios including authentication, authorization, and soft delete verification
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing user deletion functionality at: {API_BASE}")

class UserDeletionTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.sales_token = None
        self.admin_user = None
        self.sales_user = None
        self.test_users = []  # Users created for testing deletion
        
    def login_admin(self):
        """Login as admin user"""
        print("\n=== Logging in as Admin ===")
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
                print(f"✅ Admin login successful: {self.admin_user['email']}")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {e}")
            return False
    
    def login_sales(self):
        """Login as sales user"""
        print("\n=== Logging in as Sales ===")
        login_data = {
            "login": "sales@crm.com",
            "password": "sales123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.sales_token = data["access_token"]
                self.sales_user = data["user"]
                print(f"✅ Sales login successful: {self.sales_user['email']}")
                return True
            else:
                print(f"❌ Sales login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales login error: {e}")
            return False
    
    def create_test_users(self):
        """Create test users for deletion testing"""
        print("\n=== Creating Test Users for Deletion ===")
        
        if not self.admin_token:
            print("❌ Admin token required to create users")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create multiple test users
        test_user_data = [
            {
                "username": f"testuser1_{uuid.uuid4().hex[:8]}",
                "email": f"testuser1_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123",
                "full_name": "Test User 1",
                "role": "sales",
                "position": "Sales Executive"
            },
            {
                "username": f"testuser2_{uuid.uuid4().hex[:8]}",
                "email": f"testuser2_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123",
                "full_name": "Test User 2",
                "role": "manager",
                "position": "Sales Manager"
            },
            {
                "username": f"testuser3_{uuid.uuid4().hex[:8]}",
                "email": f"testuser3_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123",
                "full_name": "Test User 3",
                "role": "intern",
                "position": "Intern"
            }
        ]
        
        for user_data in test_user_data:
            try:
                response = self.session.post(f"{API_BASE}/users", json=user_data, headers=headers)
                if response.status_code == 200:
                    user = response.json()
                    self.test_users.append(user)
                    print(f"✅ Created test user: {user['username']} ({user['id']})")
                else:
                    print(f"❌ Failed to create test user {user_data['username']}: {response.status_code} - {response.text}")
                    return False
            except Exception as e:
                print(f"❌ Error creating test user {user_data['username']}: {e}")
                return False
        
        print(f"✅ Created {len(self.test_users)} test users for deletion testing")
        return True
    
    def test_single_user_deletion_admin(self):
        """Test single user deletion with admin privileges"""
        print("\n=== Testing Single User Deletion (Admin) ===")
        
        if not self.admin_token or not self.test_users:
            print("❌ Admin token and test users required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        test_user = self.test_users[0]
        user_id = test_user['id']
        
        # First, verify user exists and is active
        try:
            response = self.session.get(f"{API_BASE}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                user_before = response.json()
                if not user_before.get('is_active', True):
                    print(f"❌ Test user {user_id} is already inactive")
                    return False
                print(f"✅ Verified user {user_id} exists and is active")
            else:
                print(f"❌ Failed to get user before deletion: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error getting user before deletion: {e}")
            return False
        
        # Delete the user
        try:
            response = self.session.delete(f"{API_BASE}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ User deletion successful: {result['message']}")
            else:
                print(f"❌ User deletion failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error deleting user: {e}")
            return False
        
        # Verify user is soft deleted (is_active = False)
        try:
            response = self.session.get(f"{API_BASE}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                user_after = response.json()
                if user_after.get('is_active') == False:
                    print(f"✅ Verified user {user_id} is soft deleted (is_active = False)")
                    return True
                else:
                    print(f"❌ User {user_id} is still active after deletion")
                    return False
            else:
                print(f"❌ Failed to get user after deletion: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error verifying soft delete: {e}")
            return False
    
    def test_single_user_deletion_unauthorized(self):
        """Test single user deletion without admin privileges (should fail)"""
        print("\n=== Testing Single User Deletion (Unauthorized - Sales User) ===")
        
        if not self.sales_token or not self.test_users:
            print("❌ Sales token and test users required")
            return False
        
        headers = {"Authorization": f"Bearer {self.sales_token}"}
        test_user = self.test_users[1] if len(self.test_users) > 1 else self.test_users[0]
        user_id = test_user['id']
        
        # Try to delete user with sales privileges (should fail)
        try:
            response = self.session.delete(f"{API_BASE}/users/{user_id}", headers=headers)
            if response.status_code == 403:
                result = response.json()
                print(f"✅ Unauthorized deletion correctly blocked: {result['detail']}")
                return True
            else:
                print(f"❌ Unauthorized deletion should have failed with 403, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing unauthorized deletion: {e}")
            return False
    
    def test_single_user_deletion_no_auth(self):
        """Test single user deletion without authentication (should fail)"""
        print("\n=== Testing Single User Deletion (No Authentication) ===")
        
        if not self.test_users:
            print("❌ Test users required")
            return False
        
        test_user = self.test_users[1] if len(self.test_users) > 1 else self.test_users[0]
        user_id = test_user['id']
        
        # Try to delete user without authentication (should fail)
        try:
            response = self.session.delete(f"{API_BASE}/users/{user_id}")
            if response.status_code == 401:
                print(f"✅ Unauthenticated deletion correctly blocked: {response.status_code}")
                return True
            else:
                print(f"❌ Unauthenticated deletion should have failed with 401, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing unauthenticated deletion: {e}")
            return False
    
    def test_single_user_deletion_invalid_id(self):
        """Test single user deletion with invalid user ID"""
        print("\n=== Testing Single User Deletion (Invalid User ID) ===")
        
        if not self.admin_token:
            print("❌ Admin token required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        invalid_user_id = str(uuid.uuid4())  # Random UUID that doesn't exist
        
        # Try to delete non-existent user
        try:
            response = self.session.delete(f"{API_BASE}/users/{invalid_user_id}", headers=headers)
            if response.status_code == 404:
                result = response.json()
                print(f"✅ Invalid user ID correctly handled: {result['detail']}")
                return True
            else:
                print(f"❌ Invalid user ID should have failed with 404, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing invalid user ID: {e}")
            return False
    
    def test_self_deletion_prevention(self):
        """Test that admin cannot delete their own account"""
        print("\n=== Testing Self-Deletion Prevention ===")
        
        if not self.admin_token or not self.admin_user:
            print("❌ Admin token and user required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        admin_user_id = self.admin_user['id']
        
        # Try to delete own account (should fail)
        try:
            response = self.session.delete(f"{API_BASE}/users/{admin_user_id}", headers=headers)
            if response.status_code == 400:
                result = response.json()
                print(f"✅ Self-deletion correctly prevented: {result['detail']}")
                return True
            else:
                print(f"❌ Self-deletion should have failed with 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing self-deletion prevention: {e}")
            return False
    
    def test_bulk_user_deletion_admin(self):
        """Test bulk user deletion with admin privileges"""
        print("\n=== Testing Bulk User Deletion (Admin) ===")
        
        if not self.admin_token or len(self.test_users) < 2:
            print("❌ Admin token and at least 2 test users required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Use remaining test users for bulk deletion (skip the first one if already deleted)
        bulk_user_ids = []
        for user in self.test_users[1:]:  # Skip first user (might be already deleted)
            bulk_user_ids.append(user['id'])
        
        if not bulk_user_ids:
            print("❌ No users available for bulk deletion")
            return False
        
        print(f"Attempting to bulk delete {len(bulk_user_ids)} users")
        
        # Perform bulk deletion
        try:
            response = self.session.post(f"{API_BASE}/users/bulk-delete", json=bulk_user_ids, headers=headers)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Bulk deletion successful: {result['message']}")
                print(f"   Success count: {result['success_count']}")
                print(f"   Error count: {result['error_count']}")
                if result['errors']:
                    print(f"   Errors: {result['errors']}")
                
                # Verify users are soft deleted
                for user_id in bulk_user_ids:
                    try:
                        user_response = self.session.get(f"{API_BASE}/users/{user_id}", headers=headers)
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            if user_data.get('is_active') == False:
                                print(f"✅ User {user_id} is soft deleted")
                            else:
                                print(f"❌ User {user_id} is still active after bulk deletion")
                                return False
                    except Exception as e:
                        print(f"❌ Error verifying bulk deletion for user {user_id}: {e}")
                        return False
                
                return True
            else:
                print(f"❌ Bulk deletion failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error performing bulk deletion: {e}")
            return False
    
    def test_bulk_user_deletion_unauthorized(self):
        """Test bulk user deletion without admin privileges (should fail)"""
        print("\n=== Testing Bulk User Deletion (Unauthorized - Sales User) ===")
        
        if not self.sales_token:
            print("❌ Sales token required")
            return False
        
        headers = {"Authorization": f"Bearer {self.sales_token}"}
        dummy_user_ids = [str(uuid.uuid4()), str(uuid.uuid4())]  # Random UUIDs
        
        # Try bulk deletion with sales privileges (should fail)
        try:
            response = self.session.post(f"{API_BASE}/users/bulk-delete", json=dummy_user_ids, headers=headers)
            if response.status_code == 403:
                result = response.json()
                print(f"✅ Unauthorized bulk deletion correctly blocked: {result['detail']}")
                return True
            else:
                print(f"❌ Unauthorized bulk deletion should have failed with 403, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing unauthorized bulk deletion: {e}")
            return False
    
    def test_bulk_user_deletion_empty_list(self):
        """Test bulk user deletion with empty user list"""
        print("\n=== Testing Bulk User Deletion (Empty List) ===")
        
        if not self.admin_token:
            print("❌ Admin token required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Try bulk deletion with empty list (should fail)
        try:
            response = self.session.post(f"{API_BASE}/users/bulk-delete", json=[], headers=headers)
            if response.status_code == 400:
                result = response.json()
                print(f"✅ Empty list correctly handled: {result['detail']}")
                return True
            else:
                print(f"❌ Empty list should have failed with 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing empty list bulk deletion: {e}")
            return False
    
    def test_bulk_user_deletion_with_self(self):
        """Test bulk user deletion including own account (should fail)"""
        print("\n=== Testing Bulk User Deletion (Including Self) ===")
        
        if not self.admin_token or not self.admin_user:
            print("❌ Admin token and user required")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        user_ids_with_self = [self.admin_user['id'], str(uuid.uuid4())]  # Include admin's own ID
        
        # Try bulk deletion including own account (should fail)
        try:
            response = self.session.post(f"{API_BASE}/users/bulk-delete", json=user_ids_with_self, headers=headers)
            if response.status_code == 400:
                result = response.json()
                print(f"✅ Self-inclusion in bulk deletion correctly prevented: {result['detail']}")
                return True
            else:
                print(f"❌ Self-inclusion should have failed with 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing self-inclusion in bulk deletion: {e}")
            return False
    
    def run_all_tests(self):
        """Run all user deletion tests"""
        print("🚀 Starting User Deletion Functionality Tests")
        print("=" * 60)
        
        test_results = []
        
        # Login tests
        test_results.append(("Admin Login", self.login_admin()))
        test_results.append(("Sales Login", self.login_sales()))
        
        # Create test users
        test_results.append(("Create Test Users", self.create_test_users()))
        
        # Single user deletion tests
        test_results.append(("Single User Deletion (Admin)", self.test_single_user_deletion_admin()))
        test_results.append(("Single User Deletion (Unauthorized)", self.test_single_user_deletion_unauthorized()))
        test_results.append(("Single User Deletion (No Auth)", self.test_single_user_deletion_no_auth()))
        test_results.append(("Single User Deletion (Invalid ID)", self.test_single_user_deletion_invalid_id()))
        test_results.append(("Self-Deletion Prevention", self.test_self_deletion_prevention()))
        
        # Bulk user deletion tests
        test_results.append(("Bulk User Deletion (Admin)", self.test_bulk_user_deletion_admin()))
        test_results.append(("Bulk User Deletion (Unauthorized)", self.test_bulk_user_deletion_unauthorized()))
        test_results.append(("Bulk User Deletion (Empty List)", self.test_bulk_user_deletion_empty_list()))
        test_results.append(("Bulk User Deletion (Including Self)", self.test_bulk_user_deletion_with_self()))
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 USER DELETION TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 All user deletion tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = UserDeletionTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)