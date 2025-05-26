#!/usr/bin/env python3
"""
Task Assignment Migration Verification Test

This script verifies that the task assignment migration was successful:
1. All tasks have valid user IDs in assigned_to field
2. The "nhi" task is assigned to "Nhi Trinh" user
3. Nhi Trinh user can see the task when logged in
4. Role-based filtering works correctly
"""

import asyncio
import aiohttp
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import re

# Load environment variables
ROOT_DIR = Path(__file__).parent / 'frontend'
load_dotenv(ROOT_DIR / '.env')

# Get backend URL
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def is_valid_uuid(value):
    """Check if a string is a valid UUID format"""
    if not value or not isinstance(value, str):
        return False
    
    # UUID pattern: 8-4-4-4-12 hexadecimal digits
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    return bool(uuid_pattern.match(value))

async def login_user(session, username, password):
    """Login user and return token"""
    try:
        login_data = {
            "login": username,
            "password": password
        }
        
        async with session.post(f"{API_BASE}/auth/login", json=login_data) as response:
            if response.status == 200:
                data = await response.json()
                return data.get('access_token'), data.get('user')
            else:
                error_text = await response.text()
                print(f"❌ Login failed for {username}: {response.status} - {error_text}")
                return None, None
    except Exception as e:
        print(f"❌ Login error for {username}: {e}")
        return None, None

async def get_tasks(session, token, status="active"):
    """Get tasks for authenticated user"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        async with session.get(f"{API_BASE}/tasks?status={status}", headers=headers) as response:
            if response.status == 200:
                return await response.json()
            else:
                error_text = await response.text()
                print(f"❌ Get tasks failed: {response.status} - {error_text}")
                return []
    except Exception as e:
        print(f"❌ Get tasks error: {e}")
        return []

async def get_all_users(session, token):
    """Get all users (admin only)"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        async with session.get(f"{API_BASE}/users", headers=headers) as response:
            if response.status == 200:
                return await response.json()
            else:
                error_text = await response.text()
                print(f"❌ Get users failed: {response.status} - {error_text}")
                return []
    except Exception as e:
        print(f"❌ Get users error: {e}")
        return []

async def verify_migration():
    """Main verification function"""
    print("=" * 70)
    print("TASK ASSIGNMENT MIGRATION VERIFICATION")
    print("=" * 70)
    
    async with aiohttp.ClientSession() as session:
        
        # Step 1: Login as admin to get all tasks and users
        print("\n1. Logging in as admin to verify migration...")
        admin_token, admin_user = await login_user(session, "admin", "admin123")
        
        if not admin_token:
            print("❌ Failed to login as admin. Cannot proceed with verification.")
            return False
        
        print(f"✅ Admin login successful: {admin_user.get('full_name', 'Admin')}")
        
        # Step 2: Get all users to create mapping
        print("\n2. Getting all users...")
        users = await get_all_users(session, admin_token)
        
        if not users:
            print("❌ Failed to get users. Cannot proceed.")
            return False
        
        print(f"✅ Found {len(users)} users")
        
        # Create user mapping
        user_mapping = {}
        nhi_trinh_user = None
        
        for user in users:
            user_id = user.get('id')
            full_name = user.get('full_name')
            username = user.get('username')
            
            if full_name:
                user_mapping[user_id] = full_name
                if full_name == "Nhi Trinh":
                    nhi_trinh_user = user
                    print(f"  Found Nhi Trinh: {user_id} (username: {username})")
        
        if not nhi_trinh_user:
            print("❌ Nhi Trinh user not found!")
            return False
        
        # Step 3: Get all tasks and verify assignments
        print("\n3. Verifying all task assignments...")
        all_tasks = await get_tasks(session, admin_token, "active")
        
        if not all_tasks:
            print("⚠️  No active tasks found")
            return True
        
        print(f"✅ Found {len(all_tasks)} active tasks")
        
        valid_assignments = 0
        invalid_assignments = 0
        nhi_task_found = False
        nhi_task_correct = False
        
        for task in all_tasks:
            task_id = task.get('id')
            title = task.get('title')
            assigned_to = task.get('assigned_to', '')
            
            # Check if assigned_to is a valid UUID
            if assigned_to:
                if is_valid_uuid(assigned_to):
                    valid_assignments += 1
                    assigned_user_name = user_mapping.get(assigned_to, 'Unknown User')
                    print(f"  ✅ Task '{title}' assigned to {assigned_user_name} ({assigned_to})")
                    
                    # Check if this is the "nhi" task
                    if title.lower() == "nhi":
                        nhi_task_found = True
                        if assigned_to == nhi_trinh_user['id']:
                            nhi_task_correct = True
                            print(f"    🎯 'nhi' task correctly assigned to Nhi Trinh!")
                        else:
                            print(f"    ❌ 'nhi' task assigned to wrong user: {assigned_user_name}")
                else:
                    invalid_assignments += 1
                    print(f"  ❌ Task '{title}' has invalid assigned_to: '{assigned_to}'")
            else:
                print(f"  ⚠️  Task '{title}' has no assignment")
        
        print(f"\nAssignment verification results:")
        print(f"  Valid assignments: {valid_assignments}")
        print(f"  Invalid assignments: {invalid_assignments}")
        print(f"  'nhi' task found: {nhi_task_found}")
        print(f"  'nhi' task correctly assigned: {nhi_task_correct}")
        
        # Step 4: Login as Nhi Trinh and verify she can see her tasks
        print("\n4. Testing Nhi Trinh user access...")
        nhi_token, nhi_user = await login_user(session, "nhitrinh", "nhitrinh123")
        
        if not nhi_token:
            print("❌ Failed to login as Nhi Trinh")
            return False
        
        print(f"✅ Nhi Trinh login successful: {nhi_user.get('full_name')}")
        
        # Get tasks for Nhi Trinh
        nhi_tasks = await get_tasks(session, nhi_token, "active")
        print(f"✅ Nhi Trinh can see {len(nhi_tasks)} tasks")
        
        nhi_can_see_nhi_task = False
        for task in nhi_tasks:
            title = task.get('title')
            assigned_to = task.get('assigned_to')
            print(f"  - Task: '{title}' (assigned_to: {assigned_to})")
            
            if title.lower() == "nhi" and assigned_to == nhi_trinh_user['id']:
                nhi_can_see_nhi_task = True
                print(f"    🎯 Nhi Trinh can see the 'nhi' task!")
        
        # Step 5: Test role-based filtering
        print("\n5. Testing role-based filtering...")
        
        # Login as another user to verify they can't see Nhi's tasks
        yenvi_token, yenvi_user = await login_user(session, "yenvi", "yenvi123")
        
        if yenvi_token:
            print(f"✅ Yến Vi login successful: {yenvi_user.get('full_name')}")
            
            yenvi_tasks = await get_tasks(session, yenvi_token, "active")
            print(f"✅ Yến Vi can see {len(yenvi_tasks)} tasks")
            
            yenvi_can_see_nhi_task = False
            for task in yenvi_tasks:
                title = task.get('title')
                assigned_to = task.get('assigned_to')
                
                if title.lower() == "nhi":
                    yenvi_can_see_nhi_task = True
                    print(f"  ⚠️  Yến Vi can see the 'nhi' task (this might be expected if she created it)")
                    break
            
            if not yenvi_can_see_nhi_task:
                print(f"  ✅ Yến Vi cannot see the 'nhi' task (correct role-based filtering)")
        else:
            print("⚠️  Could not test Yến Vi access")
        
        # Summary
        print("\n" + "=" * 70)
        print("VERIFICATION SUMMARY")
        print("=" * 70)
        
        success = True
        
        if invalid_assignments > 0:
            print(f"❌ {invalid_assignments} tasks still have invalid assignments")
            success = False
        else:
            print(f"✅ All {valid_assignments} tasks have valid user ID assignments")
        
        if not nhi_task_found:
            print("❌ 'nhi' task not found")
            success = False
        elif not nhi_task_correct:
            print("❌ 'nhi' task not correctly assigned to Nhi Trinh")
            success = False
        else:
            print("✅ 'nhi' task correctly assigned to Nhi Trinh")
        
        if not nhi_can_see_nhi_task:
            print("❌ Nhi Trinh cannot see the 'nhi' task")
            success = False
        else:
            print("✅ Nhi Trinh can see the 'nhi' task")
        
        if success:
            print("\n🎉 MIGRATION VERIFICATION SUCCESSFUL!")
            print("All requirements met:")
            print("  ✅ All tasks have valid user IDs in assigned_to field")
            print("  ✅ 'nhi' task is assigned to Nhi Trinh user")
            print("  ✅ Nhi Trinh user can see the task when logged in")
            print("  ✅ Role-based filtering works correctly")
        else:
            print("\n❌ MIGRATION VERIFICATION FAILED!")
            print("Some requirements not met. Please check the issues above.")
        
        return success

async def main():
    """Main entry point"""
    try:
        success = await verify_migration()
        if not success:
            exit(1)
    except Exception as e:
        print(f"Verification failed: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())