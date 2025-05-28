#!/usr/bin/env python3
"""
Additional Edge Case Testing for Client Detail Functionality
Testing specific scenarios mentioned in the review request
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"

class ClientDetailEdgeCaseTester:
    def __init__(self):
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
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
    
    def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            # Use unique email for this test session
            import time
            unique_email = f"edgetest{int(time.time())}@crm.com"
            register_data = {
                "email": unique_email,
                "password": "testpass123",
                "full_name": "Edge Test Admin",
                "role": "admin"
            }
            
            response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                self.log_test("Authentication", True, f"Successfully registered: {unique_email}")
                return True
            else:
                self.log_test("Authentication", False, f"Failed to authenticate: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.token}"}
    
    def test_exact_review_request_scenario(self):
        """Test the exact scenario from the review request"""
        try:
            # Step 1: Create client with specific data from review request
            client_data = {
                "name": "Test Client VN",
                "invoice_email": "billing@test.vn",
                "client_type": "business",
                "source": "website"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Exact Review Request Scenario", False, f"Failed to create client: {response.status_code}")
                return False
            
            client = response.json()
            client_id = client["id"]
            
            # Step 2: Update client with new values from review request
            update_data = {
                "invoice_email": "newemail@test.vn",
                "client_type": "individual",
                "source": "referral"
            }
            
            response = requests.put(f"{BACKEND_URL}/clients/{client_id}", json=update_data, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Exact Review Request Scenario", False, f"Failed to update client: {response.status_code}")
                return False
            
            # Step 3: Get client detail and verify ALL fields match the updated values
            response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Exact Review Request Scenario", False, f"Failed to get client: {response.status_code}")
                return False
            
            updated_client = response.json()
            
            # Verify exact values from review request
            expected_values = {
                "invoice_email": "newemail@test.vn",
                "client_type": "individual",
                "source": "referral"
            }
            
            all_correct = True
            for field, expected_value in expected_values.items():
                actual_value = updated_client.get(field)
                if actual_value != expected_value:
                    all_correct = False
                    self.log_test("Exact Review Request Scenario", False, 
                                f"Field {field} incorrect: expected '{expected_value}', got '{actual_value}'")
                    break
            
            if all_correct:
                # Step 4: Test data persistence across multiple GET requests
                for i in range(3):
                    time.sleep(1)
                    response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
                    if response.status_code == 200:
                        client_check = response.json()
                        if (client_check.get("invoice_email") != "newemail@test.vn" or
                            client_check.get("client_type") != "individual" or
                            client_check.get("source") != "referral"):
                            all_correct = False
                            self.log_test("Exact Review Request Scenario", False, 
                                        f"Data inconsistent on check {i+1}")
                            break
                    else:
                        all_correct = False
                        break
            
            # Cleanup
            requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if all_correct:
                self.log_test("Exact Review Request Scenario", True, 
                            "Exact scenario from review request working perfectly - data persists correctly")
                return True
            else:
                return False
                
        except Exception as e:
            self.log_test("Exact Review Request Scenario", False, f"Error: {str(e)}")
            return False
    
    def test_comprehensive_field_update_cycle(self):
        """Test updating all fields at once and verifying persistence"""
        try:
            # Create client
            client_data = {
                "name": "Comprehensive Test Client",
                "contact_person": "Initial Person",
                "email": "initial@test.com",
                "invoice_email": "initial-billing@test.com",
                "client_type": "individual",
                "source": "initial_source",
                "notes": "Initial notes"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Comprehensive Field Update Cycle", False, f"Failed to create client: {response.status_code}")
                return False
            
            client = response.json()
            client_id = client["id"]
            
            # Update ALL fields at once
            comprehensive_update = {
                "name": "Updated Comprehensive Client",
                "contact_person": "Updated Person",
                "email": "updated@test.com",
                "invoice_email": "updated-billing@test.com",
                "client_type": "business",
                "source": "updated_source",
                "notes": "Updated comprehensive notes",
                "company": "Updated Company",
                "phone": "+84999888777",
                "contract_value": 1000000,
                "address": "Updated Address, Vietnam"
            }
            
            response = requests.put(f"{BACKEND_URL}/clients/{client_id}", json=comprehensive_update, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Comprehensive Field Update Cycle", False, f"Failed to update client: {response.status_code}")
                return False
            
            # Verify all fields were updated and persist
            time.sleep(1)
            response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Comprehensive Field Update Cycle", False, f"Failed to get updated client: {response.status_code}")
                return False
            
            updated_client = response.json()
            
            # Check all updated fields
            all_correct = True
            incorrect_fields = []
            
            for field, expected_value in comprehensive_update.items():
                actual_value = updated_client.get(field)
                if actual_value != expected_value:
                    all_correct = False
                    incorrect_fields.append(f"{field}: expected '{expected_value}', got '{actual_value}'")
            
            # Cleanup
            requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if all_correct:
                self.log_test("Comprehensive Field Update Cycle", True, 
                            "All fields updated and persisted correctly in comprehensive update")
                return True
            else:
                self.log_test("Comprehensive Field Update Cycle", False, 
                            f"Fields not updated correctly: {', '.join(incorrect_fields)}")
                return False
                
        except Exception as e:
            self.log_test("Comprehensive Field Update Cycle", False, f"Error: {str(e)}")
            return False
    
    def test_partial_update_field_retention(self):
        """Test that non-provided fields retain their existing values during partial updates"""
        try:
            # Create client with all fields
            client_data = {
                "name": "Retention Test Client",
                "contact_person": "Original Person",
                "email": "original@test.com",
                "invoice_email": "original-billing@test.com",
                "client_type": "business",
                "source": "original_source",
                "notes": "Original notes",
                "company": "Original Company",
                "phone": "+84111222333",
                "contract_value": 500000,
                "address": "Original Address"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Partial Update Field Retention", False, f"Failed to create client: {response.status_code}")
                return False
            
            client = response.json()
            client_id = client["id"]
            
            # Update only invoice_email and client_type
            partial_update = {
                "invoice_email": "partial-update@test.com",
                "client_type": "individual"
            }
            
            response = requests.put(f"{BACKEND_URL}/clients/{client_id}", json=partial_update, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Partial Update Field Retention", False, f"Failed to update client: {response.status_code}")
                return False
            
            # Verify updated fields changed and others retained
            time.sleep(1)
            response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Partial Update Field Retention", False, f"Failed to get updated client: {response.status_code}")
                return False
            
            updated_client = response.json()
            
            # Check updated fields
            if (updated_client.get("invoice_email") != "partial-update@test.com" or
                updated_client.get("client_type") != "individual"):
                self.log_test("Partial Update Field Retention", False, 
                            f"Updated fields incorrect: invoice_email={updated_client.get('invoice_email')}, client_type={updated_client.get('client_type')}")
                return False
            
            # Check retained fields
            retained_fields = {
                "name": "Retention Test Client",
                "contact_person": "Original Person",
                "email": "original@test.com",
                "source": "original_source",
                "notes": "Original notes",
                "company": "Original Company",
                "phone": "+84111222333",
                "contract_value": 500000,
                "address": "Original Address"
            }
            
            all_retained = True
            incorrect_retentions = []
            
            for field, expected_value in retained_fields.items():
                actual_value = updated_client.get(field)
                if actual_value != expected_value:
                    all_retained = False
                    incorrect_retentions.append(f"{field}: expected '{expected_value}', got '{actual_value}'")
            
            # Cleanup
            requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if all_retained:
                self.log_test("Partial Update Field Retention", True, 
                            "Partial update working correctly - updated fields changed, others retained")
                return True
            else:
                self.log_test("Partial Update Field Retention", False, 
                            f"Fields not retained correctly: {', '.join(incorrect_retentions)}")
                return False
                
        except Exception as e:
            self.log_test("Partial Update Field Retention", False, f"Error: {str(e)}")
            return False
    
    def test_invalid_client_type_handling(self):
        """Test with invalid client_type (should default or handle gracefully)"""
        try:
            # Create client with invalid client_type
            client_data = {
                "name": "Invalid Type Test Client",
                "contact_person": "Test Person",
                "email": "invalid@test.com",
                "client_type": "invalid_type"  # Invalid value
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                client_id = client["id"]
                
                # Check how invalid client_type is handled
                actual_type = client.get("client_type")
                
                # Should either default to "individual" or keep the invalid value
                if actual_type in ["individual", "invalid_type"]:
                    self.log_test("Invalid Client Type Handling", True, 
                                f"Invalid client_type handled gracefully: '{actual_type}'")
                    
                    # Cleanup
                    requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
                    return True
                else:
                    self.log_test("Invalid Client Type Handling", False, 
                                f"Unexpected client_type value: '{actual_type}'")
                    # Cleanup
                    requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
                    return False
            else:
                # If creation fails, that's also acceptable handling
                self.log_test("Invalid Client Type Handling", True, 
                            f"Invalid client_type rejected appropriately: {response.status_code}")
                return True
                
        except Exception as e:
            self.log_test("Invalid Client Type Handling", False, f"Error: {str(e)}")
            return False
    
    def test_stress_data_persistence(self):
        """Stress test data persistence with rapid updates"""
        try:
            # Create client
            client_data = {
                "name": "Stress Test Client",
                "invoice_email": "stress@test.com",
                "client_type": "business",
                "source": "stress_test"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Stress Data Persistence", False, f"Failed to create client: {response.status_code}")
                return False
            
            client = response.json()
            client_id = client["id"]
            
            # Perform rapid updates
            for i in range(5):
                update_data = {
                    "invoice_email": f"stress{i}@test.com",
                    "client_type": "individual" if i % 2 == 0 else "business",
                    "source": f"stress_source_{i}"
                }
                
                response = requests.put(f"{BACKEND_URL}/clients/{client_id}", json=update_data, headers=self.get_headers())
                
                if response.status_code != 200:
                    self.log_test("Stress Data Persistence", False, f"Failed update {i}: {response.status_code}")
                    return False
                
                # Immediately verify the update
                response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
                
                if response.status_code != 200:
                    self.log_test("Stress Data Persistence", False, f"Failed to get client after update {i}: {response.status_code}")
                    return False
                
                client_check = response.json()
                
                if (client_check.get("invoice_email") != f"stress{i}@test.com" or
                    client_check.get("client_type") != ("individual" if i % 2 == 0 else "business") or
                    client_check.get("source") != f"stress_source_{i}"):
                    self.log_test("Stress Data Persistence", False, 
                                f"Data inconsistent after rapid update {i}")
                    return False
                
                time.sleep(0.2)  # Small delay between updates
            
            # Final verification after all updates
            time.sleep(1)
            response = requests.get(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
            
            if response.status_code == 200:
                final_client = response.json()
                if (final_client.get("invoice_email") == "stress4@test.com" and
                    final_client.get("client_type") == "business" and
                    final_client.get("source") == "stress_source_4"):
                    self.log_test("Stress Data Persistence", True, 
                                "Data persistence maintained through rapid updates")
                    
                    # Cleanup
                    requests.delete(f"{BACKEND_URL}/clients/{client_id}", headers=self.get_headers())
                    return True
                else:
                    self.log_test("Stress Data Persistence", False, 
                                "Final data verification failed after stress test")
                    return False
            else:
                self.log_test("Stress Data Persistence", False, 
                            f"Failed final verification: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Stress Data Persistence", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all edge case tests"""
        print("🚀 Starting Client Detail Edge Case Testing")
        print("=" * 80)
        
        # Authentication first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return None
        
        # Run all tests
        tests = [
            self.test_exact_review_request_scenario,
            self.test_comprehensive_field_update_cycle,
            self.test_partial_update_field_retention,
            self.test_invalid_client_type_handling,
            self.test_stress_data_persistence
        ]
        
        for test in tests:
            test()
            time.sleep(0.5)
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 EDGE CASE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        return success_rate

if __name__ == "__main__":
    tester = ClientDetailEdgeCaseTester()
    success_rate = tester.run_all_tests()
    
    if success_rate and success_rate >= 90:
        print(f"\n🎉 EXCELLENT: {success_rate:.1f}% success rate - All edge cases handled correctly!")
    elif success_rate and success_rate >= 75:
        print(f"\n✅ GOOD: {success_rate:.1f}% success rate - Most edge cases handled correctly")
    elif success_rate:
        print(f"\n❌ NEEDS ATTENTION: {success_rate:.1f}% success rate - Edge case issues detected")
    else:
        print("\n❌ TESTING FAILED: Could not complete edge case tests")