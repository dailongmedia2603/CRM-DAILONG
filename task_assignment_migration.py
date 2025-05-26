#!/usr/bin/env python3
"""
Task Assignment Migration Script

This script fixes existing tasks in the database that have assigned_to field 
storing display names instead of user IDs.

ISSUE: Tasks have assigned_to="Nhi Trinh" (display name) instead of user ID
TARGET: Convert to assigned_to="8a794e4e-940e-4554-84da-99c00e58356b" (user ID)
"""

import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import re

# Load environment variables
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def is_valid_uuid(value):
    """Check if a string is a valid UUID format"""
    if not value or not isinstance(value, str):
        return False
    
    # UUID pattern: 8-4-4-4-12 hexadecimal digits
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    return bool(uuid_pattern.match(value))

async def get_all_tasks():
    """Get all tasks from database"""
    try:
        tasks = await db.tasks.find().to_list(1000)
        print(f"Found {len(tasks)} tasks in database")
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []

async def get_all_users():
    """Get all users from database and create name-to-ID mapping"""
    try:
        users = await db.users.find().to_list(1000)
        print(f"Found {len(users)} users in database")
        
        # Create mapping from display names to user IDs
        name_to_id = {}
        
        for user in users:
            user_id = user.get('id')
            full_name = user.get('full_name')
            username = user.get('username')
            email = user.get('email')
            
            # Map full_name to user ID
            if full_name:
                name_to_id[full_name] = user_id
                print(f"  Mapped: '{full_name}' -> {user_id}")
            
            # Also map username and email for completeness
            if username:
                name_to_id[username] = user_id
            if email:
                name_to_id[email] = user_id
        
        return users, name_to_id
    except Exception as e:
        print(f"Error fetching users: {e}")
        return [], {}

async def fix_task_assignments():
    """Main migration function"""
    print("=" * 60)
    print("TASK ASSIGNMENT MIGRATION - FIXING DISPLAY NAMES TO USER IDS")
    print("=" * 60)
    
    # Step 1: Get all tasks
    print("\n1. Getting all tasks from database...")
    tasks = await get_all_tasks()
    
    if not tasks:
        print("No tasks found. Migration complete.")
        return
    
    # Step 2: Get all users and create mapping
    print("\n2. Getting all users and creating name-to-ID mapping...")
    users, name_to_id = await get_all_users()
    
    if not name_to_id:
        print("No users found. Cannot proceed with migration.")
        return
    
    print(f"\nAvailable name mappings:")
    for name, user_id in name_to_id.items():
        print(f"  '{name}' -> {user_id}")
    
    # Step 3: Identify tasks with wrong assigned_to values
    print("\n3. Identifying tasks with display names instead of user IDs...")
    tasks_to_fix = []
    
    for task in tasks:
        task_id = task.get('id')
        title = task.get('title', 'Untitled')
        assigned_to = task.get('assigned_to', '')
        
        # Check if assigned_to is NOT a valid UUID (i.e., it's a display name)
        if assigned_to and not is_valid_uuid(assigned_to):
            tasks_to_fix.append({
                'task_id': task_id,
                'title': title,
                'current_assigned_to': assigned_to,
                'task_data': task
            })
            print(f"  NEEDS FIX: Task '{title}' (ID: {task_id}) has assigned_to='{assigned_to}'")
    
    print(f"\nFound {len(tasks_to_fix)} tasks that need fixing")
    
    if not tasks_to_fix:
        print("All tasks already have valid user IDs. Migration complete.")
        return
    
    # Step 4: Fix each task
    print("\n4. Fixing task assignments...")
    fixed_count = 0
    error_count = 0
    
    for task_info in tasks_to_fix:
        task_id = task_info['task_id']
        title = task_info['title']
        current_assigned_to = task_info['current_assigned_to']
        
        # Try to find matching user ID
        new_assigned_to = None
        
        # Direct match
        if current_assigned_to in name_to_id:
            new_assigned_to = name_to_id[current_assigned_to]
        else:
            # Try case-insensitive match
            for name, user_id in name_to_id.items():
                if name.lower() == current_assigned_to.lower():
                    new_assigned_to = user_id
                    break
        
        if new_assigned_to:
            try:
                # Update the task
                result = await db.tasks.update_one(
                    {"id": task_id},
                    {"$set": {"assigned_to": new_assigned_to}}
                )
                
                if result.modified_count > 0:
                    print(f"  ✅ FIXED: Task '{title}' - '{current_assigned_to}' -> {new_assigned_to}")
                    fixed_count += 1
                else:
                    print(f"  ❌ ERROR: Task '{title}' - No documents modified")
                    error_count += 1
                    
            except Exception as e:
                print(f"  ❌ ERROR: Task '{title}' - {e}")
                error_count += 1
        else:
            print(f"  ⚠️  WARNING: Task '{title}' - No matching user found for '{current_assigned_to}'")
            error_count += 1
    
    # Step 5: Verify the "nhi" task specifically
    print("\n5. Verifying the 'nhi' task specifically...")
    nhi_task = await db.tasks.find_one({"title": {"$regex": "nhi", "$options": "i"}})
    
    if nhi_task:
        nhi_assigned_to = nhi_task.get('assigned_to', '')
        print(f"  Found 'nhi' task: assigned_to = '{nhi_assigned_to}'")
        
        # Check if it's assigned to Nhi Trinh user
        nhi_trinh_id = name_to_id.get('Nhi Trinh')
        if nhi_trinh_id:
            if nhi_assigned_to == nhi_trinh_id:
                print(f"  ✅ 'nhi' task is correctly assigned to Nhi Trinh ({nhi_trinh_id})")
            else:
                print(f"  🔧 Fixing 'nhi' task assignment to Nhi Trinh...")
                try:
                    result = await db.tasks.update_one(
                        {"id": nhi_task['id']},
                        {"$set": {"assigned_to": nhi_trinh_id}}
                    )
                    if result.modified_count > 0:
                        print(f"  ✅ 'nhi' task now assigned to Nhi Trinh ({nhi_trinh_id})")
                        fixed_count += 1
                    else:
                        print(f"  ❌ Failed to update 'nhi' task")
                        error_count += 1
                except Exception as e:
                    print(f"  ❌ Error updating 'nhi' task: {e}")
                    error_count += 1
        else:
            print(f"  ⚠️  WARNING: No 'Nhi Trinh' user found in database")
    else:
        print(f"  ⚠️  No task with title containing 'nhi' found")
    
    # Step 6: Final verification
    print("\n6. Final verification - checking all tasks...")
    updated_tasks = await db.tasks.find().to_list(1000)
    valid_assignments = 0
    invalid_assignments = 0
    
    for task in updated_tasks:
        assigned_to = task.get('assigned_to', '')
        if assigned_to:
            if is_valid_uuid(assigned_to):
                valid_assignments += 1
            else:
                invalid_assignments += 1
                print(f"  ⚠️  Still invalid: Task '{task.get('title')}' has assigned_to='{assigned_to}'")
    
    # Summary
    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)
    print(f"Tasks fixed: {fixed_count}")
    print(f"Errors: {error_count}")
    print(f"Valid assignments after migration: {valid_assignments}")
    print(f"Invalid assignments remaining: {invalid_assignments}")
    
    if invalid_assignments == 0:
        print("🎉 SUCCESS: All tasks now have valid user ID assignments!")
    else:
        print("⚠️  WARNING: Some tasks still have invalid assignments")
    
    print("Migration complete.")

async def main():
    """Main entry point"""
    try:
        await fix_task_assignments()
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())