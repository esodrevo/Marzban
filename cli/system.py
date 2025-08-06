"""
System CLI Module

Handles system status and information through the command line interface.
"""

import asyncio
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel

from app.db.base import get_db
from app.models.admin import AdminDetails
from app.operation import OperatorType
from app.operation.system import SystemOperation
from app.utils.system import readable_size

# Initialize console for rich output
console = Console()

# System admin for CLI operations
SYSTEM_ADMIN = AdminDetails(username="system", is_sudo=True, telegram_id=None, discord_webhook=None)


def get_system_operation() -> SystemOperation:
    """Get system operation instance."""
    return SystemOperation(OperatorType.SYS)


class SystemCLI:
    """System CLI operations."""

    def __init__(self):
        self.console = console

    async def show_status(self, db):
        """Show system status."""
        system_op = get_system_operation()
        stats = await system_op.get_system_stats(db, SYSTEM_ADMIN)

        status_text = (
            f"[bold]System Statistics[/bold]\n\n"
            f"CPU Usage: [green]{stats.cpu_usage:.1f}%[/green]\n"
            f"Memory Usage: [green]{stats.mem_used / stats.mem_total * 100:.1f}%[/green] "
            f"([cyan]{readable_size(stats.mem_used)}[/cyan] / [cyan]{readable_size(stats.mem_total)}[/cyan])\n"
            f"CPU Cores: [magenta]{stats.cpu_cores}[/magenta]\n"
            f"Total Users: [blue]{stats.total_user}[/blue]\n"
            f"Active Users: [green]{stats.active_users}[/green]\n"
            f"Online Users: [yellow]{stats.online_users}[/yellow]\n"
            f"On Hold Users: [yellow]{stats.on_hold_users}[/yellow]\n"
            f"Disabled Users: [red]{stats.disabled_users}[/red]\n"
            f"Expired Users: [red]{stats.expired_users}[/red]\n"
            f"Limited Users: [yellow]{stats.limited_users}[/yellow]\n"
            f"Data Usage (In): [blue]{readable_size(stats.incoming_bandwidth)}[/blue]\n"
            f"Data Usage (Out): [blue]{readable_size(stats.outgoing_bandwidth)}[/blue]"
        )

        panel = Panel(
            status_text,
            title="System Information",
            border_style="blue",
        )

        self.console.print(panel)


# CLI commands
async def show_status():
    """Show system status."""
    system_cli = SystemCLI()
    async for db in get_db():
        try:
            await system_cli.show_status(db)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break
