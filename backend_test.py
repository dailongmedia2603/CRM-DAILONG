#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for CRM System Phase 1
Tests all authentication, user management, customer management, and analytics APIs
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

print(f"Testing backend at: {API_BASE}")

class CRMAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.sales_token = None
        self.manager_token = None
        self.admin_user = None
        self.sales_user = None
        self.manager_user = None
        self.test_customer_id = None
        self.test_interaction_id = None
        self.test_client_ids = []
        
    def test_health_check(self):
        """Test basic health check endpoint"""
        print("\n=== Testing Health Check ===")
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration for different roles"""
        print("\n=== Testing User Registration ===")
        
        # Test admin registration
        admin_data = {
            "email": f"admin_{uuid.uuid4().hex[:8]}@test.com",
            "password": "admin123",
            "full_name": "Test Admin",
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
                print(f"✅ Admin registration successful: {self.admin_user['email']}")
            else:
                print(f"❌ Admin registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin registration error: {e}")
            return False
        
        # Test sales registration
        sales_data = {
            "email": f"sales_{uuid.uuid4().hex[:8]}@test.com",
            "password": "sales123",
            "full_name": "Test Sales Person",
            "role": "sales",
            "phone": "+1234567891",
            "target_monthly": 10000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=sales_data)
            if response.status_code == 200:
                data = response.json()
                self.sales_token = data["access_token"]
                self.sales_user = data["user"]
                print(f"✅ Sales registration successful: {self.sales_user['email']}")
            else:
                print(f"❌ Sales registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales registration error: {e}")
            return False
        
        # Test manager registration
        manager_data = {
            "email": f"manager_{uuid.uuid4().hex[:8]}@test.com",
            "password": "manager123",
            "full_name": "Test Manager",
            "role": "manager",
            "phone": "+1234567892",
            "target_monthly": 0.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=manager_data)
            if response.status_code == 200:
                data = response.json()
                self.manager_token = data["access_token"]
                self.manager_user = data["user"]
                print(f"✅ Manager registration successful: {self.manager_user['email']}")
                return True
            else:
                print(f"❌ Manager registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Manager registration error: {e}")
            return False
    
    def test_user_login(self):
        """Test user login functionality"""
        print("\n=== Testing User Login ===")
        
        # Test admin login with existing credentials
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Admin login successful")
                # Verify token is different (new login)
                if data["access_token"] != self.admin_token:
                    print("✅ New token generated on login")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {e}")
            return False
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n=== Testing Invalid Login ===")
        
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=invalid_data)
            if response.status_code == 400:
                print("✅ Invalid login correctly rejected")
                return True
            else:
                print(f"❌ Invalid login should return 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Invalid login test error: {e}")
            return False
    
    def test_protected_endpoint_access(self):
        """Test access to protected endpoints with and without tokens"""
        print("\n=== Testing Protected Endpoint Access ===")
        
        # Test without token
        try:
            response = self.session.get(f"{API_BASE}/auth/me")
            if response.status_code == 403:
                print("✅ Protected endpoint correctly rejects requests without token")
            else:
                print(f"❌ Expected 403 for no token, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ No token test error: {e}")
            return False
        
        # Test with valid token
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Protected endpoint access with valid token successful: {data['email']}")
                return True
            else:
                print(f"❌ Protected endpoint access failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Valid token test error: {e}")
            return False
    
    def test_customer_management(self):
        """Test customer CRUD operations"""
        print("\n=== Testing Customer Management ===")
        
        # Test customer creation
        customer_data = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "+1234567893",
            "company": "Test Company",
            "position": "CEO",
            "status": "lead",
            "assigned_sales_id": self.sales_user["id"],
            "potential_value": 50000.0,
            "notes": "Test customer for API testing",
            "address": "123 Test St, Test City",
            "source": "website"
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_customer_id = data["id"]
                print(f"✅ Customer creation successful: {data['name']}")
            else:
                print(f"❌ Customer creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer creation error: {e}")
            return False
        
        # Test customer retrieval
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Customer retrieval successful: {data['name']}")
            else:
                print(f"❌ Customer retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer retrieval error: {e}")
            return False
        
        # Test customer update
        update_data = {
            "status": "prospect",
            "potential_value": 75000.0,
            "notes": "Updated notes for testing"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/customers/{self.test_customer_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Customer update successful: status={data['status']}, value={data['potential_value']}")
            else:
                print(f"❌ Customer update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer update error: {e}")
            return False
        
        # Test customer list retrieval
        try:
            response = self.session.get(f"{API_BASE}/customers", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Customer list retrieval successful: {len(data)} customers found")
                return True
            else:
                print(f"❌ Customer list retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer list retrieval error: {e}")
            return False
    
    def test_role_based_access_control(self):
        """Test role-based access control for customers"""
        print("\n=== Testing Role-Based Access Control ===")
        
        # Test sales person can only see their customers
        sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
        try:
            response = self.session.get(f"{API_BASE}/customers", headers=sales_headers)
            if response.status_code == 200:
                data = response.json()
                # Should only see customers assigned to them
                assigned_customers = [c for c in data if c["assigned_sales_id"] == self.sales_user["id"]]
                if len(assigned_customers) == len(data):
                    print(f"✅ Sales person correctly sees only assigned customers: {len(data)}")
                else:
                    print(f"❌ Sales person sees unassigned customers")
                    return False
            else:
                print(f"❌ Sales customer access failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales customer access error: {e}")
            return False
        
        # Test sales person cannot access other's customers directly
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}", headers=sales_headers)
            if response.status_code == 200:
                # This should work since the customer is assigned to this sales person
                print("✅ Sales person can access assigned customer")
                return True
            else:
                print(f"❌ Sales person cannot access assigned customer: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Sales customer direct access error: {e}")
            return False
    
    def test_interaction_tracking(self):
        """Test interaction tracking functionality"""
        print("\n=== Testing Interaction Tracking ===")
        
        # Create an interaction
        interaction_data = {
            "customer_id": self.test_customer_id,
            "type": "call",
            "title": "Initial Sales Call",
            "description": "Discussed product requirements and pricing",
            "revenue_generated": 5000.0,
            "next_action": "Send proposal",
            "next_action_date": (datetime.utcnow() + timedelta(days=3)).isoformat()
        }
        
        headers = {"Authorization": f"Bearer {self.sales_token}"}
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=interaction_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_interaction_id = data["id"]
                print(f"✅ Interaction creation successful: {data['title']}")
            else:
                print(f"❌ Interaction creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Interaction creation error: {e}")
            return False
        
        # Get customer interactions
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}/interactions", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Customer interactions retrieval successful: {len(data)} interactions")
                return True
            else:
                print(f"❌ Customer interactions retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer interactions retrieval error: {e}")
            return False
    
    def test_sales_team_management(self):
        """Test sales team management APIs"""
        print("\n=== Testing Sales Team Management ===")
        
        # Test getting sales team (admin/manager access)
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/sales", headers=admin_headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Sales team retrieval successful: {len(data)} sales persons")
            else:
                print(f"❌ Sales team retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales team retrieval error: {e}")
            return False
        
        # Test sales person analytics
        try:
            response = self.session.get(f"{API_BASE}/sales/{self.sales_user['id']}/analytics", headers=admin_headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Sales analytics successful: {data['total_customers']} customers, ${data['total_revenue']} revenue")
                return True
            else:
                print(f"❌ Sales analytics failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales analytics error: {e}")
            return False
    
    def test_dashboard_analytics(self):
        """Test dashboard analytics for different user roles"""
        print("\n=== Testing Dashboard Analytics ===")
        
        # Test admin dashboard analytics
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/dashboard/analytics", headers=admin_headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Admin dashboard analytics successful:")
                print(f"   - Total customers: {data['total_customers']}")
                print(f"   - Total revenue: ${data['total_revenue']}")
                print(f"   - Sales team size: {data['total_sales_team']}")
                print(f"   - Customer status distribution: {data['customers_by_status']}")
            else:
                print(f"❌ Admin dashboard analytics failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin dashboard analytics error: {e}")
            return False
        
        # Test sales person dashboard analytics
        sales_headers = {"Authorization": f"Bearer {self.sales_token}"}
        try:
            response = self.session.get(f"{API_BASE}/dashboard/analytics", headers=sales_headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Sales dashboard analytics successful:")
                print(f"   - Personal customers: {data['total_customers']}")
                print(f"   - Personal revenue: ${data['total_revenue']}")
                print(f"   - Personal interactions: {data['total_interactions']}")
                return True
            else:
                print(f"❌ Sales dashboard analytics failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Sales dashboard analytics error: {e}")
            return False
    
    def test_data_consistency(self):
        """Test data consistency across related entities"""
        print("\n=== Testing Data Consistency ===")
        
        # Verify customer revenue was updated after interaction
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}", headers=headers)
            if response.status_code == 200:
                customer = response.json()
                if customer["total_revenue"] > 0:
                    print(f"✅ Customer revenue updated correctly: ${customer['total_revenue']}")
                else:
                    print(f"❌ Customer revenue not updated after interaction")
                    return False
                
                if customer["last_contact"]:
                    print(f"✅ Customer last contact updated: {customer['last_contact']}")
                    return True
                else:
                    print(f"❌ Customer last contact not updated")
                    return False
            else:
                print(f"❌ Customer data consistency check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Data consistency check error: {e}")
            return False
    
    def test_search_and_filtering(self):
        """Test customer search and filtering capabilities"""
        print("\n=== Testing Search and Filtering ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test filtering by status
        try:
            response = self.session.get(f"{API_BASE}/customers?status=prospect", headers=headers)
            if response.status_code == 200:
                data = response.json()
                prospect_customers = [c for c in data if c["status"] == "prospect"]
                if len(prospect_customers) == len(data):
                    print(f"✅ Status filtering works correctly: {len(data)} prospect customers")
                else:
                    print(f"❌ Status filtering failed")
                    return False
            else:
                print(f"❌ Status filtering request failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Status filtering error: {e}")
            return False
        
        # Test filtering by sales person
        try:
            response = self.session.get(f"{API_BASE}/customers?sales_id={self.sales_user['id']}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                assigned_customers = [c for c in data if c["assigned_sales_id"] == self.sales_user["id"]]
                if len(assigned_customers) == len(data):
                    print(f"✅ Sales person filtering works correctly: {len(data)} assigned customers")
                    return True
                else:
                    print(f"❌ Sales person filtering failed")
                    return False
            else:
                print(f"❌ Sales person filtering request failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Sales person filtering error: {e}")
            return False
    
    def test_client_management_create(self):
        """Test client creation with all required fields"""
        print("\n=== Testing Client Creation ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test creating a client with all fields
        client_data = {
            "name": "Test Client Corp",
            "contact_person": "John Doe",
            "email": "john.doe@testclient.com",
            "contract_value": 150000.50,
            "company": "Test Client Corporation",
            "phone": "+1-555-0123",
            "contract_link": "https://example.com/contract/123",
            "address": "123 Business Ave, Suite 100, Business City, BC 12345",
            "notes": "High-value client with potential for expansion"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients", json=client_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_client_ids.append(data["id"])
                print(f"✅ Client creation successful: {data['name']} (ID: {data['id']})")
                
                # Verify all fields are set correctly
                if (data["status"] == "active" and 
                    data["contract_value"] == 150000.50 and
                    data["contact_person"] == "John Doe"):
                    print("✅ Client data fields set correctly")
                    return True
                else:
                    print(f"❌ Client data fields incorrect")
                    return False
            else:
                print(f"❌ Client creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client creation error: {e}")
            return False
    
    def test_client_management_edge_cases(self):
        """Test client creation with edge cases"""
        print("\n=== Testing Client Creation Edge Cases ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test with minimal required fields
        minimal_client = {
            "name": "Minimal Client",
            "contact_person": "Jane Smith",
            "email": "jane@minimal.com",
            "contract_value": 0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients", json=minimal_client, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_client_ids.append(data["id"])
                print(f"✅ Minimal client creation successful: {data['name']}")
            else:
                print(f"❌ Minimal client creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Minimal client creation error: {e}")
            return False
        
        # Test with decimal contract value
        decimal_client = {
            "name": "Decimal Value Client",
            "contact_person": "Bob Wilson",
            "email": "bob@decimal.com",
            "contract_value": 99999.99
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients", json=decimal_client, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_client_ids.append(data["id"])
                print(f"✅ Decimal contract value client creation successful: ${data['contract_value']}")
                return True
            else:
                print(f"❌ Decimal contract value client creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Decimal contract value client creation error: {e}")
            return False
    
    def test_client_management_get_all(self):
        """Test getting all clients with status filtering"""
        print("\n=== Testing Get All Clients ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test getting all clients
        try:
            response = self.session.get(f"{API_BASE}/clients", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Get all clients successful: {len(data)} clients found")
                
                # Verify no MongoDB ObjectIDs in response
                for client in data:
                    if "_id" in client:
                        print(f"❌ MongoDB ObjectID found in response")
                        return False
                print("✅ No MongoDB ObjectIDs in response")
                
            else:
                print(f"❌ Get all clients failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Get all clients error: {e}")
            return False
        
        # Test status filtering
        try:
            response = self.session.get(f"{API_BASE}/clients?status=active", headers=headers)
            if response.status_code == 200:
                data = response.json()
                active_clients = [c for c in data if c["status"] == "active"]
                if len(active_clients) == len(data):
                    print(f"✅ Status filtering works correctly: {len(data)} active clients")
                    return True
                else:
                    print(f"❌ Status filtering failed - found non-active clients")
                    return False
            else:
                print(f"❌ Status filtering failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Status filtering error: {e}")
            return False
    
    def test_client_statistics(self):
        """Test client statistics endpoint"""
        print("\n=== Testing Client Statistics ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = self.session.get(f"{API_BASE}/clients/statistics", headers=headers)
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                required_fields = ["totalClients", "totalContractValue", "clientsThisMonth", "contractValueThisMonth"]
                for field in required_fields:
                    if field not in data:
                        print(f"❌ Missing required field in statistics: {field}")
                        return False
                
                print(f"✅ Client statistics successful:")
                print(f"   - Total clients: {data['totalClients']}")
                print(f"   - Total contract value: ${data['totalContractValue']}")
                print(f"   - Clients this month: {data['clientsThisMonth']}")
                print(f"   - Contract value this month: ${data['contractValueThisMonth']}")
                
                # Verify calculations make sense
                if data['totalClients'] >= 0 and data['totalContractValue'] >= 0:
                    print("✅ Statistics calculations appear correct")
                    return True
                else:
                    print(f"❌ Statistics calculations appear incorrect")
                    return False
            else:
                print(f"❌ Client statistics failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client statistics error: {e}")
            return False
    
    def test_client_management_update(self):
        """Test client update functionality"""
        print("\n=== Testing Client Update ===")
        
        if not self.test_client_ids:
            print("❌ No test clients available for update")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        client_id = self.test_client_ids[0]
        
        # Test updating client data
        update_data = {
            "name": "Updated Client Name",
            "contract_value": 200000.00,
            "notes": "Updated notes for testing",
            "phone": "+1-555-9999"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/clients/{client_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Client update successful: {data['message']}")
                
                # Verify the update by getting the client
                get_response = self.session.get(f"{API_BASE}/clients", headers=headers)
                if get_response.status_code == 200:
                    clients = get_response.json()
                    updated_client = next((c for c in clients if c["id"] == client_id), None)
                    if updated_client and updated_client["contract_value"] == 200000.00:
                        print("✅ Client update verification successful")
                        return True
                    else:
                        print("❌ Client update verification failed")
                        return False
                else:
                    print("❌ Could not verify client update")
                    return False
            else:
                print(f"❌ Client update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client update error: {e}")
            return False
    
    def test_client_management_delete(self):
        """Test client deletion"""
        print("\n=== Testing Client Deletion ===")
        
        if len(self.test_client_ids) < 2:
            print("❌ Not enough test clients for deletion test")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        client_id = self.test_client_ids[-1]  # Delete the last one
        
        try:
            response = self.session.delete(f"{API_BASE}/clients/{client_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Client deletion successful: {data['message']}")
                
                # Verify deletion by trying to get all clients
                get_response = self.session.get(f"{API_BASE}/clients", headers=headers)
                if get_response.status_code == 200:
                    clients = get_response.json()
                    deleted_client = next((c for c in clients if c["id"] == client_id), None)
                    if deleted_client is None:
                        print("✅ Client deletion verification successful")
                        self.test_client_ids.remove(client_id)
                        return True
                    else:
                        print("❌ Client deletion verification failed - client still exists")
                        return False
                else:
                    print("❌ Could not verify client deletion")
                    return False
            else:
                print(f"❌ Client deletion failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Client deletion error: {e}")
            return False
    
    def test_client_bulk_actions(self):
        """Test bulk actions on clients"""
        print("\n=== Testing Client Bulk Actions ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create additional clients for bulk testing
        bulk_test_clients = []
        for i in range(2):
            client_data = {
                "name": f"Bulk Test Client {i+1}",
                "contact_person": f"Contact {i+1}",
                "email": f"bulk{i+1}@test.com",
                "contract_value": 10000 * (i+1)
            }
            
            try:
                response = self.session.post(f"{API_BASE}/clients", json=client_data, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    bulk_test_clients.append(data["id"])
                    print(f"✅ Bulk test client {i+1} created: {data['id']}")
                else:
                    print(f"❌ Failed to create bulk test client {i+1}")
                    return False
            except Exception as e:
                print(f"❌ Error creating bulk test client {i+1}: {e}")
                return False
        
        # Test bulk archive
        archive_data = {
            "action": "archive",
            "client_ids": bulk_test_clients
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients/bulk-action", json=archive_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Bulk archive successful: {data['message']}")
            else:
                print(f"❌ Bulk archive failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Bulk archive error: {e}")
            return False
        
        # Test bulk delete
        delete_data = {
            "action": "delete",
            "client_ids": bulk_test_clients
        }
        
        try:
            response = self.session.post(f"{API_BASE}/clients/bulk-action", json=delete_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Bulk delete successful: {data['message']}")
                return True
            else:
                print(f"❌ Bulk delete failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Bulk delete error: {e}")
            return False
    
    def test_client_authentication_required(self):
        """Test that all client endpoints require authentication"""
        print("\n=== Testing Client Authentication Requirements ===")
        
        # Test without authentication
        endpoints_to_test = [
            ("GET", f"{API_BASE}/clients"),
            ("GET", f"{API_BASE}/clients/statistics"),
            ("POST", f"{API_BASE}/clients"),
            ("PUT", f"{API_BASE}/clients/test-id"),
            ("DELETE", f"{API_BASE}/clients/test-id"),
            ("POST", f"{API_BASE}/clients/bulk-action")
        ]
        
        for method, url in endpoints_to_test:
            try:
                if method == "GET":
                    response = self.session.get(url)
                elif method == "POST":
                    response = self.session.post(url, json={})
                elif method == "PUT":
                    response = self.session.put(url, json={})
                elif method == "DELETE":
                    response = self.session.delete(url)
                
                if response.status_code == 403:
                    print(f"✅ {method} {url.split('/')[-1]} correctly requires authentication")
                else:
                    print(f"❌ {method} {url.split('/')[-1]} should require authentication, got: {response.status_code}")
                    return False
            except Exception as e:
                print(f"❌ Error testing {method} {url}: {e}")
                return False
        
        return True
    
    def test_client_error_handling(self):
        """Test error handling for client endpoints"""
        print("\n=== Testing Client Error Handling ===")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test updating non-existent client
        try:
            response = self.session.put(f"{API_BASE}/clients/non-existent-id", 
                                      json={"name": "Test"}, headers=headers)
            if response.status_code == 404:
                print("✅ Update non-existent client correctly returns 404")
            else:
                print(f"❌ Update non-existent client should return 404, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing update non-existent client: {e}")
            return False
        
        # Test deleting non-existent client
        try:
            response = self.session.delete(f"{API_BASE}/clients/non-existent-id", headers=headers)
            if response.status_code == 404:
                print("✅ Delete non-existent client correctly returns 404")
            else:
                print(f"❌ Delete non-existent client should return 404, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing delete non-existent client: {e}")
            return False
        
        # Test bulk action with empty client IDs
        try:
            response = self.session.post(f"{API_BASE}/clients/bulk-action", 
                                       json={"action": "delete", "client_ids": []}, headers=headers)
            if response.status_code == 400:
                print("✅ Bulk action with empty IDs correctly returns 400")
            else:
                print(f"❌ Bulk action with empty IDs should return 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing bulk action with empty IDs: {e}")
            return False
        
        # Test bulk action with invalid action
        try:
            response = self.session.post(f"{API_BASE}/clients/bulk-action", 
                                       json={"action": "invalid", "client_ids": ["test"]}, headers=headers)
            if response.status_code == 400:
                print("✅ Bulk action with invalid action correctly returns 400")
                return True
            else:
                print(f"❌ Bulk action with invalid action should return 400, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing bulk action with invalid action: {e}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CRM Backend API Testing...")
        
        test_results = []
        
        # Core functionality tests
        test_results.append(("Health Check", self.test_health_check()))
        test_results.append(("User Login", self.test_existing_user_login()))
        test_results.append(("User Registration", self.test_user_registration()))
        test_results.append(("Invalid Login", self.test_invalid_login()))
        test_results.append(("Protected Endpoint Access", self.test_protected_endpoint_access()))
        test_results.append(("Customer Management", self.test_customer_management()))
        test_results.append(("Role-Based Access Control", self.test_role_based_access_control()))
        test_results.append(("Interaction Tracking", self.test_interaction_tracking()))
        test_results.append(("Sales Team Management", self.test_sales_team_management()))
        test_results.append(("Dashboard Analytics", self.test_dashboard_analytics()))
        test_results.append(("Data Consistency", self.test_data_consistency()))
        test_results.append(("Search and Filtering", self.test_search_and_filtering()))
        
        # Client Management tests
        test_results.append(("Client Creation", self.test_client_management_create()))
        test_results.append(("Client Edge Cases", self.test_client_management_edge_cases()))
        test_results.append(("Client Get All & Filtering", self.test_client_management_get_all()))
        test_results.append(("Client Statistics", self.test_client_statistics()))
        test_results.append(("Client Update", self.test_client_management_update()))
        test_results.append(("Client Deletion", self.test_client_management_delete()))
        test_results.append(("Client Bulk Actions", self.test_client_bulk_actions()))
        test_results.append(("Client Authentication", self.test_client_authentication_required()))
        test_results.append(("Client Error Handling", self.test_client_error_handling()))
        
        # Print summary
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
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
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    tester = CRMAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)