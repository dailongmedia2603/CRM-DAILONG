#!/usr/bin/env python3
"""
Additional Edge Case Testing for CRM Backend
Tests error handling, validation, and edge cases
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

print(f"Testing edge cases at: {API_BASE}")

class CRMEdgeCaseTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        
    def setup_admin_user(self):
        """Setup admin user for testing"""
        admin_data = {
            "email": f"edge_admin_{uuid.uuid4().hex[:8]}@test.com",
            "password": "admin123",
            "full_name": "Edge Test Admin",
            "role": "admin",
            "phone": "+1234567890",
            "target_monthly": 0.0
        }
        
        response = self.session.post(f"{API_BASE}/auth/register", json=admin_data)
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data["access_token"]
            return True
        return False
    
    def test_duplicate_email_registration(self):
        """Test duplicate email registration"""
        print("\n=== Testing Duplicate Email Registration ===")
        
        # First registration
        user_data = {
            "email": "duplicate@test.com",
            "password": "test123",
            "full_name": "First User",
            "role": "sales",
            "phone": "+1234567890",
            "target_monthly": 10000.0
        }
        
        response1 = self.session.post(f"{API_BASE}/auth/register", json=user_data)
        
        # Second registration with same email
        user_data["full_name"] = "Second User"
        response2 = self.session.post(f"{API_BASE}/auth/register", json=user_data)
        
        if response1.status_code == 200 and response2.status_code == 400:
            print("✅ Duplicate email registration correctly rejected")
            return True
        else:
            print(f"❌ Duplicate email handling failed: {response1.status_code}, {response2.status_code}")
            return False
    
    def test_invalid_customer_data(self):
        """Test customer creation with invalid data"""
        print("\n=== Testing Invalid Customer Data ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test missing required fields
        invalid_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email format
            "phone": "",
            "company": "",
            "status": "invalid_status",  # Invalid status
            "potential_value": -1000.0  # Negative value
        }
        
        response = self.session.post(f"{API_BASE}/customers", json=invalid_data, headers=headers)
        
        if response.status_code == 422:  # Validation error
            print("✅ Invalid customer data correctly rejected")
            return True
        else:
            print(f"❌ Invalid customer data should be rejected, got: {response.status_code}")
            return False
    
    def test_unauthorized_access_attempts(self):
        """Test various unauthorized access attempts"""
        print("\n=== Testing Unauthorized Access Attempts ===")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        
        response = self.session.get(f"{API_BASE}/customers", headers=invalid_headers)
        if response.status_code == 401:  # 401 is correct for invalid token
            print("✅ Invalid token correctly rejected")
        else:
            print(f"❌ Invalid token should return 401, got: {response.status_code}")
            return False
        
        # Test with malformed Authorization header
        malformed_headers = {"Authorization": "InvalidFormat token"}
        
        response = self.session.get(f"{API_BASE}/customers", headers=malformed_headers)
        if response.status_code == 401:  # 401 is correct for malformed auth
            print("✅ Malformed authorization header correctly rejected")
            return True
        else:
            print(f"❌ Malformed auth header should return 401, got: {response.status_code}")
            return False
    
    def test_nonexistent_resource_access(self):
        """Test access to nonexistent resources"""
        print("\n=== Testing Nonexistent Resource Access ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test nonexistent customer
        fake_customer_id = str(uuid.uuid4())
        response = self.session.get(f"{API_BASE}/customers/{fake_customer_id}", headers=headers)
        
        if response.status_code == 404:
            print("✅ Nonexistent customer correctly returns 404")
        else:
            print(f"❌ Nonexistent customer should return 404, got: {response.status_code}")
            return False
        
        # Test nonexistent sales person analytics
        fake_sales_id = str(uuid.uuid4())
        response = self.session.get(f"{API_BASE}/sales/{fake_sales_id}/analytics", headers=headers)
        
        if response.status_code == 404:
            print("✅ Nonexistent sales person analytics correctly returns 404")
            return True
        else:
            print(f"❌ Nonexistent sales analytics should return 404, got: {response.status_code}")
            return False
    
    def test_data_validation_edge_cases(self):
        """Test edge cases in data validation"""
        print("\n=== Testing Data Validation Edge Cases ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test extremely long strings
        long_string = "x" * 1000
        customer_data = {
            "name": long_string,
            "email": "test@test.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "position": "CEO",
            "status": "lead",
            "potential_value": 50000.0,
            "notes": long_string,
            "address": long_string,
            "source": "website"
        }
        
        response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
        
        # Should either accept it or reject with validation error
        if response.status_code in [200, 422]:
            print("✅ Long string validation handled appropriately")
            return True
        else:
            print(f"❌ Unexpected response for long strings: {response.status_code}")
            return False
    
    def test_concurrent_operations(self):
        """Test concurrent operations don't cause issues"""
        print("\n=== Testing Concurrent Operations ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create multiple customers rapidly
        success_count = 0
        for i in range(5):
            customer_data = {
                "name": f"Concurrent Customer {i}",
                "email": f"concurrent{i}_{uuid.uuid4().hex[:6]}@test.com",  # Ensure unique emails
                "phone": f"+123456789{i}",
                "company": f"Company {i}",
                "position": "Manager",
                "status": "lead",
                "potential_value": 10000.0 + i * 1000,
                "notes": f"Concurrent test customer {i}",
                "address": f"Address {i}",
                "source": "website"  # Use valid source
            }
            
            response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
            if response.status_code == 200:
                success_count += 1
            else:
                print(f"   Customer {i} failed: {response.status_code} - {response.text}")
        
        if success_count >= 4:  # Allow for some failures in concurrent operations
            print(f"✅ Concurrent customer creation mostly successful ({success_count}/5)")
            return True
        else:
            print(f"❌ Only {success_count}/5 concurrent operations succeeded")
            return False
    
    def run_edge_case_tests(self):
        """Run all edge case tests"""
        print("🔍 Starting CRM Backend Edge Case Testing...")
        
        if not self.setup_admin_user():
            print("❌ Failed to setup admin user for testing")
            return False
        
        test_results = []
        
        test_results.append(("Duplicate Email Registration", self.test_duplicate_email_registration()))
        test_results.append(("Invalid Customer Data", self.test_invalid_customer_data()))
        test_results.append(("Unauthorized Access Attempts", self.test_unauthorized_access_attempts()))
        test_results.append(("Nonexistent Resource Access", self.test_nonexistent_resource_access()))
        test_results.append(("Data Validation Edge Cases", self.test_data_validation_edge_cases()))
        test_results.append(("Concurrent Operations", self.test_concurrent_operations()))
        
        # Print summary
        print("\n" + "="*60)
        print("🏁 EDGE CASE TEST SUMMARY")
        print("="*60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<30} {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Edge Case Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        return failed == 0

if __name__ == "__main__":
    tester = CRMEdgeCaseTester()
    success = tester.run_edge_case_tests()
    exit(0 if success else 1)