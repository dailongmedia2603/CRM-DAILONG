#!/usr/bin/env python3
"""
Comprehensive Client Detail Functionality Testing
Testing all updated Client Detail functionality with focus on data persistence
"""

import requests
import json
import time
from datetime import datetime, timezone, timedelta

# Configuration
BACKEND_URL = "https://3c3487d3-5b5a-4c39-935b-f362292e6e62.preview.emergentagent.com/api"

class ClientDetailTester:
    def __init__(self):
        self.token = None
        self.test_client_id = None
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
            # Try to login with existing test user
            login_data = {
                "email": "admin@test.com",
                "password": "admin123"
            }
            
            response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                self.log_test("Authentication", True, "Successfully logged in with existing admin user")
                return True
            else:
                # Try with different credentials
                login_data = {
                    "email": "testadmin@crm.com",
                    "password": "testpass123"
                }
                
                response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
                
                if response.status_code == 200:
                    data = response.json()
                    self.token = data["access_token"]
                    self.log_test("Authentication", True, "Successfully logged in with alternative admin user")
                    return True
                else:
                    # Try to register new admin user with unique email
                    import time
                    unique_email = f"testadmin{int(time.time())}@crm.com"
                    register_data = {
                        "email": unique_email,
                        "password": "testpass123",
                        "full_name": "Test Admin",
                        "role": "admin"
                    }
                    
                    response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        self.token = data["access_token"]
                        self.log_test("Authentication", True, f"Successfully registered and logged in new admin user: {unique_email}")
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
    
    def test_client_creation_with_new_fields(self):
        """Test 1: Create client with all new fields including invoice_email, client_type, source"""
        try:
            client_data = {
                "name": "Test Client VN",
                "contact_person": "Nguyen Van Test",
                "email": "test@client.vn",
                "invoice_email": "billing@test.vn",
                "client_type": "business",
                "source": "website",
                "company": "Test Company VN",
                "phone": "+84123456789",
                "contract_value": 500000,
                "address": "Ho Chi Minh City, Vietnam",
                "notes": "Test client for Vietnam market"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                self.test_client_id = client["id"]
                
                # Verify all new fields are present
                required_fields = ["invoice_email", "client_type", "source"]
                missing_fields = [field for field in required_fields if field not in client]
                
                if not missing_fields:
                    # Verify field values
                    if (client["invoice_email"] == "billing@test.vn" and 
                        client["client_type"] == "business" and 
                        client["source"] == "website"):
                        self.log_test("Client Creation with New Fields", True, 
                                    f"Client created with ID: {client['id']}, all new fields present and correct")
                        return True
                    else:
                        self.log_test("Client Creation with New Fields", False, 
                                    f"Field values incorrect: invoice_email={client.get('invoice_email')}, client_type={client.get('client_type')}, source={client.get('source')}")
                        return False
                else:
                    self.log_test("Client Creation with New Fields", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Client Creation with New Fields", False, f"Failed to create client: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Client Creation with New Fields", False, f"Error: {str(e)}")
            return False
    
    def test_client_detail_retrieval(self):
        """Test 2: Get client detail and verify all new fields are returned"""
        try:
            if not self.test_client_id:
                self.log_test("Client Detail Retrieval", False, "No test client ID available")
                return False
            
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                
                # Verify all new fields are present and correct
                expected_values = {
                    "invoice_email": "billing@test.vn",
                    "client_type": "business", 
                    "source": "website"
                }
                
                all_correct = True
                for field, expected_value in expected_values.items():
                    if client.get(field) != expected_value:
                        all_correct = False
                        self.log_test("Client Detail Retrieval", False, 
                                    f"Field {field} incorrect: expected '{expected_value}', got '{client.get(field)}'")
                        return False
                
                if all_correct:
                    self.log_test("Client Detail Retrieval", True, "All new fields retrieved correctly")
                    return True
                    
            else:
                self.log_test("Client Detail Retrieval", False, f"Failed to get client: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Client Detail Retrieval", False, f"Error: {str(e)}")
            return False
    
    def test_client_update_all_new_fields(self):
        """Test 3: Update client with new values for invoice_email, client_type, source"""
        try:
            if not self.test_client_id:
                self.log_test("Client Update All New Fields", False, "No test client ID available")
                return False
            
            update_data = {
                "name": "Updated Test Client VN",
                "contact_person": "Tran Thi Updated",
                "email": "updated@client.vn",
                "invoice_email": "newemail@test.vn",
                "client_type": "individual",
                "source": "referral",
                "company": "Updated Company VN",
                "phone": "+84987654321",
                "contract_value": 750000,
                "address": "Hanoi, Vietnam",
                "notes": "Updated test client"
            }
            
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", json=update_data, headers=self.get_headers())
            
            if response.status_code == 200:
                self.log_test("Client Update All New Fields", True, "Client updated successfully")
                return True
            else:
                self.log_test("Client Update All New Fields", False, f"Failed to update client: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Client Update All New Fields", False, f"Error: {str(e)}")
            return False
    
    def test_data_persistence_after_update(self):
        """Test 4: Verify data persistence - GET client after update to confirm all fields are saved"""
        try:
            if not self.test_client_id:
                self.log_test("Data Persistence After Update", False, "No test client ID available")
                return False
            
            # Wait a moment to ensure update is processed
            time.sleep(1)
            
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                
                # Verify updated values persist
                expected_values = {
                    "name": "Updated Test Client VN",
                    "invoice_email": "newemail@test.vn",
                    "client_type": "individual",
                    "source": "referral",
                    "email": "updated@client.vn",
                    "contact_person": "Tran Thi Updated"
                }
                
                all_correct = True
                incorrect_fields = []
                
                for field, expected_value in expected_values.items():
                    actual_value = client.get(field)
                    if actual_value != expected_value:
                        all_correct = False
                        incorrect_fields.append(f"{field}: expected '{expected_value}', got '{actual_value}'")
                
                if all_correct:
                    self.log_test("Data Persistence After Update", True, "All updated fields persisted correctly")
                    return True
                else:
                    self.log_test("Data Persistence After Update", False, f"Fields not persisted correctly: {', '.join(incorrect_fields)}")
                    return False
                    
            else:
                self.log_test("Data Persistence After Update", False, f"Failed to get client after update: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Data Persistence After Update", False, f"Error: {str(e)}")
            return False
    
    def test_multiple_get_requests_persistence(self):
        """Test 5: Test data persistence across multiple GET requests"""
        try:
            if not self.test_client_id:
                self.log_test("Multiple GET Requests Persistence", False, "No test client ID available")
                return False
            
            # Make 3 consecutive GET requests
            for i in range(3):
                response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
                
                if response.status_code != 200:
                    self.log_test("Multiple GET Requests Persistence", False, f"GET request {i+1} failed: {response.status_code}")
                    return False
                
                client = response.json()
                
                # Verify critical fields are still correct
                if (client.get("invoice_email") != "newemail@test.vn" or 
                    client.get("client_type") != "individual" or 
                    client.get("source") != "referral"):
                    self.log_test("Multiple GET Requests Persistence", False, 
                                f"Data inconsistent on request {i+1}: invoice_email={client.get('invoice_email')}, client_type={client.get('client_type')}, source={client.get('source')}")
                    return False
                
                time.sleep(0.5)  # Small delay between requests
            
            self.log_test("Multiple GET Requests Persistence", True, "Data consistent across 3 consecutive GET requests")
            return True
            
        except Exception as e:
            self.log_test("Multiple GET Requests Persistence", False, f"Error: {str(e)}")
            return False
    
    def test_individual_field_updates(self):
        """Test 6: Test updating each field individually"""
        try:
            if not self.test_client_id:
                self.log_test("Individual Field Updates", False, "No test client ID available")
                return False
            
            # Test updating invoice_email only
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", 
                                  json={"invoice_email": "individual@test.vn"}, 
                                  headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Individual Field Updates", False, f"Failed to update invoice_email: {response.status_code}")
                return False
            
            # Verify the change
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            if response.status_code == 200:
                client = response.json()
                if client.get("invoice_email") != "individual@test.vn":
                    self.log_test("Individual Field Updates", False, f"invoice_email not updated correctly: {client.get('invoice_email')}")
                    return False
            
            # Test updating client_type only
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", 
                                  json={"client_type": "business"}, 
                                  headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Individual Field Updates", False, f"Failed to update client_type: {response.status_code}")
                return False
            
            # Verify the change
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            if response.status_code == 200:
                client = response.json()
                if client.get("client_type") != "business":
                    self.log_test("Individual Field Updates", False, f"client_type not updated correctly: {client.get('client_type')}")
                    return False
            
            # Test updating source only
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", 
                                  json={"source": "social_media"}, 
                                  headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Individual Field Updates", False, f"Failed to update source: {response.status_code}")
                return False
            
            # Verify the change
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            if response.status_code == 200:
                client = response.json()
                if client.get("source") != "social_media":
                    self.log_test("Individual Field Updates", False, f"source not updated correctly: {client.get('source')}")
                    return False
            
            self.log_test("Individual Field Updates", True, "All individual field updates working correctly")
            return True
            
        except Exception as e:
            self.log_test("Individual Field Updates", False, f"Error: {str(e)}")
            return False
    
    def test_empty_string_handling(self):
        """Test 7: Test with empty strings for invoice_email, source (should be allowed)"""
        try:
            if not self.test_client_id:
                self.log_test("Empty String Handling", False, "No test client ID available")
                return False
            
            # Update with empty strings
            update_data = {
                "invoice_email": "",
                "source": "",
                "client_type": "individual"
            }
            
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", json=update_data, headers=self.get_headers())
            
            if response.status_code == 200:
                # Verify empty strings are saved
                response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
                if response.status_code == 200:
                    client = response.json()
                    if (client.get("invoice_email") == "" and 
                        client.get("source") == "" and 
                        client.get("client_type") == "individual"):
                        self.log_test("Empty String Handling", True, "Empty strings handled correctly")
                        return True
                    else:
                        self.log_test("Empty String Handling", False, 
                                    f"Empty strings not saved correctly: invoice_email='{client.get('invoice_email')}', source='{client.get('source')}'")
                        return False
                else:
                    self.log_test("Empty String Handling", False, f"Failed to retrieve client after empty string update: {response.status_code}")
                    return False
            else:
                self.log_test("Empty String Handling", False, f"Failed to update with empty strings: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Empty String Handling", False, f"Error: {str(e)}")
            return False
    
    def test_client_type_validation(self):
        """Test 8: Test client_type validation with valid values"""
        try:
            if not self.test_client_id:
                self.log_test("Client Type Validation", False, "No test client ID available")
                return False
            
            # Test valid client_type values
            valid_types = ["individual", "business"]
            
            for client_type in valid_types:
                response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", 
                                      json={"client_type": client_type}, 
                                      headers=self.get_headers())
                
                if response.status_code != 200:
                    self.log_test("Client Type Validation", False, f"Failed to update with valid client_type '{client_type}': {response.status_code}")
                    return False
                
                # Verify the value was saved
                response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
                if response.status_code == 200:
                    client = response.json()
                    if client.get("client_type") != client_type:
                        self.log_test("Client Type Validation", False, f"client_type '{client_type}' not saved correctly: {client.get('client_type')}")
                        return False
            
            self.log_test("Client Type Validation", True, "Valid client_type values (individual, business) handled correctly")
            return True
            
        except Exception as e:
            self.log_test("Client Type Validation", False, f"Error: {str(e)}")
            return False
    
    def test_vietnam_timezone_handling(self):
        """Test 9: Verify created_at and updated_at timestamps are handled correctly"""
        try:
            if not self.test_client_id:
                self.log_test("Vietnam Timezone Handling", False, "No test client ID available")
                return False
            
            # Get current client data
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                
                # Check if timestamps exist
                if "created_at" not in client or "updated_at" not in client:
                    self.log_test("Vietnam Timezone Handling", False, "Missing timestamp fields")
                    return False
                
                # Verify timestamps are in ISO format and can be parsed
                try:
                    created_at = datetime.fromisoformat(client["created_at"].replace('Z', '+00:00'))
                    updated_at = datetime.fromisoformat(client["updated_at"].replace('Z', '+00:00'))
                    
                    # Check that updated_at is after created_at (since we've made updates)
                    if updated_at >= created_at:
                        # Test conversion to Vietnam timezone (UTC+7)
                        vietnam_tz = timezone(timedelta(hours=7))
                        vietnam_time = updated_at.astimezone(vietnam_tz)
                        
                        self.log_test("Vietnam Timezone Handling", True, 
                                    f"Timestamps handled correctly. Vietnam time: {vietnam_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                        return True
                    else:
                        self.log_test("Vietnam Timezone Handling", False, "updated_at is not after created_at")
                        return False
                        
                except Exception as parse_error:
                    self.log_test("Vietnam Timezone Handling", False, f"Failed to parse timestamps: {str(parse_error)}")
                    return False
            else:
                self.log_test("Vietnam Timezone Handling", False, f"Failed to get client for timezone test: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Vietnam Timezone Handling", False, f"Error: {str(e)}")
            return False
    
    def test_updated_at_on_put_operations(self):
        """Test 10: Verify that updated_at timestamp is updated on PUT operations"""
        try:
            if not self.test_client_id:
                self.log_test("Updated_at on PUT Operations", False, "No test client ID available")
                return False
            
            # Get current updated_at
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            if response.status_code != 200:
                self.log_test("Updated_at on PUT Operations", False, "Failed to get initial client data")
                return False
            
            initial_client = response.json()
            initial_updated_at = initial_client.get("updated_at")
            
            # Wait a moment to ensure timestamp difference
            time.sleep(2)
            
            # Make an update
            response = requests.put(f"{BACKEND_URL}/clients/{self.test_client_id}", 
                                  json={"notes": "Testing updated_at timestamp"}, 
                                  headers=self.get_headers())
            
            if response.status_code != 200:
                self.log_test("Updated_at on PUT Operations", False, f"Failed to update client: {response.status_code}")
                return False
            
            # Get updated client data
            response = requests.get(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
            if response.status_code != 200:
                self.log_test("Updated_at on PUT Operations", False, "Failed to get updated client data")
                return False
            
            updated_client = response.json()
            new_updated_at = updated_client.get("updated_at")
            
            # Compare timestamps
            if initial_updated_at != new_updated_at:
                self.log_test("Updated_at on PUT Operations", True, 
                            f"updated_at timestamp correctly updated from {initial_updated_at} to {new_updated_at}")
                return True
            else:
                self.log_test("Updated_at on PUT Operations", False, "updated_at timestamp was not updated")
                return False
                
        except Exception as e:
            self.log_test("Updated_at on PUT Operations", False, f"Error: {str(e)}")
            return False
    
    def test_default_client_type(self):
        """Test 11: Test that client_type defaults to 'individual' when not provided"""
        try:
            # Create a client without specifying client_type
            client_data = {
                "name": "Default Type Test Client",
                "contact_person": "Test Person",
                "email": "default@test.com"
            }
            
            response = requests.post(f"{BACKEND_URL}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code == 200:
                client = response.json()
                default_client_id = client["id"]
                
                # Verify client_type defaults to 'individual'
                if client.get("client_type") == "individual":
                    self.log_test("Default Client Type", True, "client_type correctly defaults to 'individual'")
                    
                    # Clean up - delete the test client
                    requests.delete(f"{BACKEND_URL}/clients/{default_client_id}", headers=self.get_headers())
                    return True
                else:
                    self.log_test("Default Client Type", False, f"client_type defaulted to '{client.get('client_type')}' instead of 'individual'")
                    # Clean up
                    requests.delete(f"{BACKEND_URL}/clients/{default_client_id}", headers=self.get_headers())
                    return False
            else:
                self.log_test("Default Client Type", False, f"Failed to create client for default test: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Default Client Type", False, f"Error: {str(e)}")
            return False
    
    def test_authentication_required(self):
        """Test 12: Verify that all endpoints require JWT token"""
        try:
            # Test without token
            response = requests.get(f"{BACKEND_URL}/clients")
            
            if response.status_code in [401, 403]:
                self.log_test("Authentication Required", True, f"Correctly requires authentication (status: {response.status_code})")
                return True
            else:
                self.log_test("Authentication Required", False, f"Should require authentication but got status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Authentication Required", False, f"Error: {str(e)}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        try:
            if self.test_client_id:
                response = requests.delete(f"{BACKEND_URL}/clients/{self.test_client_id}", headers=self.get_headers())
                if response.status_code == 200:
                    print(f"✅ Cleaned up test client: {self.test_client_id}")
                else:
                    print(f"⚠️ Failed to clean up test client: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Cleanup error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Client Detail Functionality Testing")
        print("=" * 80)
        
        # Authentication first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        # Run all tests
        tests = [
            self.test_client_creation_with_new_fields,
            self.test_client_detail_retrieval,
            self.test_client_update_all_new_fields,
            self.test_data_persistence_after_update,
            self.test_multiple_get_requests_persistence,
            self.test_individual_field_updates,
            self.test_empty_string_handling,
            self.test_client_type_validation,
            self.test_vietnam_timezone_handling,
            self.test_updated_at_on_put_operations,
            self.test_default_client_type,
            self.test_authentication_required
        ]
        
        for test in tests:
            test()
            time.sleep(0.5)  # Small delay between tests
        
        # Cleanup
        self.cleanup()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
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
        
        # Critical requirements check
        print("\n🎯 CRITICAL REQUIREMENTS VERIFICATION:")
        critical_tests = [
            "Client Creation with New Fields",
            "Client Detail Retrieval", 
            "Data Persistence After Update",
            "Multiple GET Requests Persistence",
            "Individual Field Updates"
        ]
        
        critical_passed = sum(1 for result in self.test_results 
                            if result["test"] in critical_tests and result["success"])
        
        print(f"Critical Tests Passed: {critical_passed}/{len(critical_tests)}")
        
        if critical_passed == len(critical_tests):
            print("✅ ALL CRITICAL REQUIREMENTS VERIFIED - DATA PERSISTENCE WORKING CORRECTLY")
        else:
            print("❌ CRITICAL REQUIREMENTS NOT MET - DATA PERSISTENCE ISSUES DETECTED")
        
        return success_rate

if __name__ == "__main__":
    tester = ClientDetailTester()
    success_rate = tester.run_all_tests()
    
    if success_rate and success_rate >= 90:
        print(f"\n🎉 EXCELLENT: {success_rate:.1f}% success rate - Client Detail functionality is working correctly!")
    elif success_rate and success_rate >= 75:
        print(f"\n✅ GOOD: {success_rate:.1f}% success rate - Client Detail functionality is mostly working with minor issues")
    elif success_rate:
        print(f"\n❌ NEEDS ATTENTION: {success_rate:.1f}% success rate - Client Detail functionality has significant issues")
    else:
        print("\n❌ TESTING FAILED: Could not complete tests")