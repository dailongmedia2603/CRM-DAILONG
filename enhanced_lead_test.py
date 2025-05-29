import requests
import json
import unittest
from datetime import datetime
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_URL = f"{BACKEND_URL}/api"

class EnhancedLeadManagementTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up authentication and test data before running tests"""
        cls.auth_token = None
        cls.admin_user = None
        cls.test_customer_id = None
        cls.sales_user_id = None
        
        # Authenticate as admin
        cls.authenticate()
        
        # Get or create a sales user for testing
        cls.setup_sales_user()
    
    @classmethod
    def authenticate(cls):
        """Authenticate with the API and get a JWT token"""
        auth_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{API_URL}/auth/login", json=auth_data)
            response.raise_for_status()
            
            data = response.json()
            cls.auth_token = data.get("access_token")
            cls.admin_user = data.get("user")
            
            print(f"✅ Authentication successful. User: {cls.admin_user.get('username')}, Role: {cls.admin_user.get('role')}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Authentication failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            sys.exit(1)
    
    @classmethod
    def setup_sales_user(cls):
        """Get or create a sales user for testing"""
        headers = {"Authorization": f"Bearer {cls.auth_token}"}
        
        # First, try to find an existing sales user
        try:
            response = requests.get(f"{API_URL}/users", headers=headers)
            response.raise_for_status()
            
            users = response.json()
            sales_users = [user for user in users if user.get("role") == "sales" and user.get("is_active")]
            
            if sales_users:
                cls.sales_user_id = sales_users[0].get("id")
                print(f"✅ Found existing sales user with ID: {cls.sales_user_id}")
            else:
                # Create a new sales user if none exists
                user_data = {
                    "username": f"salestest_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "password": "sales123",
                    "full_name": "Sales Test User",
                    "position": "Sales Executive",
                    "role": "sales",
                    "phone": "1234567890",
                    "target_monthly": 100000.0
                }
                
                response = requests.post(f"{API_URL}/users", json=user_data, headers=headers)
                response.raise_for_status()
                
                new_user = response.json()
                cls.sales_user_id = new_user.get("id")
                print(f"✅ Created new sales user with ID: {cls.sales_user_id}")
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to set up sales user: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            # Continue with admin user's ID as fallback
            if cls.admin_user:
                cls.sales_user_id = cls.admin_user.get("id")
                print(f"⚠️ Using admin user ID as fallback: {cls.sales_user_id}")
    
    def get_headers(self):
        """Get headers with authentication token"""
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_01_get_users_endpoint(self):
        """Test GET /api/users endpoint for sales team filtering"""
        print("\n🔍 Testing GET /api/users endpoint...")
        
        try:
            response = requests.get(f"{API_URL}/users", headers=self.get_headers())
            response.raise_for_status()
            
            users = response.json()
            self.assertIsInstance(users, list)
            
            # Check if we have users with different roles
            roles = set(user.get("role") for user in users)
            print(f"✅ Found users with roles: {roles}")
            
            # Verify we have sales team members
            sales_users = [user for user in users if user.get("role") in ["sales", "sale"]]
            if len(sales_users) > 0:
                print(f"✅ Found {len(sales_users)} sales team members")
            else:
                print("⚠️ No sales team members found")
            
            # Check if users have required fields
            for user in users:
                self.assertIn("id", user)
                self.assertIn("username", user)
                self.assertIn("role", user)
                self.assertIn("is_active", user)
            
            print("✅ GET /api/users endpoint working correctly")
            return True
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            return False
        except AssertionError as e:
            print(f"❌ Assertion failed: {str(e)}")
            return False
    
    def test_02_create_customer(self):
        """Test POST /api/customers endpoint with new schema"""
        print("\n🔍 Testing POST /api/customers endpoint...")
        
        # Test data with all fields including new ones
        customer_data = {
            "name": f"Test Lead {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "0987654321",
            "company": "Test Company",
            "status": "high",  # CustomerStatus.HIGH
            "care_status": "potential_close",  # CareStatus.POTENTIAL_CLOSE
            "sales_result": "signed_contract",  # SalesResult.SIGNED_CONTRACT
            "assigned_sales_id": self.sales_user_id,
            "potential_value": 50000.0,
            "notes": "Test lead with all fields",
            "source": "website"
        }
        
        try:
            response = requests.post(
                f"{API_URL}/customers", 
                json=customer_data,
                headers=self.get_headers()
            )
            response.raise_for_status()
            
            created_customer = response.json()
            self.__class__.test_customer_id = created_customer.get("id")
            
            # Verify all fields were saved correctly
            self.assertEqual(created_customer.get("name"), customer_data.get("name"))
            self.assertEqual(created_customer.get("phone"), customer_data.get("phone"))
            self.assertEqual(created_customer.get("company"), customer_data.get("company"))
            self.assertEqual(created_customer.get("status"), customer_data.get("status"))
            self.assertEqual(created_customer.get("care_status"), customer_data.get("care_status"))
            self.assertEqual(created_customer.get("sales_result"), customer_data.get("sales_result"))
            self.assertEqual(created_customer.get("assigned_sales_id"), customer_data.get("assigned_sales_id"))
            self.assertEqual(created_customer.get("potential_value"), customer_data.get("potential_value"))
            self.assertEqual(created_customer.get("notes"), customer_data.get("notes"))
            self.assertEqual(created_customer.get("source"), customer_data.get("source"))
            
            print(f"✅ Created customer with ID: {self.__class__.test_customer_id}")
            print("✅ POST /api/customers endpoint working correctly with new schema")
            return True
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            return False
        except AssertionError as e:
            print(f"❌ Assertion failed: {str(e)}")
            return False
    
    def test_03_get_customers(self):
        """Test GET /api/customers endpoint with enhanced fields"""
        print("\n🔍 Testing GET /api/customers endpoint...")
        
        try:
            response = requests.get(f"{API_URL}/customers", headers=self.get_headers())
            response.raise_for_status()
            
            customers = response.json()
            self.assertIsInstance(customers, list)
            
            if len(customers) > 0:
                print(f"✅ Found {len(customers)} customers")
                
                # Check if customers have the enhanced fields
                for customer in customers:
                    self.assertIn("id", customer)
                    self.assertIn("name", customer)
                    self.assertIn("status", customer)
                    self.assertIn("care_status", customer)
                    self.assertIn("sales_result", customer)
                    self.assertIn("assigned_sales_id", customer)
                    self.assertIn("potential_value", customer)
                
                # Find our test customer if we created one
                if self.__class__.test_customer_id:
                    test_customer = next((c for c in customers if c.get("id") == self.__class__.test_customer_id), None)
                    if test_customer:
                        print(f"✅ Found our test customer in GET response")
                
                print("✅ GET /api/customers endpoint working correctly with enhanced fields")
                return True
            else:
                print("⚠️ No customers found")
                return True  # Not a failure, just no data
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            return False
        except AssertionError as e:
            print(f"❌ Assertion failed: {str(e)}")
            return False
    
    def test_04_update_customer(self):
        """Test PUT /api/customers/{id} endpoint with enhanced fields"""
        print("\n🔍 Testing PUT /api/customers/{id} endpoint...")
        
        if not self.__class__.test_customer_id:
            print("⚠️ No test customer ID available for update test")
            return True  # Skip this test
        
        # Update data with different values
        update_data = {
            "status": "normal",  # CustomerStatus.NORMAL
            "care_status": "thinking",  # CareStatus.THINKING
            "sales_result": "not_interested",  # SalesResult.NOT_INTERESTED
            "potential_value": 25000.0,
            "notes": "Updated test lead",
            "source": "referral"
        }
        
        try:
            response = requests.put(
                f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                json=update_data,
                headers=self.get_headers()
            )
            response.raise_for_status()
            
            updated_customer = response.json()
            
            # Verify fields were updated correctly
            self.assertEqual(updated_customer.get("status"), update_data.get("status"))
            self.assertEqual(updated_customer.get("care_status"), update_data.get("care_status"))
            self.assertEqual(updated_customer.get("sales_result"), update_data.get("sales_result"))
            self.assertEqual(updated_customer.get("potential_value"), update_data.get("potential_value"))
            self.assertEqual(updated_customer.get("notes"), update_data.get("notes"))
            self.assertEqual(updated_customer.get("source"), update_data.get("source"))
            
            print("✅ PUT /api/customers/{id} endpoint working correctly with enhanced fields")
            return True
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            return False
        except AssertionError as e:
            print(f"❌ Assertion failed: {str(e)}")
            return False
    
    def test_05_enum_values_validation(self):
        """Test all enum values for status, care_status, sales_result fields"""
        print("\n🔍 Testing enum values validation...")
        
        if not self.__class__.test_customer_id:
            print("⚠️ No test customer ID available for enum validation test")
            return True  # Skip this test
        
        success = True
        
        # Test all CustomerStatus values
        customer_statuses = ["high", "normal", "low"]
        for status in customer_statuses:
            try:
                update_data = {"status": status}
                response = requests.put(
                    f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                    json=update_data,
                    headers=self.get_headers()
                )
                response.raise_for_status()
                updated_customer = response.json()
                self.assertEqual(updated_customer.get("status"), status)
                print(f"✅ CustomerStatus '{status}' validated successfully")
            except Exception as e:
                print(f"❌ Failed to validate CustomerStatus '{status}': {str(e)}")
                success = False
        
        # Test all CareStatus values
        care_statuses = ["potential_close", "thinking", "working", "silent", "rejected"]
        for status in care_statuses:
            try:
                update_data = {"care_status": status}
                response = requests.put(
                    f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                    json=update_data,
                    headers=self.get_headers()
                )
                response.raise_for_status()
                updated_customer = response.json()
                self.assertEqual(updated_customer.get("care_status"), status)
                print(f"✅ CareStatus '{status}' validated successfully")
            except Exception as e:
                print(f"❌ Failed to validate CareStatus '{status}': {str(e)}")
                success = False
        
        # Test all SalesResult values
        sales_results = ["signed_contract", "not_interested"]
        for result in sales_results:
            try:
                update_data = {"sales_result": result}
                response = requests.put(
                    f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                    json=update_data,
                    headers=self.get_headers()
                )
                response.raise_for_status()
                updated_customer = response.json()
                self.assertEqual(updated_customer.get("sales_result"), result)
                print(f"✅ SalesResult '{result}' validated successfully")
            except Exception as e:
                print(f"❌ Failed to validate SalesResult '{result}': {str(e)}")
                success = False
        
        if success:
            print("✅ All enum values validated successfully")
        else:
            print("❌ Some enum values failed validation")
        
        return success
    
    def test_06_required_field_validation(self):
        """Test required field validation (name, assigned_sales_id)"""
        print("\n🔍 Testing required field validation...")
        
        success = True
        
        # Test missing name
        try:
            customer_data = {
                "assigned_sales_id": self.sales_user_id,
                "status": "high"
            }
            response = requests.post(
                f"{API_URL}/customers", 
                json=customer_data,
                headers=self.get_headers()
            )
            
            # Should fail with 422 Unprocessable Entity
            if response.status_code in [400, 422]:
                print("✅ Missing 'name' field validation working")
            else:
                print(f"❌ Missing 'name' field validation failed: Expected 422, got {response.status_code}")
                success = False
        except Exception as e:
            print(f"❌ Failed to test missing 'name' field validation: {str(e)}")
            success = False
        
        # Test missing assigned_sales_id
        try:
            customer_data = {
                "name": "Test Required Fields",
                "status": "high"
            }
            response = requests.post(
                f"{API_URL}/customers", 
                json=customer_data,
                headers=self.get_headers()
            )
            
            # Should fail with 422 Unprocessable Entity
            if response.status_code in [400, 422]:
                print("✅ Missing 'assigned_sales_id' field validation working")
            else:
                print(f"❌ Missing 'assigned_sales_id' field validation failed: Expected 422, got {response.status_code}")
                success = False
        except Exception as e:
            print(f"❌ Failed to test missing 'assigned_sales_id' field validation: {str(e)}")
            success = False
        
        if success:
            print("✅ Required field validation working correctly")
        else:
            print("❌ Required field validation has issues")
        
        return success
    
    def test_07_optional_fields_validation(self):
        """Test optional fields (phone, company, notes, source)"""
        print("\n🔍 Testing optional fields...")
        
        # Create customer with only required fields
        customer_data = {
            "name": f"Minimal Lead {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "assigned_sales_id": self.sales_user_id
        }
        
        try:
            response = requests.post(
                f"{API_URL}/customers", 
                json=customer_data,
                headers=self.get_headers()
            )
            response.raise_for_status()
            
            created_customer = response.json()
            minimal_customer_id = created_customer.get("id")
            
            # Verify required fields
            self.assertEqual(created_customer.get("name"), customer_data.get("name"))
            self.assertEqual(created_customer.get("assigned_sales_id"), customer_data.get("assigned_sales_id"))
            
            # Verify optional fields have default or null values
            self.assertIn("phone", created_customer)
            self.assertIn("company", created_customer)
            self.assertIn("notes", created_customer)
            self.assertIn("source", created_customer)
            
            print(f"✅ Created minimal customer with ID: {minimal_customer_id}")
            print("✅ Optional fields validation working correctly")
            
            # Clean up the minimal customer
            try:
                delete_response = requests.delete(
                    f"{API_URL}/customers/{minimal_customer_id}", 
                    headers=self.get_headers()
                )
                delete_response.raise_for_status()
                print(f"✅ Deleted minimal customer")
            except Exception as e:
                print(f"⚠️ Failed to delete minimal customer: {str(e)}")
            
            return True
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
            return False
        except AssertionError as e:
            print(f"❌ Assertion failed: {str(e)}")
            return False
    
    def test_08_potential_value_formatting(self):
        """Test potential_value number formatting"""
        print("\n🔍 Testing potential_value number formatting...")
        
        if not self.__class__.test_customer_id:
            print("⚠️ No test customer ID available for potential_value test")
            return True  # Skip this test
        
        success = True
        
        # Test different number formats
        test_values = [
            (1000, 1000.0),
            (1000.5, 1000.5),
            (0, 0.0),
            (999999.99, 999999.99)
        ]
        
        for input_value, expected_value in test_values:
            try:
                update_data = {"potential_value": input_value}
                response = requests.put(
                    f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                    json=update_data,
                    headers=self.get_headers()
                )
                response.raise_for_status()
                updated_customer = response.json()
                
                # Check if the value is stored correctly
                self.assertEqual(updated_customer.get("potential_value"), expected_value)
                print(f"✅ potential_value {input_value} formatted correctly as {updated_customer.get('potential_value')}")
            
            except requests.exceptions.RequestException as e:
                print(f"❌ API request failed for value {input_value}: {str(e)}")
                if hasattr(e, 'response') and e.response:
                    print(f"Response: {e.response.text}")
                success = False
            except AssertionError as e:
                print(f"❌ Assertion failed for value {input_value}: {str(e)}")
                success = False
        
        if success:
            print("✅ potential_value number formatting working correctly")
        else:
            print("❌ potential_value number formatting has issues")
        
        return success
    
    def test_09_get_customers_with_filters(self):
        """Test GET /api/customers with status and sales_id filters"""
        print("\n🔍 Testing GET /api/customers with filters...")
        
        success = True
        
        # Test status filter
        try:
            response = requests.get(
                f"{API_URL}/customers?status=high", 
                headers=self.get_headers()
            )
            response.raise_for_status()
            
            high_status_customers = response.json()
            self.assertIsInstance(high_status_customers, list)
            
            # Verify all returned customers have high status
            for customer in high_status_customers:
                self.assertEqual(customer.get("status"), "high")
            
            print(f"✅ Found {len(high_status_customers)} customers with status=high")
        except Exception as e:
            print(f"❌ Failed to filter customers by status: {str(e)}")
            success = False
        
        # Test sales_id filter
        if self.sales_user_id:
            try:
                response = requests.get(
                    f"{API_URL}/customers?sales_id={self.sales_user_id}", 
                    headers=self.get_headers()
                )
                response.raise_for_status()
                
                sales_customers = response.json()
                self.assertIsInstance(sales_customers, list)
                
                # Verify all returned customers are assigned to the sales user
                for customer in sales_customers:
                    self.assertEqual(customer.get("assigned_sales_id"), self.sales_user_id)
                
                print(f"✅ Found {len(sales_customers)} customers assigned to sales_id={self.sales_user_id}")
            except Exception as e:
                print(f"❌ Failed to filter customers by sales_id: {str(e)}")
                success = False
        
        if success:
            print("✅ GET /api/customers filtering working correctly")
        else:
            print("❌ GET /api/customers filtering has issues")
        
        return success
    
    def test_10_cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        if self.__class__.test_customer_id:
            try:
                response = requests.delete(
                    f"{API_URL}/customers/{self.__class__.test_customer_id}", 
                    headers=self.get_headers()
                )
                response.raise_for_status()
                print(f"✅ Deleted test customer with ID: {self.__class__.test_customer_id}")
            except Exception as e:
                print(f"⚠️ Failed to delete test customer: {str(e)}")
        
        print("✅ Cleanup completed")
        return True

    def run_all_tests(self):
        """Run all tests and return overall success status"""
        test_methods = [
            self.test_01_get_users_endpoint,
            self.test_02_create_customer,
            self.test_03_get_customers,
            self.test_04_update_customer,
            self.test_05_enum_values_validation,
            self.test_06_required_field_validation,
            self.test_07_optional_fields_validation,
            self.test_08_potential_value_formatting,
            self.test_09_get_customers_with_filters,
            self.test_10_cleanup
        ]
        
        results = []
        for test_method in test_methods:
            try:
                result = test_method()
                results.append(result)
            except Exception as e:
                print(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
                results.append(False)
        
        success_count = sum(1 for result in results if result)
        total_count = len(results)
        success_rate = (success_count / total_count) * 100 if total_count > 0 else 0
        
        print("\n============================================================")
        print(f"🏁 TEST SUMMARY: Enhanced Lead Management System")
        print("============================================================")
        print(f"Total Tests: {total_count}")
        print(f"Passed: {success_count}")
        print(f"Failed: {total_count - success_count}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_count == total_count:
            print("\n✅ All tests passed! The Enhanced Lead Management System is working correctly.")
            return True
        else:
            print("\n⚠️ Some tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    print(f"🚀 Starting Enhanced Lead Management API Tests against {API_URL}")
    tester = EnhancedLeadManagementTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)