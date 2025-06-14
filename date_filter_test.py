#!/usr/bin/env python3
"""
Test script for Date Filtering functionality
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
API_BASE = "https://3b82276e-07b9-4d31-bbc2-f9a78618e89b.preview.emergentagent.com/api"

class DateFilterTest:
    def __init__(self):
        self.base_url = API_BASE
        self.token = None
        self.headers = {}
        
    def authenticate(self):
        """Authenticate with admin user"""
        try:
            login_data = {
                "login": "admin@crm.com",
                "password": "admin123"
            }
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.headers = {"Authorization": f"Bearer {self.token}"}
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_date_filter_today(self):
        """Test today date filter"""
        print("\n=== Testing Date Filter: Today ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/tasks?date_filter=today",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Today filter successful: {len(tasks)} tasks")
                
                # Check if all tasks are from today
                today = datetime.now().date()
                for task in tasks:
                    task_date = datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).date()
                    if task_date != today:
                        print(f"❌ Found task not from today: {task['title']} ({task_date})")
                        return False
                
                print("✅ All tasks are from today")
                return True
            else:
                print(f"❌ Today filter failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Today filter error: {e}")
            return False
    
    def test_date_filter_yesterday(self):
        """Test yesterday date filter"""
        print("\n=== Testing Date Filter: Yesterday ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/tasks?date_filter=yesterday",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Yesterday filter successful: {len(tasks)} tasks")
                
                # Check if all tasks are from yesterday
                yesterday = (datetime.now() - timedelta(days=1)).date()
                for task in tasks:
                    task_date = datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).date()
                    if task_date != yesterday:
                        print(f"❌ Found task not from yesterday: {task['title']} ({task_date})")
                        return False
                
                print("✅ All tasks are from yesterday")
                return True
            else:
                print(f"❌ Yesterday filter failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Yesterday filter error: {e}")
            return False
    
    def test_date_filter_last_7_days(self):
        """Test last 7 days date filter"""
        print("\n=== Testing Date Filter: Last 7 Days ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/tasks?date_filter=last_7_days",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Last 7 days filter successful: {len(tasks)} tasks")
                
                # Check if all tasks are from last 7 days
                seven_days_ago = (datetime.now() - timedelta(days=7)).date()
                today = datetime.now().date()
                
                for task in tasks:
                    task_date = datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).date()
                    if task_date < seven_days_ago or task_date > today:
                        print(f"❌ Found task outside 7 days range: {task['title']} ({task_date})")
                        return False
                
                print("✅ All tasks are within last 7 days")
                return True
            else:
                print(f"❌ Last 7 days filter failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Last 7 days filter error: {e}")
            return False
    
    def test_date_filter_custom(self):
        """Test custom date range filter"""
        print("\n=== Testing Date Filter: Custom Range ===")
        
        try:
            # Test with a specific date range
            from_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            to_date = datetime.now().strftime("%Y-%m-%d")
            
            response = requests.get(
                f"{self.base_url}/tasks?date_filter=custom&date_from={from_date}&date_to={to_date}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                tasks = response.json()
                print(f"✅ Custom range filter successful: {len(tasks)} tasks")
                print(f"   Range: {from_date} to {to_date}")
                
                # Check if all tasks are within the range
                from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
                
                for task in tasks:
                    task_date = datetime.fromisoformat(task['created_at'].replace('Z', '+00:00')).date()
                    if task_date < from_date_obj or task_date > to_date_obj:
                        print(f"❌ Found task outside custom range: {task['title']} ({task_date})")
                        return False
                
                print("✅ All tasks are within custom date range")
                return True
            else:
                print(f"❌ Custom range filter failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Custom range filter error: {e}")
            return False
    
    def test_statistics_with_date_filter(self):
        """Test statistics with date filtering"""
        print("\n=== Testing Statistics with Date Filter ===")
        
        try:
            # Test statistics without filter
            response1 = requests.get(
                f"{self.base_url}/tasks/statistics",
                headers=self.headers
            )
            
            # Test statistics with today filter
            response2 = requests.get(
                f"{self.base_url}/tasks/statistics?date_filter=today",
                headers=self.headers
            )
            
            if response1.status_code == 200 and response2.status_code == 200:
                stats_all = response1.json()
                stats_today = response2.json()
                
                print("✅ Statistics without filter:")
                print(f"   - Urgent: {stats_all.get('urgent', 0)}")
                print(f"   - Pending: {stats_all.get('pending', 0)}")
                print(f"   - In Progress: {stats_all.get('inProgress', 0)}")
                
                print("✅ Statistics with today filter:")
                print(f"   - Urgent: {stats_today.get('urgent', 0)}")
                print(f"   - Pending: {stats_today.get('pending', 0)}")
                print(f"   - In Progress: {stats_today.get('inProgress', 0)}")
                
                # Today stats should be less than or equal to all stats
                if (stats_today.get('urgent', 0) <= stats_all.get('urgent', 0) and
                    stats_today.get('pending', 0) <= stats_all.get('pending', 0) and
                    stats_today.get('inProgress', 0) <= stats_all.get('inProgress', 0)):
                    print("✅ Today statistics are logically correct")
                else:
                    print("❌ Today statistics are higher than total statistics")
                    return False
                
                return True
            else:
                print(f"❌ Statistics failed: {response1.status_code}, {response2.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Statistics error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all date filter tests"""
        print("🚀 Starting Date Filter Testing...\n")
        
        if not self.authenticate():
            print("❌ Cannot proceed without authentication")
            return False
        
        tests = [
            self.test_date_filter_today,
            self.test_date_filter_yesterday,
            self.test_date_filter_last_7_days,
            self.test_date_filter_custom,
            self.test_statistics_with_date_filter
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
        
        print(f"\n🏁 DATE FILTER TEST SUMMARY")
        print(f"============================================================")
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {passed/total*100:.1f}%")
        
        if passed == total:
            print("✅ All date filter tests passed!")
        else:
            print(f"⚠️  {total - passed} tests failed.")
        
        return passed == total

if __name__ == "__main__":
    tester = DateFilterTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)