#!/usr/bin/env python3
"""
Client Detail Functionality Verification Test
Tests the Client Detail API endpoints to ensure they are working correctly
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

print(f"Testing Client Detail Functionality at: {API_BASE}")

class ClientDetailTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_client_id = None
        self.test_document_ids = []
        
    def setup_authentication(self):
        """Setup admin authentication for testing"""
        print("\n=== Setting Up Authentication ===")
        
        admin_data = {
            "email": f"admin_detail_test_{uuid.uuid4().hex[:8]}@test.com",
            "password": "admin123",
            "full_name": "Client Detail Test Admin",
            "role": "admin"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=admin_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                print(f"✅ Admin authentication setup successful")
                return True
            else:
                print(f"❌ Admin authentication setup failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Admin authentication setup error: {e}")
            return False
    
    def test_client_detail_api(self):
        """Test Client Detail API with new fields"""
        print("\n=== Testing Client Detail API ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create client with new fields
        client_data = {
            "name": "Detail Test Client",
            "contact_person": "Detail Tester",
            "email": "detail@test.com",
            "invoice_email": "billing@detail.com",
            "client_type": "business",
            "source": "referral",
            "notes": "Client detail testing",
            "address": "123 Detail Street",
            "phone": "+1-555-DETAIL",
            "contract_value": 150000.00
        }
        
        # Create client
        try:
            response = self.session.post(f"{API_BASE}/clients", json=client_data, headers=headers)
            if response.status_code == 200:
                client = response.json()
                self.test_client_id = client["id"]
                print(f"✅ Client created for detail testing: {client['name']}")
            else:
                print(f"❌ Client creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Client creation error: {e}")
            return False
        
        # Test GET client detail
        try:
            response = self.session.get(f"{API_BASE}/clients/{self.test_client_id}", headers=headers)
            if response.status_code == 200:
                client_detail = response.json()
                
                # Verify all new fields are present
                required_fields = ["invoice_email", "client_type", "source"]
                for field in required_fields:
                    if field in client_detail:
                        print(f"✅ New field '{field}' present: {client_detail[field]}")
                    else:
                        print(f"❌ New field '{field}' missing from response")
                        return False
                
                print("✅ Client Detail API working correctly with all new fields")
                return True
            else:
                print(f"❌ Client detail retrieval failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Client detail retrieval error: {e}")
            return False
    
    def test_client_documents_crud(self):
        """Test Client Documents CRUD operations"""
        print("\n=== Testing Client Documents CRUD ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET documents (should be empty initially)
        try:
            response = self.session.get(f"{API_BASE}/clients/{self.test_client_id}/documents", headers=headers)
            if response.status_code == 200:
                documents = response.json()
                if len(documents) == 0:
                    print("✅ GET documents returns empty array initially")
                else:
                    print(f"⚠️  GET documents returned {len(documents)} documents (expected 0)")
            else:
                print(f"❌ GET documents failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ GET documents error: {e}")
            return False
        
        # Test POST document creation
        document_data = {
            "name": "Test Contract",
            "link": "https://example.com/contract.pdf",
            "status": "pending"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients/{self.test_client_id}/documents", 
                                       json=document_data, headers=headers)
            if response.status_code == 200:
                document = response.json()
                document_id = document["id"]
                self.test_document_ids.append(document_id)
                print(f"✅ POST document creation successful: {document['name']}")
            else:
                print(f"❌ POST document creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ POST document creation error: {e}")
            return False
        
        # Test PUT document update
        update_data = {
            "name": "Updated Contract",
            "link": "https://example.com/updated-contract.pdf",
            "status": "signed"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/clients/{self.test_client_id}/documents/{document_id}", 
                                      json=update_data, headers=headers)
            if response.status_code == 200:
                print("✅ PUT document update successful")
            else:
                print(f"❌ PUT document update failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ PUT document update error: {e}")
            return False
        
        # Test GET documents after creation
        try:
            response = self.session.get(f"{API_BASE}/clients/{self.test_client_id}/documents", headers=headers)
            if response.status_code == 200:
                documents = response.json()
                if len(documents) == 1 and documents[0]["status"] == "signed":
                    print("✅ GET documents shows updated document correctly")
                else:
                    print(f"❌ GET documents verification failed")
                    return False
            else:
                print(f"❌ GET documents verification failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ GET documents verification error: {e}")
            return False
        
        # Test DELETE document
        try:
            response = self.session.delete(f"{API_BASE}/clients/{self.test_client_id}/documents/{document_id}", 
                                         headers=headers)
            if response.status_code == 200:
                print("✅ DELETE document successful")
                return True
            else:
                print(f"❌ DELETE document failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ DELETE document error: {e}")
            return False
    
    def test_client_projects_placeholder(self):
        """Test Client Projects placeholder endpoint"""
        print("\n=== Testing Client Projects Placeholder ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = self.session.get(f"{API_BASE}/clients/{self.test_client_id}/projects", headers=headers)
            if response.status_code == 200:
                projects = response.json()
                if isinstance(projects, list) and len(projects) == 0:
                    print("✅ Client Projects placeholder returns empty array as expected")
                    return True
                else:
                    print(f"❌ Client Projects placeholder should return empty array, got: {projects}")
                    return False
            else:
                print(f"❌ Client Projects placeholder failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Client Projects placeholder error: {e}")
            return False
    
    def test_authentication_requirements(self):
        """Test that all endpoints require authentication"""
        print("\n=== Testing Authentication Requirements ===")
        
        endpoints = [
            f"{API_BASE}/clients/{self.test_client_id}",
            f"{API_BASE}/clients/{self.test_client_id}/documents",
            f"{API_BASE}/clients/{self.test_client_id}/projects"
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(endpoint)
                if response.status_code == 403:
                    print(f"✅ {endpoint.split('/')[-1]} correctly requires authentication")
                else:
                    print(f"❌ {endpoint.split('/')[-1]} should require authentication, got: {response.status_code}")
                    return False
            except Exception as e:
                print(f"❌ Error testing authentication for {endpoint}: {e}")
                return False
        
        return True
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n=== Cleaning Up Test Data ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        if self.test_client_id:
            try:
                response = self.session.delete(f"{API_BASE}/clients/{self.test_client_id}", headers=headers)
                if response.status_code == 200:
                    print(f"✅ Cleaned up test client: {self.test_client_id}")
                else:
                    print(f"⚠️  Could not clean up test client: {response.status_code}")
            except Exception as e:
                print(f"⚠️  Error cleaning up test client: {e}")
    
    def run_all_tests(self):
        """Run all Client Detail functionality tests"""
        print("🚀 Starting Client Detail Functionality Verification...")
        print("="*60)
        
        # Setup
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return False
        
        test_results = []
        
        # Run all tests
        test_results.append(("Client Detail API", self.test_client_detail_api()))
        test_results.append(("Client Documents CRUD", self.test_client_documents_crud()))
        test_results.append(("Client Projects Placeholder", self.test_client_projects_placeholder()))
        test_results.append(("Authentication Requirements", self.test_authentication_requirements()))
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "="*60)
        print("🏁 CLIENT DETAIL FUNCTIONALITY SUMMARY")
        print("="*60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<35} {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 CLIENT DETAIL FUNCTIONALITY VERIFICATION SUCCESSFUL!")
            return True
        else:
            print(f"\n❌ {failed} test(s) failed in Client Detail functionality")
            return False

if __name__ == "__main__":
    tester = ClientDetailTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)