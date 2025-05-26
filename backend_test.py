#!/usr/bin/env python3
"""
Comprehensive Backend Testing for CRM System
Tests all modules after GitHub import to ensure functionality is working correctly.
"""

import requests
import json
import time
from datetime import datetime, timedelta
import uuid

# Configuration
BACKEND_URL = "https://33831ab9-c861-4051-ab2d-853ef3d8563d.preview.emergentagent.com/api"
TEST_USER_CREDENTIALS = {
    "login": "admin",
    "password": "admin123"
}

class CRMBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        self.test_results = []
        self.test_data = {}
        
    def log_test(self, test_name, success, message="", data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                headers["Content-Type"] = "application/json"
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                headers["Content-Type"] = "application/json"
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_authentication_system(self):
        """Test JWT Authentication System"""
        print("\n=== Testing JWT Authentication System ===")
        
        # Test 1: User Login
        login_data = TEST_USER_CREDENTIALS
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.token = data["access_token"]
                self.test_data["current_user"] = data["user"]
                self.log_test("User Login", True, f"Successfully logged in as {data['user'].get('username', 'unknown')}")
            else:
                self.log_test("User Login", False, "Login response missing required fields")
        else:
            self.log_test("User Login", False, f"Login failed with status: {response.status_code if response else 'No response'}")
            return False
            
        # Test 2: Get Current User Profile
        response = self.make_request("GET", "/auth/me")
        if response and response.status_code == 200:
            user_data = response.json()
            self.log_test("Get User Profile", True, f"Retrieved profile for user: {user_data.get('username')}")
        else:
            self.log_test("Get User Profile", False, f"Failed to get user profile: {response.status_code if response else 'No response'}")
            
        # Test 3: Test Protected Endpoint Access
        response = self.make_request("GET", "/users")
        if response and response.status_code == 200:
            self.log_test("Protected Endpoint Access", True, "Successfully accessed protected endpoint")
        else:
            self.log_test("Protected Endpoint Access", False, f"Failed to access protected endpoint: {response.status_code if response else 'No response'}")
            
        return True

    def test_user_management_api(self):
        """Test User Management API"""
        print("\n=== Testing User Management API ===")
        
        # Test 1: Get All Users
        response = self.make_request("GET", "/users")
        if response and response.status_code == 200:
            users = response.json()
            self.test_data["users"] = users
            self.log_test("Get All Users", True, f"Retrieved {len(users)} users")
        else:
            self.log_test("Get All Users", False, f"Failed to get users: {response.status_code if response else 'No response'}")
            
        # Test 2: Get User Roles List
        response = self.make_request("GET", "/users/roles/list")
        if response and response.status_code == 200:
            roles = response.json()
            self.log_test("Get User Roles", True, f"Retrieved {len(roles)} available roles")
        else:
            self.log_test("Get User Roles", False, f"Failed to get roles: {response.status_code if response else 'No response'}")
            
        # Test 3: Create New User (if admin)
        if self.test_data.get("current_user", {}).get("role") == "admin":
            test_user_data = {
                "username": f"test_user_{int(time.time())}",
                "password": "testpass123",
                "email": f"test_{int(time.time())}@example.com",
                "full_name": "Test User",
                "role": "sales",
                "position": "Sales Executive"
            }
            
            response = self.make_request("POST", "/users", test_user_data)
            if response and response.status_code == 200:
                created_user = response.json()
                self.test_data["created_user"] = created_user
                self.log_test("Create User", True, f"Created user: {created_user.get('username')}")
            else:
                self.log_test("Create User", False, f"Failed to create user: {response.status_code if response else 'No response'}")

    def test_customer_management_api(self):
        """Test Customer Management API"""
        print("\n=== Testing Customer Management API ===")
        
        # Test 1: Get All Customers
        response = self.make_request("GET", "/customers")
        if response and response.status_code == 200:
            customers = response.json()
            self.test_data["customers"] = customers
            self.log_test("Get All Customers", True, f"Retrieved {len(customers)} customers")
        else:
            self.log_test("Get All Customers", False, f"Failed to get customers: {response.status_code if response else 'No response'}")
            
        # Test 2: Create New Customer
        current_user_id = self.test_data.get("current_user", {}).get("id")
        if current_user_id:
            customer_data = {
                "name": f"Test Customer {int(time.time())}",
                "email": f"customer_{int(time.time())}@example.com",
                "phone": "+1234567890",
                "company": "Test Company",
                "status": "lead",
                "assigned_sales_id": current_user_id,
                "potential_value": 50000.0,
                "notes": "Test customer for API testing"
            }
            
            response = self.make_request("POST", "/customers", customer_data)
            if response and response.status_code == 200:
                created_customer = response.json()
                self.test_data["created_customer"] = created_customer
                self.log_test("Create Customer", True, f"Created customer: {created_customer.get('name')}")
                
                # Test 3: Get Customer by ID
                customer_id = created_customer.get("id")
                response = self.make_request("GET", f"/customers/{customer_id}")
                if response and response.status_code == 200:
                    self.log_test("Get Customer by ID", True, "Successfully retrieved customer by ID")
                else:
                    self.log_test("Get Customer by ID", False, f"Failed to get customer by ID: {response.status_code if response else 'No response'}")
            else:
                self.log_test("Create Customer", False, f"Failed to create customer: {response.status_code if response else 'No response'}")

    def test_client_management_api(self):
        """Test Client Management API"""
        print("\n=== Testing Client Management API ===")
        
        # Test 1: Get All Clients
        response = self.make_request("GET", "/clients")
        if response and response.status_code == 200:
            clients = response.json()
            self.test_data["clients"] = clients
            self.log_test("Get All Clients", True, f"Retrieved {len(clients)} clients")
        else:
            self.log_test("Get All Clients", False, f"Failed to get clients: {response.status_code if response else 'No response'}")
            
        # Test 2: Get Client Statistics
        response = self.make_request("GET", "/clients/statistics")
        if response and response.status_code == 200:
            stats = response.json()
            self.log_test("Get Client Statistics", True, f"Retrieved statistics: {stats.get('totalClients', 0)} total clients")
        else:
            self.log_test("Get Client Statistics", False, f"Failed to get client statistics: {response.status_code if response else 'No response'}")
            
        # Test 3: Create New Client
        client_data = {
            "name": f"Test Client {int(time.time())}",
            "company": "Test Company Ltd",
            "contact_person": "John Doe",
            "email": f"client_{int(time.time())}@example.com",
            "phone": "+1234567890",
            "contract_value": 100000.0,
            "contract_link": "https://example.com/contract",
            "address": "123 Test Street",
            "notes": "Test client for API testing",
            "invoice_email": f"invoice_{int(time.time())}@example.com",
            "client_type": "business",
            "source": "referral"
        }
        
        response = self.make_request("POST", "/clients", client_data)
        if response and response.status_code == 200:
            created_client = response.json()
            self.test_data["created_client"] = created_client
            self.log_test("Create Client", True, f"Created client: {created_client.get('name')}")
            
            # Test 4: Get Client Detail
            client_id = created_client.get("id")
            response = self.make_request("GET", f"/clients/{client_id}")
            if response and response.status_code == 200:
                client_detail = response.json()
                # Verify new fields are present
                if "invoice_email" in client_detail and "client_type" in client_detail and "source" in client_detail:
                    self.log_test("Get Client Detail with New Fields", True, "Client detail includes all new fields")
                else:
                    self.log_test("Get Client Detail with New Fields", False, "Client detail missing new fields")
            else:
                self.log_test("Get Client Detail", False, f"Failed to get client detail: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Create Client", False, f"Failed to create client: {response.status_code if response else 'No response'}")

    def test_client_documents_api(self):
        """Test Client Documents CRUD API"""
        print("\n=== Testing Client Documents API ===")
        
        client_id = self.test_data.get("created_client", {}).get("id")
        if not client_id:
            self.log_test("Client Documents Test", False, "No test client available for documents testing")
            return
            
        # Test 1: Get Client Documents (should be empty initially)
        response = self.make_request("GET", f"/clients/{client_id}/documents")
        if response and response.status_code == 200:
            documents = response.json()
            self.log_test("Get Client Documents", True, f"Retrieved {len(documents)} documents")
        else:
            self.log_test("Get Client Documents", False, f"Failed to get documents: {response.status_code if response else 'No response'}")
            
        # Test 2: Create Client Document
        document_data = {
            "name": "Test Contract Document",
            "link": "https://example.com/contract.pdf",
            "status": "pending"
        }
        
        response = self.make_request("POST", f"/clients/{client_id}/documents", document_data)
        if response and response.status_code == 200:
            created_document = response.json()
            self.test_data["created_document"] = created_document
            self.log_test("Create Client Document", True, f"Created document: {created_document.get('name')}")
            
            # Test 3: Update Client Document
            document_id = created_document.get("id")
            update_data = {
                "name": "Updated Contract Document",
                "status": "signed"
            }
            
            response = self.make_request("PUT", f"/clients/{client_id}/documents/{document_id}", update_data)
            if response and response.status_code == 200:
                self.log_test("Update Client Document", True, "Successfully updated document")
            else:
                self.log_test("Update Client Document", False, f"Failed to update document: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Create Client Document", False, f"Failed to create document: {response.status_code if response else 'No response'}")

    def test_projects_management_api(self):
        """Test Projects Management Module"""
        print("\n=== Testing Projects Management API ===")
        
        # Test 1: Get All Projects
        response = self.make_request("GET", "/projects")
        if response and response.status_code == 200:
            projects = response.json()
            self.test_data["projects"] = projects
            self.log_test("Get All Projects", True, f"Retrieved {len(projects)} projects")
        else:
            self.log_test("Get All Projects", False, f"Failed to get projects: {response.status_code if response else 'No response'}")
            
        # Test 2: Get Project Statistics
        response = self.make_request("GET", "/projects/statistics")
        if response and response.status_code == 200:
            stats = response.json()
            self.log_test("Get Project Statistics", True, f"Retrieved statistics: {stats.get('total_projects', 0)} total projects")
        else:
            self.log_test("Get Project Statistics", False, f"Failed to get project statistics: {response.status_code if response else 'No response'}")
            
        # Test 3: Get Project Options
        response = self.make_request("GET", "/projects/progress-options")
        if response and response.status_code == 200:
            options = response.json()
            self.log_test("Get Project Progress Options", True, f"Retrieved {len(options)} progress options")
        else:
            self.log_test("Get Project Progress Options", False, f"Failed to get progress options: {response.status_code if response else 'No response'}")
            
        # Test 4: Create New Project
        client_id = self.test_data.get("created_client", {}).get("id")
        project_data = {
            "client_id": client_id,
            "name": f"Test Project {int(time.time())}",
            "work_file_link": "https://example.com/project-files",
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "contract_value": 75000.0,
            "debt": 0.0,
            "progress": "in_progress",
            "status": "active",
            "notes": "Test project for API testing"
        }
        
        response = self.make_request("POST", "/projects", project_data)
        if response and response.status_code == 200:
            created_project = response.json()
            self.test_data["created_project"] = created_project
            self.log_test("Create Project", True, f"Created project: {created_project.get('name')}")
        else:
            self.log_test("Create Project", False, f"Failed to create project: {response.status_code if response else 'No response'}")

    def test_task_management_api(self):
        """Test Task Management with Feedback System"""
        print("\n=== Testing Task Management API ===")
        
        # Test 1: Get All Tasks
        response = self.make_request("GET", "/tasks")
        if response and response.status_code == 200:
            tasks = response.json()
            self.test_data["tasks"] = tasks
            self.log_test("Get All Tasks", True, f"Retrieved {len(tasks)} tasks")
        else:
            self.log_test("Get All Tasks", False, f"Failed to get tasks: {response.status_code if response else 'No response'}")
            
        # Test 2: Get Task Statistics
        response = self.make_request("GET", "/tasks/statistics")
        if response and response.status_code == 200:
            stats = response.json()
            self.log_test("Get Task Statistics", True, f"Retrieved task statistics: {stats.get('todo', 0)} todo tasks")
        else:
            self.log_test("Get Task Statistics", False, f"Failed to get task statistics: {response.status_code if response else 'No response'}")
            
        # Test 3: Get Task Comment Counts
        response = self.make_request("GET", "/tasks/comment-counts")
        if response and response.status_code == 200:
            comment_counts = response.json()
            self.log_test("Get Task Comment Counts", True, f"Retrieved comment counts for {len(comment_counts)} tasks")
        else:
            self.log_test("Get Task Comment Counts", False, f"Failed to get comment counts: {response.status_code if response else 'No response'}")
            
        # Test 4: Create New Task
        task_data = {
            "title": f"Test Task {int(time.time())}",
            "description": "Test task for API testing",
            "priority": "medium",
            "deadline": (datetime.now() + timedelta(days=7)).isoformat(),
            "assigned_to": "Test User"
        }
        
        response = self.make_request("POST", "/tasks", task_data)
        if response and response.status_code == 200:
            created_task = response.json()
            self.test_data["created_task"] = created_task
            self.log_test("Create Task", True, f"Created task: {created_task.get('title')}")
            
            # Test 5: Get Task Comments
            task_id = created_task.get("id")
            response = self.make_request("GET", f"/tasks/{task_id}/comments")
            if response and response.status_code == 200:
                comments = response.json()
                self.log_test("Get Task Comments", True, f"Retrieved {len(comments)} comments for task")
            else:
                self.log_test("Get Task Comments", False, f"Failed to get task comments: {response.status_code if response else 'No response'}")
                
            # Test 6: Create Task Comment
            comment_data = {
                "message": "This is a test comment for the task"
            }
            
            response = self.make_request("POST", f"/tasks/{task_id}/comments", comment_data)
            if response and response.status_code == 200:
                created_comment = response.json()
                self.log_test("Create Task Comment", True, f"Created comment: {created_comment.get('message')[:30]}...")
            else:
                self.log_test("Create Task Comment", False, f"Failed to create comment: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Create Task", False, f"Failed to create task: {response.status_code if response else 'No response'}")

    def test_interaction_tracking_api(self):
        """Test Interaction Tracking API"""
        print("\n=== Testing Interaction Tracking API ===")
        
        customer_id = self.test_data.get("created_customer", {}).get("id")
        if not customer_id:
            self.log_test("Interaction Tracking Test", False, "No test customer available for interaction testing")
            return
            
        # Test 1: Get Customer Interactions
        response = self.make_request("GET", f"/customers/{customer_id}/interactions")
        if response and response.status_code == 200:
            interactions = response.json()
            self.log_test("Get Customer Interactions", True, f"Retrieved {len(interactions)} interactions")
        else:
            self.log_test("Get Customer Interactions", False, f"Failed to get interactions: {response.status_code if response else 'No response'}")
            
        # Test 2: Create New Interaction
        interaction_data = {
            "customer_id": customer_id,
            "type": "call",
            "title": "Follow-up Call",
            "description": "Discussed project requirements and timeline",
            "revenue_generated": 5000.0,
            "next_action": "Send proposal",
            "next_action_date": (datetime.now() + timedelta(days=3)).isoformat()
        }
        
        response = self.make_request("POST", "/interactions", interaction_data)
        if response and response.status_code == 200:
            created_interaction = response.json()
            self.test_data["created_interaction"] = created_interaction
            self.log_test("Create Interaction", True, f"Created interaction: {created_interaction.get('title')}")
        else:
            self.log_test("Create Interaction", False, f"Failed to create interaction: {response.status_code if response else 'No response'}")

    def test_sales_team_management_api(self):
        """Test Sales Team Management API"""
        print("\n=== Testing Sales Team Management API ===")
        
        # Test 1: Get Sales Team (requires admin/manager role)
        current_user_role = self.test_data.get("current_user", {}).get("role")
        if current_user_role in ["admin", "manager"]:
            response = self.make_request("GET", "/sales")
            if response and response.status_code == 200:
                sales_team = response.json()
                self.log_test("Get Sales Team", True, f"Retrieved {len(sales_team)} sales team members")
                
                # Test 2: Get Sales Analytics for first sales person
                if sales_team:
                    sales_id = sales_team[0].get("id")
                    response = self.make_request("GET", f"/sales/{sales_id}/analytics")
                    if response and response.status_code == 200:
                        analytics = response.json()
                        self.log_test("Get Sales Analytics", True, f"Retrieved analytics for sales person: {analytics.get('total_customers', 0)} customers")
                    else:
                        self.log_test("Get Sales Analytics", False, f"Failed to get sales analytics: {response.status_code if response else 'No response'}")
            else:
                self.log_test("Get Sales Team", False, f"Failed to get sales team: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Sales Team Management", False, f"Current user role '{current_user_role}' not authorized for sales team management")

    def test_analytics_dashboard_api(self):
        """Test Analytics Dashboard API - This would be implemented based on specific dashboard endpoints"""
        print("\n=== Testing Analytics Dashboard API ===")
        
        # Note: The analytics dashboard would typically have specific endpoints
        # For now, we test the statistics endpoints we've already covered
        
        # Test overall system health by checking if all statistics endpoints work
        endpoints_tested = [
            ("/clients/statistics", "Client Statistics"),
            ("/projects/statistics", "Project Statistics"), 
            ("/tasks/statistics", "Task Statistics")
        ]
        
        all_working = True
        for endpoint, name in endpoints_tested:
            response = self.make_request("GET", endpoint)
            if response and response.status_code == 200:
                self.log_test(f"Dashboard - {name}", True, f"{name} endpoint working")
            else:
                self.log_test(f"Dashboard - {name}", False, f"{name} endpoint failed")
                all_working = False
                
        if all_working:
            self.log_test("Analytics Dashboard Integration", True, "All dashboard statistics endpoints working")
        else:
            self.log_test("Analytics Dashboard Integration", False, "Some dashboard endpoints failed")

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive CRM Backend Testing")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test modules
        if self.test_authentication_system():
            self.test_user_management_api()
            self.test_customer_management_api()
            self.test_client_management_api()
            self.test_client_documents_api()
            self.test_projects_management_api()
            self.test_task_management_api()
            self.test_interaction_tracking_api()
            self.test_sales_team_management_api()
            self.test_analytics_dashboard_api()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Generate summary
        self.generate_test_summary(duration)
        
    def generate_test_summary(self, duration):
        """Generate and display test summary"""
        print("\n" + "=" * 60)
        print("🎯 COMPREHENSIVE CRM BACKEND TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 Test Results:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {failed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Duration: {duration:.2f} seconds")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['message']}")
        
        print(f"\n✅ Module Status Summary:")
        modules = {
            "JWT Authentication System": ["User Login", "Get User Profile", "Protected Endpoint Access"],
            "User Management API": ["Get All Users", "Get User Roles", "Create User"],
            "Customer Management API": ["Get All Customers", "Create Customer", "Get Customer by ID"],
            "Client Management API": ["Get All Clients", "Get Client Statistics", "Create Client", "Get Client Detail"],
            "Client Documents API": ["Get Client Documents", "Create Client Document", "Update Client Document"],
            "Projects Management API": ["Get All Projects", "Get Project Statistics", "Create Project"],
            "Task Management API": ["Get All Tasks", "Get Task Statistics", "Create Task", "Get Task Comments", "Create Task Comment"],
            "Interaction Tracking API": ["Get Customer Interactions", "Create Interaction"],
            "Sales Team Management API": ["Get Sales Team", "Get Sales Analytics"],
            "Analytics Dashboard API": ["Dashboard - Client Statistics", "Dashboard - Project Statistics", "Dashboard - Task Statistics"]
        }
        
        for module, tests in modules.items():
            module_results = [r for r in self.test_results if r["test"] in tests]
            if module_results:
                module_passed = len([r for r in module_results if r["success"]])
                module_total = len(module_results)
                module_rate = (module_passed / module_total * 100) if module_total > 0 else 0
                status = "✅" if module_rate == 100 else "⚠️" if module_rate >= 50 else "❌"
                print(f"   {status} {module}: {module_passed}/{module_total} ({module_rate:.0f}%)")
        
        # Overall assessment
        print(f"\n🎯 Overall Assessment:")
        if success_rate >= 95:
            print("   🎉 EXCELLENT: CRM system is working perfectly!")
        elif success_rate >= 80:
            print("   ✅ GOOD: CRM system is working well with minor issues")
        elif success_rate >= 60:
            print("   ⚠️ FAIR: CRM system has some issues that need attention")
        else:
            print("   ❌ POOR: CRM system has significant issues requiring immediate attention")
            
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "duration": duration,
            "status": "PASS" if success_rate >= 80 else "FAIL"
        }

if __name__ == "__main__":
    tester = CRMBackendTester()
    tester.run_comprehensive_test()