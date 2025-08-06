"""
Marzban CLI Package

A modern, type-safe CLI built with Typer for managing Marzban instances.
"""

import asyncio
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from app.db.base import get_db
from app.models.admin import AdminDetails
from app.operation import OperatorType
from app.operation.admin import AdminOperation
from app.operation.group import GroupOperation
from app.operation.node import NodeOperation
from app.operation.system import SystemOperation
from app.operation.user import UserOperation

# Initialize console for rich output
console = Console()

# System admin for CLI operations
SYSTEM_ADMIN = AdminDetails(username="system", is_sudo=True, telegram_id=None, discord_webhook=None)


def get_admin_operation() -> AdminOperation:
    """Get admin operation instance."""
    return AdminOperation(OperatorType.SYS)


def get_user_operation() -> UserOperation:
    """Get user operation instance."""
    return UserOperation(OperatorType.SYS)


def get_system_operation() -> SystemOperation:
    """Get system operation instance."""
    return SystemOperation(OperatorType.SYS)


def get_group_operation() -> GroupOperation:
    """Get group operation instance."""
    return GroupOperation(OperatorType.SYS)


def get_node_operation() -> NodeOperation:
    """Get node operation instance."""
    return NodeOperation(OperatorType.SYS)


class BaseCLI:
    """Base class for CLI operations."""

    def __init__(self):
        self.console = console

    async def run_with_db(self, operation):
        """Run an operation with database session."""
        async for db in get_db():
            try:
                await operation(db)
            except Exception as e:
                self.console.print(f"[red]Error: {e}[/red]")
            finally:
                break

    def create_table(self, title: str, columns: list) -> Table:
        """Create a rich table with given columns."""
        table = Table(title=title)
        for column in columns:
            table.add_column(column["name"], style=column.get("style", "white"))
        return table
