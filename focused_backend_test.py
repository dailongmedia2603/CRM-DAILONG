#!/usr/bin/env python3
import requests
import json
import uuid
import sys
from datetime import datetime

class FocusedCRMAPITester:
    def __init__(self):
        # Get the backend URL from the frontend .env file
        self.base_url = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"
        self.token = None
        self.admin_user = {"login": "admin@crm.com", "password": "admin123"}
        self.sales_user = {"login": "sales@crm.com", "password": "sales123"}
        self.manager_user = {"login": "manager@crm.com", "password": "manager123"}
        self.test_customer_id = None
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

    def login(self, credentials):
        self.log_info(f"Logging in as {credentials.get('login')}")
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=credentials
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.log_success(f"Login successful: {credentials.get('login')}")
                return True
            else:
                self.log_failure(f"Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_failure("Login request failed", str(e))
            return False

    def get_auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    def test_auth_login(self):
        print("\n=== Testing Authentication APIs ===")
        # Test admin login
        admin_success = self.login(self.admin_user)
        
        # Test sales login
        sales_success = self.login(self.sales_user)
        
        # Test manager login
        manager_success = self.login(self.manager_user)
        
        # Verify JWT token generation
        if self.token:
            self.log_success("JWT token generated successfully")
        else:
            self.log_failure("JWT token generation failed")
        
        # Return to admin login for subsequent tests
        if not admin_success:
            self.log_info("Using admin credentials for subsequent tests")
            self.login(self.admin_user)

    def test_core_crm_apis(self):
        print("\n=== Testing Core CRM APIs ===")
        
        # Test GET /api/customers
        try:
            response = requests.get(
                f"{self.base_url}/customers",
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                customers = response.json()
                self.log_success(f"GET /api/customers successful: {len(customers)} customers found")
                if customers:
                    self.test_customer_id = customers[0].get("id")
                    self.log_info(f"Using customer ID for further tests: {self.test_customer_id}")
            else:
                self.log_failure(f"GET /api/customers failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure("GET /api/customers request failed", str(e))
        
        # Test GET /api/users
        try:
            response = requests.get(
                f"{self.base_url}/users",
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                users = response.json()
                self.log_success(f"GET /api/users successful: {len(users)} users found")
            else:
                self.log_failure(f"GET /api/users failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure("GET /api/users request failed", str(e))
        
        # Test GET /api/tasks
        try:
            response = requests.get(
                f"{self.base_url}/tasks",
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                tasks = response.json()
                self.log_success(f"GET /api/tasks successful: {len(tasks)} tasks found")
            else:
                self.log_failure(f"GET /api/tasks failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure("GET /api/tasks request failed", str(e))
        
        # Test GET /api/interactions
        try:
            response = requests.get(
                f"{self.base_url}/interactions",
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                interactions = response.json()
                self.log_success(f"GET /api/interactions successful: {len(interactions)} interactions found")
            else:
                self.log_failure(f"GET /api/interactions failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure("GET /api/interactions request failed", str(e))

    def test_customer_specific_apis(self):
        print("\n=== Testing Customer-specific APIs ===")
        
        if not self.test_customer_id:
            self.log_info("No customer ID available, fetching customers first")
            try:
                response = requests.get(
                    f"{self.base_url}/customers",
                    headers=self.get_auth_headers()
                )
                if response.status_code == 200:
                    customers = response.json()
                    if customers:
                        self.test_customer_id = customers[0].get("id")
                        self.log_info(f"Using customer ID: {self.test_customer_id}")
                    else:
                        self.log_failure("No customers found to test customer-specific APIs")
                        return
                else:
                    self.log_failure(f"Failed to fetch customers: {response.status_code} - {response.text}")
                    return
            except Exception as e:
                self.log_failure("Request to fetch customers failed", str(e))
                return
        
        # Test GET /api/customers/{id}/interactions
        try:
            response = requests.get(
                f"{self.base_url}/customers/{self.test_customer_id}/interactions",
                headers=self.get_auth_headers()
            )
            if response.status_code == 200:
                interactions = response.json()
                self.log_success(f"GET /api/customers/{self.test_customer_id}/interactions successful: {len(interactions)} interactions found")
            else:
                self.log_failure(f"GET /api/customers/{self.test_customer_id}/interactions failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure(f"GET /api/customers/{self.test_customer_id}/interactions request failed", str(e))
        
        # Test POST /api/interactions
        try:
            interaction_data = {
                "customer_id": self.test_customer_id,
                "type": "follow_up",
                "title": f"Test Interaction {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "notes": "This is a test interaction created by the API tester",
                "date": datetime.now().strftime("%Y-%m-%d")
            }
            response = requests.post(
                f"{self.base_url}/interactions",
                headers=self.get_auth_headers(),
                json=interaction_data
            )
            if response.status_code == 200:
                interaction = response.json()
                self.log_success(f"POST /api/interactions successful: {interaction.get('title')}")
                
                # Verify the interaction was created by fetching it
                verify_response = requests.get(
                    f"{self.base_url}/customers/{self.test_customer_id}/interactions",
                    headers=self.get_auth_headers()
                )
                if verify_response.status_code == 200:
                    interactions = verify_response.json()
                    found = False
                    for i in interactions:
                        if i.get("title") == interaction_data["title"]:
                            found = True
                            break
                    if found:
                        self.log_success("Created interaction found in customer interactions")
                    else:
                        self.log_failure("Created interaction not found in customer interactions")
                else:
                    self.log_failure(f"Failed to verify interaction creation: {verify_response.status_code} - {verify_response.text}")
            else:
                self.log_failure(f"POST /api/interactions failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_failure("POST /api/interactions request failed", str(e))

    def test_error_handling(self):
        print("\n=== Testing Error Handling & Authentication ===")
        
        # Test unauthorized access
        try:
            response = requests.get(
                f"{self.base_url}/customers",
                headers={}  # No auth token
            )
            if response.status_code in [401, 403]:
                self.log_success(f"Unauthorized access correctly rejected with status {response.status_code}")
            else:
                self.log_failure(f"Unauthorized access should be rejected, got: {response.status_code}")
        except Exception as e:
            self.log_failure("Unauthorized access test failed", str(e))
        
        # Test invalid parameters
        if self.test_customer_id:
            try:
                # Try to create an interaction with missing required fields
                interaction_data = {
                    "customer_id": self.test_customer_id,
                    # Missing type and title
                    "notes": "This is a test interaction with missing fields"
                }
                response = requests.post(
                    f"{self.base_url}/interactions",
                    headers=self.get_auth_headers(),
                    json=interaction_data
                )
                if response.status_code in [400, 422]:
                    self.log_success(f"Invalid parameters correctly rejected with status {response.status_code}")
                else:
                    self.log_failure(f"Invalid parameters should be rejected, got: {response.status_code}")
            except Exception as e:
                self.log_failure("Invalid parameters test failed", str(e))
        
        # Test non-existent resource
        try:
            fake_id = str(uuid.uuid4())
            response = requests.get(
                f"{self.base_url}/customers/{fake_id}",
                headers=self.get_auth_headers()
            )
            if response.status_code == 404:
                self.log_success("Non-existent resource correctly returns 404")
            else:
                self.log_failure(f"Non-existent resource should return 404, got: {response.status_code}")
        except Exception as e:
            self.log_failure("Non-existent resource test failed", str(e))

    def run_all_tests(self):
        print("🚀 Starting Focused CRM Backend API Testing...")
        print(f"Testing backend at: {self.base_url}")
        
        # Run all tests
        self.test_auth_login()
        self.test_core_crm_apis()
        self.test_customer_specific_apis()
        self.test_error_handling()
        
        # Print summary
        print("\n============================================================")
        print("🏁 TEST SUMMARY")
        print("============================================================")
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.success_count}")
        print(f"Failed: {self.total_tests - self.success_count}")
        success_rate = (self.success_count / self.total_tests) * 100 if self.total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.success_count == self.total_tests:
            print("\n✅ All tests passed! The backend is working correctly.")
            return True
        else:
            print(f"\n⚠️  {self.total_tests - self.success_count} tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    tester = FocusedCRMAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)