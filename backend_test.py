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
    
    def test_existing_user_login(self):
        """Test login with existing system users"""
        print("\n=== Testing Existing User Login ===")
        
        # Test admin login with existing credentials
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                print(f"✅ Admin login successful: {self.admin_user['username']}")
                
                # Test sales user login
                sales_login = {
                    "login": "yenvi",
                    "password": "yenvi123"
                }
                sales_response = self.session.post(f"{API_BASE}/auth/login", json=sales_login)
                if sales_response.status_code == 200:
                    sales_data = sales_response.json()
                    self.sales_token = sales_data["access_token"]
                    self.sales_user = sales_data["user"]
                    print(f"✅ Sales user login successful: {self.sales_user['username']}")
                else:
                    print(f"⚠️ Sales user login failed, using admin for all tests")
                    self.sales_token = self.admin_token
                    self.sales_user = self.admin_user
                
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {e}")
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
            
    def test_lead_management_api(self):
        """Test Lead Management API endpoints thoroughly"""
        print("\n=== Testing Lead Management API ===")
        
        # Test admin login
        print("\n--- Testing Admin Authentication ---")
        login_data = {
            "login": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                print(f"✅ Admin login successful: {self.admin_user['username']}")
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {e}")
            return False
            
        # Set auth headers
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /api/users endpoint
        print("\n--- Testing GET /api/users ---")
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            if response.status_code == 200:
                users = response.json()
                print(f"✅ GET /api/users successful: {len(users)} users found")
                
                # Find a sales user for assigning leads
                sales_users = [user for user in users if user.get("role") == "sales"]
                if sales_users:
                    sales_user_id = sales_users[0]["id"]
                    print(f"✅ Found sales user for lead assignment: {sales_users[0].get('username', 'Unknown')}")
                else:
                    # If no sales user found, use admin user
                    sales_user_id = self.admin_user["id"]
                    print(f"⚠️ No sales users found, using admin user for lead assignment")
            else:
                print(f"❌ GET /api/users failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ GET /api/users error: {e}")
            return False
        
        # Test GET /api/customers endpoint
        print("\n--- Testing GET /api/customers ---")
        try:
            response = self.session.get(f"{API_BASE}/customers", headers=headers)
            if response.status_code == 200:
                leads = response.json()
                print(f"✅ GET /api/customers successful: {len(leads)} leads found")
            else:
                print(f"❌ GET /api/customers failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ GET /api/customers error: {e}")
            return False
        
        # Test POST /api/customers with different statuses
        print("\n--- Testing POST /api/customers with different statuses ---")
        
        # Test data with different statuses, care_status, and sales_result values
        test_leads = [
            {
                "name": "Lead with High Status",
                "phone": "+84123456789",
                "company": "High Value Corp",
                "status": "high",
                "care_status": "potential_close",
                "sales_result": None,
                "assigned_sales_id": sales_user_id,
                "potential_value": 100000.0,
                "notes": "High potential lead",
                "source": "website"
            },
            {
                "name": "Lead with Normal Status",
                "phone": "+84987654321",
                "company": "Normal Corp",
                "status": "normal",
                "care_status": "thinking",
                "sales_result": None,
                "assigned_sales_id": sales_user_id,
                "potential_value": 50000.0,
                "notes": "Normal potential lead",
                "source": "referral"
            },
            {
                "name": "Lead with Low Status",
                "phone": "+84555666777",
                "company": "Low Value Corp",
                "status": "low",
                "care_status": "silent",
                "sales_result": None,
                "assigned_sales_id": sales_user_id,
                "potential_value": 10000.0,
                "notes": "Low potential lead",
                "source": "cold call"
            },
            {
                "name": "Nguyễn Văn Anh",  # Vietnamese name
                "phone": "+84111222333",
                "company": "Công ty TNHH Việt Nam",  # Vietnamese company name
                "status": "high",
                "care_status": "working",
                "sales_result": None,
                "assigned_sales_id": sales_user_id,
                "potential_value": 75000.0,
                "notes": "Khách hàng tiềm năng từ Hà Nội",  # Vietnamese notes
                "source": "exhibition"
            },
            {
                "name": "Trần Thị Bình",  # Vietnamese name
                "phone": "+84444555666",
                "company": "Doanh nghiệp Xây dựng Sài Gòn",  # Vietnamese company name
                "status": "normal",
                "care_status": "rejected",
                "sales_result": "not_interested",
                "assigned_sales_id": sales_user_id,
                "potential_value": 25000.0,
                "notes": "Đã từ chối đề xuất ban đầu",  # Vietnamese notes
                "source": "partner"
            }
        ]
        
        created_lead_ids = []
        
        for i, lead_data in enumerate(test_leads):
            try:
                response = self.session.post(f"{API_BASE}/customers", json=lead_data, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    created_lead_ids.append(data["id"])
                    print(f"✅ Created lead {i+1}: {data['name']} (ID: {data['id']})")
                    
                    # Verify all fields are set correctly
                    if (data["status"] == lead_data["status"] and 
                        data["care_status"] == lead_data["care_status"] and
                        data["potential_value"] == lead_data["potential_value"]):
                        print(f"  ✅ Lead data fields set correctly")
                    else:
                        print(f"  ❌ Lead data fields incorrect")
                        return False
                else:
                    print(f"❌ Failed to create lead {i+1}: {response.status_code} - {response.text}")
                    return False
            except Exception as e:
                print(f"❌ Error creating lead {i+1}: {e}")
                return False
        
        # Test PUT /api/customers/{id} to update a lead
        print("\n--- Testing PUT /api/customers/{id} ---")
        
        if created_lead_ids:
            lead_id = created_lead_ids[0]
            update_data = {
                "status": "normal",
                "care_status": "working",
                "sales_result": "signed_contract",
                "potential_value": 120000.0,
                "notes": "Updated notes after contract signing"
            }
            
            try:
                response = self.session.put(f"{API_BASE}/customers/{lead_id}", json=update_data, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Updated lead: {data['name']}")
                    
                    # Verify update fields
                    if (data["status"] == update_data["status"] and 
                        data["care_status"] == update_data["care_status"] and
                        data["sales_result"] == update_data["sales_result"] and
                        data["potential_value"] == update_data["potential_value"]):
                        print(f"  ✅ Lead update fields set correctly")
                    else:
                        print(f"  ❌ Lead update fields incorrect")
                        return False
                else:
                    print(f"❌ Failed to update lead: {response.status_code} - {response.text}")
                    return False
            except Exception as e:
                print(f"❌ Error updating lead: {e}")
                return False
        
        # Test validation for required fields
        print("\n--- Testing validation for required fields ---")
        
        # Missing required field (name)
        invalid_lead = {
            "phone": "+84999888777",
            "company": "Invalid Corp",
            "status": "high",
            "care_status": "potential_close",
            "assigned_sales_id": sales_user_id,
            "potential_value": 50000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=invalid_lead, headers=headers)
            if response.status_code in [400, 422]:  # Pydantic validation error or custom validation
                print(f"✅ Validation correctly rejected lead without name field")
            else:
                print(f"❌ Validation should reject lead without name, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing validation: {e}")
            return False
        
        # Missing required field (assigned_sales_id)
        invalid_lead = {
            "name": "Invalid Lead",
            "phone": "+84999888777",
            "company": "Invalid Corp",
            "status": "high",
            "care_status": "potential_close",
            "potential_value": 50000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=invalid_lead, headers=headers)
            if response.status_code in [400, 422]:  # Pydantic validation error or custom validation
                print(f"✅ Validation correctly rejected lead without assigned_sales_id field")
            else:
                print(f"❌ Validation should reject lead without assigned_sales_id, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing validation: {e}")
            return False
        
        # Invalid enum value for status
        invalid_lead = {
            "name": "Invalid Status Lead",
            "phone": "+84999888777",
            "company": "Invalid Corp",
            "status": "invalid_status",  # Invalid enum value
            "care_status": "potential_close",
            "assigned_sales_id": sales_user_id,
            "potential_value": 50000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=invalid_lead, headers=headers)
            if response.status_code in [400, 422]:  # Pydantic validation error or custom validation
                print(f"✅ Validation correctly rejected lead with invalid status enum value")
            else:
                print(f"❌ Validation should reject lead with invalid status, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing validation: {e}")
            return False
        
        # Invalid enum value for care_status
        invalid_lead = {
            "name": "Invalid Care Status Lead",
            "phone": "+84999888777",
            "company": "Invalid Corp",
            "status": "high",
            "care_status": "invalid_care_status",  # Invalid enum value
            "assigned_sales_id": sales_user_id,
            "potential_value": 50000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=invalid_lead, headers=headers)
            if response.status_code in [400, 422]:  # Pydantic validation error or custom validation
                print(f"✅ Validation correctly rejected lead with invalid care_status enum value")
            else:
                print(f"❌ Validation should reject lead with invalid care_status, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing validation: {e}")
            return False
        
        # Invalid enum value for sales_result
        invalid_lead = {
            "name": "Invalid Sales Result Lead",
            "phone": "+84999888777",
            "company": "Invalid Corp",
            "status": "high",
            "care_status": "potential_close",
            "sales_result": "invalid_result",  # Invalid enum value
            "assigned_sales_id": sales_user_id,
            "potential_value": 50000.0
        }
        
        try:
            response = self.session.post(f"{API_BASE}/customers", json=invalid_lead, headers=headers)
            if response.status_code in [400, 422]:  # Pydantic validation error or custom validation
                print(f"✅ Validation correctly rejected lead with invalid sales_result enum value")
            else:
                print(f"❌ Validation should reject lead with invalid sales_result, got: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error testing validation: {e}")
            return False
        
        print("\n--- Lead Management API Testing Summary ---")
        print(f"✅ Successfully created {len(created_lead_ids)} leads with different statuses")
        print(f"✅ Successfully updated lead information")
        print(f"✅ Successfully validated required fields and enum values")
        print(f"✅ Successfully tested with Vietnamese characters")
        
        return True

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
        
        # Lead Management API tests
        test_results.append(("Lead Management API", self.test_lead_management_api()))
        
        # Customer Interactions API tests with follow_up type
        test_results.append(("Customer Interactions API with follow_up", self.test_customer_interactions_api()))
        
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

    def test_customer_interactions_api(self):
        """Test customer interactions API with follow_up type"""
        print("\n=== Testing Customer Interactions API with follow_up type ===")
        
        # Test admin login if not already logged in
        if not self.admin_token:
            print("\n- Logging in as admin to get token")
            login_data = {
                "login": "admin",
                "password": "admin123"
            }
            try:
                response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
                if response.status_code == 200:
                    self.admin_token = response.json()["access_token"]
                    print(f"✅ Admin login successful: admin")
                else:
                    print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                    return False
            except Exception as e:
                print(f"❌ Admin login error: {e}")
                return False
        
        # Test sales login if not already logged in
        if not self.sales_token:
            print("\n- Logging in as sales to get token")
            login_data = {
                "login": "sales01",
                "password": "sales123"
            }
            try:
                response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
                if response.status_code == 200:
                    self.sales_token = response.json()["access_token"]
                    print(f"✅ Sales login successful: sales01")
                else:
                    print(f"❌ Sales login failed: {response.status_code} - {response.text}")
                    print(f"⚠️ Using admin token for all tests")
                    self.sales_token = self.admin_token
            except Exception as e:
                print(f"❌ Sales login error: {e}")
                print(f"⚠️ Using admin token for all tests")
                self.sales_token = self.admin_token
        
        # Create a test customer if not already created
        if not self.test_customer_id:
            print("\n- Creating a test customer")
            customer_data = {
                "name": "Test Customer for Interactions",
                "email": f"test_customer_{uuid.uuid4().hex[:8]}@example.com",
                "phone": "+1234567890",
                "address": "123 Test St",
                "assigned_sales_id": "sales01",
                "status": "normal",
                "care_status": "new",
                "sales_result": "pending"
            }
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            try:
                response = self.session.post(f"{API_BASE}/customers", json=customer_data, headers=headers)
                if response.status_code == 200:
                    self.test_customer_id = response.json()["id"]
                    print(f"✅ Test customer creation successful: {customer_data['name']} (ID: {self.test_customer_id})")
                else:
                    print(f"❌ Test customer creation failed: {response.status_code} - {response.text}")
                    # Try to get an existing customer
                    try:
                        response = self.session.get(f"{API_BASE}/customers", headers=headers)
                        if response.status_code == 200 and len(response.json()) > 0:
                            self.test_customer_id = response.json()[0]["id"]
                            print(f"✅ Using existing customer with ID: {self.test_customer_id}")
                        else:
                            print(f"❌ Could not get existing customers: {response.status_code} - {response.text}")
                            return False
                    except Exception as e:
                        print(f"❌ Error getting existing customers: {e}")
                        return False
            except Exception as e:
                print(f"❌ Test customer creation error: {e}")
                return False
        
        # Test 1: Create a new interaction with type "follow_up"
        print("\n- Testing POST /api/interactions with follow_up type")
        follow_up_interaction = {
            "customer_id": self.test_customer_id,
            "type": "follow_up",
            "title": "Follow-up Call",
            "description": "Followed up on previous discussion",
            "revenue_generated": 0.0,
            "next_action": "Schedule demo",
            "next_action_date": (datetime.utcnow() + timedelta(days=5)).isoformat()
        }
        
        headers = {"Authorization": f"Bearer {self.sales_token}"}
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=follow_up_interaction, headers=headers)
            if response.status_code == 200:
                data = response.json()
                follow_up_interaction_id = data["id"]
                print(f"✅ Follow-up interaction creation successful: {data['title']}")
                print(f"   - ID: {follow_up_interaction_id}")
                print(f"   - Type: {data['type']}")
                print(f"   - Customer ID: {data['customer_id']}")
                
                # Verify all required fields are present in response
                required_fields = ["id", "customer_id", "sales_id", "type", "title", "date"]
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    print(f"❌ Missing required fields in response: {missing_fields}")
                    return False
                
                # Verify the type is "follow_up"
                if data["type"] != "follow_up":
                    print(f"❌ Interaction type mismatch: expected 'follow_up', got '{data['type']}'")
                    return False
            else:
                print(f"❌ Follow-up interaction creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Follow-up interaction creation error: {e}")
            return False
        
        # Test 2: Get customer interactions and verify the follow-up interaction is included
        print("\n- Testing GET /api/customers/{customer_id}/interactions")
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}/interactions", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Customer interactions retrieval successful: {len(data)} interactions")
                
                # Verify the follow-up interaction is in the list
                follow_up_interactions = [i for i in data if i["id"] == follow_up_interaction_id]
                if follow_up_interactions:
                    print(f"✅ Follow-up interaction found in customer interactions")
                else:
                    print(f"❌ Follow-up interaction not found in customer interactions")
                    return False
                
                # Verify the structure of the response
                if len(data) > 0:
                    first_interaction = data[0]
                    required_fields = ["id", "customer_id", "sales_id", "type", "title", "date"]
                    missing_fields = [field for field in required_fields if field not in first_interaction]
                    if missing_fields:
                        print(f"❌ Missing required fields in interaction response: {missing_fields}")
                        return False
                    print(f"✅ Interaction response structure is valid")
            else:
                print(f"❌ Customer interactions retrieval failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Customer interactions retrieval error: {e}")
            return False
        
        # Test 3: Test access control - Admin should be able to access any customer's interactions
        print("\n- Testing access control with admin user")
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = self.session.get(f"{API_BASE}/customers/{self.test_customer_id}/interactions", headers=admin_headers)
            if response.status_code == 200:
                print(f"✅ Admin can access customer interactions")
            else:
                print(f"❌ Admin access to customer interactions failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Admin access test error: {e}")
            return False
        
        # Test 4: Test required fields validation
        print("\n- Testing required fields validation")
        # Missing customer_id
        invalid_interaction = {
            "type": "follow_up",
            "title": "Missing Customer ID"
        }
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=invalid_interaction, headers=headers)
            if response.status_code != 200:
                print(f"✅ Validation correctly rejected interaction missing customer_id: {response.status_code}")
            else:
                print(f"❌ Validation failed: accepted interaction without customer_id")
                return False
        except Exception as e:
            print(f"❌ Validation test error: {e}")
            return False
        
        # Missing type
        invalid_interaction = {
            "customer_id": self.test_customer_id,
            "title": "Missing Type"
        }
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=invalid_interaction, headers=headers)
            if response.status_code != 200:
                print(f"✅ Validation correctly rejected interaction missing type: {response.status_code}")
            else:
                print(f"❌ Validation failed: accepted interaction without type")
                return False
        except Exception as e:
            print(f"❌ Validation test error: {e}")
            return False
        
        # Missing title
        invalid_interaction = {
            "customer_id": self.test_customer_id,
            "type": "follow_up"
        }
        try:
            response = self.session.post(f"{API_BASE}/interactions", json=invalid_interaction, headers=headers)
            if response.status_code != 200:
                print(f"✅ Validation correctly rejected interaction missing title: {response.status_code}")
            else:
                print(f"❌ Validation failed: accepted interaction without title")
                return False
        except Exception as e:
            print(f"❌ Validation test error: {e}")
            return False
        
        print("\n✅ All customer interactions API tests passed!")
        return True

if __name__ == "__main__":
    tester = CRMAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)