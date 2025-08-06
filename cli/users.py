"""
Users CLI Module

Handles user account management through the command line interface.
"""

from typing import Optional

from rich.console import Console
from rich.table import Table

from app.db.base import get_db
from app.db.models import UserStatus
from app.models.admin import AdminDetails
from app.operation import OperatorType
from app.operation.user import UserOperation
from app.utils.helpers import readable_datetime
from app.utils.system import readable_size

# Initialize console for rich output
console = Console()

# System admin for CLI operations
SYSTEM_ADMIN = AdminDetails(username="system", is_sudo=True, telegram_id=None, discord_webhook=None)


def get_user_operation() -> UserOperation:
    """Get user operation instance."""
    return UserOperation(OperatorType.SYS)


class UserCLI:
    """User CLI operations."""

    def __init__(self):
        self.console = console

    async def list_users(self, db, status: Optional[UserStatus] = None, offset: int = 0, limit: int = 10):
        """List user accounts."""
        user_op = get_user_operation()
        users_response = await user_op.get_users(db, SYSTEM_ADMIN, limit=limit, status=status, offset=offset)

        if not users_response.users:
            self.console.print("[yellow]No users found[/yellow]")
            return

        table = Table(title="User Accounts")
        table.add_column("Username", style="cyan")
        table.add_column("Status", style="green")
        table.add_column("Used Traffic", style="blue")
        table.add_column("Data Limit", style="magenta")
        table.add_column("Expire", style="yellow")

        for user in users_response.users:
            data_limit = readable_size(user.data_limit) if user.data_limit else "∞"
            expire = readable_datetime(user.expire) if user.expire else "∞"

            table.add_row(
                user.username,
                user.status.value,
                readable_size(user.used_traffic),
                data_limit,
                expire,
            )

        self.console.print(table)


# CLI commands
async def list_users(status: Optional[UserStatus] = None, offset: int = 0, limit: int = 10):
    """List user accounts."""
    user_cli = UserCLI()
    async for db in get_db():
        try:
            await user_cli.list_users(db, status, offset, limit)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break
