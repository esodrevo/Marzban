"""
Nodes CLI Module

Handles node management through the command line interface.
"""


from rich.console import Console
from rich.table import Table

from app.db.base import get_db
from app.models.admin import AdminDetails
from app.operation import OperatorType
from app.operation.node import NodeOperation
from app.utils.helpers import readable_datetime

# Initialize console for rich output
console = Console()

# System admin for CLI operations
SYSTEM_ADMIN = AdminDetails(username="system", is_sudo=True, telegram_id=None, discord_webhook=None)


def get_node_operation() -> NodeOperation:
    """Get node operation instance."""
    return NodeOperation(OperatorType.SYS)


class NodeCLI:
    """Node CLI operations."""

    def __init__(self):
        self.console = console

    async def list_nodes(self, db):
        """List all nodes."""
        node_op = get_node_operation()
        nodes = await node_op.get_db_nodes(db)

        if not nodes:
            self.console.print("[yellow]No nodes found[/yellow]")
            return

        table = Table(title="Nodes")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("Address", style="blue")
        table.add_column("Port", style="magenta")
        table.add_column("Status", style="yellow")
        table.add_column("Created At", style="white")

        for node in nodes:
            table.add_row(
                str(node.id),
                node.name,
                node.address,
                str(node.port),
                "Online" if node.is_online else "Offline",
                readable_datetime(node.created_at),
            )

        self.console.print(table)


# CLI commands
async def list_nodes():
    """List all nodes."""
    node_cli = NodeCLI()
    async for db in get_db():
        try:
            await node_cli.list_nodes(db)
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
        finally:
            break
