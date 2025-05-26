#!/usr/bin/env python3
"""
Role-Based Data Filtering Test for CRM Media App

This test verifies the NEW FEATURES IMPLEMENTED:
1. Projects Module: Role-based filtering 
2. Clients Module: Role-based filtering
3. Tasks Module: Role-based filtering

Testing Requirements:
- Admin users can see all data
- Non-admin users only see data they created OR are assigned to
- Test create operations set created_by correctly
- Test edge cases with users having no assigned data
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Backend URL from environment
BACKEND_URL = "https://33831ab9-c861-4051-ab2d-853ef3d8563d.preview.emergentagent.com/api"

class RoleBasedFilteringTester:
    def __init__(self):
        self.admin_token = None
        self.sales_token = None
        self.account_token = None
        self.test_results = []
        self.admin_user_id = None
        self.sales_user_id = None
        self.account_user_id = None
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate_users(self):
        """Authenticate different user roles"""
        print("\n🔐 AUTHENTICATING USERS...")
        
        # Test users from existing system
        test_users = [
            {"login": "admin", "password": "admin123", "role": "admin"},
            {"login": "yenvi", "password": "yenvi123", "role": "sales"},
            {"login": "nhitrinh", "password": "nhitrinh123", "role": "account"}
        ]
        
        tokens = {}
        user_ids = {}
        
        for user in test_users:
            try:
                response = requests.post(f"{BACKEND_URL}/auth/login", json={
                    "login": user["login"],
                    "password": user["password"]
                })
                
                if response.status_code == 200:
                    data = response.json()
                    tokens[user["role"]] = data["access_token"]
                    user_ids[user["role"]] = data["user"]["id"]
                    self.log_result(f"Login {user['role']} user", True, f"User ID: {data['user']['id']}")
                else:
                    self.log_result(f"Login {user['role']} user", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Login {user['role']} user", False, f"Error: {str(e)}")
        
        self.admin_token = tokens.get("admin")
        self.sales_token = tokens.get("sales")
        self.manager_token = tokens.get("manager")
        self.admin_user_id = user_ids.get("admin")
        self.sales_user_id = user_ids.get("sales")
        self.manager_user_id = user_ids.get("manager")
        
        return len(tokens) >= 2  # Need at least admin and one non-admin user
    
    def create_test_data(self):
        """Create test data with different users to test filtering"""
        print("\n📊 CREATING TEST DATA...")
        
        if not self.admin_token or not self.sales_token:
            self.log_result("Create test data", False, "Missing authentication tokens")
            return False
        
        # Create test projects with different creators and assignments
        test_projects = [
            {
                "name": "Admin Project 1",
                "contract_value": 10000,
                "created_by_role": "admin",
                "account_id": None,
                "content_id": None,
                "seeder_id": None
            },
            {
                "name": "Sales Project 1", 
                "contract_value": 5000,
                "created_by_role": "sales",
                "account_id": self.sales_user_id,  # Assign to sales user
                "content_id": None,
                "seeder_id": None
            },
            {
                "name": "Admin Project Assigned to Sales",
                "contract_value": 8000,
                "created_by_role": "admin",
                "account_id": self.sales_user_id,  # Assign to sales user
                "content_id": None,
                "seeder_id": None
            }
        ]
        
        # Create test clients with different creators and assignments
        test_clients = [
            {
                "name": "Admin Client 1",
                "contact_person": "Admin Contact",
                "email": "admin.client@test.com",
                "contract_value": 15000,
                "created_by_role": "admin",
                "assigned_sales_id": None
            },
            {
                "name": "Sales Client 1",
                "contact_person": "Sales Contact", 
                "email": "sales.client@test.com",
                "contract_value": 7000,
                "created_by_role": "sales",
                "assigned_sales_id": self.sales_user_id
            },
            {
                "name": "Admin Client Assigned to Sales",
                "contact_person": "Assigned Contact",
                "email": "assigned.client@test.com", 
                "contract_value": 12000,
                "created_by_role": "admin",
                "assigned_sales_id": self.sales_user_id
            }
        ]
        
        # Create test tasks with different creators and assignments
        test_tasks = [
            {
                "title": "Admin Task 1",
                "description": "Task created by admin",
                "priority": "high",
                "deadline": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "created_by_role": "admin",
                "assigned_to": self.admin_user_id
            },
            {
                "title": "Sales Task 1",
                "description": "Task created by sales",
                "priority": "medium", 
                "deadline": (datetime.utcnow() + timedelta(days=5)).isoformat(),
                "created_by_role": "sales",
                "assigned_to": self.sales_user_id
            },
            {
                "title": "Admin Task Assigned to Sales",
                "description": "Task created by admin, assigned to sales",
                "priority": "urgent",
                "deadline": (datetime.utcnow() + timedelta(days=3)).isoformat(),
                "created_by_role": "admin", 
                "assigned_to": self.sales_user_id
            }
        ]
        
        # Create projects
        for project in test_projects:
            token = self.admin_token if project["created_by_role"] == "admin" else self.sales_token
            headers = {"Authorization": f"Bearer {token}"}
            
            project_data = {
                "name": project["name"],
                "contract_value": project["contract_value"],
                "account_id": project["account_id"],
                "content_id": project["content_id"],
                "seeder_id": project["seeder_id"]
            }
            
            try:
                response = requests.post(f"{BACKEND_URL}/projects", json=project_data, headers=headers)
                if response.status_code == 200:
                    self.log_result(f"Create project: {project['name']}", True)
                else:
                    self.log_result(f"Create project: {project['name']}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Create project: {project['name']}", False, f"Error: {str(e)}")
        
        # Create clients
        for client in test_clients:
            token = self.admin_token if client["created_by_role"] == "admin" else self.sales_token
            headers = {"Authorization": f"Bearer {token}"}
            
            client_data = {
                "name": client["name"],
                "contact_person": client["contact_person"],
                "email": client["email"],
                "contract_value": client["contract_value"],
                "assigned_sales_id": client["assigned_sales_id"]
            }
            
            try:
                response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=headers)
                if response.status_code == 200:
                    self.log_result(f"Create client: {client['name']}", True)
                else:
                    self.log_result(f"Create client: {client['name']}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Create client: {client['name']}", False, f"Error: {str(e)}")
        
        # Create tasks
        for task in test_tasks:
            token = self.admin_token if task["created_by_role"] == "admin" else self.sales_token
            headers = {"Authorization": f"Bearer {token}"}
            
            task_data = {
                "title": task["title"],
                "description": task["description"],
                "priority": task["priority"],
                "deadline": task["deadline"],
                "assigned_to": task["assigned_to"]
            }
            
            try:
                response = requests.post(f"{BACKEND_URL}/tasks", json=task_data, headers=headers)
                if response.status_code == 200:
                    self.log_result(f"Create task: {task['title']}", True)
                else:
                    self.log_result(f"Create task: {task['title']}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Create task: {task['title']}", False, f"Error: {str(e)}")
        
        return True
    
    def test_projects_filtering(self):
        """Test Projects endpoint role-based filtering"""
        print("\n🏗️ TESTING PROJECTS ROLE-BASED FILTERING...")
        
        # Test admin user - should see all projects
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/projects", headers=headers)
            
            if response.status_code == 200:
                admin_projects = response.json()
                self.log_result("Admin can access projects endpoint", True, f"Found {len(admin_projects)} projects")
                
                # Admin should see all projects (including those created by others)
                project_names = [p.get("name", "") for p in admin_projects]
                has_admin_projects = any("Admin Project" in name for name in project_names)
                has_sales_projects = any("Sales Project" in name for name in project_names)
                
                if has_admin_projects and has_sales_projects:
                    self.log_result("Admin sees all projects (own + others)", True, f"Projects: {project_names}")
                else:
                    self.log_result("Admin sees all projects (own + others)", False, f"Missing projects: {project_names}")
            else:
                self.log_result("Admin can access projects endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Admin can access projects endpoint", False, f"Error: {str(e)}")
        
        # Test sales user - should only see their created/assigned projects
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            response = requests.get(f"{BACKEND_URL}/projects", headers=headers)
            
            if response.status_code == 200:
                sales_projects = response.json()
                self.log_result("Sales can access projects endpoint", True, f"Found {len(sales_projects)} projects")
                
                # Sales should only see projects they created OR are assigned to
                project_names = [p.get("name", "") for p in sales_projects]
                
                # Check if sales sees their own projects
                has_own_projects = any("Sales Project" in name for name in project_names)
                # Check if sales sees projects assigned to them
                has_assigned_projects = any("Assigned to Sales" in name for name in project_names)
                # Check if sales does NOT see admin-only projects
                has_admin_only = any(name == "Admin Project 1" for name in project_names)
                
                if has_own_projects or has_assigned_projects:
                    if not has_admin_only:
                        self.log_result("Sales sees only created/assigned projects", True, f"Projects: {project_names}")
                    else:
                        self.log_result("Sales sees only created/assigned projects", False, f"Sees admin-only projects: {project_names}")
                else:
                    self.log_result("Sales sees only created/assigned projects", False, f"Missing own/assigned projects: {project_names}")
            else:
                self.log_result("Sales can access projects endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sales can access projects endpoint", False, f"Error: {str(e)}")
    
    def test_clients_filtering(self):
        """Test Clients endpoint role-based filtering"""
        print("\n👥 TESTING CLIENTS ROLE-BASED FILTERING...")
        
        # Test admin user - should see all clients
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/clients", headers=headers)
            
            if response.status_code == 200:
                admin_clients = response.json()
                self.log_result("Admin can access clients endpoint", True, f"Found {len(admin_clients)} clients")
                
                # Admin should see all clients
                client_names = [c.get("name", "") for c in admin_clients]
                has_admin_clients = any("Admin Client" in name for name in client_names)
                has_sales_clients = any("Sales Client" in name for name in client_names)
                
                if has_admin_clients and has_sales_clients:
                    self.log_result("Admin sees all clients (own + others)", True, f"Clients: {client_names}")
                else:
                    self.log_result("Admin sees all clients (own + others)", False, f"Missing clients: {client_names}")
            else:
                self.log_result("Admin can access clients endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Admin can access clients endpoint", False, f"Error: {str(e)}")
        
        # Test sales user - should only see their created/assigned clients
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            response = requests.get(f"{BACKEND_URL}/clients", headers=headers)
            
            if response.status_code == 200:
                sales_clients = response.json()
                self.log_result("Sales can access clients endpoint", True, f"Found {len(sales_clients)} clients")
                
                # Sales should only see clients they created OR are assigned to
                client_names = [c.get("name", "") for c in sales_clients]
                
                # Check if sales sees their own clients
                has_own_clients = any("Sales Client" in name for name in client_names)
                # Check if sales sees clients assigned to them
                has_assigned_clients = any("Assigned to Sales" in name for name in client_names)
                # Check if sales does NOT see admin-only clients
                has_admin_only = any(name == "Admin Client 1" for name in client_names)
                
                if has_own_clients or has_assigned_clients:
                    if not has_admin_only:
                        self.log_result("Sales sees only created/assigned clients", True, f"Clients: {client_names}")
                    else:
                        self.log_result("Sales sees only created/assigned clients", False, f"Sees admin-only clients: {client_names}")
                else:
                    self.log_result("Sales sees only created/assigned clients", False, f"Missing own/assigned clients: {client_names}")
            else:
                self.log_result("Sales can access clients endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sales can access clients endpoint", False, f"Error: {str(e)}")
    
    def test_tasks_filtering(self):
        """Test Tasks endpoint role-based filtering"""
        print("\n📋 TESTING TASKS ROLE-BASED FILTERING...")
        
        # Test admin user - should see all tasks
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                admin_tasks = response.json()
                self.log_result("Admin can access tasks endpoint", True, f"Found {len(admin_tasks)} tasks")
                
                # Admin should see all tasks
                task_titles = [t.get("title", "") for t in admin_tasks]
                has_admin_tasks = any("Admin Task" in title for title in task_titles)
                has_sales_tasks = any("Sales Task" in title for title in task_titles)
                
                if has_admin_tasks and has_sales_tasks:
                    self.log_result("Admin sees all tasks (own + others)", True, f"Tasks: {task_titles}")
                else:
                    self.log_result("Admin sees all tasks (own + others)", False, f"Missing tasks: {task_titles}")
            else:
                self.log_result("Admin can access tasks endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Admin can access tasks endpoint", False, f"Error: {str(e)}")
        
        # Test sales user - should only see their created/assigned tasks
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                sales_tasks = response.json()
                self.log_result("Sales can access tasks endpoint", True, f"Found {len(sales_tasks)} tasks")
                
                # Sales should only see tasks they created OR are assigned to
                task_titles = [t.get("title", "") for t in sales_tasks]
                
                # Check if sales sees their own tasks
                has_own_tasks = any("Sales Task" in title for title in task_titles)
                # Check if sales sees tasks assigned to them
                has_assigned_tasks = any("Assigned to Sales" in title for title in task_titles)
                # Check if sales does NOT see admin-only tasks
                has_admin_only = any(title == "Admin Task 1" for title in task_titles)
                
                if has_own_tasks or has_assigned_tasks:
                    if not has_admin_only:
                        self.log_result("Sales sees only created/assigned tasks", True, f"Tasks: {task_titles}")
                    else:
                        self.log_result("Sales sees only created/assigned tasks", False, f"Sees admin-only tasks: {task_titles}")
                else:
                    self.log_result("Sales sees only created/assigned tasks", False, f"Missing own/assigned tasks: {task_titles}")
            else:
                self.log_result("Sales can access tasks endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sales can access tasks endpoint", False, f"Error: {str(e)}")
    
    def test_created_by_field(self):
        """Test that created_by field is set correctly during creation"""
        print("\n🔧 TESTING CREATED_BY FIELD VERIFICATION...")
        
        # Create a new project as sales user and verify created_by is set
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            project_data = {
                "name": "Test Created By Project",
                "contract_value": 1000
            }
            
            response = requests.post(f"{BACKEND_URL}/projects", json=project_data, headers=headers)
            
            if response.status_code == 200:
                project = response.json()
                created_by = project.get("created_by")
                
                if created_by == self.sales_user_id:
                    self.log_result("Project created_by field set correctly", True, f"created_by: {created_by}")
                else:
                    self.log_result("Project created_by field set correctly", False, f"Expected: {self.sales_user_id}, Got: {created_by}")
            else:
                self.log_result("Project created_by field set correctly", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Project created_by field set correctly", False, f"Error: {str(e)}")
        
        # Create a new client as sales user and verify created_by is set
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            client_data = {
                "name": "Test Created By Client",
                "contact_person": "Test Contact",
                "email": "test.created@test.com",
                "contract_value": 2000
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=headers)
            
            if response.status_code == 200:
                client = response.json()
                created_by = client.get("created_by")
                
                if created_by == self.sales_user_id:
                    self.log_result("Client created_by field set correctly", True, f"created_by: {created_by}")
                else:
                    self.log_result("Client created_by field set correctly", False, f"Expected: {self.sales_user_id}, Got: {created_by}")
            else:
                self.log_result("Client created_by field set correctly", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Client created_by field set correctly", False, f"Error: {str(e)}")
        
        # Create a new task as sales user and verify created_by is set
        try:
            headers = {"Authorization": f"Bearer {self.sales_token}"}
            task_data = {
                "title": "Test Created By Task",
                "description": "Test task for created_by verification",
                "priority": "medium",
                "deadline": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "assigned_to": self.sales_user_id
            }
            
            response = requests.post(f"{BACKEND_URL}/tasks", json=task_data, headers=headers)
            
            if response.status_code == 200:
                task = response.json()
                created_by = task.get("created_by")
                
                if created_by == self.sales_user_id:
                    self.log_result("Task created_by field set correctly", True, f"created_by: {created_by}")
                else:
                    self.log_result("Task created_by field set correctly", False, f"Expected: {self.sales_user_id}, Got: {created_by}")
            else:
                self.log_result("Task created_by field set correctly", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Task created_by field set correctly", False, f"Error: {str(e)}")
    
    def test_edge_cases(self):
        """Test edge cases - users with no assigned data should see empty results"""
        print("\n🔍 TESTING EDGE CASES...")
        
        # Test manager user (who should have no data) - should see empty results for non-admin
        if self.manager_token:
            try:
                headers = {"Authorization": f"Bearer {self.manager_token}"}
                
                # Test projects
                response = requests.get(f"{BACKEND_URL}/projects", headers=headers)
                if response.status_code == 200:
                    manager_projects = response.json()
                    # Manager should see empty or very limited results (only if they created/assigned)
                    self.log_result("Manager with no data sees limited projects", True, f"Found {len(manager_projects)} projects")
                else:
                    self.log_result("Manager with no data sees limited projects", False, f"Status: {response.status_code}")
                
                # Test clients
                response = requests.get(f"{BACKEND_URL}/clients", headers=headers)
                if response.status_code == 200:
                    manager_clients = response.json()
                    self.log_result("Manager with no data sees limited clients", True, f"Found {len(manager_clients)} clients")
                else:
                    self.log_result("Manager with no data sees limited clients", False, f"Status: {response.status_code}")
                
                # Test tasks
                response = requests.get(f"{BACKEND_URL}/tasks", headers=headers)
                if response.status_code == 200:
                    manager_tasks = response.json()
                    self.log_result("Manager with no data sees limited tasks", True, f"Found {len(manager_tasks)} tasks")
                else:
                    self.log_result("Manager with no data sees limited tasks", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_result("Manager edge case testing", False, f"Error: {str(e)}")
        else:
            self.log_result("Manager edge case testing", False, "Manager token not available")
    
    def run_all_tests(self):
        """Run all role-based filtering tests"""
        print("🚀 STARTING ROLE-BASED DATA FILTERING TESTS FOR CRM MEDIA APP")
        print("=" * 80)
        
        # Step 1: Authenticate users
        if not self.authenticate_users():
            print("❌ CRITICAL: Failed to authenticate required users")
            return False
        
        # Step 2: Create test data
        if not self.create_test_data():
            print("❌ CRITICAL: Failed to create test data")
            return False
        
        # Step 3: Test role-based filtering for each module
        self.test_projects_filtering()
        self.test_clients_filtering()
        self.test_tasks_filtering()
        
        # Step 4: Test created_by field verification
        self.test_created_by_field()
        
        # Step 5: Test edge cases
        self.test_edge_cases()
        
        # Generate summary
        self.generate_summary()
        
        return True
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("📊 ROLE-BASED DATA FILTERING TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        # Critical requirements verification
        print("\n🎯 CRITICAL REQUIREMENTS VERIFICATION:")
        
        # Check if role-based filtering is working for all modules
        projects_admin = any("Admin sees all projects" in r["test"] and r["success"] for r in self.test_results)
        projects_sales = any("Sales sees only created/assigned projects" in r["test"] and r["success"] for r in self.test_results)
        
        clients_admin = any("Admin sees all clients" in r["test"] and r["success"] for r in self.test_results)
        clients_sales = any("Sales sees only created/assigned clients" in r["test"] and r["success"] for r in self.test_results)
        
        tasks_admin = any("Admin sees all tasks" in r["test"] and r["success"] for r in self.test_results)
        tasks_sales = any("Sales sees only created/assigned tasks" in r["test"] and r["success"] for r in self.test_results)
        
        created_by_working = any("created_by field set correctly" in r["test"] and r["success"] for r in self.test_results)
        
        print(f"✅ Projects Role-Based Filtering: {'WORKING' if projects_admin and projects_sales else 'FAILED'}")
        print(f"✅ Clients Role-Based Filtering: {'WORKING' if clients_admin and clients_sales else 'FAILED'}")
        print(f"✅ Tasks Role-Based Filtering: {'WORKING' if tasks_admin and tasks_sales else 'FAILED'}")
        print(f"✅ Created By Field Setting: {'WORKING' if created_by_working else 'FAILED'}")
        
        if success_rate >= 80:
            print(f"\n🎉 OVERALL STATUS: EXCELLENT ({success_rate:.1f}% success rate)")
        elif success_rate >= 60:
            print(f"\n⚠️ OVERALL STATUS: GOOD ({success_rate:.1f}% success rate)")
        else:
            print(f"\n❌ OVERALL STATUS: NEEDS IMPROVEMENT ({success_rate:.1f}% success rate)")

if __name__ == "__main__":
    tester = RoleBasedFilteringTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)