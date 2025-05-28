#!/usr/bin/env python3

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"

class ClientDetailTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_client_id = None
        self.test_document_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append(f"{status}: {test_name} - {details}")
        print(f"{status}: {test_name} - {details}")
        
    def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            # Try to login with existing test user
            login_data = {
                "email": "admin@test.com",
                "password": "testpass123"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.log_test("Authentication", True, "Successfully logged in with existing admin user")
                return True
            else:
                # Try to register new admin user
                register_data = {
                    "email": "admin@test.com",
                    "password": "testpass123",
                    "full_name": "Test Admin",
                    "role": "admin"
                }
                
                response = requests.post(f"{self.base_url}/auth/register", json=register_data)
                
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data["access_token"]
                    self.log_test("Authentication", True, "Successfully registered and logged in new admin user")
                    return True
                else:
                    self.log_test("Authentication", False, f"Failed to register: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            self.log_test("Authentication", False, f"Exception during auth: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_client_creation_with_new_fields(self):
        """Test creating client with new fields: invoice_email, client_type, source"""
        try:
            client_data = {
                "name": "Test Client Detail",
                "contact_person": "John Doe",
                "email": "john@testclient.com",
                "invoice_email": "billing@testclient.com",
                "client_type": "business",
                "source": "referral",
                "company": "Test Company Ltd",
                "phone": "+1234567890",
                "contract_value": 50000,
                "contract_link": "https://example.com/contract",
                "address": "123 Test Street",
                "notes": "Test client for detail functionality"
            }
            
            response = requests.post(f"{self.base_url}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                self.test_client_id = data["id"]
                
                # Verify new fields are present
                if (data.get("invoice_email") == "billing@testclient.com" and 
                    data.get("client_type") == "business" and 
                    data.get("source") == "referral"):
                    self.log_test("Client Creation with New Fields", True, f"Client created with ID: {self.test_client_id}")
                    return True
                else:
                    self.log_test("Client Creation with New Fields", False, "New fields not properly saved")
                    return False
            else:
                self.log_test("Client Creation with New Fields", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Client Creation with New Fields", False, f"Exception: {str(e)}")
            return False
    
    def test_client_creation_with_defaults(self):
        """Test creating client with default values"""
        try:
            client_data = {
                "name": "Minimal Client",
                "contact_person": "Jane Smith",
                "email": "jane@minimal.com"
            }
            
            response = requests.post(f"{self.base_url}/clients", json=client_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify default values
                if (data.get("client_type") == "individual" and 
                    data.get("contract_value") == 0 and
                    data.get("status") == "active"):
                    self.log_test("Client Creation with Defaults", True, "Default values applied correctly")
                    return True
                else:
                    self.log_test("Client Creation with Defaults", False, f"Default values incorrect: {data}")
                    return False
            else:
                self.log_test("Client Creation with Defaults", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Client Creation with Defaults", False, f"Exception: {str(e)}")
            return False
    
    def test_get_client_detail_valid_id(self):
        """Test GET /api/clients/{client_id} with valid ID"""
        try:
            if not self.test_client_id:
                self.log_test("Get Client Detail (Valid ID)", False, "No test client ID available")
                return False
                
            response = requests.get(f"{self.base_url}/clients/{self.test_client_id}", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all new fields are present
                required_fields = ["id", "name", "contact_person", "email", "invoice_email", "client_type", "source"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Get Client Detail (Valid ID)", True, f"All fields present: {list(data.keys())}")
                    return True
                else:
                    self.log_test("Get Client Detail (Valid ID)", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Client Detail (Valid ID)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Client Detail (Valid ID)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_client_detail_invalid_id(self):
        """Test GET /api/clients/{client_id} with invalid ID"""
        try:
            invalid_id = str(uuid.uuid4())
            response = requests.get(f"{self.base_url}/clients/{invalid_id}", headers=self.get_headers())
            
            if response.status_code == 404:
                self.log_test("Get Client Detail (Invalid ID)", True, "Correctly returned 404 for invalid ID")
                return True
            else:
                self.log_test("Get Client Detail (Invalid ID)", False, f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Client Detail (Invalid ID)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_client_documents_empty(self):
        """Test GET /api/clients/{client_id}/documents - should return empty array initially"""
        try:
            if not self.test_client_id:
                self.log_test("Get Client Documents (Empty)", False, "No test client ID available")
                return False
                
            response = requests.get(f"{self.base_url}/clients/{self.test_client_id}/documents", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 0:
                    self.log_test("Get Client Documents (Empty)", True, "Returned empty array as expected")
                    return True
                else:
                    self.log_test("Get Client Documents (Empty)", False, f"Expected empty array, got: {data}")
                    return False
            else:
                self.log_test("Get Client Documents (Empty)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Client Documents (Empty)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_document(self):
        """Test POST /api/clients/{client_id}/documents"""
        try:
            if not self.test_client_id:
                self.log_test("Create Client Document", False, "No test client ID available")
                return False
                
            document_data = {
                "name": "Test Contract",
                "link": "https://example.com/contract.pdf",
                "status": "pending"
            }
            
            response = requests.post(f"{self.base_url}/clients/{self.test_client_id}/documents", 
                                   json=document_data, headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                self.test_document_id = data["id"]
                
                # Verify document fields
                if (data.get("name") == "Test Contract" and 
                    data.get("status") == "pending" and
                    data.get("client_id") == self.test_client_id):
                    self.log_test("Create Client Document", True, f"Document created with ID: {self.test_document_id}")
                    return True
                else:
                    self.log_test("Create Client Document", False, f"Document fields incorrect: {data}")
                    return False
            else:
                self.log_test("Create Client Document", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Client Document", False, f"Exception: {str(e)}")
            return False
    
    def test_get_client_documents_with_data(self):
        """Test GET /api/clients/{client_id}/documents - should return created document"""
        try:
            if not self.test_client_id:
                self.log_test("Get Client Documents (With Data)", False, "No test client ID available")
                return False
                
            response = requests.get(f"{self.base_url}/clients/{self.test_client_id}/documents", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 1:
                    document = data[0]
                    if document.get("name") == "Test Contract":
                        self.log_test("Get Client Documents (With Data)", True, "Retrieved created document successfully")
                        return True
                    else:
                        self.log_test("Get Client Documents (With Data)", False, f"Document data incorrect: {document}")
                        return False
                else:
                    self.log_test("Get Client Documents (With Data)", False, f"Expected 1 document, got: {len(data) if isinstance(data, list) else 'not a list'}")
                    return False
            else:
                self.log_test("Get Client Documents (With Data)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Client Documents (With Data)", False, f"Exception: {str(e)}")
            return False
    
    def test_update_client_document(self):
        """Test PUT /api/clients/{client_id}/documents/{document_id}"""
        try:
            if not self.test_client_id or not self.test_document_id:
                self.log_test("Update Client Document", False, "No test client or document ID available")
                return False
                
            update_data = {
                "name": "Updated Contract",
                "link": "https://example.com/updated-contract.pdf",
                "status": "signed"
            }
            
            response = requests.put(f"{self.base_url}/clients/{self.test_client_id}/documents/{self.test_document_id}", 
                                  json=update_data, headers=self.get_headers())
            
            if response.status_code == 200:
                # Verify update by fetching the document
                get_response = requests.get(f"{self.base_url}/clients/{self.test_client_id}/documents", headers=self.get_headers())
                if get_response.status_code == 200:
                    documents = get_response.json()
                    if len(documents) == 1 and documents[0].get("status") == "signed":
                        self.log_test("Update Client Document", True, "Document updated successfully")
                        return True
                    else:
                        self.log_test("Update Client Document", False, "Document not updated properly")
                        return False
                else:
                    self.log_test("Update Client Document", False, "Could not verify update")
                    return False
            else:
                self.log_test("Update Client Document", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Client Document", False, f"Exception: {str(e)}")
            return False
    
    def test_document_status_values(self):
        """Test document status supports: pending, signed, shipped, completed"""
        try:
            if not self.test_client_id:
                self.log_test("Document Status Values", False, "No test client ID available")
                return False
                
            statuses = ["pending", "signed", "shipped", "completed"]
            success_count = 0
            
            for status in statuses:
                document_data = {
                    "name": f"Test Document {status}",
                    "link": f"https://example.com/{status}.pdf",
                    "status": status
                }
                
                response = requests.post(f"{self.base_url}/clients/{self.test_client_id}/documents", 
                                       json=document_data, headers=self.get_headers())
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == status:
                        success_count += 1
            
            if success_count == len(statuses):
                self.log_test("Document Status Values", True, f"All status values supported: {statuses}")
                return True
            else:
                self.log_test("Document Status Values", False, f"Only {success_count}/{len(statuses)} status values worked")
                return False
                
        except Exception as e:
            self.log_test("Document Status Values", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_client_document(self):
        """Test DELETE /api/clients/{client_id}/documents/{document_id}"""
        try:
            if not self.test_client_id or not self.test_document_id:
                self.log_test("Delete Client Document", False, "No test client or document ID available")
                return False
                
            response = requests.delete(f"{self.base_url}/clients/{self.test_client_id}/documents/{self.test_document_id}", 
                                     headers=self.get_headers())
            
            if response.status_code == 200:
                # Verify deletion by checking if document is gone
                get_response = requests.get(f"{self.base_url}/clients/{self.test_client_id}/documents", headers=self.get_headers())
                if get_response.status_code == 200:
                    documents = get_response.json()
                    # Should have 4 documents from status test, minus 1 deleted = 3
                    if len(documents) == 4:  # 4 from status test
                        self.log_test("Delete Client Document", True, "Document deleted successfully")
                        return True
                    else:
                        self.log_test("Delete Client Document", False, f"Expected 4 documents after deletion, got {len(documents)}")
                        return False
                else:
                    self.log_test("Delete Client Document", False, "Could not verify deletion")
                    return False
            else:
                self.log_test("Delete Client Document", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Client Document", False, f"Exception: {str(e)}")
            return False
    
    def test_get_client_projects(self):
        """Test GET /api/clients/{client_id}/projects - should return empty array"""
        try:
            if not self.test_client_id:
                self.log_test("Get Client Projects", False, "No test client ID available")
                return False
                
            response = requests.get(f"{self.base_url}/clients/{self.test_client_id}/projects", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 0:
                    self.log_test("Get Client Projects", True, "Returned empty array as expected (placeholder)")
                    return True
                else:
                    self.log_test("Get Client Projects", False, f"Expected empty array, got: {data}")
                    return False
            else:
                self.log_test("Get Client Projects", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Client Projects", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_client_id_for_documents(self):
        """Test document operations with invalid client_id"""
        try:
            invalid_id = str(uuid.uuid4())
            
            # Test GET documents with invalid client_id
            response = requests.get(f"{self.base_url}/clients/{invalid_id}/documents", headers=self.get_headers())
            if response.status_code != 200:
                self.log_test("Invalid Client ID for Documents (GET)", False, f"Expected 200 for empty result, got {response.status_code}")
                return False
            
            # Test POST document with invalid client_id
            document_data = {"name": "Test", "status": "pending"}
            response = requests.post(f"{self.base_url}/clients/{invalid_id}/documents", 
                                   json=document_data, headers=self.get_headers())
            if response.status_code == 404:
                self.log_test("Invalid Client ID for Documents", True, "Correctly handled invalid client_id")
                return True
            else:
                self.log_test("Invalid Client ID for Documents", False, f"Expected 404 for invalid client, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Client ID for Documents", False, f"Exception: {str(e)}")
            return False
    
    def test_authentication_required(self):
        """Test that all new endpoints require authentication"""
        try:
            endpoints_to_test = [
                f"/clients/{str(uuid.uuid4())}",
                f"/clients/{str(uuid.uuid4())}/documents",
                f"/clients/{str(uuid.uuid4())}/projects"
            ]
            
            success_count = 0
            for endpoint in endpoints_to_test:
                response = requests.get(f"{self.base_url}{endpoint}")
                if response.status_code in [401, 403]:
                    success_count += 1
            
            if success_count == len(endpoints_to_test):
                self.log_test("Authentication Required", True, "All endpoints properly require authentication")
                return True
            else:
                self.log_test("Authentication Required", False, f"Only {success_count}/{len(endpoints_to_test)} endpoints require auth")
                return False
                
        except Exception as e:
            self.log_test("Authentication Required", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_document_id(self):
        """Test operations with invalid document_id"""
        try:
            if not self.test_client_id:
                self.log_test("Invalid Document ID", False, "No test client ID available")
                return False
                
            invalid_doc_id = str(uuid.uuid4())
            
            # Test UPDATE with invalid document_id
            update_data = {"name": "Test", "status": "pending"}
            response = requests.put(f"{self.base_url}/clients/{self.test_client_id}/documents/{invalid_doc_id}", 
                                  json=update_data, headers=self.get_headers())
            
            if response.status_code == 404:
                # Test DELETE with invalid document_id
                response = requests.delete(f"{self.base_url}/clients/{self.test_client_id}/documents/{invalid_doc_id}", 
                                         headers=self.get_headers())
                if response.status_code == 404:
                    self.log_test("Invalid Document ID", True, "Correctly returned 404 for invalid document_id")
                    return True
                else:
                    self.log_test("Invalid Document ID", False, f"DELETE: Expected 404, got {response.status_code}")
                    return False
            else:
                self.log_test("Invalid Document ID", False, f"UPDATE: Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Document ID", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Client Detail functionality tests"""
        print("🚀 Starting Client Detail Functionality Testing...")
        print("=" * 60)
        
        # Authentication
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Test sequence
        tests = [
            self.test_client_creation_with_new_fields,
            self.test_client_creation_with_defaults,
            self.test_get_client_detail_valid_id,
            self.test_get_client_detail_invalid_id,
            self.test_get_client_documents_empty,
            self.test_create_client_document,
            self.test_get_client_documents_with_data,
            self.test_update_client_document,
            self.test_document_status_values,
            self.test_delete_client_document,
            self.test_get_client_projects,
            self.test_invalid_client_id_for_documents,
            self.test_authentication_required,
            self.test_invalid_document_id
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        print("=" * 60)
        
        # Print all results
        for result in self.test_results:
            print(result)
        
        return passed == total

if __name__ == "__main__":
    tester = ClientDetailTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED! Client Detail functionality is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please review the results above.")