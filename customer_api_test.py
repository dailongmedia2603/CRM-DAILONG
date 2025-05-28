#!/usr/bin/env python3
"""
Test the updated Customer API with new fields and schema changes for the Lead module
"""

import requests
import json
import unittest
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing updated Customer API at: {API_BASE}")

class CustomerAPITest(unittest.TestCase):
    """Test the updated Customer API with new fields and schema changes for the Lead module"""
    
    def setUp(self):
        """Set up the test by logging in and getting an auth token"""
        # Login with admin credentials
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        self.assertEqual(response.status_code, 200, "Failed to login with admin credentials")
        
        # Extract token for authentication
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Store created customer IDs for cleanup
        self.customer_ids = []
    
    def tearDown(self):
        """Clean up by deleting any customers created during tests"""
        for customer_id in self.customer_ids:
            requests.delete(f"{API_BASE}/customers/{customer_id}", headers=self.headers)
    
    def test_get_customers(self):
        """Test GET /api/customers - Should return customers with new fields"""
        response = requests.get(f"{API_BASE}/customers", headers=self.headers)
        self.assertEqual(response.status_code, 200, "Failed to get customers")
        
        # Check if response is a list
        customers = response.json()
        self.assertIsInstance(customers, list, "Response is not a list")
        
        # If there are customers, check for new fields
        if customers:
            customer = customers[0]
            # Check for new fields
            self.assertIn("care_status", customer, "care_status field missing")
            self.assertIn("sales_result", customer, "sales_result field missing")
            self.assertIn("potential_value", customer, "potential_value field missing")
            self.assertIn("source", customer, "source field missing")
            
            # Check that email/position/address are not present (as per requirements)
            self.assertNotIn("email", customer, "email field should not be present")
            self.assertNotIn("position", customer, "position field should not be present")
            self.assertNotIn("address", customer, "address field should not be present")
    
    def test_create_customer_with_all_fields(self):
        """Test creating a customer with all new fields populated"""
        customer_data = {
            "name": "Test Customer Full",
            "phone": "0987654321",
            "company": "Test Product",
            "status": "high",  # Tiềm năng
            "care_status": "potential_close",  # Khả năng chốt
            "sales_result": "signed_contract",  # Ký hợp đồng
            "assigned_sales_id": "admin",  # Using admin ID for testing
            "potential_value": 5000000.0,  # Giá trị hợp đồng
            "notes": "Test notes",
            "source": "Facebook"
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed to create customer: {response.text}")
        
        # Store customer ID for cleanup
        customer = response.json()
        self.customer_ids.append(customer["id"])
        
        # Verify all fields were saved correctly
        self.assertEqual(customer["name"], customer_data["name"])
        self.assertEqual(customer["phone"], customer_data["phone"])
        self.assertEqual(customer["company"], customer_data["company"])
        self.assertEqual(customer["status"], customer_data["status"])
        self.assertEqual(customer["care_status"], customer_data["care_status"])
        self.assertEqual(customer["sales_result"], customer_data["sales_result"])
        self.assertEqual(customer["assigned_sales_id"], customer_data["assigned_sales_id"])
        self.assertEqual(customer["potential_value"], customer_data["potential_value"])
        self.assertEqual(customer["notes"], customer_data["notes"])
        self.assertEqual(customer["source"], customer_data["source"])
    
    def test_create_customer_minimal_fields(self):
        """Test creating a customer with only required fields"""
        customer_data = {
            "name": "Test Customer Minimal",
            "assigned_sales_id": "admin"  # Using admin ID for testing
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed to create customer with minimal fields: {response.text}")
        
        # Store customer ID for cleanup
        customer = response.json()
        self.customer_ids.append(customer["id"])
        
        # Verify required fields were saved correctly
        self.assertEqual(customer["name"], customer_data["name"])
        self.assertEqual(customer["assigned_sales_id"], customer_data["assigned_sales_id"])
        
        # Verify default values for optional fields
        self.assertEqual(customer["status"], "high")  # Default status is "high"
        self.assertEqual(customer["care_status"], "potential_close")  # Default care_status
        self.assertEqual(customer["potential_value"], 0.0)  # Default potential_value
        self.assertIsNone(customer["sales_result"])  # Default sales_result is None
    
    def test_invalid_enum_values(self):
        """Test invalid enum values for status, care_status, sales_result"""
        # Test invalid status
        customer_data = {
            "name": "Test Invalid Status",
            "assigned_sales_id": "admin",
            "status": "invalid_status"  # Invalid status
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertNotEqual(response.status_code, 200, "Should fail with invalid status")
        
        # Test invalid care_status
        customer_data = {
            "name": "Test Invalid Care Status",
            "assigned_sales_id": "admin",
            "care_status": "invalid_care_status"  # Invalid care_status
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertNotEqual(response.status_code, 200, "Should fail with invalid care_status")
        
        # Test invalid sales_result
        customer_data = {
            "name": "Test Invalid Sales Result",
            "assigned_sales_id": "admin",
            "sales_result": "invalid_sales_result"  # Invalid sales_result
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertNotEqual(response.status_code, 200, "Should fail with invalid sales_result")
    
    def test_number_formatting_potential_value(self):
        """Test number formatting for potential_value"""
        # Test with integer
        customer_data = {
            "name": "Test Integer Value",
            "assigned_sales_id": "admin",
            "potential_value": 5000000
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed with integer potential_value: {response.text}")
        
        # Store customer ID for cleanup
        customer = response.json()
        self.customer_ids.append(customer["id"])
        
        # Verify potential_value was saved correctly
        self.assertEqual(customer["potential_value"], float(customer_data["potential_value"]))
        
        # Test with float
        customer_data = {
            "name": "Test Float Value",
            "assigned_sales_id": "admin",
            "potential_value": 5000000.50
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed with float potential_value: {response.text}")
        
        # Store customer ID for cleanup
        customer = response.json()
        self.customer_ids.append(customer["id"])
        
        # Verify potential_value was saved correctly
        self.assertEqual(customer["potential_value"], customer_data["potential_value"])
    
    def test_update_customer(self):
        """Test updating an existing customer"""
        # First create a customer
        customer_data = {
            "name": "Test Update Customer",
            "assigned_sales_id": "admin",
            "status": "high",
            "care_status": "potential_close",
            "potential_value": 1000000.0
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed to create customer for update test: {response.text}")
        
        # Store customer ID for cleanup
        customer = response.json()
        customer_id = customer["id"]
        self.customer_ids.append(customer_id)
        
        # Update the customer
        update_data = {
            "name": "Updated Customer Name",
            "status": "normal",
            "care_status": "thinking",
            "sales_result": "not_interested",
            "potential_value": 2000000.0,
            "source": "Website"
        }
        
        response = requests.put(f"{API_BASE}/customers/{customer_id}", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed to update customer: {response.text}")
        
        # Get the updated customer
        response = requests.get(f"{API_BASE}/customers/{customer_id}", headers=self.headers)
        self.assertEqual(response.status_code, 200, f"Failed to get updated customer: {response.text}")
        
        updated_customer = response.json()
        
        # Verify fields were updated correctly
        self.assertEqual(updated_customer["name"], update_data["name"])
        self.assertEqual(updated_customer["status"], update_data["status"])
        self.assertEqual(updated_customer["care_status"], update_data["care_status"])
        self.assertEqual(updated_customer["sales_result"], update_data["sales_result"])
        self.assertEqual(updated_customer["potential_value"], update_data["potential_value"])
        self.assertEqual(updated_customer["source"], update_data["source"])
        
        # Verify fields not in update_data remain unchanged
        self.assertEqual(updated_customer["assigned_sales_id"], customer_data["assigned_sales_id"])
    
    def test_field_validation(self):
        """Test field validation"""
        # Test missing required field (name)
        customer_data = {
            "assigned_sales_id": "admin"
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertNotEqual(response.status_code, 200, "Should fail with missing name field")
        
        # Test missing required field (assigned_sales_id)
        customer_data = {
            "name": "Test Missing Sales ID"
        }
        
        response = requests.post(f"{API_BASE}/customers", json=customer_data, headers=self.headers)
        self.assertNotEqual(response.status_code, 200, "Should fail with missing assigned_sales_id field")

if __name__ == "__main__":
    unittest.main()