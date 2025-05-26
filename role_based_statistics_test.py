#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class RoleBasedStatisticsTest:
    def __init__(self):
        self.admin_token = None
        self.user_token = None
        self.admin_user = None
        self.test_user = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def login_admin(self):
        """Login as admin user"""
        try:
            # Try to login with admin credentials
            login_data = {
                "login": "admin",
                "password": "admin123"
            }
            
            response = requests.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                self.log_result("Admin Login", True, f"Successfully logged in as admin: {self.admin_user['username']}")
                return True
            else:
                self.log_result("Admin Login", False, f"Failed to login as admin: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception during admin login: {str(e)}")
            return False
    
    def login_user(self):
        """Login as regular user (Nhi Trinh)"""
        try:
            # Try to login with Nhi Trinh credentials
            login_data = {
                "login": "nhi.trinh",
                "password": "password123"
            }
            
            response = requests.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.user_token = data["access_token"]
                self.test_user = data["user"]
                self.log_result("User Login", True, f"Successfully logged in as user: {self.test_user['username']} (Role: {self.test_user['role']})")
                return True
            else:
                self.log_result("User Login", False, f"Failed to login as user: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_result("User Login", False, f"Exception during user login: {str(e)}")
            return False
    
    def get_statistics(self, endpoint, token, user_type):
        """Get statistics from specified endpoint"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_BASE}/{endpoint}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(f"{user_type} {endpoint}", True, f"Successfully retrieved {endpoint} statistics", data)
                return data
            else:
                self.log_result(f"{user_type} {endpoint}", False, f"Failed to get {endpoint}: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.log_result(f"{user_type} {endpoint}", False, f"Exception getting {endpoint}: {str(e)}")
            return None
    
    def get_data_list(self, endpoint, token, user_type):
        """Get data list from specified endpoint for comparison"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_BASE}/{endpoint}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                self.log_result(f"{user_type} {endpoint} Data", True, f"Retrieved {count} items from {endpoint}")
                return data
            else:
                self.log_result(f"{user_type} {endpoint} Data", False, f"Failed to get {endpoint} data: {response.status_code}")
                return None
                
        except Exception as e:
            self.log_result(f"{user_type} {endpoint} Data", False, f"Exception getting {endpoint} data: {str(e)}")
            return None
    
    def test_project_statistics(self):
        """Test project statistics role-based filtering"""
        print("\n=== TESTING PROJECT STATISTICS ===")
        
        # Get admin statistics
        admin_stats = self.get_statistics("projects/statistics", self.admin_token, "Admin")
        admin_projects = self.get_data_list("projects", self.admin_token, "Admin")
        
        # Get user statistics  
        user_stats = self.get_statistics("projects/statistics", self.user_token, "User")
        user_projects = self.get_data_list("projects", self.user_token, "User")
        
        if admin_stats and user_stats and admin_projects is not None and user_projects is not None:
            # Compare statistics
            admin_total = admin_stats.get("total_projects", 0)
            user_total = user_stats.get("total_projects", 0)
            admin_project_count = len(admin_projects)
            user_project_count = len(user_projects)
            
            # Verify admin sees more or equal data
            if admin_total >= user_total:
                self.log_result("Project Statistics Filtering", True, 
                    f"Admin sees {admin_total} projects, User sees {user_total} projects (filtering working)")
            else:
                self.log_result("Project Statistics Filtering", False, 
                    f"User sees more projects ({user_total}) than admin ({admin_total}) - filtering broken")
            
            # Verify statistics match data lists
            if admin_total == admin_project_count:
                self.log_result("Admin Project Stats Consistency", True, 
                    f"Admin statistics ({admin_total}) match project list count ({admin_project_count})")
            else:
                self.log_result("Admin Project Stats Consistency", False, 
                    f"Admin statistics ({admin_total}) don't match project list count ({admin_project_count})")
            
            if user_total == user_project_count:
                self.log_result("User Project Stats Consistency", True, 
                    f"User statistics ({user_total}) match project list count ({user_project_count})")
            else:
                self.log_result("User Project Stats Consistency", False, 
                    f"User statistics ({user_total}) don't match project list count ({user_project_count})")
    
    def test_client_statistics(self):
        """Test client statistics role-based filtering"""
        print("\n=== TESTING CLIENT STATISTICS ===")
        
        # Get admin statistics
        admin_stats = self.get_statistics("clients/statistics", self.admin_token, "Admin")
        admin_clients = self.get_data_list("clients", self.admin_token, "Admin")
        
        # Get user statistics
        user_stats = self.get_statistics("clients/statistics", self.user_token, "User")
        user_clients = self.get_data_list("clients", self.user_token, "User")
        
        if admin_stats and user_stats and admin_clients is not None and user_clients is not None:
            # Compare statistics
            admin_total = admin_stats.get("totalClients", 0)
            user_total = user_stats.get("totalClients", 0)
            admin_client_count = len(admin_clients)
            user_client_count = len(user_clients)
            
            # Verify admin sees more or equal data
            if admin_total >= user_total:
                self.log_result("Client Statistics Filtering", True, 
                    f"Admin sees {admin_total} clients, User sees {user_total} clients (filtering working)")
            else:
                self.log_result("Client Statistics Filtering", False, 
                    f"User sees more clients ({user_total}) than admin ({admin_total}) - filtering broken")
            
            # Verify statistics match data lists
            if admin_total == admin_client_count:
                self.log_result("Admin Client Stats Consistency", True, 
                    f"Admin statistics ({admin_total}) match client list count ({admin_client_count})")
            else:
                self.log_result("Admin Client Stats Consistency", False, 
                    f"Admin statistics ({admin_total}) don't match client list count ({admin_client_count})")
            
            if user_total == user_client_count:
                self.log_result("User Client Stats Consistency", True, 
                    f"User statistics ({user_total}) match client list count ({user_client_count})")
            else:
                self.log_result("User Client Stats Consistency", False, 
                    f"User statistics ({user_total}) don't match client list count ({user_client_count})")
    
    def test_task_statistics(self):
        """Test task statistics role-based filtering"""
        print("\n=== TESTING TASK STATISTICS ===")
        
        # Get admin statistics
        admin_stats = self.get_statistics("tasks/statistics", self.admin_token, "Admin")
        admin_tasks = self.get_data_list("tasks", self.admin_token, "Admin")
        
        # Get user statistics
        user_stats = self.get_statistics("tasks/statistics", self.user_token, "User")
        user_tasks = self.get_data_list("tasks", self.user_token, "User")
        
        if admin_stats and user_stats and admin_tasks is not None and user_tasks is not None:
            # Compare total task counts (sum of all statuses)
            admin_total = (admin_stats.get("urgent", 0) + admin_stats.get("todo", 0) + 
                          admin_stats.get("inProgress", 0))
            user_total = (user_stats.get("urgent", 0) + user_stats.get("todo", 0) + 
                         user_stats.get("inProgress", 0))
            admin_task_count = len(admin_tasks)
            user_task_count = len(user_tasks)
            
            # Verify admin sees more or equal data
            if admin_total >= user_total:
                self.log_result("Task Statistics Filtering", True, 
                    f"Admin sees {admin_total} active tasks, User sees {user_total} active tasks (filtering working)")
            else:
                self.log_result("Task Statistics Filtering", False, 
                    f"User sees more tasks ({user_total}) than admin ({admin_total}) - filtering broken")
            
            # Verify user sees expected limited data (based on review request)
            if user_task_count <= 1:
                self.log_result("User Task Count Verification", True, 
                    f"User 'Nhi Trinh' sees {user_task_count} task(s) as expected from review request")
            else:
                self.log_result("User Task Count Verification", False, 
                    f"User 'Nhi Trinh' sees {user_task_count} tasks, expected 1 or fewer")
            
            # Log detailed statistics for comparison
            self.log_result("Task Statistics Details", True, 
                f"Admin: urgent={admin_stats.get('urgent', 0)}, todo={admin_stats.get('todo', 0)}, inProgress={admin_stats.get('inProgress', 0)}, dueToday={admin_stats.get('dueToday', 0)}, overdue={admin_stats.get('overdue', 0)}")
            self.log_result("Task Statistics Details", True, 
                f"User: urgent={user_stats.get('urgent', 0)}, todo={user_stats.get('todo', 0)}, inProgress={user_stats.get('inProgress', 0)}, dueToday={user_stats.get('dueToday', 0)}, overdue={user_stats.get('overdue', 0)}")
    
    def run_all_tests(self):
        """Run all role-based statistics filtering tests"""
        print("🧪 STARTING ROLE-BASED STATISTICS FILTERING TESTS")
        print("=" * 60)
        
        # Login as admin
        if not self.login_admin():
            print("❌ Cannot proceed without admin login")
            return False
        
        # Login as user
        if not self.login_user():
            print("❌ Cannot proceed without user login")
            return False
        
        # Test all statistics endpoints
        self.test_project_statistics()
        self.test_client_statistics()
        self.test_task_statistics()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = RoleBasedStatisticsTest()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL ROLE-BASED STATISTICS FILTERING TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n💥 SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()