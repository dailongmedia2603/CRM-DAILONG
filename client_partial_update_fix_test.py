#!/usr/bin/env python3
"""
CRITICAL BUG FIX VERIFICATION TEST
Tests the FIXED partial update functionality to verify the critical bug has been resolved.

This test specifically verifies that partial updates only change the specified fields
and do not reset other fields to empty values or defaults.
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

print(f"Testing CRITICAL PARTIAL UPDATE BUG FIX at: {API_BASE}")

class ClientPartialUpdateFixTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_user = None
        self.test_client_ids = []
        
    def setup_authentication(self):
        """Setup admin authentication for testing"""
        print("\n=== Setting Up Authentication ===")
        
        # Register admin user
        admin_data = {
            "email": f"admin_partial_test_{uuid.uuid4().hex[:8]}@test.com",
            "password": "admin123",
            "full_name": "Partial Update Test Admin",
            "role": "admin",
            "phone": "+1234567890",
            "target_monthly": 0.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=admin_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                print(f"✅ Admin authentication setup successful: {self.admin_user['email']}")
                return True
            else:
                print(f"❌ Admin authentication setup failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin authentication setup error: {e}")
            return False
    
    def test_partial_update_critical_scenario(self):
        """
        Test the exact critical scenario from the bug report:
        Create client with ALL fields, then update ONLY invoice_email field
        """
        print("\n=== CRITICAL SCENARIO: Partial Update with ALL Fields ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create client with ALL fields
        full_client_data = {
            "name": "Full Data Client Corp",
            "contact_person": "John Smith",
            "email": "john.smith@fulldata.com",
            "invoice_email": "billing@fulldata.com",
            "client_type": "business",
            "source": "website",
            "notes": "Important client with full data set",
            "address": "123 Full Data Street, Complete City, FC 12345",
            "phone": "+1-555-FULL",
            "contract_value": 250000.00,
            "company": "Full Data Corporation",
            "contract_link": "https://example.com/contract/full"
        }
        
        # Step 1: Create client
        try:
            response = self.session.post(f"{API_BASE}/clients", json=full_client_data, headers=headers)
            if response.status_code == 200:
                client = response.json()
                client_id = client["id"]
                self.test_client_ids.append(client_id)
                print(f"✅ Client created with ALL fields: {client['name']} (ID: {client_id})")
                
                # Verify all fields are set
                original_fields = {
                    "name": client["name"],
                    "contact_person": client["contact_person"],
                    "email": client["email"],
                    "invoice_email": client["invoice_email"],
                    "client_type": client["client_type"],
                    "source": client["source"],
                    "notes": client["notes"],
                    "address": client["address"],
                    "phone": client["phone"],
                    "contract_value": client["contract_value"],
                    "company": client["company"],
                    "contract_link": client["contract_link"]
                }
                print(f"✅ Original client data verified with {len(original_fields)} fields")
            else:
                print(f"❌ Client creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client creation error: {e}")
            return False
        
        # Step 2: Update ONLY invoice_email field
        partial_update = {
            "invoice_email": "updated-billing@fulldata.com"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=partial_update, headers=headers)
            if response.status_code == 200:
                print(f"✅ Partial update (invoice_email only) successful")
            else:
                print(f"❌ Partial update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Partial update error: {e}")
            return False
        
        # Step 3: Verify ALL OTHER fields remain unchanged
        try:
            response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
            if response.status_code == 200:
                updated_client = response.json()
                
                # Check that invoice_email was updated
                if updated_client["invoice_email"] == "updated-billing@fulldata.com":
                    print(f"✅ invoice_email correctly updated to: {updated_client['invoice_email']}")
                else:
                    print(f"❌ invoice_email not updated correctly. Expected: updated-billing@fulldata.com, Got: {updated_client['invoice_email']}")
                    return False
                
                # Check that ALL OTHER fields remain unchanged
                fields_to_check = [
                    ("name", "Full Data Client Corp"),
                    ("contact_person", "John Smith"),
                    ("email", "john.smith@fulldata.com"),
                    ("client_type", "business"),
                    ("source", "website"),
                    ("notes", "Important client with full data set"),
                    ("address", "123 Full Data Street, Complete City, FC 12345"),
                    ("phone", "+1-555-FULL"),
                    ("contract_value", 250000.00),
                    ("company", "Full Data Corporation"),
                    ("contract_link", "https://example.com/contract/full")
                ]
                
                all_preserved = True
                for field_name, expected_value in fields_to_check:
                    actual_value = updated_client.get(field_name)
                    if actual_value != expected_value:
                        print(f"❌ CRITICAL BUG: Field '{field_name}' was reset! Expected: '{expected_value}', Got: '{actual_value}'")
                        all_preserved = False
                    else:
                        print(f"✅ Field '{field_name}' preserved correctly: '{actual_value}'")
                
                if all_preserved:
                    print(f"🎉 CRITICAL BUG FIX VERIFIED: All {len(fields_to_check)} fields preserved during partial update!")
                    return True
                else:
                    print(f"❌ CRITICAL BUG STILL EXISTS: Some fields were reset during partial update")
                    return False
            else:
                print(f"❌ Failed to retrieve updated client: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client retrieval error: {e}")
            return False
    
    def test_individual_field_updates(self):
        """Test updating individual fields one by one"""
        print("\n=== INDIVIDUAL FIELD UPDATE TESTING ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a client for individual field testing
        client_data = {
            "name": "Individual Field Test Client",
            "contact_person": "Jane Doe",
            "email": "jane.doe@individual.com",
            "invoice_email": "billing@individual.com",
            "client_type": "individual",
            "source": "website",
            "notes": "Original notes",
            "address": "456 Individual Ave",
            "phone": "+1-555-INDV",
            "contract_value": 100000.00
        }
        
        # Create client
        try:
            response = self.session.post(f"{API_BASE}/clients", json=client_data, headers=headers)
            if response.status_code == 200:
                client = response.json()
                client_id = client["id"]
                self.test_client_ids.append(client_id)
                print(f"✅ Individual field test client created: {client['name']}")
            else:
                print(f"❌ Individual field test client creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Individual field test client creation error: {e}")
            return False
        
        # Test 1: Update ONLY client_type from "individual" to "business"
        print("\n--- Test 1: Update ONLY client_type ---")
        try:
            update_data = {"client_type": "business"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ client_type update successful")
                
                # Verify update
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    updated_client = get_response.json()
                    if (updated_client["client_type"] == "business" and
                        updated_client["name"] == "Individual Field Test Client" and
                        updated_client["source"] == "website" and
                        updated_client["notes"] == "Original notes"):
                        print("✅ client_type updated correctly, other fields preserved")
                    else:
                        print("❌ client_type update verification failed")
                        return False
                else:
                    print("❌ Could not verify client_type update")
                    return False
            else:
                print(f"❌ client_type update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ client_type update error: {e}")
            return False
        
        # Test 2: Update ONLY source from "website" to "referral"
        print("\n--- Test 2: Update ONLY source ---")
        try:
            update_data = {"source": "referral"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ source update successful")
                
                # Verify update
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    updated_client = get_response.json()
                    if (updated_client["source"] == "referral" and
                        updated_client["client_type"] == "business" and  # From previous update
                        updated_client["name"] == "Individual Field Test Client" and
                        updated_client["notes"] == "Original notes"):
                        print("✅ source updated correctly, other fields preserved")
                    else:
                        print("❌ source update verification failed")
                        return False
                else:
                    print("❌ Could not verify source update")
                    return False
            else:
                print(f"❌ source update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ source update error: {e}")
            return False
        
        # Test 3: Update ONLY notes field
        print("\n--- Test 3: Update ONLY notes ---")
        try:
            update_data = {"notes": "Updated notes after individual field testing"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ notes update successful")
                
                # Verify update
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    updated_client = get_response.json()
                    if (updated_client["notes"] == "Updated notes after individual field testing" and
                        updated_client["source"] == "referral" and  # From previous update
                        updated_client["client_type"] == "business" and  # From first update
                        updated_client["name"] == "Individual Field Test Client"):
                        print("✅ notes updated correctly, other fields preserved")
                        return True
                    else:
                        print("❌ notes update verification failed")
                        return False
                else:
                    print("❌ Could not verify notes update")
                    return False
            else:
                print(f"❌ notes update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ notes update error: {e}")
            return False
    
    def test_data_persistence_stress_test(self):
        """
        Data Persistence Stress Test from review request:
        - Create client with specific data
        - Update only invoice_email
        - Verify all fields preserved
        - Update only client_type
        - Verify all fields preserved including previous update
        """
        print("\n=== DATA PERSISTENCE STRESS TEST ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create client with specific data as per review request
        stress_test_data = {
            "name": "Test Client",
            "invoice_email": "original@test.com",
            "client_type": "business",
            "source": "website",
            "contact_person": "Stress Test Contact",
            "email": "contact@test.com",
            "phone": "+1-555-STRESS",
            "contract_value": 75000.00
        }
        
        # Step 1: Create client
        try:
            response = self.session.post(f"{API_BASE}/clients", json=stress_test_data, headers=headers)
            if response.status_code == 200:
                client = response.json()
                client_id = client["id"]
                self.test_client_ids.append(client_id)
                print(f"✅ Stress test client created: {client['name']}")
                print(f"   Initial state: name='{client['name']}', invoice_email='{client['invoice_email']}', client_type='{client['client_type']}', source='{client['source']}'")
            else:
                print(f"❌ Stress test client creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Stress test client creation error: {e}")
            return False
        
        # Step 2: Update only invoice_email to "updated@test.com"
        print("\n--- Step 2: Update ONLY invoice_email ---")
        try:
            update_data = {"invoice_email": "updated@test.com"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ invoice_email update successful")
                
                # Verify expected state
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    client = get_response.json()
                    expected_state = {
                        "name": "Test Client",
                        "invoice_email": "updated@test.com",
                        "client_type": "business",
                        "source": "website"
                    }
                    
                    actual_state = {
                        "name": client["name"],
                        "invoice_email": client["invoice_email"],
                        "client_type": client["client_type"],
                        "source": client["source"]
                    }
                    
                    if actual_state == expected_state:
                        print(f"✅ Step 2 verification PASSED: {actual_state}")
                    else:
                        print(f"❌ Step 2 verification FAILED:")
                        print(f"   Expected: {expected_state}")
                        print(f"   Actual:   {actual_state}")
                        return False
                else:
                    print("❌ Could not verify step 2")
                    return False
            else:
                print(f"❌ invoice_email update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ invoice_email update error: {e}")
            return False
        
        # Step 3: Update only client_type to "individual"
        print("\n--- Step 3: Update ONLY client_type ---")
        try:
            update_data = {"client_type": "individual"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ client_type update successful")
                
                # Verify final expected state
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    client = get_response.json()
                    expected_final_state = {
                        "name": "Test Client",
                        "invoice_email": "updated@test.com",  # From step 2
                        "client_type": "individual",  # From step 3
                        "source": "website"  # Original
                    }
                    
                    actual_final_state = {
                        "name": client["name"],
                        "invoice_email": client["invoice_email"],
                        "client_type": client["client_type"],
                        "source": client["source"]
                    }
                    
                    if actual_final_state == expected_final_state:
                        print(f"🎉 STRESS TEST PASSED: {actual_final_state}")
                        print("✅ All partial updates preserved previous changes correctly!")
                        return True
                    else:
                        print(f"❌ Step 3 verification FAILED:")
                        print(f"   Expected: {expected_final_state}")
                        print(f"   Actual:   {actual_final_state}")
                        return False
                else:
                    print("❌ Could not verify step 3")
                    return False
            else:
                print(f"❌ client_type update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ client_type update error: {e}")
            return False
    
    def test_full_update_cycle_verification(self):
        """
        Full Update Cycle Verification:
        - Create client with full data
        - Do partial update (only 1 field)
        - Get client detail and verify all original fields are preserved
        - Do another partial update (different field)
        - Get client detail again and verify both old and new fields are preserved
        """
        print("\n=== FULL UPDATE CYCLE VERIFICATION ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create client with full data
        full_cycle_data = {
            "name": "Full Cycle Test Client",
            "contact_person": "Cycle Tester",
            "email": "cycle@test.com",
            "invoice_email": "cycle-billing@test.com",
            "client_type": "business",
            "source": "referral",
            "notes": "Full cycle testing client",
            "address": "789 Cycle Street",
            "phone": "+1-555-CYCLE",
            "contract_value": 300000.00,
            "company": "Cycle Test Corp",
            "contract_link": "https://example.com/cycle"
        }
        
        # Step 1: Create client
        try:
            response = self.session.post(f"{API_BASE}/clients", json=full_cycle_data, headers=headers)
            if response.status_code == 200:
                client = response.json()
                client_id = client["id"]
                self.test_client_ids.append(client_id)
                print(f"✅ Full cycle client created: {client['name']}")
                
                # Store original state
                original_state = {k: v for k, v in client.items() if k not in ["id", "status", "created_at", "updated_at", "created_by"]}
                print(f"✅ Original state captured with {len(original_state)} fields")
            else:
                print(f"❌ Full cycle client creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Full cycle client creation error: {e}")
            return False
        
        # Step 2: First partial update (only phone)
        print("\n--- Step 2: First partial update (phone only) ---")
        try:
            update_data = {"phone": "+1-555-UPDATED"}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ First partial update (phone) successful")
                
                # Verify all original fields preserved except phone
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    updated_client = get_response.json()
                    
                    # Check that phone was updated
                    if updated_client["phone"] == "+1-555-UPDATED":
                        print("✅ Phone field updated correctly")
                    else:
                        print(f"❌ Phone field not updated correctly")
                        return False
                    
                    # Check all other fields preserved
                    fields_preserved = True
                    for field, original_value in original_state.items():
                        if field == "phone":
                            continue  # Skip phone as it should be updated
                        
                        current_value = updated_client.get(field)
                        if current_value != original_value:
                            print(f"❌ Field '{field}' not preserved. Original: '{original_value}', Current: '{current_value}'")
                            fields_preserved = False
                    
                    if fields_preserved:
                        print("✅ All other fields preserved after first partial update")
                    else:
                        print("❌ Some fields not preserved after first partial update")
                        return False
                else:
                    print("❌ Could not verify first partial update")
                    return False
            else:
                print(f"❌ First partial update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ First partial update error: {e}")
            return False
        
        # Step 3: Second partial update (only contract_value)
        print("\n--- Step 3: Second partial update (contract_value only) ---")
        try:
            update_data = {"contract_value": 350000.00}
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ Second partial update (contract_value) successful")
                
                # Verify all fields preserved with both updates
                get_response = self.session.get(f"{API_BASE}/clients/{client_id}", headers=headers)
                if get_response.status_code == 200:
                    final_client = get_response.json()
                    
                    # Check that contract_value was updated
                    if final_client["contract_value"] == 350000.00:
                        print("✅ contract_value field updated correctly")
                    else:
                        print(f"❌ contract_value field not updated correctly")
                        return False
                    
                    # Check that phone update from step 2 is still preserved
                    if final_client["phone"] == "+1-555-UPDATED":
                        print("✅ Previous phone update still preserved")
                    else:
                        print(f"❌ Previous phone update lost")
                        return False
                    
                    # Check all other original fields still preserved
                    fields_preserved = True
                    for field, original_value in original_state.items():
                        if field in ["phone", "contract_value"]:
                            continue  # Skip updated fields
                        
                        current_value = final_client.get(field)
                        if current_value != original_value:
                            print(f"❌ Field '{field}' not preserved. Original: '{original_value}', Current: '{current_value}'")
                            fields_preserved = False
                    
                    if fields_preserved:
                        print("🎉 FULL UPDATE CYCLE VERIFICATION PASSED!")
                        print("✅ All original fields preserved through multiple partial updates")
                        print("✅ Both partial updates applied correctly")
                        return True
                    else:
                        print("❌ Some original fields not preserved through update cycle")
                        return False
                else:
                    print("❌ Could not verify second partial update")
                    return False
            else:
                print(f"❌ Second partial update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Second partial update error: {e}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test clients"""
        print("\n=== Cleaning Up Test Data ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        for client_id in self.test_client_ids:
            try:
                response = self.session.delete(f"{API_BASE}/clients/{client_id}", headers=headers)
                if response.status_code == 200:
                    print(f"✅ Cleaned up test client: {client_id}")
                else:
                    print(f"⚠️  Could not clean up test client {client_id}: {response.status_code}")
            except Exception as e:
                print(f"⚠️  Error cleaning up test client {client_id}: {e}")
    
    def run_all_tests(self):
        """Run all critical partial update bug fix verification tests"""
        print("🚀 Starting CRITICAL PARTIAL UPDATE BUG FIX VERIFICATION...")
        print("="*80)
        
        # Setup
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return False
        
        test_results = []
        
        # Run all verification tests
        test_results.append(("Critical Scenario: Partial Update with ALL Fields", self.test_partial_update_critical_scenario()))
        test_results.append(("Individual Field Updates", self.test_individual_field_updates()))
        test_results.append(("Data Persistence Stress Test", self.test_data_persistence_stress_test()))
        test_results.append(("Full Update Cycle Verification", self.test_full_update_cycle_verification()))
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "="*80)
        print("🏁 CRITICAL BUG FIX VERIFICATION SUMMARY")
        print("="*80)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<50} {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 CRITICAL BUG FIX VERIFICATION SUCCESSFUL!")
            print("✅ Partial update functionality is working correctly")
            print("✅ No data loss occurs during partial updates")
            print("✅ All fields preserve their values when not being updated")
            print("✅ The production-blocking bug has been resolved")
            return True
        else:
            print(f"\n❌ CRITICAL BUG FIX VERIFICATION FAILED!")
            print(f"⚠️  {failed} test(s) failed - the bug may still exist")
            print("🚨 This is a production-blocking issue that must be fixed")
            return False

if __name__ == "__main__":
    tester = ClientPartialUpdateFixTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)