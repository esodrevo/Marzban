"""
Admin CLI Module

Handles admin account management through the command line interface.
"""

import asyncio
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from app.db.base import get_db
from app.models.admin import AdminCreate, AdminDetails, AdminModify
from app.operation import OperatorType
from app.operation.admin import AdminOperation
from app.utils.system import readable_size

# Initialize console for rich output
console = Console()

# System admin for CLI operations
SYSTEM_ADMIN = AdminDetails(username="system", is_sudo=True, telegram_id=None, discord_webhook=None)


def get_admin_operation() -> AdminOperation:
    """Get admin operation instance."""
    return AdminOperation(OperatorType.SYS)


class AdminCLI:
    """Admin CLI operations."""

    def __init__(self):
        self.console = console

    async def list_admins(self, db):
        """List all admin accounts."""
        admin_op = get_admin_operation()
        admins = await admin_op.get_admins(db)

        if not admins:
            self.console.print("[yellow]No admins found[/yellow]")
            return

        table = Table(title="Admin Accounts")
        table.add_column("Username", style="cyan")
        table.add_column("Is Sudo", style="green")
        table.add_column("Used Traffic", style="blue")
        table.add_column("Is Disabled", style="red")

        for admin in admins:
            table.add_row(
                admin.username,
                "✓" if admin.is_sudo else "✗",
                readable_size(admin.used_traffic),
                "✓" if admin.is_disabled else "✗",
            )

        self.console.print(table)

    async def create_admin(self, db, username: str):
        """Create a new admin account."""
        admin_op = get_admin_operation()

        # Check if admin already exists
        admins = await admin_op.get_admins(db)
        if any(admin.username == username for admin in admins):
            self.console.print(f"[red]Admin '{username}' already exists[/red]")
            return

        # Get password
        password = typer.prompt("Password", hide_input=True)
        if not password:
            self.console.print("[red]Password is required[/red]")
            return

        # Create admin
        new_admin = AdminCreate(username=username, password=password, is_sudo=False)

        try:
            await admin_op.create_admin(db, new_admin, SYSTEM_ADMIN)
            self.console.print(f"[green]Admin '{username}' created successfully[/green]")
        except Exception as e:
            self.console.print(f"[red]Error creating admin: {e}[/red]")

    async def delete_admin(self, db, username: str):
        """Delete an admin account."""
        admin_op = get_admin_operation()

        # Check if admin exists
        admins = await admin_op.get_admins(db)
        if not any(admin.username == username for admin in admins):
            self.console.print(f"[red]Admin '{username}' not found[/red]")
            return

        if typer.confirm(f"Are you sure you want to delete admin '{username}'?"):
            try:
                await admin_op.remove_admin(db, username, SYSTEM_ADMIN)
                self.console.print(f"[green]Admin '{username}' deleted successfully[/green]")
            except Exception as e:
                self.console.print(f"[red]Error deleting admin: {e}[/red]")

    async def modify_admin(self, db, username: str):
        """Modify an admin account."""
        admin_op = get_admin_operation()

        # Check if admin exists
        admins = await admin_op.get_admins(db)
        if not any(admin.username == username for admin in admins):
            self.console.print(f"[red]Admin '{username}' not found[/red]")
            return

        # Get the current admin details
        current_admin = next(admin for admin in admins if admin.username == username)

        self.console.print(f"[yellow]Modifying admin '{username}'[/yellow]")
        self.console.print("[cyan]Current settings:[/cyan]")
        self.console.print(f"  Username: {current_admin.username}")
        self.console.print(f"  Is Sudo: {'✓' if current_admin.is_sudo else '✗'}")

        # Interactive modification
        modified_admin = AdminModify(is_sudo=current_admin.is_sudo)

        # Password modification
        if typer.confirm("Do you want to change the password?"):
            new_password = typer.prompt("New password", hide_input=True)
            if new_password:
                modified_admin.password = new_password

        # Sudo status modification
        if typer.confirm(f"Do you want to change sudo status? (Current: {'✓' if current_admin.is_sudo else '✗'})"):
            modified_admin.is_sudo = typer.confirm("Make this admin a sudo admin?")

        # Confirm changes
        self.console.print("\n[cyan]Summary of changes:[/cyan]")
        if modified_admin.password:
            self.console.print("  Password: [yellow]Will be updated[/yellow]")
        if modified_admin.is_sudo != current_admin.is_sudo:
            self.console.print(f"  Is Sudo: {'✓' if modified_admin.is_sudo else '✗'} [yellow](changed)[/yellow]")

        if typer.confirm("Do you want to apply these changes?"):
            try:
                await admin_op.modify_admin(db, username, modified_admin, SYSTEM_ADMIN)
                self.console.print(f"[green]Admin '{username}' modified successfully[/green]")
            except Exception as e:
                self.console.print(f"[red]Error modifying admin: {e}[/red]")
        else:
            self.console.print("[yellow]Modification cancelled[/yellow]")

    async def reset_admin_usage(self, db, username: str):
        """Reset admin usage statistics."""
        admin_op = get_admin_operation()

        # Check if admin exists
        admins = await admin_op.get_admins(db)
        if not any(admin.username == username for admin in admins):
            self.console.print(f"[red]Admin '{username}' not found[/red]")
            return

        if typer.confirm(f"Are you sure you want to reset usage for admin '{username}'?"):
            try:
                await admin_op.reset_admin_usage(db, username, SYSTEM_ADMIN)
                self.console.print(f"[green]Usage reset for admin '{username}'[/green]")
            except Exception as e:
                self.console.print(f"[red]Error resetting usage: {e}[/red]")


# CLI commands
async def list_admins():
    """List all admin accounts."""
    admin_cli = AdminCLI()
    async for db in get_db():
        try:
            await admin_cli.list_admins(db)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break


async def create_admin(username: str):
    """Create a new admin account."""
    admin_cli = AdminCLI()
    async for db in get_db():
        try:
            await admin_cli.create_admin(db, username)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break


async def delete_admin(username: str):
    """Delete an admin account."""
    admin_cli = AdminCLI()
    async for db in get_db():
        try:
            await admin_cli.delete_admin(db, username)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break


async def modify_admin(username: str):
    """Modify an admin account."""
    admin_cli = AdminCLI()
    async for db in get_db():
        try:
            await admin_cli.modify_admin(db, username)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break


async def reset_admin_usage(username: str):
    """Reset admin usage statistics."""
    admin_cli = AdminCLI()
    async for db in get_db():
        try:
            await admin_cli.reset_admin_usage(db, username)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break
